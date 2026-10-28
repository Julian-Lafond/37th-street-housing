"use client";

import { useActionState, useId, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";

export interface ActionResult {
  ok: boolean;
  message: string;
}
export type FormAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/** A form bound to a server action, with a live "Saved" / error message. */
export function SaveForm({
  action,
  children,
  submitLabel = "Save changes",
  className = "",
  destructive = false,
  confirmMessage,
}: {
  action: FormAction;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  destructive?: boolean;
  /** Asks "are you sure?" before submitting; cancelling sends nothing. */
  confirmMessage?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={`space-y-5 ${className}`}
    >
      {children}
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton label={submitLabel} destructive={destructive} />
        <p role="status" aria-live="polite" className="text-sm font-semibold">
          {state && (
            <span className={`inline-flex items-center gap-1.5 ${state.ok ? "text-eucalyptus-ink" : "text-terracotta"}`}>
              {state.ok ? <CheckCircle2 aria-hidden="true" className="size-4" /> : <AlertCircle aria-hidden="true" className="size-4" />}
              {state.message}
            </span>
          )}
        </p>
      </div>
    </form>
  );
}

export function SubmitButton({ label, destructive = false }: { label: string; destructive?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-11 items-center rounded-full px-5 text-[0.9375rem] font-semibold transition-[background-color,transform] active:scale-[0.97] disabled:opacity-60 ${
        destructive ? "border border-terracotta text-terracotta hover:bg-terracotta hover:text-plaster" : "bg-ink text-plaster hover:bg-dusk"
      }`}
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

const inputBase =
  "block w-full rounded-lg border border-ink/25 bg-plaster px-3.5 text-base text-ink transition-colors hover:border-ink/50 focus:border-ink";

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  hint,
  required,
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: "text" | "number" | "email" | "tel" | "date" | "url";
  hint?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label} {required && <span className="font-normal text-ink-soft">(required)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-0.5 mb-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        min={min}
        max={max}
        step={step}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${inputBase} min-h-11`}
      />
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  hint,
  rows = 4,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  rows?: number;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label} {required && <span className="font-normal text-ink-soft">(required)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-0.5 mb-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${inputBase} py-2.5`}
      />
    </div>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-0.5 mb-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      )}
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${inputBase} min-h-11`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Checkbox({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-1 size-5 shrink-0 accent-terracotta" />
      <label htmlFor={id} className="text-[0.9375rem]">
        <span className="font-semibold">{label}</span>
        {hint && <span className="block text-xs text-ink-soft">{hint}</span>}
      </label>
    </div>
  );
}

export function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-plaster p-5 sm:p-7">
      <h2 className="font-sans text-lg font-bold" style={{ fontVariationSettings: "normal" }}>
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
