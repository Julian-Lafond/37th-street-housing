import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPage } from "@/lib/data";
import FairHousingContent from "@/content/legal/fair-housing.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("fair-housing");
  return { title: page.title, description: page.description, alternates: { canonical: "/fair-housing" } };
}

export default function Page() {
  return <LegalPage slug="fair-housing" Content={FairHousingContent} />;
}
