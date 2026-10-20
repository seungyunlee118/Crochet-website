import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/money";
import { ButtonLink } from "./ButtonLink";

export function ShelfHero() {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-14">
      <div className="grid items-end gap-x-12 gap-y-6 lg:grid-cols-[1.25fr_1fr]">
        <h1
          id="hero-title"
          className="text-[clamp(2.6rem,7.2vw,5.25rem)] leading-[1.02] font-bold [font-stretch:88%]"
        >
          {site.tagline}
        </h1>
        <div className="lg:pb-3">
          <p className="max-w-[44ch] text-lg text-cocoa-soft">{site.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/shop/plushies">Shop plushies</ButtonLink>
            <Link
              href="/shop/accessories"
              className="inline-flex min-h-12 items-center font-semibold underline decoration-2 underline-offset-4 hover:text-strawberry"
            >
              See accessories
            </Link>
          </div>
        </div>
      </div>

      <ul aria-label="On the shelf" className="mt-12 grid grid-cols-2 gap-y-32 sm:mt-16 sm:grid-cols-4">
        {featured.map((p, i) => (
          <li key={p.slug} className="shelf-cell">
            <Link href={`/products/${p.slug}`} prefetch className="group block rounded-2xl">
              <Image
                src={p.image}
                alt=""
                width={400}
                height={400}
                priority
                className="settle mx-auto -mb-3 w-[88%] transition-transform duration-300 group-hover:-translate-y-1.5"
                style={{ animationDelay: `${120 + i * 110}ms` }}
              />
              <span className="absolute top-full left-1/2 flex -translate-x-1/2 flex-col items-center">
                <span aria-hidden="true" className="h-5 w-px bg-cocoa/60" />
                <span
                  className={`price-tag block min-w-28 bg-paper px-3 pt-3.5 pb-2 text-center drop-shadow-sm transition-transform duration-300 group-hover:rotate-0 ${
                    i % 2 ? "rotate-3" : "-rotate-3"
                  }`}
                >
                  <span aria-hidden="true" className="mx-auto mb-1 block size-2 rounded-full bg-milk ring-1 ring-line" />
                  <span aria-hidden="true" className="block text-[0.95rem] leading-tight font-semibold">
                    {p.name.split(" the ")[0]}
                  </span>
                  <span className="sr-only">{p.name}, </span>
                  <span className="block font-display text-[0.95rem] text-strawberry tabular-nums">
                    {formatPrice(p.priceCents)}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
