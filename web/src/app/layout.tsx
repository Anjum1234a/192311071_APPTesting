import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Dental Care",
  description: "AI Dental Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50">{children}</body>
    </html>
  );
}
