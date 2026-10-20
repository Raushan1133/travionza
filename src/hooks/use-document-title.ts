import * as React from "react"

import { APP_NAME, APP_TAGLINE } from "@/lib/constants"

/** Sets the browser tab title – pass nothing to get the app name and tagline */
export function useDocumentTitle(title?: string) {
  React.useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : `${APP_NAME} — ${APP_TAGLINE}`
  }, [title])
}
