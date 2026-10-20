"use client";

import { useEffect } from "react";
import { clearBag } from "@/lib/bag";

// Empties the bag once an order is confirmed as paid.
export function ClearBag() {
  useEffect(() => {
    clearBag();
  }, []);
  return null;
}
