"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Info, Mail } from "lucide-react";
import { ANY_UNIT, createInquirySchema, inquiryDefaults, type InquiryInput } from "@/lib/inquiry-schema";
import { submitInquiry, type InquiryResult } from "@/lib/inquiry";
import { sendInquiry } from "@/lib/inquiry-action";
import { buttonClasses } from "@/components/ui/button";

export interface UnitOption {
  slug: string;
  /** Visible label, e.g. "Apt 1158 ¼ · 3 bed / 3 bath · $5,100/mo" */
  label: string;
  /** Spoken label, e.g. "Apartment 1158 and a quarter, 3 bed, 3 bath, $5,100 per month" */
  accessibleLabel: string;
  /** Short name for the email body. */
  name: string;
}

type FieldName = keyof InquiryInput;

// Field order for the error summary.
const FIELD_ORDER: FieldName[] = ["fullName", "email", "phone", "unit", "moveIn", "moveInOther", "groupSize", "contactMethod", "message", "consent", "smsConsent"];

const FIELD_LABELS: Record<FieldName, string> = {
  fullName: "Full name",
  email: "Email",
  phone: "Phone",
  unit: "Apartment of interest",
  moveIn: "Desired move-in",
  moveInOther: "Preferred move-in timing",
  groupSize: "Group size",
  contactMethod: "Preferred contact method",
  message: "Message",
  consent: "Consent to be contacted",
  smsConsent: "Consent to text messages",
  website: "Website",
};

function UnitPrefill({ slugs, setValue }: { slugs: string[]; setValue: UseFormSetValue<InquiryInput> }) {
  const params = useSearchParams();
  const unit = params.get("unit");
  useEffect(() => {
    if (unit && slugs.includes(unit)) setValue("unit", unit, { shouldDirty: true });
  }, [unit, slugs, setValue]);
  return null;
}

