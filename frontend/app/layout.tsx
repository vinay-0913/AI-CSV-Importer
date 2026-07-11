import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowEasy AI CSV Importer",
  description:
    "Intelligently import CSV files from any format into GrowEasy CRM using AI-powered field mapping. Supports Facebook Leads, Google Ads, Excel, and custom formats.",
  keywords: [
    "CRM",
    "CSV importer",
    "AI",
    "lead management",
    "GrowEasy",
    "data import",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inter — closest open-source substitute for Haas Grotesk (per DESIGN.md §Typography) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          backgroundColor: "var(--color-canvas)",
          color: "var(--color-ink)",
        }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
