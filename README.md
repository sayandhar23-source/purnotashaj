# Purnota Shaj — Full E-commerce Platform

A complete e-commerce stack: **Next.js** (frontend, deploy to Vercel) + **NestJS** (backend API) +
**MongoDB**. Built for clothing, jewellery, ornaments and makeup — but works for any catalog.

## What's included

- Storefront: home page with rotating sale banners (separate desktop/mobile images), category
  browsing, product detail pages with variant selection (each variant has its own price/stock),
  search, cart, wishlist.
- **WhatsApp button** on every product — opens a chat pre-filled with the product name and link, to
  the phone number you configure.
- Customer accounts: register with **email OTP verification** (via Resend), login, forgot/reset
  password (also OTP-based), a customer dashboard to view orders, wishlist, and change email/password.
- Checkout with **Stripe** and **Razorpay** (both wired up — pick either at checkout).
- Newsletter signup (footer) with an admin list of subscribers.
- Full **admin dashboard**:
  - Products: create/edit/delete, with unlimited variants (size/color/etc.), each with its own
    price, compare-at price, and stock.
  - Categories, sale banners (desktop + mobile images, scheduling, sort order), orders (status
    updates), newsletter subscriber list.
  - **User registration logs**: every sign-up's email, IP address, and geolocated city/region/country.
  - **Revenue analytics**: last 7 / 30 days at a glance, plus a comparison chart — this month vs
    last month, this week vs last week, this year vs last year, or any two custom date ranges you
    pick — with a line chart of daily revenue for both periods.
- Mobile-first responsive UI throughout, built with Tailwind.

## Project structure

```
ecommerce-project/
  backend/    NestJS API (deploy anywhere that runs Node — Render, Railway, an EC2/VM, etc.)
  frontend/   Next.js app (deploy to Vercel)
```

## Quick facts you'll want first

- **Admin dashboard URL**: `/admin/dashboard` on your frontend (e.g. `http://localhost:3000/admin/dashboard`
  locally, or `https://yourstore.com/admin/dashboard` in production). You log in through the same
  page as customers — `/account/login` — and get redirected based on your account's role.
