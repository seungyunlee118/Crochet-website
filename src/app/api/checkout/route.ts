import type Stripe from "stripe";
import { site } from "@/config/site";
import { getProduct } from "@/data/products";
import { shippingFor } from "@/lib/money";
import { getStripe } from "@/lib/stripe";
import { getStockStore, type Line, type StockStore } from "@/lib/stock-store";
import { stockLeft } from "@/lib/stock";

// Pieces are held while the customer pays. Stripe's shortest checkout is 30 minutes;
// the extra minute keeps Stripe from rejecting it as too short.
const HOLD_MINUTES = 31;
// Holds outlast the checkout a little, in case the "paid" message from Stripe arrives late
const HOLD_GRACE_MINUTES = 15;

const fail = (error: string, status: number, stock?: Record<string, number>) =>
  Response.json({ error, stock }, { status });

// Accepts { items: [{ slug, qty }], previous?: sessionId } from the bag and returns { url, session } for Stripe Checkout.
// Prices and stock come from the server, never from the browser. `previous` is the checkout this browser
// opened last: going back to the bag and checking out again lets go of the pieces it was holding.
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const items = parseItems(body);
  if (!items) return fail("We couldn't read your bag. Please refresh the page and try again.", 400);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const toHold: (Line & { stock: number })[] = [];
  let subtotal = 0;
  const origin = siteOrigin(request);

  for (const { slug, qty } of items) {
    const p = getProduct(slug);
    if (!p) return fail("Something in your bag isn't sold anymore. Please remove it and try again.", 409);

    subtotal += p.priceCents * qty;
    toHold.push({ slug, qty, stock: p.stock });
    lineItems.push({
      quantity: qty,
      price_data: {
        currency: "usd",
        unit_amount: p.priceCents,
        product_data: {
          name: p.name,
          description: p.summary,
          images: imageUrls(p.image, origin),
          metadata: { slug },
        },
      },
    });
  }

  const stripe = getStripe();
  const store = getStockStore();
  if (!stripe || !store) {
    console.error(
      !stripe
        ? "Checkout is off: set STRIPE_SECRET_KEY in .env.local (see README)."
        : "Checkout is off: connect Upstash Redis so stock can be counted (see README).",
    );
    return fail(
      process.env.NODE_ENV === "production"
        ? "Checkout isn't available right now. Please try again later."
        : "Payments aren't connected yet. Add STRIPE_SECRET_KEY to .env.local and restart the dev server.",
      503,
    );
  }

  const previous = (body as { previous?: unknown }).previous;
  if (typeof previous === "string") await releasePrevious(stripe, store, previous);

  const holdId = crypto.randomUUID();
  const expiresAt = Date.now() + HOLD_MINUTES * 60_000;
  try {
    const short = await store.hold(holdId, toHold, expiresAt + HOLD_GRACE_MINUTES * 60_000);
    if (short) {
      // Send fresh counts so the bag can show what's actually left
      const left = stockLeft(await store.soldCounts());
      return fail(shortMessage(short, items), 409, left);
    }
  } catch (err) {
    console.error("Couldn't check stock:", err);
    return fail("Checkout couldn't open. Please try again in a moment.", 503);
  }

  const { shipping } = site;
  const shippingCents = shippingFor(subtotal);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: shippingCents === 0 ? "Free shipping" : "Standard shipping",
            fixed_amount: { amount: shippingCents, currency: "usd" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: shipping.packDaysMin + shipping.transitMin },
              maximum: { unit: "business_day", value: shipping.packDaysMax + shipping.transitMax },
            },
          },
        },
      ],
      // Turn on once Stripe Tax is set up in your dashboard (see README)
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
      expires_at: Math.floor(expiresAt / 1000),
      metadata: {
        // Easy to read in the Stripe dashboard: which pieces to pack
        items: items.map((i) => `${i.slug} x${i.qty}`).join(", ").slice(0, 500),
        // Lets the webhook turn the hold into a sale, or release it if the checkout expires
        hold: holdId,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/bag`,
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return Response.json({ url: session.url, session: session.id });
  } catch (err) {
    console.error("Stripe checkout failed:", err);
    await store.release(holdId).catch(() => {});
    return fail("Checkout couldn't open. Please try again in a moment.", 502);
  }
}

function shortMessage({ slug, sold, held }: { slug: string; sold: number; held: number }, items: Line[]) {
  const p = getProduct(slug)!;
  const qty = items.find((i) => i.slug === slug)?.qty ?? 1;
  const left = Math.max(0, p.stock - sold);
  const free = Math.max(0, left - held);
  if (left === 0) return `${p.name} just sold out. Please remove it from your bag.`;
  if (qty > left) return `There are only ${left} of ${p.name} left. Please lower the quantity.`;
  if (free === 0)
    return `${p.name} is in someone else's checkout right now. If they don't finish, it'll be back in about 30 minutes. Please remove it to check out the rest.`;
  return `Only ${free} of ${p.name} can be bought right now, because someone else is checking out with the rest. Please lower the quantity.`;
}

// Ends the customer's earlier checkout, unless they already paid, and lets go of what it was holding
async function releasePrevious(stripe: Stripe, store: StockStore, id: string) {
  if (!/^cs_(test|live)_\w+$/.test(id)) return;
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.status === "complete") return;
    if (session.status === "open") await stripe.checkout.sessions.expire(id);
    if (session.metadata?.hold) await store.release(session.metadata.hold);
  } catch (err) {
    // Paid at the same moment, or already gone. Their hold runs out on its own.
    console.error("Couldn't end the previous checkout:", err);
  }
}

function parseItems(body: unknown): Line[] | null {
  const items = (body as { items?: unknown } | null)?.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) return null;
  const merged = new Map<string, number>();
  for (const item of items) {
    const { slug, qty } = (item ?? {}) as Partial<Line>;
    if (typeof slug !== "string" || typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return null;
    }
    merged.set(slug, (merged.get(slug) ?? 0) + qty);
  }
  return [...merged].map(([slug, qty]) => ({ slug, qty }));
}

function siteOrigin(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

// Stripe shows product photos on its checkout page, but only from public https URLs and not SVGs
function imageUrls(image: string, origin: string) {
  if (!origin.startsWith("https://") || image.endsWith(".svg")) return undefined;
  return [new URL(image, origin).href];
}
