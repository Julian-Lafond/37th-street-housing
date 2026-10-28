import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPage } from "@/lib/data";
import TermsContent from "@/content/legal/terms.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("terms");
  return { title: page.title, description: page.description, alternates: { canonical: "/terms" } };
}

export default function Page() {
  return <LegalPage slug="terms" Content={TermsContent} />;
}
