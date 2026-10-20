import "server-only";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { products } from "@/data/products";
import { getStockStore } from "./stock-store";

// How many of each piece are left for the shop's pages: starting stock from products.ts minus paid orders.
// Baked into the static pages and refreshed when an order is paid. Checkout always asks the store directly.
export async function getStock(): Promise<Record<string, number>> {
  "use cache";
  cacheTag("stock");
  try {
    const sold = (await getStockStore()?.soldCounts()) ?? {};
    cacheLife("hours");
    return stockLeft(sold);
  } catch (err) {
    console.error("Couldn't read stock counts, showing starting stock from products.ts:", err);
    // Try again soon
    cacheLife("minutes");
    return stockLeft({});
  }
}

// The product list with each `stock` replaced by how many are left
export async function getLiveProducts() {
  const left = await getStock();
  return products.map((p) => ({ ...p, stock: left[p.slug] ?? p.stock }));
}

export function stockLeft(sold: Record<string, number>) {
  return Object.fromEntries(products.map((p) => [p.slug, Math.max(0, p.stock - (sold[p.slug] ?? 0))]));
}

// Called after a sale. The next visit to each page waits for fresh counts instead of showing old ones.
export function refreshStock() {
  revalidateTag("stock", { expire: 0 });
}
