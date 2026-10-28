import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";
import { signOut } from "@/app/admin/actions";
import { getAdmin } from "@/lib/supabase/server";

async function RequireAdmin({ children }: { children: ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <>
      <p className="mb-6 text-sm text-ink-soft">Signed in as {admin.user.email}</p>
      {children}
    </>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-ink/10 bg-plaster">
        <div className="container-site flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/admin" className="rounded-md">
            <Wordmark wordmark="37th Street" descriptor="Admin" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-4 text-sm font-semibold hover:bg-sand">
              View website<span className="sr-only"> (opens in a new tab)</span>
            </Link>
            <form action={signOut}>
              <button type="submit" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ink-soft hover:text-ink">
                Log out
              </button>
            </form>
          </div>
        </div>
        <Suspense fallback={<AdminNavLinks pathname={null} />}>
          <AdminNav />
        </Suspense>
      </header>
      <main id="main" className="container-site flex-1 py-8 md:py-10">
        <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
          <RequireAdmin>{children}</RequireAdmin>
        </Suspense>
      </main>
    </div>
  );
}
