import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Lumière — Luxury Skincare", template: "%s | Lumière" },
  description: "Premium clean beauty & skincare crafted with botanical science.",
  keywords: ["skincare", "luxury beauty", "serums", "clean beauty", "moisturizer"],
  openGraph: { title: "Lumière", description: "Premium clean beauty & skincare.", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}