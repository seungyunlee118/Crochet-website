import type { Metadata } from "next";
import { ShopView } from "@/components/ShopView";

export const metadata: Metadata = { title: "Plushies" };

export default function PlushiesPage() {
  return <ShopView category="plushies" />;
}