- **Admin login credentials**: whatever you set as `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` in
  `backend/.env` before running `npm run seed` (defaults to `admin@yourstore.com` / `ChangeMe123!`
  if you don't set them — **change this password immediately** from Admin → Settings after first login).
- Running `npm run seed` also creates **20 demo products** (5 per top-level category, with
  subcategories and variants) so the storefront isn't empty on first run — see below.

## Animated logo

`frontend/components/AnimatedLogo.tsx` renders the brand mark — a female portrait line drawing
(with maang tikka, jhumka earrings, and a nath) that draws itself in, followed by "PS" outlining
in gold, filling solid, then crossfading into the full "Purnota Shaj" wordmark. It loops
continuously on a 10-second cycle. The keyframes live in `app/globals.css` (search for
`logoSilhouetteDraw` and the other `logo*` animations) so they're loaded once globally.

- `<AnimatedLogo variant="wordmark" />` — the compact text-only mark used in the navbar, on its
  own small dark pill so it stays legible against the white header. Sizes itself down gracefully
  on narrow screens via `clamp()`.
- `<AnimatedLogo variant="full" />` — the full portrait + wordmark, used at the top of the footer.

Drop it anywhere else you want the brand mark (a loading screen, an about page, order confirmation
emails as a static image export, etc.) by importing the component and choosing a variant.

## Merchandising: homepage sections, multi-image galleries, nested categories

A few features were added on top of the original build:

- **Multiple product photos (up to 5)** — the admin product form lets you add up to 5 image URLs
  per product. On the storefront, product cards **cycle through them automatically on hover**
  (desktop), and the product detail page has a full **swipeable gallery** (touch swipe on mobile,
  arrow buttons + dot indicators on desktop, plus a thumbnail strip).
- **Homepage sections** — Hot Deals Now, New Arrivals, and Most Selling each show up to 5 products
  in a horizontally scrollable row (swipeable on mobile, a plain grid on large screens) with a
  "View all" link through to a dedicated page. Every top-level category also gets its own row the
  same way. Which products appear in which section is controlled entirely from **Admin →
  Products** — each product has independent checkboxes for Featured / New Arrivals / Most Selling
  / Hot Deals Now, so one product can appear in several sections at once.
- **Nested categories, arbitrary depth** — categories can be nested as deep as you like (not just
  one level). Out of the box, Jewellery → Chains → Long Chain / Small Chain demonstrates a
  3-level example. Category pages show a filter sidebar of their immediate subcategories, and
  clicking through only shows that subcategory's products — so `/category/jewellery` shows
  everything under Jewellery, but `/category/jewellery-chains-long` shows only long chains.
- **Top-level categories** now include Clothing, Saree, Jewellery, Ornaments, Makeup, and Perfumes
  out of the box (via the seed script) — add, remove, or rename any of these from Admin →
  Categories.

## 0. Demo data & subcategories

`npm run seed` (inside `backend/`) creates:

- 4 top-level categories (Clothing, Jewellery, Ornaments, Makeup), each with 2 subcategories
  (e.g. Clothing → T-Shirts, Dresses).
- 20 demo products (5 per top-level category), most with variants (size/shade/length — each
  variant has its own price and stock), using placeholder images from placehold.co so you can see
  the full UI immediately. Delete or edit them anytime from Admin → Products.
- The one admin account described above.

It's safe to re-run — it skips anything that already exists by matching on email/slug/title.

### Category pages & "no products" fallback

Clicking a category shows that category's products plus everything in its subcategories. If a
category is genuinely empty, the page shows featured products as suggestions instead of erroring.
Every product detail page also has a "You may also like" section pulling from the same category
(falling back to featured products if the category has nothing else).

### Automatic SKU generation

You never need to type a SKU. When you create or edit a product, each variant (and simple
products with no variants) gets an auto-generated SKU like `CLO-CLASS-M-001`, built from the
category, product title, and variant name — guaranteed unique per product. This happens
server-side in `ProductsService`, so it also applies to anything created via the API directly.

## Order flow & admin confirmation

Placing an order and paying for it (Stripe or Razorpay) doesn't immediately notify the customer
that it's "confirmed" — instead:

1. Customer pays → order status becomes `paid`.
2. The backend immediately emails **you** (the address in `ADMIN_NOTIFICATION_EMAIL`) with the
   order details, and the admin dashboard shows a notification badge (bell icon + a badge on the
   "Orders" nav item) with the count of orders awaiting confirmation. This badge polls every 20
   seconds while you're in the admin panel.
3. You go to **Admin → Orders**, review the order (highlighted in orange, labeled "Needs
   confirmation"), and click **Confirm Order**.
4. Only at that point does the **customer** receive their order confirmation email.

You can still change an order's status (shipped, delivered, etc.) at any time from the same page
using the status dropdown — confirmation is a separate step focused specifically on the
"someone needs to look at this new order" moment.

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # fill in the values below
npm run start:dev      # http://localhost:4000/api
```

### Required accounts & keys (fill into `backend/.env`)

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — create a free cluster, get the connection string |
| `JWT_SECRET`, `JWT_OTP_SECRET` | Any long random strings (e.g. `openssl rand -hex 32`) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) — used to send OTP emails. Verify a sending domain, or use their test domain while developing |
| `MAIL_FROM` | e.g. `Purnota Shaj <no-reply@yourdomain.com>` — must be on a domain verified in Resend |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) |
| `WHATSAPP_PHONE_NUMBER` | Your WhatsApp Business number, digits only with country code, e.g. `919999999999` for +91 |
| `FRONTEND_URL` | Your deployed frontend URL (used for Stripe redirect + CORS) |
| `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` | Credentials for the first admin account |

### Create your admin account + default categories

```bash
npm run seed
```

This creates one admin user (from `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`) and four categories:
Clothing, Jewellery, Ornaments, Makeup. Log in with that account, then go to `/admin/dashboard`
on the frontend — you'll have full access to the admin panel.

**Change the admin password immediately after first login**, from the customer dashboard's
Settings tab (the same change-password flow works for admin accounts too).

### Stripe webhook (for reliable payment confirmation)

Stripe webhooks need the *raw* request body to verify signatures. If you want live webhook
confirmation (recommended for production), add this in `main.ts` before `app.listen`:

```ts
app.use('/api/payments/stripe/webhook', require('express').raw({ type: 'application/json' }));
```

Then register `https://your-backend-url/api/payments/stripe/webhook` as an endpoint in the Stripe
Dashboard, listening for `checkout.session.completed`. Without this, Razorpay's flow (which verifies
the payment signature client-side and immediately confirms via `/payments/razorpay/verify`) will
still work out of the box.

### Where to deploy the backend

NestJS needs a persistent Node process, so it **cannot go on Vercel's serverless functions as-is**.
Good options: [Render](https://render.com), [Railway](https://railway.app), a small VM (the same
Oracle VM pattern used for TrueOdds works well — `pm2 start dist/main.js --name purnota-shaj-backend`
after `npm run build`).

### Deploying to Render (step by step)

1. Push the `backend/` folder to a GitHub repo (either the whole project with Render's root
   directory set to `backend/`, or its own repo).
2. In the [Render dashboard](https://dashboard.render.com), click **New → Web Service**, connect
   your repo.
3. Configure the service:
   - **Root directory**: `backend` (only if you pushed the whole monorepo — leave blank if the repo
     is just the backend folder)
   - **Runtime**: Node
   - **Build command**: `npm install && npm run build`
   - **Start command**: `npm run start:prod`
   - **Instance type**: the free tier works for testing; note that free instances spin down after
     inactivity and take ~30s to wake on the next request — upgrade to a paid instance for a
     production storefront so checkout doesn't stall.
4. Under **Environment**, add every variable from `backend/.env.example` with your real values
   (Render's dashboard has an "Add from .env" paste option — you can paste the whole file at once).
   Set `FRONTEND_URL` to your Vercel URL once you have it.
5. Deploy. Render gives you a URL like `https://purnota-shaj-backend.onrender.com` — your API base
   becomes `https://purnota-shaj-backend.onrender.com/api`.
6. Run the seed script once, from your local machine, pointed at the **production** database (set
   `MONGODB_URI` in your local `.env` to the same Atlas connection string Render is using, then run
   `npm run seed` locally) — Render's free tier doesn't give you an interactive shell to run it
   there directly. (Paid Render plans do offer a shell tab under the service if you'd rather run it
   from there.)
7. Back in Vercel, set `NEXT_PUBLIC_API_URL` to `https://purnota-shaj-backend.onrender.com/api` and
   redeploy the frontend so it points at the live backend.
8. If you're using Stripe webhooks, register
   `https://purnota-shaj-backend.onrender.com/api/payments/stripe/webhook` in the Stripe Dashboard
   (see the raw-body note above — add that middleware line before deploying).

That's the whole loop: Render hosts the always-on API + connects to MongoDB Atlas, Vercel hosts
the frontend and talks to Render over `NEXT_PUBLIC_API_URL`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev                  # http://localhost:3000
```

### Deploy to Vercel

1. Push this `frontend/` folder to a GitHub repo (or the whole project, setting the Vercel
   project's root directory to `frontend/`).
2. Import it in Vercel, set these environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_API_URL` — your deployed backend's URL, e.g. `https://api.yourstore.com/api`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` — same number as the backend
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` — same as backend's `RAZORPAY_KEY_ID` (this one is public/safe
     to expose — it's the publishable key)
3. Deploy.

## 3. Adding your first products

1. Log in as admin → **Admin → Products → Add New Product**.
2. Paste image URLs (host images anywhere — Cloudinary, S3, ImageKit, or even a public Google
   Drive/Imgur link while testing). A dedicated image upload widget isn't wired up yet; the
   product form takes URLs so you can plug in any image host without changing code.
3. Add variants if the product has options (size, color, etc.) — each variant gets its own price
   and stock count, which is what drives per-variant pricing on the storefront.
4. Check "Featured on homepage" to have it show in the homepage's Featured section.

## 4. Sale banners

**Admin → Sale Banners** — add one image sized for desktop (wide, e.g. 1600×500) and one for
mobile (e.g. 800×450 or taller). The storefront automatically swaps between them based on screen
width — no extra work needed. Multiple active banners rotate automatically every 5 seconds.

## Notes & things you'll want to customize

- **Branding**: colors live in `frontend/tailwind.config.js` under `theme.colors.brand` — swap the
  hex values for your palette. Fonts are loaded from Google Fonts in `app/layout.tsx`.
- **Image uploads**: currently URL-based (see above). If you want direct image upload from the
  admin panel, the natural next step is adding an S3 or Cloudinary upload endpoint on the backend
  and a file input on the product/banner forms.
- **Order emails**: `MailService.sendOrderConfirmation` exists but isn't wired into the payment
  webhook yet — hook it in once you've confirmed your Resend sending domain, so customers get a
  confirmation email after successful payment.
- **Currency**: defaults to INR (₹) throughout since Razorpay is India-first; Stripe checkout
  sessions also default to the order's `currency` field on the Order schema if you want to support
  multiple currencies.
- **Rate limiting**: a basic global throttle (60 requests/min) is enabled via `@nestjs/throttler`
  in `app.module.ts` — tune as needed.

## Tech stack summary

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts (admin charts), Axios
- **Backend**: NestJS, TypeScript, Mongoose (MongoDB), Passport JWT, bcrypt, Resend, Stripe SDK,
  Razorpay SDK, geoip-lite (for logging registration locations)
- **Database**: MongoDB (use Atlas for a managed free tier)