export function InquiryForm({
  units,
  contact,
  backend,
}: {
  units: UnitOption[];
  contact: { email: string | null; phone: string | null; addressLine: string };
  /** True when the inquiry backend (Supabase) is configured: submissions are saved. */
  backend: boolean;
}) {
  const slugs = useMemo(() => units.map((u) => u.slug), [units]);
  const schema = useMemo(() => createInquirySchema(slugs), [slugs]);
  const [result, setResult] = useState<InquiryResult | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<InquiryInput>({
    resolver: zodResolver(schema),
    defaultValues: inquiryDefaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const contactMethod = useWatch({ control, name: "contactMethod" });
  const moveIn = useWatch({ control, name: "moveIn" });

  useEffect(() => {
    if (showSummary) summaryRef.current?.focus();
  }, [showSummary, submitCount]);

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  const onValid = async (data: InquiryInput) => {
    setShowSummary(false);
    if (backend) {
      const res = await sendInquiry(data).catch(
        (): InquiryResult => ({ status: "error", message: "Something went wrong. Please try again or email us." }),
      );
      setResult(res);
      if (res.status === "received") reset(inquiryDefaults);
      return;
    }
    const unit = units.find((u) => u.slug === data.unit);
    const res = await submitInquiry(data, {
      contact,
      unitLabel: unit ? unit.name : "Not sure yet",
      moveInLabel: data.moveIn === "august-2027" ? "August 2027" : data.moveIn === "other" ? data.moveInOther : "",
    });
    setResult(res);
  };

  const onInvalid = () => {
    setResult(null);
    setShowSummary(true);
  };

  const errorList = FIELD_ORDER.filter((f) => errors[f]).map((f) => ({ field: f, message: errors[f]?.message ?? "" }));

  return (
    <div>
      {!backend && (
        <p className="mb-8 flex items-start gap-3 rounded-xl border border-ink/12 bg-sand/70 p-4 text-[0.9375rem]">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-eucalyptus-ink" />
          <span>
            Online inquiries are coming soon.{" "}
            {contact.email
              ? "You can fill this out now and we’ll prepare an email with your details for you to send."
              : "In the meantime, please reach out using the contact details on this page."}
          </span>
        </p>
      )}

      {showSummary && errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          aria-labelledby="error-summary-title"
          className="mb-8 rounded-xl border-2 border-terracotta bg-plaster p-5"
        >
          <h2 id="error-summary-title" className="flex items-center gap-2 font-sans text-lg font-bold" style={{ fontVariationSettings: "normal" }}>
            <AlertCircle aria-hidden="true" className="size-5 text-terracotta" />
            Please fix {errorList.length === 1 ? "1 problem" : `${errorList.length} problems`}
          </h2>
          <ul className="mt-3 space-y-1.5">
            {errorList.map((e) => (
              <li key={e.field}>
                <a
                  href={`#${fieldId(e.field)}`}
                  className="font-semibold text-terracotta underline"
                  onClick={(ev) => {
                    ev.preventDefault();
                    document.getElementById(fieldId(e.field))?.focus();
                  }}
                >
                  {FIELD_LABELS[e.field]}: {e.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div aria-live="polite">
        {result && (
          <div
            ref={resultRef}
            tabIndex={-1}
            className={`mb-8 rounded-xl border p-6 ${result.status === "error" ? "border-2 border-terracotta bg-plaster" : "border-eucalyptus bg-eucalyptus/10"}`}
          >
            <h2 className="font-sans text-lg font-bold" style={{ fontVariationSettings: "normal" }}>
              {result.status === "received" ? "Thanks, we received your inquiry." : result.message}
            </h2>
            {result.status === "received" && (
              <p className="mt-2 text-[0.9375rem] text-ink-soft">We’ll be in touch soon using the contact method you chose.</p>
            )}
            {result.status !== "received" && (
              <div className="mt-3 space-y-3 text-[0.9375rem]">
                {result.status === "unavailable" && result.mailtoHref && (
                  <a href={result.mailtoHref} className={buttonClasses("primary", "md")}>
                    <Mail aria-hidden="true" className="size-4" />
                    Open a prefilled email
                  </a>
                )}
                <ul className="space-y-1">
                  {contact.email && (
                    <li>
                      Email:{" "}
                      <a className="font-semibold text-terracotta underline" href={`mailto:${contact.email}`}>
                        {contact.email}
                      </a>
                    </li>
                  )}
                  {contact.phone && (
                    <li>
                      Phone:{" "}
                      <a className="font-semibold text-terracotta underline" href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                        {contact.phone}
                      </a>
                    </li>
                  )}
                  <li>Address: {contact.addressLine}</li>
                </ul>
                {result.status === "unavailable" && <p className="text-ink-soft">Nothing was sent or stored.</p>}
              </div>
            )}
          </div>
        )}
      </div>

      <form noValidate onSubmit={handleSubmit(onValid, onInvalid)} aria-label="Inquiry form" className="space-y-6">
        <Suspense fallback={null}>
          <UnitPrefill slugs={slugs} setValue={setValue} />
        </Suspense>

        <p className="text-sm text-ink-soft">Fields marked (required) must be filled in.</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field name="fullName" label="Full name" required errors={errors}>
            {(a) => <input {...a} {...register("fullName")} type="text" autoComplete="name" className={inputClass} />}
          </Field>
          <Field name="email" label="Email" required errors={errors}>
            {(a) => <input {...a} {...register("email")} type="email" autoComplete="email" inputMode="email" className={inputClass} />}
          </Field>
        </div>

        <Field
          name="phone"
          label="Phone"
          hint={contactMethod !== "email" ? "Required for phone or text contact." : undefined}
          errors={errors}
        >
          {(a) => <input {...a} {...register("phone")} type="tel" autoComplete="tel" inputMode="tel" className={`${inputClass} sm:max-w-sm`} />}
        </Field>

        <Field name="unit" label="Apartment of interest" required errors={errors}>
          {(a) => (
            <select {...a} {...register("unit")} className={inputClass}>
              <option value="" disabled>
                Choose an apartment
              </option>
              <option value={ANY_UNIT}>Not sure yet / show me all</option>
              {units.map((u) => (
                <option key={u.slug} value={u.slug} aria-label={u.accessibleLabel}>
                  {u.label}
                </option>
              ))}
            </select>
          )}
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field name="moveIn" label="Desired move-in" errors={errors}>
            {(a) => (
              <select {...a} {...register("moveIn")} className={inputClass}>
                <option value="">No preference</option>
                <option value="august-2027">August 2027</option>
                <option value="other">Other</option>
              </select>
            )}
          </Field>
          <Field name="groupSize" label="Group size" hint="How many people are you searching with, including you?" errors={errors}>
            {(a) => <input {...a} {...register("groupSize")} type="number" min={1} max={5} step={1} inputMode="numeric" className={`${inputClass} max-w-32`} />}
          </Field>
        </div>

        {moveIn === "other" && (
          <Field name="moveInOther" label="Preferred move-in timing" required errors={errors}>
            {(a) => <input {...a} {...register("moveInOther")} type="text" className={inputClass} />}
          </Field>
        )}

        <fieldset aria-describedby={errors.contactMethod ? errId("contactMethod") : undefined}>
          <legend className="mb-2 font-semibold">Preferred contact method</legend>
          <div className="flex flex-wrap gap-3">
            {(["email", "phone", "text"] as const).map((method) => (
              <label key={method} className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border border-ink/20 px-4 has-checked:border-ink has-checked:bg-sand">
                <input
                  {...register("contactMethod")}
                  id={method === "email" ? fieldId("contactMethod") : undefined}
                  type="radio"
                  value={method}
                  className="size-4 accent-terracotta"
                />
                {method === "email" ? "Email" : method === "phone" ? "Phone" : "Text"}
              </label>
            ))}
          </div>
          <ErrorText name="contactMethod" errors={errors} />
        </fieldset>

        <Field name="message" label="Message" hint="Questions, timing, anything that helps us help you." errors={errors}>
          {(a) => <textarea {...a} {...register("message")} rows={5} className={`${inputClass} min-h-32 py-3`} />}
        </Field>

        <div className="space-y-4 rounded-xl border border-ink/12 bg-plaster p-5">
          <CheckboxField name="consent" required errors={errors} register={register}>
            I agree to be contacted about my inquiry. See our{" "}
            <Link href="/privacy" className="font-semibold text-terracotta underline">
              Privacy Policy
            </Link>
            .
          </CheckboxField>

          {contactMethod === "text" && (
            <CheckboxField
              name="smsConsent"
              required
              errors={errors}
              register={register}
              hint="We’ll only text you about this inquiry. Message and data rates may apply. Reply STOP at any time to opt out."
            >
              I agree to receive text messages about my inquiry.
            </CheckboxField>
          )}
        </div>

        {/* Honeypot: hidden from people and assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>

        <button type="submit" disabled={isSubmitting} className={buttonClasses("primary", "lg", "w-full sm:w-auto disabled:opacity-60")}>
          {isSubmitting ? "Checking…" : "Send inquiry"}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  "block min-h-12 w-full rounded-lg border border-ink/30 bg-plaster px-4 text-base text-ink transition-colors placeholder:text-ink-soft hover:border-ink/60 aria-invalid:border-terracotta aria-invalid:border-2";

function fieldId(name: FieldName) {
  return `inquiry-${name}`;
}
function errId(name: FieldName) {
  return `inquiry-${name}-error`;
}
function hintId(name: FieldName) {
  return `inquiry-${name}-hint`;
}

function ErrorText({ name, errors }: { name: FieldName; errors: FieldErrors<InquiryInput> }) {
  const message = errors[name]?.message;
  if (!message) return null;
  return (
    <p id={errId(name)} className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-terracotta">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>
        <span className="sr-only">Error: </span>
        {message}
      </span>
    </p>
  );
}

function Field({
  name,
  label,
  hint,
  required,
  errors,
  children,
}: {
  name: FieldName;
  label: string;
  hint?: string;
  required?: boolean;
  errors: FieldErrors<InquiryInput>;
  children: (a: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string; "aria-required"?: boolean }) => ReactNode;
}) {
  const invalid = Boolean(errors[name]);
  const describedBy = [hint && hintId(name), invalid && errId(name)].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={fieldId(name)} className="mb-2 block font-semibold">
        {label} {required && <span className="font-normal text-ink-soft">(required)</span>}
      </label>
      {hint && (
        <p id={hintId(name)} className="-mt-1 mb-2 text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {children({ id: fieldId(name), "aria-invalid": invalid || undefined, "aria-describedby": describedBy, "aria-required": required || undefined })}
      <ErrorText name={name} errors={errors} />
    </div>
  );
}

function CheckboxField({
  name,
  required,
  hint,
  errors,
  register,
  children,
}: {
  name: "consent" | "smsConsent";
  required?: boolean;
  hint?: string;
  errors: FieldErrors<InquiryInput>;
  register: ReturnType<typeof useForm<InquiryInput>>["register"];
  children: ReactNode;
}) {
  const invalid = Boolean(errors[name]);
  const describedBy = [hint && hintId(name), invalid && errId(name)].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={fieldId(name)}
          type="checkbox"
          {...register(name)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className="mt-1 size-5 shrink-0 accent-terracotta"
        />
        <label htmlFor={fieldId(name)} className="text-[0.9375rem]">
          {children} {required && <span className="text-ink-soft">(required)</span>}
        </label>
      </div>
      {hint && (
        <p id={hintId(name)} className="ml-8 mt-1 text-sm text-ink-soft">
          {hint}
        </p>
      )}
      <div className="ml-8">
        <ErrorText name={name} errors={errors} />
      </div>
    </div>
  );
}
