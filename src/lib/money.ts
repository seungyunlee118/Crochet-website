import { site } from "@/config/site";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(cents: number) {
  return usd.format(cents / 100);
}

export function shippingFor(subtotalCents: number) {
  return subtotalCents >= site.shipping.freeOverCents ? 0 : site.shipping.flatRateCents;
}

export const packDays = `${site.shipping.packDaysMin}–${site.shipping.packDaysMax}`;

export const shippingLine =`${formatPrice(site.shipping.flatRateCents)} shipping, free on orders over ${formatPrice(
  site.shipping.freeOverCents,
)}`;
