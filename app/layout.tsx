import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo RFP Platform — Procurement Monitoring",
  description: "Prototype dashboard for monitoring procurement RFP activity.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
