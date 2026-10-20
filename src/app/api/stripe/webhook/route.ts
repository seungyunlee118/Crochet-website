import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getStockStore, type Line } from "@/lib/stock-store";
import { refreshStock } from "@/lib/stock";

// Stripe calls this after checkout events (set up in the Stripe Dashboard, see README).
// Paid orders lower the stock; abandoned checkouts let go of the pieces they were holding.
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const store = getStockStore();
  if (!stripe || !secret || !store) {
    console.error(
      "Stripe webhook is off: set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET, and connect Upstash Redis (see README).",
    );
    // Stripe keeps retrying for 3 days, so orders are still counted once this is fixed
    return new Response("Webhook isn't set up", { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature") ?? "",
      secret,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      // Card and wallet payments are paid at this point. Bank debits are still pending,
      // but the pieces are theirs unless the payment fails.
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const lines = await orderLines(stripe, session.id);
        if (await store.recordSale(session.id, session.metadata?.hold, lines)) refreshStock();
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        if (await store.cancelSale(session.id, await orderLines(stripe, session.id))) refreshStock();
        break;
      }
      case "checkout.session.expired": {
        const hold = event.data.object.metadata?.hold;
        if (hold) await store.release(hold);
        break;
      }
    }
  } catch (err) {
    console.error(`Stripe webhook ${event.type} failed:`, err);
    // Stripe retries failed deliveries
    return new Response("Couldn't update stock", { status: 500 });
  }
  return Response.json({ received: true });
}

// What was bought, read from Stripe rather than from the session metadata (which is cut off at 500 characters)
async function orderLines(stripe: Stripe, sessionId: string): Promise<Line[]> {
  const qty = new Map<string, number>();
  const lineItems = stripe.checkout.sessions.listLineItems(sessionId, {
    expand: ["data.price.product"],
    limit: 100,
  });
  for await (const item of lineItems) {
    const product = item.price?.product;
    const slug = typeof product === "object" && !product.deleted ? product.metadata.slug : undefined;
    if (slug && item.quantity) qty.set(slug, (qty.get(slug) ?? 0) + item.quantity);
  }
  return [...qty].map(([slug, qty]) => ({ slug, qty }));
}
