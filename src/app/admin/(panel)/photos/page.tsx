import type { Metadata } from "next";
import Image from "next/image";
import { deletePhoto, savePhoto, uploadPhoto } from "@/app/admin/actions";
import { FileField } from "@/components/admin/file-field";
import { Card, Checkbox, Field, SaveForm, Select, TextArea } from "@/components/admin/form-kit";
import { mediaUrl } from "@/lib/supabase/env";
import type { MediaRow } from "@/lib/supabase/mappers";
import { getAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Photos" };

const ROOMS = ["living", "kitchen", "hallway", "bedroom", "bathroom", "laundry", "exterior"].map((r) => ({
  value: r,
  label: r[0].toUpperCase() + r.slice(1),
}));
const CATEGORIES = [
  { value: "interior", label: "Interior" },
  { value: "exterior", label: "Exterior" },
];

export default async function PhotosPage() {
  const admin = await getAdmin();
  if (!admin) return null;
  const [{ data: media }, { data: units }] = await Promise.all([
    admin.supabase.from("media").select("*").order("sort_order"),
    admin.supabase.from("units").select("slug, display_name").order("sort_order"),
  ]);
  const unitOptions = [
    { value: "", label: "Shared building gallery (not tied to an apartment)" },
    ...(units ?? []).map((u) => ({ value: u.slug, label: u.display_name })),
  ];
  const photos = (media ?? []) as MediaRow[];

  return (
    <div>
      <h1 className="text-display">Photos</h1>
      <p className="mt-2 max-w-[65ch] text-sm text-ink-soft">
        Photos in the shared gallery appear on the Gallery page with a note that they show representative residences. Only
        assign a photo to an apartment if you’re sure it shows that apartment; it will then appear on that apartment’s page.
      </p>

      <div className="mt-8">
        <Card title="Upload a photo">
          <SaveForm action={uploadPhoto} submitLabel="Upload">
            <div className="grid gap-5 lg:grid-cols-2">
              <FileField label="Photo" name="file" />
              <div className="space-y-5">
                <TextArea
                  label="Description for screen readers"
                  name="alt"
                  rows={3}
                  required
                  hint="Describe what the photo shows, e.g. “Bedroom with two tall windows, a queen bed and a desk.”"
                />
                <Field label="Caption (optional)" name="caption" />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Select label="Type" name="category" defaultValue="interior" options={CATEGORIES} />
                  <Select label="Room" name="room" defaultValue="bedroom" options={ROOMS} />
                </div>
                <Select label="Shows" name="assigned_unit" defaultValue="" options={unitOptions} />
              </div>
            </div>
          </SaveForm>
        </Card>
      </div>

      <h2 className="mt-12 font-sans text-xl font-bold" style={{ fontVariationSettings: "normal" }}>
        All photos ({photos.length})
      </h2>
      <ul className="mt-5 space-y-4">
        {photos.map((p) => (
          <li key={p.id} className="rounded-2xl border border-ink/10 bg-plaster p-4 sm:p-5">
            <div className="grid gap-5 md:grid-cols-[14rem_1fr]">
              <div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-sand">
                  <Image
                    src={mediaUrl(p.src)}
                    alt={p.alt}
                    fill
                    sizes="224px"
                    quality={70}
                    className="object-cover"
                    style={{ objectPosition: `${p.focal_x}% ${p.focal_y}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-ink-soft">
                  {p.assigned_unit ? `Shows ${units?.find((u) => u.slug === p.assigned_unit)?.display_name}` : "Shared gallery"}
                  {!p.published && " · Hidden"}
                  {p.is_cover && " · Cover"}
                </p>
              </div>
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold">
                  <span className="line-clamp-2">{p.caption || p.alt}</span>
                  <span className="ml-auto shrink-0 text-sm text-terracotta underline group-open:hidden">Edit</span>
                </summary>
                <div className="mt-4 space-y-6">
                  <SaveForm action={savePhoto}>
                    <input type="hidden" name="id" value={p.id} />
                    <TextArea label="Description for screen readers" name="alt" defaultValue={p.alt} rows={3} required />
                    <Field label="Caption" name="caption" defaultValue={p.caption} />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Select label="Type" name="category" defaultValue={p.category} options={CATEGORIES} />
                      <Select label="Room" name="room" defaultValue={p.room} options={ROOMS} />
                    </div>
                    <Select label="Shows" name="assigned_unit" defaultValue={p.assigned_unit ?? ""} options={unitOptions} />
                    <div className="grid gap-5 sm:grid-cols-3">
                      <Field label="Focus left–right (%)" name="focal_x" type="number" min={0} max={100} defaultValue={p.focal_x} hint="Keeps this point in view when cropped." />
                      <Field label="Focus top–bottom (%)" name="focal_y" type="number" min={0} max={100} defaultValue={p.focal_y} />
                      <Field label="Order" name="sort_order" type="number" min={0} defaultValue={p.sort_order} hint="Lower numbers come first." />
                    </div>
                    <Checkbox label="Cover photo for its apartment" name="is_cover" defaultChecked={p.is_cover} hint="Only applies when the photo is assigned to an apartment." />
                    <Checkbox label="Show on the website" name="published" defaultChecked={p.published} />
                  </SaveForm>
                  <SaveForm action={deletePhoto} submitLabel="Delete photo" destructive confirmMessage="Delete this photo from the website? This can’t be undone.">
                    <input type="hidden" name="id" value={p.id} />
                  </SaveForm>
                </div>
              </details>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
