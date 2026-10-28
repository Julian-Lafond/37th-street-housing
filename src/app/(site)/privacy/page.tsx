import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPage } from "@/lib/data";
import PrivacyContent from "@/content/legal/privacy.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("privacy");
  return { title: page.title, description: page.description, alternates: { canonical: "/privacy" } };
}

export default function Page() {
  return <LegalPage slug="privacy" Content={PrivacyContent} />;
}
