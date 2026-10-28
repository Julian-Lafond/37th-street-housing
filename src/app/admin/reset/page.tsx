import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/wordmark";
import { ResetPasswordForm } from "@/components/admin/login-forms";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-plaster p-7 sm:p-9">
        <Wordmark wordmark="37th Street" descriptor="Admin" />
        <h1 className="mt-8 text-title">Set a new password</h1>
        <div className="mt-7">
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
