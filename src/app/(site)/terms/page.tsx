import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPage } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import TermsContent from "@/content/legal/terms.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("terms");
  return pageMetadata({ title: page.title, description: page.description, path: "/terms" });
}

export default function Page() {
  return <LegalPage slug="terms" Content={TermsContent} />;
}
