-- Purefolk catalogue and fulfilment foundation.
-- Review and apply only to a dedicated development database, never production without approval.
create extension if not exists pgcrypto;
create or replace function public.pf_is_admin() returns boolean language sql stable as $$ select coalesce(auth.jwt()->'app_metadata'->>'role','')='admin'; $$;

create table if not exists public.pf_categories(
 id uuid primary key default gen_random_uuid(), parent_id uuid references public.pf_categories(id) on delete restrict,
 name text not null, slug text not null unique, description text,
 category_type text not null default 'food' check(category_type in('food','drink','dessert','addon')),
 status text not null default 'draft' check(status in('draft','published','archived')),
 sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(parent_id is null or parent_id<>id)
);
create table if not exists public.pf_catalogue_products(
 id uuid primary key default gen_random_uuid(), category_id uuid references public.pf_categories(id) on delete restrict,
 name text not null, slug text not null unique, short_description text, description text, ingredients text, allergen_information text,
 dietary_attributes text[] not null default '{}', product_type text not null default 'food' check(product_type in('food','drink','dessert')),
 status text not null default 'draft' check(status in('draft','in_review','published','archived')), website_visible boolean not null default false,
 seo_title text, meta_description text, image_url text, image_alt text, sort_order integer not null default 0,
 published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.pf_product_variants(
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.pf_catalogue_products(id) on delete restrict,
 name text not null, sku text unique, portion_label text, quantity_value numeric(10,2), quantity_unit text,
 mrp_paise integer check(mrp_paise is null or mrp_paise>=0), selling_price_paise integer not null check(selling_price_paise>=0),
 tax_rate numeric(5,2) not null default 0 check(tax_rate between 0 and 100),
 status text not null default 'draft' check(status in('draft','active','sold_out','archived')),
 available_today boolean not null default false, max_quantity_per_order integer check(max_quantity_per_order is null or max_quantity_per_order>0),
 sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.pf_addon_groups(
 id uuid primary key default gen_random_uuid(), name text not null,
 selection_type text not null default 'multiple' check(selection_type in('single','multiple')),
 is_required boolean not null default false, min_selections integer not null default 0 check(min_selections>=0),
 max_selections integer not null default 1 check(max_selections>=min_selections),
 status text not null default 'draft' check(status in('draft','active','archived')),
 sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.pf_addons(
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.pf_addon_groups(id) on delete restrict,
 name text not null, description text, price_delta_paise integer not null default 0,
 status text not null default 'draft' check(status in('draft','active','sold_out','archived')),
 available_today boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.pf_product_addon_groups(
 product_id uuid not null references public.pf_catalogue_products(id) on delete cascade,
 addon_group_id uuid not null references public.pf_addon_groups(id) on delete restrict,
 sort_order integer not null default 0, primary key(product_id,addon_group_id)
);
create table if not exists public.pf_delivery_areas_v2(
 id uuid primary key default gen_random_uuid(), name text not null, locality_names text[] not null default '{}',
 pincodes text[] not null default '{}', boundary_notes text, is_serviceable boolean not null default false,
 status text not null default 'draft' check(status in('draft','active','inactive')), created_at timestamptz not null default now()
);
create table if not exists public.pf_delivery_rules_v2(
 id uuid primary key default gen_random_uuid(), delivery_area_id uuid not null references public.pf_delivery_areas_v2(id) on delete restrict,
 delivery_fee_paise integer not null default 0 check(delivery_fee_paise>=0),
 free_delivery_threshold_paise integer check(free_delivery_threshold_paise is null or free_delivery_threshold_paise>=0),
 minimum_order_value_paise integer not null default 0 check(minimum_order_value_paise>=0),
 same_day_cutoff time, slot_start time, slot_end time, max_orders_per_slot integer check(max_orders_per_slot is null or max_orders_per_slot>0),
 status text not null default 'draft' check(status in('draft','active','inactive')),
 created_at timestamptz not null default now(), check(slot_start is null or slot_end is null or slot_end>slot_start)
);
create table if not exists public.pf_orders(
 id uuid primary key default gen_random_uuid(), order_number bigint generated always as identity unique,
 customer_name text not null, customer_phone text not null, customer_email text, delivery_address jsonb not null,
 fulfilment_type text not null default 'delivery' check(fulfilment_type in('delivery','takeaway')),
 delivery_area_id uuid references public.pf_delivery_areas_v2(id) on delete restrict,
 requested_slot_start timestamptz, requested_slot_end timestamptz,
 status text not null default 'placed' check(status in('placed','validated','confirmed','accepted','in_preparation','quality_check','packed','ready','assigned','picked_up','out_for_delivery','delivered','cancelled','failed')),
 payment_status text not null default 'pending' check(payment_status in('pending','paid','failed','refunded','partially_refunded')),
 subtotal_paise integer not null check(subtotal_paise>=0), delivery_fee_paise integer not null default 0 check(delivery_fee_paise>=0),
 tax_paise integer not null default 0 check(tax_paise>=0), discount_paise integer not null default 0 check(discount_paise>=0),
 total_paise integer not null check(total_paise>=0), customer_note text, internal_note text, source text not null default 'website',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.pf_order_items(
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.pf_orders(id) on delete cascade,
 product_id uuid references public.pf_catalogue_products(id) on delete set null,
 variant_id uuid references public.pf_product_variants(id) on delete set null,
 product_name_snapshot text not null, variant_name_snapshot text, sku_snapshot text,
 unit_price_paise integer not null check(unit_price_paise>=0), quantity integer not null check(quantity>0),
 line_total_paise integer not null check(line_total_paise>=0), preparation_note text, created_at timestamptz not null default now()
);
create table if not exists public.pf_order_item_addons(
 id uuid primary key default gen_random_uuid(), order_item_id uuid not null references public.pf_order_items(id) on delete cascade,
 addon_id uuid references public.pf_addons(id) on delete set null, addon_name_snapshot text not null,
 unit_price_paise integer not null check(unit_price_paise>=0), quantity integer not null check(quantity>0),
 line_total_paise integer not null check(line_total_paise>=0)
);

create index if not exists pf_categories_parent_idx on public.pf_categories(parent_id,sort_order);
create index if not exists pf_catalogue_products_category_idx on public.pf_catalogue_products(category_id,status,website_visible);
create index if not exists pf_variants_product_idx on public.pf_product_variants(product_id,status,available_today);
create index if not exists pf_addons_group_idx on public.pf_addons(group_id,status,available_today);
create index if not exists pf_orders_created_status_idx on public.pf_orders(created_at desc,status);
create index if not exists pf_order_items_order_idx on public.pf_order_items(order_id);

alter table public.pf_categories enable row level security;
alter table public.pf_catalogue_products enable row level security;
alter table public.pf_product_variants enable row level security;
alter table public.pf_addon_groups enable row level security;
alter table public.pf_addons enable row level security;
alter table public.pf_product_addon_groups enable row level security;
alter table public.pf_delivery_areas_v2 enable row level security;
alter table public.pf_delivery_rules_v2 enable row level security;
alter table public.pf_orders enable row level security;
alter table public.pf_order_items enable row level security;
alter table public.pf_order_item_addons enable row level security;

create policy categories_public_read on public.pf_categories for select to anon,authenticated using(status='published' or public.pf_is_admin());
create policy categories_admin_all on public.pf_categories for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy products_public_read on public.pf_catalogue_products for select to anon,authenticated using((status='published' and website_visible) or public.pf_is_admin());
create policy products_admin_all on public.pf_catalogue_products for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy variants_public_read on public.pf_product_variants for select to anon,authenticated using((status='active' and available_today) or public.pf_is_admin());
create policy variants_admin_all on public.pf_product_variants for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy addon_groups_public_read on public.pf_addon_groups for select to anon,authenticated using(status='active' or public.pf_is_admin());
create policy addon_groups_admin_all on public.pf_addon_groups for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy addons_public_read on public.pf_addons for select to anon,authenticated using((status='active' and available_today) or public.pf_is_admin());
create policy addons_admin_all on public.pf_addons for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy product_addon_mapping_public_read on public.pf_product_addon_groups for select to anon,authenticated using(exists(select 1 from public.pf_catalogue_products p where p.id=product_id and p.status='published' and p.website_visible) or public.pf_is_admin());
create policy product_addon_mapping_admin_all on public.pf_product_addon_groups for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy delivery_areas_public_read on public.pf_delivery_areas_v2 for select to anon,authenticated using((status='active' and is_serviceable) or public.pf_is_admin());
create policy delivery_areas_admin_all on public.pf_delivery_areas_v2 for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy delivery_rules_public_read on public.pf_delivery_rules_v2 for select to anon,authenticated using(status='active' or public.pf_is_admin());
create policy delivery_rules_admin_all on public.pf_delivery_rules_v2 for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy orders_admin_read on public.pf_orders for select to authenticated using(public.pf_is_admin());
create policy orders_admin_all on public.pf_orders for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy order_items_admin_read on public.pf_order_items for select to authenticated using(public.pf_is_admin());
create policy order_items_admin_all on public.pf_order_items for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());
create policy order_addons_admin_read on public.pf_order_item_addons for select to authenticated using(public.pf_is_admin());
create policy order_addons_admin_all on public.pf_order_item_addons for all to authenticated using(public.pf_is_admin()) with check(public.pf_is_admin());

comment on table public.pf_orders is 'Do not insert from browser clients; use validated server-side checkout.';
comment on column public.pf_product_variants.selling_price_paise is 'INR minor units (paise).';
