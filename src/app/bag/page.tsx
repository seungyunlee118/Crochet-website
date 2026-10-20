import type { Metadata } from "next";
import { getStock } from "@/lib/stock";
import { getStockStore } from "@/lib/stock-store";
import { getStripe } from "@/lib/stripe";
import { BagView } from "@/components/BagView";

export const metadata: Metadata = { title: "Your bag" };

export default async function BagPage() {
  // Checkout opens once Stripe and stock counting are both connected (see README).
  // Until then the bag shows "Opening soon" instead of the checkout button.
  const checkoutOpen = getStripe() !== null && getStockStore() !== null;
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="text-[clamp(2.4rem,6vw,3.5rem)] font-bold">Your bag</h1>
      <BagView stock={await getStock()} checkoutOpen={checkoutOpen} />
    </div>
  );
}
