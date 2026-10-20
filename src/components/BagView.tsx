"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { site } from "@/config/site";
import { getProduct } from "@/data/products";
import { lastCheckout, rememberCheckout, removeFromBag, setQty, useBag } from "@/lib/bag";
import { formatPrice, shippingFor } from "@/lib/money";
import { ButtonLink, buttonClass } from "./ButtonLink";
import { CloseIcon, LockIcon, MinusIcon, PlusIcon } from "./icons";

type CheckoutReply = { url?: string; session?: string; error?: string; stock?: Record<string, number> };

// `stock` is how many of each piece are left, from the server.
// `checkoutOpen` is false until payments are connected, and the bag shows "Opening soon" instead.
export function BagView({ stock, checkoutOpen }: { stock: Record<string, number>; checkoutOpen: boolean }) {
  // Fresher counts from a checkout that was turned down
  const [latest, setLatest] = useState<Record<string, number>>({});
  const left = (slug: string) => latest[slug] ?? stock[slug] ?? 0;
  const lines = useBag()
    .map((line) => ({ ...line, product: getProduct(line.slug) }))
    .filter((l) => l.product !== undefined)
    .map((l) => ({ ...l, product: l.product!, left: left(l.slug), qty: Math.min(l.qty, left(l.slug)) }));
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const available = lines.filter((l) => l.qty > 0);
  if (lines.length === 0) {
    return (
      <div className="mt-8">
        <p className="text-lg">Your bag is empty. Find a little friend to fill it.</p>
        <div className="mt-6">
          <ButtonLink href="/shop/plushies">Shop plushies</ButtonLink>
        </div>
      </div>
    );
  }

  const subtotal = available.reduce((sum, l) => sum + l.product.priceCents * l.qty, 0);
  const shipping = available.length ? shippingFor(subtotal) : 0;
  const toFree = site.shipping.freeOverCents - subtotal;

  async function checkout() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: available.map(({ slug, qty }) => ({ slug, qty })),
          previous: lastCheckout(),
        }),
      });
      const data: CheckoutReply = await res.json().catch(() => ({}));
      if (data.stock) setLatest(data.stock);
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout couldn't open. Please try again.");
      if (data.session) rememberCheckout(data.session);
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout couldn't open. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="mt-8 grid items-start gap-x-12 gap-y-10 lg:grid-cols-[1.5fr_1fr]">
      <ul className="divide-y-2 divide-dashed divide-line border-y-2 border-dashed border-line">
        {lines.map(({ slug, qty, left, product: p }) => (
          <li key={slug} className="flex gap-4 py-5 sm:gap-6">
            <Link
              href={`/products/${slug}`}
              className="relative size-24 shrink-0 overflow-hidden rounded-[20px] sm:size-28"
              style={{ background: p.tint }}
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image src={p.image} alt="" fill sizes="112px" className="object-contain p-2" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/products/${slug}`} className="text-lg font-semibold hover:underline decoration-2 underline-offset-4">
                    {p.name}
                  </Link>
                  <p className="text-[0.95rem] text-cocoa-soft">{formatPrice(p.priceCents)} each</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromBag(slug)}
                  aria-label={`Remove ${p.name}`}
                  className="-mt-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-cocoa-soft hover:bg-blush/40 hover:text-cocoa"
                >
                  <CloseIcon className="size-5" />
                </button>
              </div>
              {qty === 0 ? (
                <p className="mt-3 font-semibold">Sold out since you added it. Remove it to check out.</p>
              ) : (
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div role="group" aria-label={`Quantity of ${p.name}`} className="flex items-center rounded-full border-2 border-line bg-paper">
                    <button
                      type="button"
                      onClick={() => setQty(slug, qty - 1, left)}
                      aria-label={qty === 1 ? `Remove ${p.name}` : "Decrease quantity"}
                      className="grid size-11 place-items-center rounded-full"
                    >
                      <MinusIcon className="size-5" />
                    </button>
                    <span className="w-7 text-center font-semibold tabular-nums">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(slug, qty + 1, left)}
                      disabled={qty >= left}
                      aria-label="Increase quantity"
                      className="grid size-11 place-items-center rounded-full disabled:opacity-35"
                    >
                      <PlusIcon className="size-5" />
                    </button>
                  </div>
                  <p className="font-display text-lg font-semibold tabular-nums">{formatPrice(p.priceCents * qty)}</p>
                </div>
              )}
              {qty > 0 && qty >= left && (
                <p className="mt-2 text-[0.95rem] text-cocoa-soft">That&apos;s all we have of this one.</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section aria-labelledby="summary-title" className="rounded-[28px] bg-paper p-6 sm:p-7 lg:sticky lg:top-6">
        <h2 id="summary-title" className="text-2xl font-bold">
          Order summary
        </h2>
        <dl className="mt-5 space-y-2.5">
          <Row term="Subtotal" value={formatPrice(subtotal)} />
          <Row term="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
        </dl>
        {toFree > 0 && available.length > 0 && (
          <p className="mt-3 rounded-2xl bg-butter/45 px-4 py-2.5 text-[0.95rem]">
            Add {formatPrice(toFree)} more for free shipping.
          </p>
        )}
        <dl className="mt-4 border-t-2 border-dashed border-line pt-4">
          <Row term="Total" value={formatPrice(subtotal + shipping)} strong />
        </dl>
        {checkoutOpen ? (
          <>
            <button
              type="button"
              onClick={checkout}
              disabled={status === "loading" || available.length === 0}
              className={`${buttonClass} mt-6 w-full`}
            >
              {status === "loading" ? "Opening checkout…" : "Check out"}
            </button>
            <div aria-live="assertive">
              {error && (
                <p role="alert" className="mt-3 rounded-2xl border-2 border-strawberry px-4 py-2.5 text-[0.95rem]">
                  {error}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <button type="button" disabled className={`${buttonClass} mt-6 w-full`}>
              Opening soon
            </button>
            <p className="mt-3 rounded-2xl bg-butter/45 px-4 py-2.5 text-[0.95rem]">
              We&apos;re getting the shop ready, so checkout isn&apos;t open yet. Your bag is saved on this device
              until it opens.
            </p>
          </>
        )}
        <p className="mt-4 flex items-start gap-2 text-[0.95rem] text-cocoa-soft">
          <LockIcon className="mt-0.5 size-5 shrink-0" />
          <span>Secure checkout by Stripe. Pay with a card, Apple Pay or Google Pay. US shipping only.</span>
        </p>
      </section>
    </div>
  );
}

function Row({ term, value, strong }: { term: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "text-xl font-bold" : ""}`}>
      <dt>{term}</dt>
      <dd className="font-display tabular-nums">{value}</dd>
    </div>
  );
}
