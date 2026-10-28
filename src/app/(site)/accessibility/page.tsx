import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPage } from "@/lib/data";
import AccessibilityContent from "@/content/legal/accessibility.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("accessibility");
  return { title: page.title, description: page.description, alternates: { canonical: "/accessibility" } };
}

export default function Page() {
  return <LegalPage slug="accessibility" Content={AccessibilityContent} />;
}
