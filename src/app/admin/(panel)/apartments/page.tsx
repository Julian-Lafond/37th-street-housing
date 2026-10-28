import type { Metadata } from "next";
import Link from "next/link";
import { formatCurrency } from "@/lib/pricing";
import { getAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Apartments" };

export default async function ApartmentsPage() {
  const admin = await getAdmin();
  if (!admin) return null;
  const { data } = await admin.supabase
    .from("units")
    .select("slug, display_name, bedrooms, bathrooms, monthly_rent, status, published")
    .order("sort_order");

  return (
    <div>
      <h1 className="text-display">Apartments</h1>
      <p className="mt-2 text-sm text-ink-soft">Choose an apartment to change its price, availability or description.</p>
      <ul className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-plaster">
        {(data ?? []).map((u) => (
          <li key={u.slug}>
            <Link href={`/admin/apartments/${u.slug}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-sand/50">
              <span>
                <span className="font-display text-2xl">{u.display_name}</span>
                <span className="ml-3 text-sm text-ink-soft">
                  {u.bedrooms} bed · {u.bathrooms} bath
                </span>
              </span>
              <span className="flex items-center gap-3 text-sm">
                <span className="font-semibold">{formatCurrency(u.monthly_rent)} / month</span>
                <span className="rounded-full border border-ink/15 px-2.5 py-0.5 capitalize">{u.status}</span>
                {!u.published && <span className="rounded-full bg-ink px-2.5 py-0.5 text-plaster">Hidden</span>}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
