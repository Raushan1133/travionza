import * as React from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Promo code chip that copies itself to the clipboard */
export function CopyCode({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success(`Code ${code} copied`)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Couldn't copy – select the code and copy it manually.")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={copy}
      className={cn("h-9 gap-2 border-dashed font-mono text-sm font-semibold tracking-wider", className)}
    >
      {code}
      {copied ? <Check className="text-success" /> : <Copy className="text-muted-foreground" />}
    </Button>
  )
}
