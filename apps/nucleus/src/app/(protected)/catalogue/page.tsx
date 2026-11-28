import { validateProductDraft, type ProductDraft } from "@purefolk/catalogue-domain";

const emptyDraft: ProductDraft = { name: "", slug: "", shortDescription: "", categoryId: "", variants: [] };
const concepts = [
  ["Product", "The food concept and stable customer-facing identity."],
  ["Variant", "The concrete portion, pack or formulation a customer can select."],
  ["SKU", "Optional internal stock/fulfilment code for a variant."],
  ["Add-on", "A separately priced variant allowed by an add-on group."],
  ["Recipe version", "The tested formula and preparation method linked to a variant."],
  ["Price", "Effective-dated INR amount stored in paise."],
  ["Publication", "Approval to show customer-safe content on the public website."],
  ["Availability", "Available, pre-order, unavailable or seasonal."],
];

export default function CataloguePage() {
  const issues = validateProductDraft(emptyDraft);
  return <>
    <p className="eyebrow">Catalogue architecture · v1</p>
    <h1>Products and sellable choices</h1>
    <p className="intro">The catalogue separates a food concept from the actual version a customer can buy. This shared model is used by Website and Nucleus. No live product records are being created yet.</p>
    <div className="grid">{concepts.map(([title, description]) => <article className="card" key={title}><h2>{title}</h2><p>{description}</p></article>)}</div>
    <section className="card" style={{marginTop:18}}>
      <h2>Four controls stay separate</h2>
      <p><strong>Lifecycle:</strong> Is it being developed, offered or retired?</p>
      <p><strong>Publication:</strong> Is customer-facing information approved and published?</p>
      <p><strong>Availability:</strong> Can this variant be ordered now?</p>
      <p><strong>Ordering / service:</strong> Is Purefolk accepting orders and serving this address/time?</p>
    </section>
    <section className="card" style={{marginTop:18}}>
      <h2>Validation contract</h2>
      <p>A product requires a name, URL slug, category and at least one sellable variant. Supplied SKUs must be unique within the product.</p>
      <p style={{marginTop:8}}>The empty draft currently produces {issues.length} expected validation issues. This is a domain check, not a saved product.</p>
    </section>
    <section className="card" style={{marginTop:18}}>
      <h2>Not connected yet</h2>
      <p>Live catalogue records, pricing writes, recipe CRUD and website publishing remain disabled until the data schema, RLS and approval workflow are implemented and tested.</p>
    </section>
  </>;
}
