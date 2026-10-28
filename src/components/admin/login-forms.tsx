"use client";

import { useActionState, useState } from "react";
import { requestPasswordReset, signIn, updatePassword } from "@/app/admin/actions";
import { Field, SubmitButton } from "./form-kit";

function Message({ state }: { state: { ok: boolean; message: string } | null }) {
  return (
    <p role="status" aria-live="polite" className={`text-sm font-semibold ${state?.ok ? "text-eucalyptus-ink" : "text-terracotta"}`}>
      {state?.message}
    </p>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [loginState, loginAction] = useActionState(signIn, null);
  const [resetState, resetAction] = useActionState(requestPasswordReset, null);

  if (mode === "reset") {
    return (
      <form action={resetAction} className="space-y-5">
        <p className="text-sm text-ink-soft">Enter your email and we’ll send you a link to set a new password.</p>
        <Field label="Email" name="email" type="email" required />
        <SubmitButton label="Send reset link" />
        <Message state={resetState} />
        <button type="button" onClick={() => setMode("login")} className="text-sm font-semibold text-terracotta underline">
          Back to login
        </button>
      </form>
    );
  }
  return (
    <form action={loginAction} className="space-y-5">
      <Field label="Email" name="email" type="email" required />
      <PasswordField name="password" label="Password" autoComplete="current-password" />
      <SubmitButton label="Log in" />
      <Message state={loginState} />
      <button type="button" onClick={() => setMode("reset")} className="text-sm font-semibold text-terracotta underline">
        Forgot your password?
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, null);
  return (
    <form action={action} className="space-y-5">
      <PasswordField name="password" label="New password" autoComplete="new-password" hint="At least 12 characters." />
      <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" />
      <SubmitButton label="Save new password" />
      <Message state={state} />
    </form>
  );
}

function PasswordField({ name, label, autoComplete, hint }: { name: string; label: string; autoComplete: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
        {label} <span className="font-normal text-ink-soft">(required)</span>
      </label>
      {hint && <p className="-mt-0.5 mb-1.5 text-xs text-ink-soft">{hint}</p>}
      <div className="flex gap-2">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required
          autoComplete={autoComplete}
          className="block min-h-11 w-full rounded-lg border border-ink/25 bg-plaster px-3.5 text-base"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          className="min-h-11 shrink-0 rounded-lg border border-ink/25 px-3 text-sm font-semibold"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
