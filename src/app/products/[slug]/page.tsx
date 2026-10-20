import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { site } from "@/config/site";
import { categories, getProduct, products } from "@/data/products";
import { formatPrice, packDays, shippingLine } from "@/lib/money";
import { getLiveProducts } from "@/lib/stock";
import { StockBadge, ProductGrid } from "@/components/ProductTile";
import { AddToBag } from "@/components/AddToBag";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return { title: "Not found" };
  return { title: product.name, description: product.description };
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetails({ params }: Pick<PageProps<"/products/[slug]">, "params">) {
  const { slug } = await params;
  const live = await getLiveProducts();
  const product = live.find((p) => p.slug === slug);
  if (!product) notFound();

  const category = categories[product.category];
  const more = live
    .filter((p) => p.category === product.category && p.slug !== product.slug && p.stock > 0)
    .slice(0, 3);

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-[0.95rem]">
        <ol className="flex flex-wrap items-center gap-2 text-cocoa-soft">
          <li>
            <Link href="/shop" className="underline-offset-4 hover:text-cocoa hover:underline">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/shop/${product.category}`} className="underline-offset-4 hover:text-cocoa hover:underline">
              {category.name}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-x-12 gap-y-8 md:grid-cols-[1.1fr_1fr]">
        <div className="md:sticky md:top-6 md:self-start">
          <div className="relative aspect-square overflow-hidden rounded-[36px]" style={{ background: product.tint }}>
            <Image
              src={product.image}
              alt={`${product.name}, ${product.summary.toLowerCase()}`}
              fill
              priority
              sizes="(min-width: 768px) 560px, 100vw"
              className={`object-contain p-[8%] ${product.stock === 0 ? "opacity-60 grayscale-[35%]" : ""}`}
            />
          </div>
        </div>

        <div className="md:pt-2">
          <h1 className="text-[clamp(2.2rem,5vw,3.25rem)] font-bold">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="font-display text-[1.75rem] font-semibold tabular-nums">{formatPrice(product.priceCents)}</p>
            <StockBadge stock={product.stock} />
            {product.stock > 2 && <p className="text-cocoa-soft">{product.stock} in stock</p>}
          </div>

          <p className="mt-5 max-w-[56ch] text-lg">{product.description}</p>

          <AddToBag slug={product.slug} stock={product.stock} />

          <p className="mt-4 text-[0.95rem] text-cocoa-soft">
            {shippingLine}. Packed within {packDays} business days.
          </p>

          <dl className="mt-8 divide-y-2 divide-dashed divide-line border-y-2 border-dashed border-line">
            <Detail term="Size">{product.size}</Detail>
            <Detail term="Made with">{product.materials}</Detail>
            <Detail term="Care">{site.policies.care}</Detail>
            {product.category === "plushies" && <Detail term="Safety">{site.policies.safety}</Detail>}
          </dl>
        </div>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="mt-24">
          <h2 id="more-title" className="mb-7 text-[2rem] font-bold">
            More {category.name.toLowerCase()}
          </h2>
          <ProductGrid products={more} />
        </section>
      )}
    </>
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="h-6 w-40 rounded-full bg-blush/40" />
      <div className="mt-5 grid gap-x-12 gap-y-8 md:grid-cols-[1.1fr_1fr]">
        <div className="aspect-square rounded-[36px] bg-blush/40" />
        <div className="space-y-4 md:pt-2">
          <div className="h-12 w-3/4 rounded-full bg-blush/40" />
          <div className="h-8 w-28 rounded-full bg-blush/40" />
          <div className="h-24 rounded-3xl bg-blush/40" />
          <div className="h-12 w-56 rounded-full bg-blush/40" />
        </div>
      </div>
    </div>
  );
}

function Detail({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="font-semibold">{term}</dt>
      <dd className="text-cocoa-soft">{children}</dd>
    </div>
  );
}
