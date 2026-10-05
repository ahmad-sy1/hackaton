import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "HitchTracker",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl">
      <body className="min-h-dvh bg-white text-zinc-900 antialiased">
        <header className="border-b border-zinc-200">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-10 py-4">
            <span aria-hidden className="h-7 w-7 rounded-md bg-zinc-200" />
            <Link href="/" className="text-lg font-semibold">
              HitchTracker
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-10 py-16">{children}</main>
      </body>
    </html>
  );
}
