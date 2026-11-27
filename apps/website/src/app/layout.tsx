import type { Metadata, Viewport } from "next";
import { Header, Footer } from "@/components/site-chrome";
import { site } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = { metadataBase:new URL(site.url), title:{default:"Purefolk | Thoughtful Vegetarian Food",template:"%s | Purefolk"}, description:site.description, applicationName:site.name, alternates:{canonical:"/"}, openGraph:{type:"website",locale:"en_IN",siteName:site.name,title:"Purefolk | Thoughtful Vegetarian Food",description:site.description,url:site.url}, robots:process.env.VERCEL_ENV==="preview"?{index:false,follow:false}:{index:true,follow:true} };
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#FAF8F2"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><body><Header/><main>{children}</main><Footer/></body></html>}
