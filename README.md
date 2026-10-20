# Croche

An online shop for handmade crochet plushies and accessories. Customers browse, add pieces to their bag and pay through Stripe (card, Apple Pay, Google Pay). Orders show up in your Stripe Dashboard.

## Run it on your computer

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Connect payments (Stripe)

1. Create a free account at stripe.com. It starts in test mode, where no real money moves.
2. In the Stripe Dashboard, open **Developers → API keys** and copy the **Secret key** (it starts with `sk_test_`).
3. Copy `.env.example` to a new file named `.env.local` and paste the key after `STRIPE_SECRET_KEY=`.
4. Restart `npm run dev`.

To try a test order, check out with card number `4242 4242 4242 4242`, any future expiry date, any CVC and any ZIP code.

### Try stock counting on your computer

Stock goes down when Stripe tells the shop an order is paid. To get those messages on your computer, install the [Stripe CLI](https://docs.stripe.com/stripe-cli), run `stripe login`, then keep this running in a second terminal next to `npm run dev`:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

It prints a signing secret that starts with `whsec_`. Paste it after `STRIPE_WEBHOOK_SECRET=` in `.env.local` and restart `npm run dev`. On your computer, counts are kept in memory and start over each time you restart, unless you also add your Upstash keys (see "Put it online") to `.env.local`.

### Where orders show up

Every paid order appears in the Stripe Dashboard under **Payments**, with the customer's name, email, shipping address and what they bought. The `items` field in the payment's metadata lists what to pack, for example `mochi-the-bunny x1`.

In Stripe's settings, turn on:

- **Email notifications for successful payments**, so you hear about each order.
- **Customer emails for successful payments**, so customers get a receipt. The thank-you page tells customers a receipt is on its way.

## Change products

All products are in `src/data/products.ts`. Each one has a name, price (in cents: `3400` is $34.00), stock count, photo and description.

- **Photos:** put square `.jpg` or `.webp` photos (about 1200×1200) in `public/products/` and point `image` at them. The current pictures are placeholder drawings.
- **Stock:** `stock` is how many of a piece you've put up for sale in total, not how many are left. The shop counts paid orders and subtracts them for you, so don't lower it after a sale.
  - Made more? Add them: if you listed 3 bunnies and finished 2 more, change `3` to `5`.
  - Sold or lost one outside the shop? Subtract it. To stop selling a piece, set it to `0`.
  - When none are left, the shop shows "Sold out" and won't let anyone buy it.
  - While a customer is on the payment page, their pieces are held for them for 30 minutes, so two people can't pay for the last one. Someone else trying to buy it in that time is asked to come back later.
- **New category:** add it to `categories` in the same file and copy `src/app/shop/plushies/page.tsx` to a folder with the new category's name.

## Shop settings

`src/config/site.ts` holds your contact email, shipping prices (currently $5.95, free over $50), packing time and the return, care and safety text on the help page. **Read the policies before you open the shop:** they are starting points, not legal advice.

## Sales tax

US sales tax rules depend on where you and your customers are. Stripe Tax can calculate and collect it at checkout: set it up in the Stripe Dashboard, then set `STRIPE_AUTOMATIC_TAX=true` in `.env.local`.

## Put it online

The simplest host for this kind of site is Vercel (it has a free plan):

1. Put this folder in a GitHub repository and import it at vercel.com.
2. **Stock counts:** in your Vercel project, open **Storage**, create an **Upstash for Redis** database (the free plan is plenty) and connect it to the project. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` for you. Checkout stays off until this is connected, so a piece can never be sold twice.
3. **Tell the shop about paid orders:** in the Stripe Dashboard, open **Developers → Webhooks** and add an endpoint (Stripe may call it a destination):
   - Endpoint URL: your shop's address followed by `/api/stripe/webhook`, for example `https://www.yourshop.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`

   After saving, reveal the **Signing secret** (it starts with `whsec_`).
4. In the Vercel project settings, add the environment variables from `.env.example`: your **live** Stripe key (`sk_live_...`), the signing secret as `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_SITE_URL` set to your shop's address. Redeploy after changing them.
5. Stripe asks you to activate your account (business details and bank account) before it accepts real payments.

Stripe keeps test mode and live mode apart: a webhook added in test mode has its own signing secret and only hears about test orders, so add it again in live mode for the real shop. The shop counts test orders separately too, so trying it with test cards never lowers your real stock.

Until the Stripe key and Upstash Redis are both connected, the bag shows "Opening soon" instead of the checkout button, so visitors can look around but not pay.

To check it's working, place a test order: the piece's count on the shop goes down, and the webhook's page in Stripe lists the delivery as succeeded.

## For developers

Next.js 16 (App Router, Cache Components), Tailwind CSS 4 and Stripe Checkout. The bag lives in `localStorage` (`src/lib/bag.ts`). `POST /api/checkout` (`src/app/api/checkout/route.ts`) takes prices from `src/data/products.ts`, atomically holds the pieces for the checkout's lifetime in Upstash Redis (`src/lib/stock-store.ts`, an in-memory stand-in under `next dev`) and creates a Stripe Checkout Session. `POST /api/stripe/webhook` turns holds into sales on `checkout.session.completed` and releases them on `checkout.session.expired`. Pages read stock through `getStock()` (`src/lib/stock.ts`), cached with tag `stock` and expired after each sale. `/checkout/success` reads the session back to show the order.
