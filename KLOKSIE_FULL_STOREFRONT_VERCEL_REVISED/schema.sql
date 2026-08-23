-- KLOKSIE storefront schema for Supabase.
-- Run this entire file once in Supabase SQL Editor. It is safe to re-run.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  image text not null,
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

-- Compatibility with the earlier KLOKSIE schema.
alter table public.products add column if not exists category text not null default 'Archive';
alter table public.products add column if not exists updated_at timestamptz not null default now();

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

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active = true);

-- The browser never receives the service-role key. Product editing and orders are
-- handled only by the Vercel server functions, which use that key server-side.

insert into public.products
  (id, name, description, image, alt, price, stock, tag, size, category, active, sort_order)
values
  ('kloksie-01', 'KLOKSIE LOW 01', 'Black / Off-white sneaker', 'assets/product-01.jpg', 'Black low-top sneaker', 0, 0, 'COMING SOON', '', 'Archive', true, 1),
  ('kloksie-02', 'RICK OWENS', 'Sculptural low-top sneaker', 'assets/product-02.jpg', 'Rick Owens sneaker', 3500, 1, 'NEW', '37', 'Archive', true, 2)
on conflict (id) do nothing;
