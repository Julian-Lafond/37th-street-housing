import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/site-chrome";

// Every public route must prerender to fully static output. The build fails if
// any page starts reading cookies, headers or uncached data. (/admin is outside
// this group and renders per request.)
export const ensureStatic = "navigation";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
