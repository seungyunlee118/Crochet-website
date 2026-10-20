import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { site } from "@/config/site";
import { getStripe } from "@/lib/stripe";
import { formatPrice, packDays } from "@/lib/money";
import { ButtonLink } from "@/components/ButtonLink";
import { ClearBag } from "@/components/ClearBag";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12">
      <Suspense fallback={<p className="text-lg">Loading your order…</p>}>
        <OrderDetails searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrderDetails({ searchParams }: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const { session_id } = await searchParams;
  const stripe = getStripe();
  if (typeof session_id !== "string" || !session_id.startsWith("cs_") || !stripe) return <NoOrder />;

  // The order is always fetched fresh from Stripe when the page is opened, never prerendered
  await connection();
  const session = await stripe.checkout.sessions
    .retrieve(session_id, { expand: ["line_items"] })
    .catch(() => null);
  if (!session) return <NoOrder />;

  const paid = session.payment_status !== "unpaid";
  const email = session.customer_details?.email;
  const ship = session.collected_information?.shipping_details;
  const lines = session.line_items?.data ?? [];
  const totals = session.total_details;

  return (
    <>
      {paid && <ClearBag />}
      <h1 className="text-[clamp(2.4rem,6vw,3.5rem)] font-bold">
        {paid ? "Thank you! Your order is in." : "Your payment is processing"}
      </h1>
      <p className="mt-3 max-w-[56ch] text-lg">
        {paid
          ? `We'll pack it within ${packDays} business days.${email ? ` Your receipt is going to ${email}.` : ""}`
          : "Your bank is still confirming the payment. You'll get an email once it goes through, and then we'll start packing."}
      </p>

      <section aria-labelledby="items-title" className="mt-10 rounded-[28px] bg-paper p-6 sm:p-7">
        <h2 id="items-title" className="text-2xl font-bold">
          What you ordered
        </h2>
        <ul className="mt-4 divide-y-2 divide-dashed divide-line">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-4 py-3">
              <span>
                {line.description} <span className="text-cocoa-soft">× {line.quantity}</span>
              </span>
              <span className="font-display tabular-nums">{formatPrice(line.amount_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-1.5 border-t-2 border-dashed border-line pt-4">
          <Row term="Shipping" value={totals?.amount_shipping ? formatPrice(totals.amount_shipping) : "Free"} />
          {!!totals?.amount_tax && <Row term="Tax" value={formatPrice(totals.amount_tax)} />}
          <Row term="Total" value={formatPrice(session.amount_total ?? 0)} strong />
        </dl>
      </section>

      {ship?.address && (
        <section aria-labelledby="ship-title" className="mt-8">
          <h2 id="ship-title" className="text-2xl font-bold">
            Shipping to
          </h2>
          <address className="mt-2 text-lg not-italic">
            {ship.name}
            <br />
            {ship.address.line1}
            {ship.address.line2 && (
              <>
                <br />
                {ship.address.line2}
              </>
            )}
            <br />
            {ship.address.city}, {ship.address.state} {ship.address.postal_code}
          </address>
        </section>
      )}

      <p className="mt-10 text-cocoa-soft">
        Questions about your order? Email{" "}
        <a href={`mailto:${site.email}`} className="font-semibold text-cocoa underline decoration-2 underline-offset-4">
          {site.email}
        </a>
        .
      </p>
      <div className="mt-6">
        <ButtonLink href="/shop">Keep shopping</ButtonLink>
      </div>
    </>
  );
}

function NoOrder() {
  return (
    <>
      <h1 className="text-[clamp(2.4rem,6vw,3.5rem)] font-bold">We couldn&apos;t find that order</h1>
      <p className="mt-3 max-w-[56ch] text-lg">
        If you just paid, your receipt email has the details. Still stuck? Email{" "}
        <a href={`mailto:${site.email}`} className="font-semibold underline decoration-2 underline-offset-4">
          {site.email}
        </a>
        .
      </p>
      <p className="mt-6">
        <Link href="/shop" className="font-semibold underline decoration-2 underline-offset-4 hover:text-strawberry">
          Back to the shop
        </Link>
      </p>
    </>
  );
}

function Row({ term, value, strong }: { term: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "pt-1 text-xl font-bold" : ""}`}>
      <dt>{term}</dt>
      <dd className="font-display tabular-nums">{value}</dd>
    </div>
  );
}
