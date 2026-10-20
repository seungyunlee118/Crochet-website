import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

// Returns null until STRIPE_SECRET_KEY is set, so the shop still runs without payments.
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}
