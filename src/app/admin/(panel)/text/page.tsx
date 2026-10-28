import type { Metadata } from "next";
import { saveHomePage } from "@/app/admin/actions";
import { Card, Checkbox, Field, SaveForm, TextArea } from "@/components/admin/form-kit";
import type { HomePageContent } from "@/content/types";
import { getAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Homepage text" };

export default async function HomeTextPage() {
  const admin = await getAdmin();
  if (!admin) return null;
  const { data } = await admin.supabase.from("home_page").select("content").eq("id", 1).single();
  const c = data?.content as HomePageContent;
  const highlights = c.neighborhood.highlights
    .map((h) => `${h.place} | ${h.mode} | ${h.minutes}${h.verified ? " | verified" : ""}`)
    .join("\n");

  return (
    <div className="max-w-3xl">
      <h1 className="text-display">Homepage text</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Small labels (“eyebrows”) are the short uppercase words above each heading. Describe the property, not the ideal
        tenant (Fair Housing).
      </p>
      <SaveForm action={saveHomePage} className="mt-8">
        <Card title="Top of the page">
          <div className="space-y-5">
            <Field label="Label" name="hero_eyebrow" defaultValue={c.hero.eyebrow} />
            <Field label="Headline" name="hero_headline" defaultValue={c.hero.headline} required />
            <Field label="Headline accent (in italic)" name="hero_accent" defaultValue={c.hero.headlineAccent} />
            <TextArea label="Supporting sentence" name="hero_subline" defaultValue={c.hero.subline} rows={3} />
          </div>
        </Card>
        <Card title="About the building">
          <div className="space-y-5">
            <Field label="Label" name="intro_eyebrow" defaultValue={c.intro.eyebrow} />
            <Field label="Heading" name="intro_heading" defaultValue={c.intro.heading} />
            <TextArea label="Paragraphs" name="intro_body" defaultValue={c.intro.body.join("\n\n")} rows={8} hint="Leave a blank line between paragraphs." />
          </div>
        </Card>
        <Card title="Residences section">
          <div className="space-y-5">
            <Field label="Label" name="res_eyebrow" defaultValue={c.residences.eyebrow} />
            <Field label="Heading" name="res_heading" defaultValue={c.residences.heading} />
            <TextArea label="Text" name="res_body" defaultValue={c.residences.body} rows={3} />
          </div>
        </Card>
        <Card title="Interiors section">
          <div className="space-y-5">
            <Field label="Label" name="int_eyebrow" defaultValue={c.interiors.eyebrow} />
            <Field label="Heading" name="int_heading" defaultValue={c.interiors.heading} />
            <TextArea label="Text" name="int_body" defaultValue={c.interiors.body} rows={2} />
          </div>
        </Card>
        <Card title="Neighborhood">
          <div className="space-y-5">
            <Field label="Label" name="nb_eyebrow" defaultValue={c.neighborhood.eyebrow} />
            <Field label="Heading" name="nb_heading" defaultValue={c.neighborhood.heading} />
            <TextArea label="Text" name="nb_body" defaultValue={c.neighborhood.body} rows={3} />
            <TextArea
              label="Places and travel times"
              name="nb_highlights"
              defaultValue={highlights}
              rows={6}
              hint="One per line: Place | walk, bike, transit or drive | minutes | verified. Check each time in Google Maps, then add “| verified”."
            />
            <Field label="Small print" name="nb_disclaimer" defaultValue={c.neighborhood.disclaimer} />
          </div>
        </Card>
        <Card title="What’s included" description="Only items marked “Show” appear. Utilities, parking and pets stay hidden until you confirm them.">
          <div className="space-y-5">
            <Field label="Label" name="feat_eyebrow" defaultValue={c.features.eyebrow} />
            <Field label="Heading" name="feat_heading" defaultValue={c.features.heading} />
            {c.features.items.map((item, i) => (
              <fieldset key={i} className="rounded-xl border border-ink/10 p-4">
                <legend className="px-1 text-sm font-semibold">{item.title}</legend>
                <div className="space-y-4">
                  <Field label="Title" name={`feat_${i}_title`} defaultValue={item.title} />
                  <TextArea label="Description" name={`feat_${i}_body`} defaultValue={item.body} rows={2} />
                  <Checkbox label="Show on the website" name={`feat_${i}_confirmed`} defaultChecked={item.confirmed} />
                </div>
              </fieldset>
            ))}
          </div>
        </Card>
        <Card title="FAQ heading & closing banner">
          <div className="space-y-5">
            <Field label="FAQ label" name="faq_eyebrow" defaultValue={c.faq.eyebrow} />
            <Field label="FAQ heading" name="faq_heading" defaultValue={c.faq.heading} />
            <Field label="Banner heading" name="cta_heading" defaultValue={c.cta.heading} />
            <TextArea label="Banner text" name="cta_body" defaultValue={c.cta.body} rows={2} />
          </div>
        </Card>
      </SaveForm>
    </div>
  );
}
