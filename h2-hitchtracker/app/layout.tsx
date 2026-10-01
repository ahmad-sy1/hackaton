import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HitchTracker",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
