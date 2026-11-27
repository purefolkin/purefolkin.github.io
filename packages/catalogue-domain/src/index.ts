/** Purefolk's canonical product/catalogue contract.
 * This package is intentionally storage-agnostic: it defines domain meaning,
 * not a Supabase schema or an assumption about the current live menu.
 */

export type CurrencyCode = "INR";
export type ProductLifecycle = "draft" | "active" | "archived";
export type VariantLifecycle = "draft" | "active" | "retired";
export type PublicationState = "unpublished" | "in_review" | "approved" | "published";
export type AvailabilityState = "available" | "preorder" | "unavailable" | "seasonal";
export type ClaimReviewState = "unverified" | "substantiated" | "approved" | "rejected";

export interface Money {
  /** Integer paise; never use floating point for stored currency. */
  amountMinor: number;
  currency: CurrencyCode;
}

export interface ProductClaim {
  code: string;
  label: string;
  reviewState: ClaimReviewState;
  evidenceReference?: string;
  reviewedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  lifecycle: ProductLifecycle;
  categoryId: string;
  /** Discoverability attributes, not separate product records or categories. */
  dietaryAttributes: string[];
  claims: ProductClaim[];
  image?: { storagePath: string; alt: string };
  variantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  /** Customer-selectable differentiator, e.g. portion size or pack size. */
  optionValues: Record<string, string>;
  lifecycle: VariantLifecycle;
  availability: AvailabilityState;
  /** Optional until SKU-level stock/production tracking is actually required. */
  sku?: string;
  unitOfMeasure: "each" | "pack" | "gram" | "millilitre";
  recipeVersionId?: string;
  /** Pricing is versioned separately so changes do not rewrite past orders. */
  priceIds: string[];
  addonGroupIds: string[];
  claims: ProductClaim[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  active: boolean;
  sortOrder: number;
}

export interface AddonGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  addonVariantIds: string[];
  required: boolean;
}

export interface VariantPrice {
  id: string;
  variantId: string;
  sellingPrice: Money;
  compareAtPrice?: Money;
  validFrom: string;
  validUntil?: string;
  active: boolean;
}

export interface WebsitePublication {
  productId: string;
  state: PublicationState;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  /** Website may only render approved, published products and variants. */
  canonicalPath?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface RecipeVersion {
  id: string;
  recipeId: string;
  versionNumber: number;
  status: "draft" | "tested" | "approved" | "retired";
  yieldQuantity: number;
  yieldUnit: "portion" | "pack" | "gram" | "millilitre";
  ingredients: RecipeIngredient[];
  preparationSteps: string[];
  approvedAt?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: "gram" | "kilogram" | "millilitre" | "litre" | "each";
}

export interface NutritionRecord {
  id: string;
  variantId: string;
  basis: "per_100g" | "per_serving" | "per_pack";
  source: "calculated_from_recipe" | "laboratory_test" | "supplier_declaration";
  reviewState: ClaimReviewState;
  energyKcal?: number;
  proteinG?: number;
  carbohydrateG?: number;
  fatG?: number;
  fibreG?: number;
  sodiumMg?: number;
  evidenceReference?: string;
  reviewedAt?: string;
}

export interface OrderLineSnapshot {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku?: string;
  quantity: number;
  unitPrice: Money;
  /** Persist add-ons as their own immutable snapshots at checkout. */
  addons: Array<{
    variantId: string;
    name: string;
    quantity: number;
    unitPrice: Money;
  }>;
}

export interface ProductDraft {
  name: string;
  slug: string;
  shortDescription: string;
  categoryId: string;
  variants: Array<{
    name: string;
    optionValues: Record<string, string>;
    unitOfMeasure: ProductVariant["unitOfMeasure"];
    sku?: string;
  }>;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

/** Lightweight domain validation; database constraints/RLS remain mandatory. */
export function validateProductDraft(draft: ProductDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!draft.name.trim()) issues.push({ field: "name", message: "Product name is required." });
  if (!draft.slug.trim()) issues.push({ field: "slug", message: "A stable URL slug is required." });
  if (!draft.categoryId.trim()) issues.push({ field: "categoryId", message: "Choose a product category." });
  if (!draft.variants.length) issues.push({ field: "variants", message: "Add at least one sellable variant." });
  const seenSkus = new Set<string>();
  draft.variants.forEach((variant, index) => {
    if (!variant.name.trim()) issues.push({ field: `variants.${index}.name`, message: "Variant name is required." });
    if (variant.sku) {
      const normalizedSku = variant.sku.trim().toUpperCase();
      if (seenSkus.has(normalizedSku)) issues.push({ field: `variants.${index}.sku`, message: "SKU must be unique within this product." });
      seenSkus.add(normalizedSku);
    }
  });
  return issues;
}

/** A website-safe publication gate; call only with server-fetched records. */
export function canPublishProduct(
  product: Product,
  variants: ProductVariant[],
  publication: WebsitePublication,
): boolean {
  return product.lifecycle === "active"
    && publication.state === "published"
    && variants.some((variant) => variant.productId === product.id
      && variant.lifecycle === "active"
      && variant.availability !== "unavailable");
}
