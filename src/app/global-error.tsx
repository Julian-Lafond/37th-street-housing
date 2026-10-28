"use client";

// Replaces the root layout when it fails, so it carries its own minimal styles.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f7f2ea", color: "#1b1f1d", fontFamily: "system-ui, sans-serif" }}>
        <title>Something went wrong | 37th Street Housing</title>
        <main style={{ maxWidth: "40rem", margin: "0 auto", padding: "6rem 1rem" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "2.5rem", lineHeight: 1.1 }}>
            Sorry, something went wrong.
          </h1>
          <p style={{ fontSize: "1.125rem", lineHeight: 1.6, color: "#4a504c" }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "1.5rem",
              minHeight: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: "999px",
              border: 0,
              background: "#b23e1f",
              color: "#f7f2ea",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
