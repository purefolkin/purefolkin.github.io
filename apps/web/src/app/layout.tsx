import type { Metadata, Viewport } from "next";
import { Header, Footer } from "@/components/header";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Purefolk | Thoughtful Vegetarian Food", template: "%s | Purefolk" },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_IN", siteName: site.name, title: "Purefolk | Thoughtful Vegetarian Food", description: site.description, url: site.url },
  twitter: { card: "summary_large_image", title: "Purefolk | Thoughtful Vegetarian Food", description: site.description },
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : { index: true, follow: true },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f7f3ec" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en-IN"><body><Header/><main>{children}</main><Footer/></body></html>;
}
