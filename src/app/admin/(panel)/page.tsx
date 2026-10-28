import Link from "next/link";
import { getAdmin } from "@/lib/supabase/server";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/service";

export default async function AdminHome() {
  const admin = await getAdmin();
  if (!admin) return null;
  const { supabase } = admin;

  // Retention: inquiries older than the configured period are deleted when the owner checks in.
  if (isServiceConfigured()) {
    await createServiceClient().rpc("purge_old_inquiries", {
      retention_months: Number(process.env.INQUIRY_RETENTION_MONTHS ?? 24),
    });
  }

  const [newInquiries, units, photos, faqs] = await Promise.all([
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("units").select("slug", { count: "exact", head: true }),
    supabase.from("media").select("id", { count: "exact", head: true }),
    supabase.from("faqs").select("id", { count: "exact", head: true }).eq("published", false),
  ]);

  const tiles = [
    { href: "/admin/inquiries", label: "New inquiries", value: newInquiries.count ?? 0, note: "Waiting for a reply" },
    { href: "/admin/apartments", label: "Apartments", value: units.count ?? 0, note: "Prices, availability, details" },
    { href: "/admin/photos", label: "Photos", value: photos.count ?? 0, note: "Upload, describe, assign to apartments" },
    { href: "/admin/faqs", label: "Hidden FAQs", value: faqs.count ?? 0, note: "Questions waiting for an answer" },
  ];

  return (
    <div>
      <h1 className="text-display">Overview</h1>
      <p className="mt-3 max-w-[60ch] text-ink-soft">
        Changes you save here appear on the website within a few seconds. Need help? Contact your developer.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="block h-full rounded-2xl border border-ink/10 bg-plaster p-6 transition-transform hover:-translate-y-0.5">
              <span className="block text-sm font-semibold text-ink-soft">{t.label}</span>
              <span className="mt-2 block font-display text-5xl leading-none">{t.value}</span>
              <span className="mt-3 block text-sm text-ink-soft">{t.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
