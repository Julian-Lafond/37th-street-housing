import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/wordmark";
import { LoginForm } from "@/components/admin/login-forms";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-plaster p-7 sm:p-9">
        <Wordmark wordmark="37th Street" descriptor="Admin" />
        <h1 className="mt-8 text-title">Log in</h1>
        <p className="mt-2 text-sm text-ink-soft">Edit apartments, photos and text, and read inquiries.</p>
        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
