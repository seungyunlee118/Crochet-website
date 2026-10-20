import type { Metadata } from "next";
import { ShopView } from "@/components/ShopView";

export const metadata: Metadata = { title: "Accessories" };

export default function AccessoriesPage() {
  return <ShopView category="accessories" />;
}
