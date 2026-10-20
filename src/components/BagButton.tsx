"use client";

import Link from "next/link";
import { useBagCount } from "@/lib/bag";
import { BagIcon } from "./icons";

export function BagButton({ className }: { className?: string }) {
  const count = useBagCount();
  const label = count === 0 ? "Bag, empty" : `Bag, ${count} ${count === 1 ? "item" : "items"}`;
  return (
    <Link
      href="/bag"
      aria-label={label}
      className={`relative inline-flex size-12 items-center justify-center rounded-full hover:bg-white/15 ${className ?? ""}`}
    >
      <BagIcon className="size-7" />
      {count > 0 && (
        <span
          key={count}
          aria-hidden="true"
          className="bump absolute top-0.5 right-0 grid min-w-6 place-items-center rounded-full bg-butter px-1.5 text-sm leading-6 font-bold text-cocoa tabular-nums"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
