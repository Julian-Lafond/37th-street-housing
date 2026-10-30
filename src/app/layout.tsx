import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { INTRO_SCRIPT } from "@/components/motion/intro";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

// Italic carries the accent word in headlines (including the hero), so it's preloaded too.
const frauncesItalic = Fraunces({
  variable: "--font-fraunces-italic",
  subsets: ["latin"],
  axes: ["opsz"],
  style: "italic",
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s | 37th Street Housing",
  },
  description: HOME_DESCRIPTION,
  applicationName: "37th Street Housing",
  openGraph: {
    type: "website",
    siteName: "37th Street Housing",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f2ea",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${frauncesItalic.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Decides before first paint whether the branded intro plays (first public page of a session only). */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
