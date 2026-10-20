"use client";

import Link from "next/link";
import { useState } from "react";
import { addToBag, useBag } from "@/lib/bag";
import { buttonClass } from "./ButtonLink";
import { CheckIcon, MinusIcon, PlusIcon } from "./icons";

export function AddToBag({ slug, stock }: { slug: string; stock: number }) {
  const inBag = useBag().find((l) => l.slug === slug)?.qty ?? 0;
  const left = stock - inBag;
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");
  const shown = Math.max(1, Math.min(qty, left));

  if (stock === 0) {
    return (
      <div className="mt-7">
        <button type="button" disabled className={buttonClass}>
          Sold out
        </button>
        <p className="mt-3 text-cocoa-soft">This one found a home. Check back for new colors.</p>
      </div>
    );
  }

  function add() {
    const { added, inBag: total } = addToBag(slug, shown, stock);
    setQty(1);
    setMessage(
      added === 0
        ? `You already have all ${stock} in your bag.`
        : `Added to your bag. You have ${total} in your bag.`,
    );
  }

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center gap-4">
        <div role="group" aria-label="Quantity" className="flex items-center rounded-full border-2 border-line bg-paper">
          <button
            type="button"
            onClick={() => setQty(shown - 1)}
            disabled={shown <= 1}
            aria-label="Decrease quantity"
            className="grid size-12 place-items-center rounded-full disabled:opacity-35"
          >
            <MinusIcon className="size-5" />
          </button>
          <output aria-live="polite" className="w-8 text-center text-lg font-semibold tabular-nums">
            {shown}
          </output>
          <button
            type="button"
            onClick={() => setQty(shown + 1)}
            disabled={shown >= left}
            aria-label="Increase quantity"
            className="grid size-12 place-items-center rounded-full disabled:opacity-35"
          >
            <PlusIcon className="size-5" />
          </button>
        </div>
        <button type="button" onClick={add} disabled={left <= 0} className={`${buttonClass} grow sm:grow-0`}>
          Add to bag
        </button>
      </div>

      <div aria-live="polite" className="min-h-7">
        {(message || left <= 0) && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <CheckIcon className="size-5 text-strawberry" />
            <span>{message || `All ${stock} are in your bag.`}</span>
            <Link href="/bag" className="font-semibold underline decoration-2 underline-offset-4 hover:text-strawberry">
              View bag
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
