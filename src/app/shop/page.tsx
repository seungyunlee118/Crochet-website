import type { Metadata } from "next";
import { ShopView } from "@/components/ShopView";

export const metadata: Metadata = { title: "Shop all" };

export default function ShopPage() {
  return <ShopView />;
}
