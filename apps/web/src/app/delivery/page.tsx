import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Delivery Information",
  description: "Check Purefolk's configured delivery areas and service information.",
  alternates: { canonical: "/delivery" },
};

type Rule = { delivery_fee_paise: number; free_delivery_threshold_paise: number | null; minimum_order_value_paise: number };
type Area = { id: string; name: string; locality_names: string[]; pincodes: string[]; pf_delivery_rules_v2: Rule[] };

export default async function DeliveryPage() {
  let areas: Area[] = [];
  const db = await createSupabaseServerClient();
  if (db) {
    const { data } = await db.from("pf_delivery_areas_v2")
      .select("id,name,locality_names,pincodes,pf_delivery_rules_v2(delivery_fee_paise,free_delivery_threshold_paise,minimum_order_value_paise)")
      .eq("status", "active").eq("is_serviceable", true).order("name");
    areas = (data ?? []) as unknown as Area[];
  }
  const money = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
  return <section className="page"><div className="container">
    <p className="eyebrow">Delivery information</p><h1 className="page-title">Service details, clearly stated.</h1>
    <p className="intro">Coverage and charges are controlled by Purefolk operations. Only verified, active delivery areas are shown here.</p>
    {areas.length ? <div className="cards">{areas.map(area => <article className="card" key={area.id}>
      <h3>{area.name}</h3>
      {area.locality_names.length ? <p>{area.locality_names.join(", ")}</p> : null}
      {area.pincodes.length ? <p className="muted">PIN codes: {area.pincodes.join(", ")}</p> : null}
      {area.pf_delivery_rules_v2.map((rule,i) => <p key={i}>Delivery: {money(rule.delivery_fee_paise)}{rule.free_delivery_threshold_paise !== null ? ` · Free above ${money(rule.free_delivery_threshold_paise)}` : ""}{rule.minimum_order_value_paise ? ` · Minimum ${money(rule.minimum_order_value_paise)}` : ""}</p>)}
    </article>)}</div> : <div className="empty"><strong>Delivery areas are being configured.</strong><p>We will publish coverage and charges after the operating area is verified.</p></div>}
  </div></section>;
}
