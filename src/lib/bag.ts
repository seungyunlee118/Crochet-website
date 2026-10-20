"use client";

import { useSyncExternalStore } from "react";

// The shopping bag lives in this browser's localStorage, so it survives reloads.
// Prices and stock are always re-checked on the server at checkout. `stock` here is
// how many are left as the page showed it.

export type BagLine = { slug: string; qty: number };

const KEY = "croche-bag";
// The Stripe checkout this browser opened last. Its pieces are held for the customer, so checking
// out again (after going back to the bag) tells the server to end it and let go of them.
const CHECKOUT_KEY = "croche-checkout";
const EMPTY: BagLine[] = [];
const listeners = new Set<() => void>();
let state: BagLine[] | null = null;

function isLine(v: unknown): v is BagLine {
  const l = v as BagLine;
  return typeof l?.slug === "string" && Number.isInteger(l?.qty) && l.qty > 0;
}

function load(): BagLine[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isLine) : [];
  } catch {
    return [];
  }
}

function getSnapshot() {
  state ??= load();
  return state;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = load();
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function save(next: BagLine[]) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked (private windows); the bag still works for this visit.
  }
  listeners.forEach((l) => l());
}

export function addToBag(slug: string, qty: number, stock: number) {
  const lines = getSnapshot();
  const current = lines.find((l) => l.slug === slug)?.qty ?? 0;
  if (stock <= 0) return { added: 0, inBag: current };
  const nextQty = Math.min(current + qty, stock);
  save(
    current
      ? lines.map((l) => (l.slug === slug ? { ...l, qty: nextQty } : l))
      : [...lines, { slug, qty: nextQty }],
  );
  return { added: nextQty - current, inBag: nextQty };
}

export function setQty(slug: string, qty: number, max: number) {
  const clamped = Math.max(0, Math.min(qty, max));
  const lines = getSnapshot();
  save(
    clamped === 0
      ? lines.filter((l) => l.slug !== slug)
      : lines.map((l) => (l.slug === slug ? { ...l, qty: clamped } : l)),
  );
}

export function removeFromBag(slug: string) {
  save(getSnapshot().filter((l) => l.slug !== slug));
}

export function clearBag() {
  save([]);
  try {
    localStorage.removeItem(CHECKOUT_KEY);
  } catch {
    // Storage blocked: nothing was remembered
  }
}

export function lastCheckout() {
  try {
    return localStorage.getItem(CHECKOUT_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function rememberCheckout(sessionId: string) {
  try {
    localStorage.setItem(CHECKOUT_KEY, sessionId);
  } catch {
    // Storage blocked: the hold just runs out on its own
  }
}

export function useBag() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function useBagCount() {
  return useBag().reduce((n, l) => n + l.qty, 0);
}
