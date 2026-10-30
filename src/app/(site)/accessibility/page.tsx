import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPage } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import AccessibilityContent from "@/content/legal/accessibility.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("accessibility");
  return pageMetadata({ title: page.title, description: page.description, path: "/accessibility" });
}

export default function Page() {
  return <LegalPage slug="accessibility" Content={AccessibilityContent} />;
}
