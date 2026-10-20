import type { Metadata } from "next";
import { getStock } from "@/lib/stock";
import { BagView } from "@/components/BagView";

export const metadata: Metadata = { title: "Your bag" };

export default async function BagPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="text-[clamp(2.4rem,6vw,3.5rem)] font-bold">Your bag</h1>
      <BagView stock={await getStock()} />
    </div>
  );
}
