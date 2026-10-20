import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/money";

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  if (stock === 0)
    return (
      <span className={`rounded-full bg-cocoa px-3 py-1 text-sm font-semibold text-milk ${className ?? ""}`}>
        Sold out
      </span>
    );
  if (stock <= 2)
    return (
      <span className={`rounded-full bg-butter px-3 py-1 text-sm font-semibold text-cocoa ${className ?? ""}`}>
        Only {stock} left
      </span>
    );
  return null;
}

export function ProductTile({ product: p, priority }: { product: Product; priority?: boolean }) {
  const soldOut = p.stock === 0;
  return (
    <li>
      <Link href={`/products/${p.slug}`} prefetch className="group block rounded-[28px]">
        <div className="relative aspect-square overflow-hidden rounded-[28px]" style={{ background: p.tint }}>
          <Image
            src={p.image}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
            className={`object-contain p-[7%] transition-transform duration-300 ease-out group-hover:scale-[1.04] ${
              soldOut ? "opacity-55 grayscale-[35%]" : ""
            }`}
          />
          <StockBadge stock={p.stock} className="absolute top-3 left-3" />
        </div>
        <h3 className="mt-3 text-lg leading-snug font-semibold decoration-2 underline-offset-4 group-hover:underline">
          {p.name}
        </h3>
        <p className="mt-0.5 font-display font-semibold tabular-nums">{formatPrice(p.priceCents)}</p>
        <p className="text-[0.95rem] text-cocoa-soft">{p.summary}</p>
      </Link>
    </li>
  );
}

export function ProductGrid({
  products,
  wide,
  priorityCount = 0,
}: {
  products: Product[];
  wide?: boolean;
  priorityCount?: number;
}) {
  return (
    <ul
      className={`grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 ${wide ? "sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-3"}`}
    >
      {products.map((p, i) => (
        <ProductTile key={p.slug} product={p} priority={i < priorityCount} />
      ))}
    </ul>
  );
}
