import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { saveUnit } from "@/app/admin/actions";
import { Card, Checkbox, Field, SaveForm, Select, TextArea } from "@/components/admin/form-kit";
import type { OneTimeCharge, RecurringFee } from "@/content/types";
import type { UnitRow } from "@/lib/supabase/mappers";
import { getAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit apartment" };

const fees = (list: RecurringFee[]) => list.map((f) => `${f.name}: ${f.monthlyAmount}`).join("\n");
const charges = (list: OneTimeCharge[]) => list.map((c) => `${c.name}: ${c.amount}${c.refundable ? " (refundable)" : ""}`).join("\n");

export default async function EditApartmentPage({ params }: PageProps<"/admin/apartments/[slug]">) {
  const { slug } = await params;
  const admin = await getAdmin();
  if (!admin) return null;
  const { data } = await admin.supabase.from("units").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const u = data as UnitRow;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/apartments" className="text-sm font-semibold text-terracotta underline">
        ← All apartments
      </Link>
      <h1 className="mt-3 text-display">{u.display_name}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        <Link href={`/residences/${u.slug}`} target="_blank" className="underline">
          View this page on the website<span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </p>

      <SaveForm action={saveUnit} className="mt-8">
        <input type="hidden" name="slug" value={u.slug} />

        <Card title="Price & availability">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Monthly rent ($, whole apartment)" name="monthly_rent" type="number" min={0} defaultValue={u.monthly_rent} required />
            <Field label="Security deposit ($)" name="security_deposit" type="number" min={0} defaultValue={u.security_deposit} required />
            <Select
              label="Status"
              name="status"
              defaultValue={u.status}
              options={[
                { value: "available", label: "Available" },
                { value: "limited", label: "Limited availability" },
                { value: "waitlist", label: "Waitlist" },
                { value: "leased", label: "Leased" },
              ]}
            />
            <Field label="Available from" name="available_from" type="date" defaultValue={u.available_from} required />
            <Field label="Lease term (months)" name="lease_term_months" type="number" min={1} max={60} defaultValue={u.lease_term_months} required />
          </div>
          <div className="mt-5 space-y-5">
            <TextArea
              label="Required monthly fees"
              name="mandatory_fees"
              defaultValue={fees(u.mandatory_fees)}
              rows={3}
              hint="One per line, like “Trash & sewer: 45”. These are added to the advertised monthly price automatically. Leave empty if there are none."
            />
            <TextArea label="Optional monthly fees" name="optional_fees" defaultValue={fees(u.optional_fees)} rows={2} hint="One per line, like “Parking: 150”." />
            <TextArea
              label="Other one-time charges"
              name="one_time_charges"
              defaultValue={charges(u.one_time_charges)}
              rows={2}
              hint="One per line, like “Application fee: 50” or “Key deposit: 100 (refundable)”. The security deposit is above."
            />
            <Checkbox label="Show “about $X per bedroom if split evenly”" name="show_per_bedroom_helper" defaultChecked={u.show_per_bedroom_helper} />
          </div>
        </Card>

        <Card title="Details">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Bedrooms" name="bedrooms" type="number" min={1} max={12} defaultValue={u.bedrooms} required />
            <Field label="Bathrooms" name="bathrooms" type="number" min={1} max={12} defaultValue={u.bathrooms} required />
            <Field label="Square feet" name="square_feet" type="number" min={1} defaultValue={u.square_feet} required />
          </div>
          <div className="mt-5 space-y-4">
            <Checkbox label="Fully furnished" name="furnished" defaultChecked={u.furnished} />
            <Checkbox label="In-unit washer & dryer" name="in_unit_laundry" defaultChecked={u.in_unit_laundry} />
          </div>
        </Card>

        <Card title="Text" description="Describe the apartment, not the ideal tenant (Fair Housing). Avoid phrases like “perfect for students” or “no kids”.">
          <div className="space-y-5">
            <TextArea label="Short summary (cards)" name="summary" defaultValue={u.summary} rows={3} required />
            <TextArea label="Full description (apartment page)" name="description" defaultValue={u.description} rows={6} required />
            <TextArea label="Features" name="features" defaultValue={u.features.join("\n")} rows={6} hint="One per line." />
          </div>
        </Card>

        <Card title="Search engines">
          <div className="space-y-5">
            <Field
              label="Page title"
              name="seo_title"
              defaultValue={u.seo_title}
              hint="Shown in Google results, followed by “| 37th Street Housing”. Leave blank (recommended) to build it from this apartment’s details. If you write one, keep it under about 38 characters."
            />
            <TextArea
              label="Page description"
              name="seo_description"
              defaultValue={u.seo_description}
              rows={3}
              hint="Leave blank (recommended) so the price and availability in Google always match this page. If you write one, keep it under 155 characters."
            />
          </div>
        </Card>

        <Card title="Visibility">
          <Checkbox label="Show this apartment on the website" name="published" defaultChecked={u.published} />
        </Card>
      </SaveForm>
    </div>
  );
}
