import Link from "next/link";
import { site } from "@/config/site";
import { categories, type Category } from "@/data/products";
import { packDays, shippingLine } from "@/lib/money";
import { getLiveProducts } from "@/lib/stock";
import { ShelfHero } from "@/components/ShelfHero";
import { ProductGrid } from "@/components/ProductTile";

const steps = [
  {
    title: "Pick your favorites",
    body: "Add them to your bag and check out with a card, Apple Pay or Google Pay.",
  },
  {
    title: "We pack it up",
    body: `Your order is packed with care within ${packDays} business days.`,
  },
  {
    title: "It ships to your door",
    body: `Delivery takes about ${site.shipping.transitMin}–${site.shipping.transitMax} business days anywhere in the US. ${shippingLine}.`,
  },
];

export default function Home() {
  return (
    <>
      <ShelfHero />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <CategorySection category="plushies" className="mt-36 sm:mt-40" />
        <CategorySection category="accessories" className="mt-20" wide />

        <div className="stitch-rule mt-20" />

        <section aria-labelledby="how-title" className="mt-16">
          <h2 id="how-title" className="text-[2rem] font-bold">
            How your order gets to you
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-strawberry font-display text-xl font-bold text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-cocoa-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="stitch-rule mt-16" />

        <section aria-labelledby="about-title" className="mt-16 grid gap-x-12 gap-y-4 md:grid-cols-[1fr_1.4fr]">
          <h2 id="about-title" className="text-[2rem] font-bold">
            Made by hand, a few at a time
          </h2>
          <div className="max-w-[62ch] space-y-4 text-lg">
            {site.about.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

async function CategorySection({
  category,
  className,
  wide,
}: {
  category: Category;
  className?: string;
  wide?: boolean;
}) {
  const { name, blurb } = categories[category];
  const items = (await getLiveProducts()).filter((p) => p.category === category);
  return (
    <section aria-labelledby={`${category}-title`} className={className}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h2 id={`${category}-title`} className="text-[2rem] font-bold">
            {name}
          </h2>
          <p className="mt-1 text-cocoa-soft">{blurb}</p>
        </div>
        <Link
          href={`/shop/${category}`}
          className="inline-flex min-h-11 items-center font-semibold underline decoration-2 underline-offset-4 hover:text-strawberry"
        >
          See all {name.toLowerCase()}
        </Link>
      </div>
      <ProductGrid products={items.slice(0, wide ? 4 : 6)} wide={wide} />
    </section>
  );
}
