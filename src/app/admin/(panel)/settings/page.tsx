import type { Metadata } from "next";
import { saveSiteSettings } from "@/app/admin/actions";
import { Card, Checkbox, Field, SaveForm } from "@/components/admin/form-kit";
import type { SiteSettings } from "@/content/types";
import { getAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contact & settings" };

export default async function SettingsPage() {
  const admin = await getAdmin();
  if (!admin) return null;
  const { data } = await admin.supabase.from("site_settings").select("content").eq("id", 1).single();
  const s = data?.content as SiteSettings;

  return (
    <div className="max-w-3xl">
      <h1 className="text-display">Contact & settings</h1>
      <SaveForm action={saveSiteSettings} className="mt-8">
        <Card title="Contact details" description="Shown in the footer and on the Contact page. Leave a field empty to hide it.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone" name="phone" type="tel" defaultValue={s.phone} />
            <Field label="Email" name="email" type="email" defaultValue={s.email} />
            <Field label="Office hours" name="office_hours" defaultValue={s.officeHours} hint="e.g. Mon–Fri, 10am–6pm" />
            <Field label="Tours" name="tour_hours" defaultValue={s.tourHours} hint="e.g. By appointment, 7 days a week" />
          </div>
        </Card>
        <Card title="Leasing banner" description="The “Now leasing” line on the homepage and the mobile Inquire bar.">
          <div className="space-y-5">
            <Field label="Text" name="banner_text" defaultValue={s.leasingBanner.text} />
            <Checkbox label="Show the banner" name="banner_enabled" defaultChecked={s.leasingBanner.enabled} />
          </div>
        </Card>
        <Card title="Inquiry emails" description="Who gets an email when someone sends an inquiry (once email sending is set up).">
          <Field label="Send to" name="notification_emails" defaultValue={s.notificationEmails.join(", ")} hint="Separate several addresses with commas." />
        </Card>
      </SaveForm>
    </div>
  );
}
