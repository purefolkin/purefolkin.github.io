import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Vegetarian Menu",
  description: "Explore Purefolk's vegetarian menu, product details and current availability.",
  alternates: { canonical: "/menu" },
};

type Variant = { id: string; name: string; selling_price_paise: number; status: string; available_today: boolean };
type Product = {
  id: string; name: string; short_description: string | null; description: string | null;
  dietary_attributes: string[]; image_url: string | null; image_alt: string | null;
  pf_product_variants: Variant[]; pf_categories: { name: string } | null;
};

async function loadProducts(): Promise<Product[]> {
  const db = await createSupabaseServerClient();
  if (!db) return [];
  const { data, error } = await db.from("pf_catalogue_products")
    .select("id,name,short_description,description,dietary_attributes,image_url,image_alt,pf_categories(name),pf_product_variants(id,name,selling_price_paise,status,available_today)")
    .eq("status", "published").eq("website_visible", true).order("sort_order");
  if (error) return [];
  return ((data ?? []) as unknown as Product[]).map(p => ({
    ...p, pf_product_variants: (p.pf_product_variants ?? []).filter(v => v.status === "active" && v.available_today)
  })).filter(p => p.pf_product_variants.length > 0);
}

const inr = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

export default async function MenuPage() {
  const products = await loadProducts();
  return <section className="page"><div className="container">
    <p className="eyebrow">The Purefolk menu</p><h1 className="page-title">Choose with clarity.</h1>
    <p className="intro">Explore products with clear descriptions and available portions. The menu reflects what the kitchen has published and marked available.</p>
    {products.length ? <div className="product-grid">{products.map(p => <article className="card" key={p.id}>
      {p.image_url ? <img src={p.image_url} alt={p.image_alt || p.name} loading="lazy" style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",borderRadius:12}}/> : null}
      <p className="eyebrow">{p.pf_categories?.name || "Purefolk selection"}</p><h3>{p.name}</h3>
      {p.short_description || p.description ? <p>{p.short_description || p.description}</p> : null}
      {p.dietary_attributes.length ? <p className="muted">{p.dietary_attributes.join(" · ")}</p> : null}
      <div className="price">{p.pf_product_variants.map(v => <p key={v.id}>{v.name} · {inr(v.selling_price_paise)}</p>)}</div>
    </article>)}</div> : <div className="empty"><strong>The menu is being prepared.</strong><p>Products will appear once the menu, prices and availability are approved.</p></div>}
  </div></section>;
}
