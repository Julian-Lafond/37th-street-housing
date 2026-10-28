import { getAdmin } from "@/lib/supabase/server";

const COLUMNS = ["created_at", "full_name", "email", "phone", "unit_slug", "move_in", "move_in_other", "group_size", "contact_method", "sms_consent", "message", "status", "notes"];

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote everything; neutralize spreadsheet formulas.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return new Response("Not authorized", { status: 401 });
  const { data, error } = await admin.supabase.from("inquiries").select(COLUMNS.join(",")).order("created_at", { ascending: false });
  if (error) return new Response("Export failed", { status: 500 });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const csv = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
