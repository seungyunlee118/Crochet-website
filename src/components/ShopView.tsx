import Link from "next/link";
import { categories, type Category } from "@/data/products";
import { getLiveProducts } from "@/lib/stock";
import { ProductGrid } from "./ProductTile";

const tabs: { href: string; label: string; category?: Category }[] = [
  { href: "/shop", label: "All" },
  ...(Object.keys(categories) as Category[]).map((c) => ({
    href: `/shop/${c}`,
    label: categories[c].name,
    category: c,
  })),
];

export async function ShopView({ category }: { category?: Category }) {
  const products = await getLiveProducts();
  const items = category ? products.filter((p) => p.category === category) : products;
  const title = category ? categories[category].name : "Shop all";
  const blurb = category ? categories[category].blurb : "Every plushie and accessory in the shop.";
  // Things you can buy first, sold-out pieces at the end
  const sorted = [...items].sort((a, b) => Number(a.stock === 0) - Number(b.stock === 0));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="text-[clamp(2.4rem,6vw,3.5rem)] font-bold">{title}</h1>
      <p className="mt-2 text-lg text-cocoa-soft">{blurb}</p>

      <nav aria-label="Categories" className="mt-7">
        <ul className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const current = tab.category === category;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={current ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-full border-2 px-5 font-semibold transition-colors ${
                    current
                      ? "border-cocoa bg-cocoa text-milk"
                      : "border-line bg-paper hover:border-cocoa"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-10">
        <ProductGrid products={sorted} wide priorityCount={4} />
      </div>
    </div>
  );
}
