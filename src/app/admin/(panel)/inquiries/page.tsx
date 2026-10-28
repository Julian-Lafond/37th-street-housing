import type { Metadata } from "next";
import { deleteInquiry, saveInquiry } from "@/app/admin/actions";
import { SaveForm, Select, TextArea } from "@/components/admin/form-kit";
import { getAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Inquiries" };

interface InquiryRow {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  unit_slug: string;
  move_in: string | null;
  move_in_other: string | null;
  group_size: number | null;
  contact_method: string;
  message: string | null;
  sms_consent: boolean;
  status: string;
  notes: string | null;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "toured", label: "Toured" },
  { value: "closed", label: "Closed" },
];

export default async function InquiriesPage() {
  const admin = await getAdmin();
  if (!admin) return null;
  const [{ data }, { data: units }] = await Promise.all([
    admin.supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(500),
    admin.supabase.from("units").select("slug, display_name"),
  ]);
  const rows = (data ?? []) as InquiryRow[];
  const unitName = (slug: string) => units?.find((u) => u.slug === slug)?.display_name ?? "Not sure yet";
  const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Los_Angeles" });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display">Inquiries</h1>
          <p className="mt-2 text-sm text-ink-soft">Newest first. Inquiries are deleted automatically after 24 months.</p>
        </div>
        {rows.length > 0 && (
          <a href="/admin/inquiries/export" className="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-5 text-sm font-semibold hover:bg-plaster">
            Download CSV
          </a>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-ink-soft">No inquiries yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-ink/10 bg-plaster p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-sans text-lg font-bold" style={{ fontVariationSettings: "normal" }}>
                  {r.full_name} <span className="font-normal text-ink-soft">· {unitName(r.unit_slug)}</span>
                </h2>
                <p className="text-sm text-ink-soft">
                  {fmt.format(new Date(r.created_at))}
                  {r.status === "new" && <span className="ml-2 rounded-full bg-sunset/20 px-2 py-0.5 text-xs font-bold text-terracotta">New</span>}
                </p>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="inline font-semibold">Email: </dt>
                  <dd className="inline">
                    <a className="text-terracotta underline" href={`mailto:${r.email}`}>
                      {r.email}
                    </a>
                  </dd>
                </div>
                {r.phone && (
                  <div>
                    <dt className="inline font-semibold">Phone: </dt>
                    <dd className="inline">
                      <a className="text-terracotta underline" href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>
                        {r.phone}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="inline font-semibold">Prefers: </dt>
                  <dd className="inline">
                    {r.contact_method}
                    {r.contact_method === "text" && (r.sms_consent ? " (agreed to texts)" : "")}
                  </dd>
                </div>
                {r.move_in && (
                  <div>
                    <dt className="inline font-semibold">Move-in: </dt>
                    <dd className="inline">{r.move_in === "august-2027" ? "August 2027" : r.move_in_other}</dd>
                  </div>
                )}
                {r.group_size && (
                  <div>
                    <dt className="inline font-semibold">Group size: </dt>
                    <dd className="inline">{r.group_size}</dd>
                  </div>
                )}
              </dl>
              {r.message && <p className="mt-3 whitespace-pre-line rounded-lg bg-sand/60 p-3 text-sm">{r.message}</p>}
              <div className="mt-5 grid gap-6 border-t border-ink/10 pt-5 lg:grid-cols-[1fr_auto]">
                <SaveForm action={saveInquiry} submitLabel="Save">
                  <input type="hidden" name="id" value={r.id} />
                  <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
                    <Select label="Status" name="status" defaultValue={r.status} options={STATUS_OPTIONS} />
                    <TextArea label="Private notes" name="notes" defaultValue={r.notes} rows={2} />
                  </div>
                </SaveForm>
                <SaveForm
                  action={deleteInquiry}
                  submitLabel="Delete"
                  destructive
                  className="lg:self-end"
                  confirmMessage={`Delete the inquiry from ${r.full_name}? This can’t be undone.`}
                >
                  <input type="hidden" name="id" value={r.id} />
                </SaveForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
