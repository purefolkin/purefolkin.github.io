import type {Metadata,Viewport} from "next";
import "./globals.css";
export const metadata:Metadata={title:{default:"Nucleus | Purefolk",template:"%s | Nucleus"},robots:{index:false,follow:false}};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#2a3d35"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><body>{children}</body></html>}
