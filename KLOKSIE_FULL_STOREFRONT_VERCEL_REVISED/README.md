# KLOKSIE — Vercel storefront

This folder is ready to upload to Vercel. It keeps the original dark KLOKSIE editorial design and adds a complete storefront: product categories, a working bag, secure PayMongo checkout creation, an Instagram link, and a protected product-management page at **`/admin.html`** (also available at **`/admin`**).

## What is included

- Responsive public storefront with category navigation and filters.
- Catalog loaded from Supabase; the original two products remain as a visual preview until Supabase is connected.
- Shopping bag with quantities, stock-aware buttons, and customer details at checkout.
- Server-side PayMongo Checkout Session creation. Prices and stock are read again from Supabase, so browser edits cannot change the amount charged.
- An authenticated admin page to add, edit, hide/show, price, categorize, and set stock for products.
- Pending order records in Supabase, including the customer-entered delivery information and checked server-side item/price snapshot.
- A `/api/health` endpoint that reports only whether the three integrations are configured; it never exposes secrets.

## Deploy in Vercel

1. Upload this ZIP or import the unzipped folder as a Vercel project.
2. In **Supabase → SQL Editor**, run [`schema.sql`](schema.sql) in full.
3. In **Vercel → Project Settings → Environment Variables**, add the values below for Production, Preview, and Development as appropriate:

   | Name | Value |
   | --- | --- |
   | `SUPABASE_URL` | Your project URL, for example `https://xxxxx.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase **service role** key — server-side only |
   | `ADMIN_PASSWORD` | A long, unique password you choose |
   | `ADMIN_SESSION_SECRET` | A separate random string of at least 32 characters |
   | `PAYMONGO_SECRET_KEY` | Start with your PayMongo `sk_test_...` key; use `sk_live_...` only after testing |
   | `SITE_URL` *(recommended)* | Your final `https://` website URL once you have a custom domain |

4. Redeploy after saving the variables.
5. Open `https://your-domain/admin.html`, sign in with `ADMIN_PASSWORD`, then enter real product prices/stock and image URLs.
6. Test a PayMongo checkout using test mode before entering a live key.

## Important launch checks

- Do not place Supabase service-role, PayMongo secret, admin password, or session secret in any browser file. This project does not expose them.
- The success page is **not proof of payment**. It deliberately says that PayMongo is the source of truth. Before live sales, configure a PayMongo payment-status webhook/fulfillment process in your own PayMongo account so a paid event updates the matching order from `pending` to `paid` and stock is finalized.
- The included checkout does not add a shipping fee. Set product prices to include delivery or add an approved shipping calculation before launch.
- The Instagram buttons point to `https://www.instagram.com/kloksie.co/`, inferred from the KLOKSIE.CO account name shown in the referenced setup. If the actual handle differs, replace that URL in `index.html` before deploying.
- The public product RLS policy permits only visible products. Vercel functions use the service-role key server-side to manage private inventory and orders.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Customer storefront |
| `/admin.html` or `/admin` | Password-protected product admin |
| `/api/products` | Public active product catalog |
| `/api/create-checkout` | Server-only PayMongo checkout creation |
| `/api/admin/login` and `/api/admin/products` | Authenticated admin API |
| `/api/health` | Configuration-status check with no secret values |
