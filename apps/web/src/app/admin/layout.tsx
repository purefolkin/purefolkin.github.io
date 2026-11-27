import { requireAdmin } from "@/lib/auth";
export const metadata={title:"Nucleus Admin",robots:{index:false,follow:false}};
export default async function AdminLayout({children}:{children:React.ReactNode}){await requireAdmin();return children;}
