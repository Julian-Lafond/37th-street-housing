import type { Metadata } from "next";
import { createFaq, deleteFaq, saveFaq } from "@/app/admin/actions";
import { Card, Checkbox, Field, SaveForm, TextArea } from "@/components/admin/form-kit";
import type { FaqRow } from "@/lib/supabase/mappers";
import { getAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqsPage() {
  const admin = await getAdmin();
  if (!admin) return null;
  const { data } = await admin.supabase.from("faqs").select("*").order("sort_order");
  const faqs = (data ?? []) as FaqRow[];

  return (
    <div className="max-w-3xl">
      <h1 className="text-display">FAQs</h1>
      <p className="mt-2 text-sm text-ink-soft">Questions stay hidden until they have an answer and “Show on website” is checked.</p>
      <ul className="mt-8 space-y-4">
        {faqs.map((f) => (
          <li key={f.id}>
            <Card title={f.question} description={f.published ? "Visible on the website" : "Hidden"}>
              <SaveForm action={saveFaq}>
                <input type="hidden" name="id" value={f.id} />
                <Field label="Question" name="question" defaultValue={f.question} required />
                <TextArea label="Answer" name="answer" defaultValue={f.answer} rows={3} />
                <div className="grid gap-5 sm:grid-cols-[8rem_1fr] sm:items-end">
                  <Field label="Order" name="sort_order" type="number" min={0} defaultValue={f.sort_order} />
                  <Checkbox label="Show on website" name="published" defaultChecked={f.published} />
                </div>
              </SaveForm>
              <div className="mt-4 border-t border-ink/10 pt-4">
                <SaveForm
                  action={deleteFaq}
                  submitLabel="Delete question"
                  destructive
                  confirmMessage={`Delete the question “${f.question}”? This can’t be undone.`}
                >
                  <input type="hidden" name="id" value={f.id} />
                </SaveForm>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Card title="Add a question">
          <SaveForm action={createFaq} submitLabel="Add question">
            <Field label="Question" name="question" required />
          </SaveForm>
        </Card>
      </div>
    </div>
  );
}
