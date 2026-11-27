import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export default function robots():MetadataRoute.Robots(){if(process.env.VERCEL_ENV==="preview")return{rules:{userAgent:"*",disallow:"/"}};return{rules:[{userAgent:"*",allow:"/",disallow:["/admin","/api"]}],sitemap:new URL("/sitemap.xml",site.url).toString(),host:site.url};}
