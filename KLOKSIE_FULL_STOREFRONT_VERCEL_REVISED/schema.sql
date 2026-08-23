-- KLOKSIE storefront schema for Supabase.
-- Run this entire file once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  image text not null default '',
  alt text not null default '',
  price integer not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  tag text not null default '',
  size text not null default '',
  category text not null default 'Archive',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists category text not null default 'Archive';
alter table public.products add column if not exists updated_at timestamptz not null default now();
alter table public.products alter column image set default '';

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  color text not null default '',
  size text not null default '',
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, color, size)
);

create index if not exists product_images_product_idx on public.product_images(product_id, sort_order);
create index if not exists product_variants_product_idx on public.product_variants(product_id, color, size);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  status text not null default 'pending',
  customer_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  shipping_address text not null default '',
  total_php integer not null default 0 check (total_php >= 0),
  items jsonb not null default '[]'::jsonb,
  paymongo_checkout_session_id text not null default '',
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.orders add column if not exists paymongo_checkout_session_id text not null default '';

create index if not exists products_public_order_idx on public.products (active, sort_order, created_at desc);
create index if not exists orders_reference_idx on public.orders (reference);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at before update on public.product_variants
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active = true);
drop policy if exists "public read active product images" on public.product_images;
create policy "public read active product images" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_images.product_id and p.active = true));
drop policy if exists "public read active product variants" on public.product_variants;
create policy "public read active product variants" on public.product_variants for select using (exists (select 1 from public.products p where p.id = product_variants.product_id and p.active = true));

insert into public.products (id, name, description, image, alt, price, stock, tag, size, category, active, sort_order)
values
  ('kloksie-01', 'KLOKSIE LOW 01', 'Black / Off-white sneaker', 'assets/product-01.jpg', 'Black low-top sneaker', 0, 0, 'COMING SOON', '', 'Archive', true, 1),
  ('kloksie-02', 'RICK OWENS', 'Sculptural low-top sneaker', 'assets/product-02.jpg', 'Rick Owens sneaker', 3500, 1, 'NEW', '37', 'Archive', true, 2)
on conflict (id) do nothing;
