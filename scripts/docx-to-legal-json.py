#!/usr/bin/env python3
"""
Convert the Travionza policy .docx files into structured JSON for the legal pages.

    python3 scripts/docx-to-legal-json.py <folder-with-docx-files>

Expects the Heading1 / Heading2 / ListParagraph styles the policies use and
writes src/mocks/data/legal/{terms,privacy,refund,overview}.json.
Re-run it whenever the Word documents change. Needs: pip install python-docx
"""
import json, re, sys, zipfile, pathlib
import docx
from docx.oxml.ns import qn

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
OUT = pathlib.Path(__file__).resolve().parent.parent / "src/mocks/data/legal"

FILES = {
    "privacy": "Privacy-Policy.docx",
    "refund": "Refund-Policy.docx",
    "terms": "Terms-and-Conditions.docx",
    "complete": "Legal-Policies-Complete.docx",
}

def find(suffix):
    m = [p for p in SRC.glob("*.docx") if p.name.endswith(suffix)]
    if not m: sys.exit(f"Missing *{suffix} in {SRC}")
    return m[0]

def slugify(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")

def list_kinds(path):
    """numId -> 'ul' | 'ol' using numbering.xml"""
    z = zipfile.ZipFile(path)
    if "word/numbering.xml" not in z.namelist(): return {}
    x = z.read("word/numbering.xml").decode()
    abstract = {}
    for m in re.finditer(r'<w:abstractNum [^>]*w:abstractNumId="(\d+)".*?</w:abstractNum>', x, re.S):
        fmt = re.search(r'<w:lvl w:ilvl="0".*?<w:numFmt w:val="(\w+)"', m.group(0), re.S)
        abstract[m.group(1)] = "ol" if fmt and fmt.group(1) == "decimal" else "ul"
    out = {}
    for m in re.finditer(r'<w:num w:numId="(\d+)"[^>]*>.*?<w:abstractNumId w:val="(\d+)"', x, re.S):
        out[m.group(1)] = abstract.get(m.group(2), "ul")
    return out

def inlines(p):
    segs = []
    for r in p.iter(qn("w:r")):
        t = "".join((n.text or "") for n in r.iter(qn("w:t")))
        if not t: continue
        rpr = r.find(qn("w:rPr"))
        b = rpr is not None and rpr.find(qn("w:b")) is not None
        i = rpr is not None and rpr.find(qn("w:i")) is not None
        if segs and segs[-1].get("b", False) == b and segs[-1].get("i", False) == i:
            segs[-1]["t"] += t
        else:
            s = {"t": t}
            if b: s["b"] = True
            if i: s["i"] = True
            segs.append(s)
    return segs

def plain(p): return "".join((n.text or "") for n in p.iter(qn("w:t"))).strip()

def style(p):
    ppr = p.find(qn("w:pPr"))
    s = ppr.find(qn("w:pStyle")) if ppr is not None else None
    return s.get(qn("w:val")) if s is not None else None

def num(p):
    ppr = p.find(qn("w:pPr"))
    n = ppr.find(qn("w:numPr")) if ppr is not None else None
    if n is None: return None
    return n.find(qn("w:numId")).get(qn("w:val")), int(n.find(qn("w:ilvl")).get(qn("w:val")))

def table(tbl):
    rows = []
    for tr in tbl.findall(qn("w:tr")):
        cells = []
        for tc in tr.findall(qn("w:tc")):
            ps = [inlines(p) for p in tc.findall(qn("w:p")) if plain(p)]
            segs = []
            for k, s in enumerate(ps):
                if k: segs.append({"t": " "})
                segs.extend(s)
            cells.append(segs)
        rows.append(cells)
    head = rows[0] if rows and all(c and all(s.get("b") for s in c) for c in rows[0]) else None
    return {"type": "table", "head": head, "rows": rows[1:] if head else rows}

def convert(path, kinds):
    d = docx.Document(str(path))
    title, effective, blocks, cur = None, None, [], None
    for el in d.element.body.iterchildren():
        tag = el.tag.split("}")[1]
        if tag == "tbl":
            blocks.append(table(el)); cur = None; continue
        if tag != "p": continue
        txt, st, n = plain(el), style(el), num(el)
        if not txt: cur = None if not n else cur; continue
        if st == "Heading1":
            blocks.append({"type": "h1", "text": txt}); cur = None; continue
        if st == "Heading2":
            blocks.append({"type": "h2", "id": slugify(txt), "text": txt}); cur = None; continue
        if n:
            numid, lvl = n
            assert lvl == 0, f"nested list in {path.name}: {txt[:40]}"
            kind = kinds.get(numid, "ul")
            if cur and cur["type"] == kind and cur["_num"] == numid:
                cur["items"].append(inlines(el))
            else:
                cur = {"type": kind, "items": [inlines(el)], "_num": numid}; blocks.append(cur)
            continue
        cur = None
        segs = inlines(el)
        if txt.startswith("Effective ") and len(txt) < 40:
            blocks.append({"type": "effective", "text": txt}); continue
        if all(s.get("b") for s in segs) and len(txt) < 70:
            blocks.append({"type": "h3", "text": txt}); continue
        blocks.append({"type": "p", "inlines": segs})
    for b in blocks: b.pop("_num", None)
    return blocks

def group_schedules(blocks):
    """Schedule A / B are fill-in forms: wrap each in one 'form' block"""
    out, i = [], 0
    while i < len(blocks):
        b = blocks[i]
        if b["type"] == "h2" and b["text"].startswith("Schedule"):
            j = i + 1
            while j < len(blocks) and blocks[j]["type"] != "h2": j += 1
            out.append({"type": "h2", "id": b["id"], "text": b["text"], "schedule": True})
            out.append({"type": "form", "blocks": blocks[i + 1:j]})
            i = j
        else:
            out.append(b); i += 1
    return out

def build(slug, path):
    blocks = convert(path, list_kinds(path))
    title = next(b["text"] for b in blocks if b["type"] == "h1")
    eff = next((b["text"] for b in blocks if b["type"] == "effective"), "")
    body = [b for b in blocks if b["type"] not in ("h1", "effective")]
    return {"slug": slug, "title": title, "effective": eff.replace("Effective ", ""), "blocks": group_schedules(body)}

OUT.mkdir(parents=True, exist_ok=True)
for slug in ("terms", "privacy", "refund"):
    doc = build(slug, find(FILES[slug]))
    (OUT / f"{slug}.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1))
    print(slug, len(doc["blocks"]), "blocks;", sum(b["type"] == "h2" for b in doc["blocks"]), "sections")

# Overview = the "Key Terms at a Glance" block from the combined file
cp = find(FILES["complete"])
allb = convert(cp, list_kinds(cp))
start = next(i for i, b in enumerate(allb) if b["type"] == "h1" and "Key Terms" in b["text"])
end = next(i for i, b in enumerate(allb[start + 1:], start + 1) if b["type"] == "h1")
eff = next(b["text"] for b in allb if b["type"] == "effective").replace("Effective ", "")
ov = {"slug": "overview", "title": "Key Terms at a Glance", "effective": eff, "blocks": allb[start + 1:end]}
(OUT / "overview.json").write_text(json.dumps(ov, ensure_ascii=False, indent=1))
print("overview", len(ov["blocks"]), "blocks")
