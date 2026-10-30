import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPage } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import FairHousingContent from "@/content/legal/fair-housing.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("fair-housing");
  return pageMetadata({ title: page.title, description: page.description, path: "/fair-housing" });
}

export default function Page() {
  return <LegalPage slug="fair-housing" Content={FairHousingContent} />;
}
