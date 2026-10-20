import "server-only";
import { Redis } from "@upstash/redis";

// Where live stock counts are kept: Upstash Redis when it's connected (see README),
// or this computer's memory while running `npm run dev` without it.
//
// The store only counts what has happened online. The starting stock stays in
// src/data/products.ts, and what's left is starting stock minus sold minus held.
// - sold: paid orders, counted once per Stripe Checkout Session
// - held: pieces set aside while a customer is on the Stripe payment page

export type Line = { slug: string; qty: number };

// Why a piece couldn't be held: how many were sold and how many someone else is holding
export type Shortfall = { slug: string; sold: number; held: number };

export type StockStore = {
  soldCounts(): Promise<Record<string, number>>;
  // Holds every line until expiresAt (ms), or holds nothing and returns the first line that's short
  hold(holdId: string, lines: (Line & { stock: number })[], expiresAt: number): Promise<Shortfall | null>;
  release(holdId: string): Promise<void>;
  // Counts an order as sold and drops its hold. Returns false if the order was already counted.
  recordSale(orderId: string, holdId: string | undefined, lines: Line[]): Promise<boolean>;
  // Puts a counted order back in stock, for payments that fail after checkout (bank debits)
  cancelSale(orderId: string, lines: Line[]): Promise<boolean>;
};

let store: StockStore | null | undefined;

// Returns null when there's nowhere to keep counts (no Upstash Redis in production).
export function getStockStore() {
  if (store === undefined) {
    store = redisStore() ?? (process.env.NODE_ENV === "development" ? memoryStore() : null);
  }
  return store;
}

// Test-mode and live orders are counted separately, so test purchases never lower real stock.
function keyPrefix() {
  const live = /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "");
  return `croche:${live ? "live" : "test"}`;
}

// Holds are stored as "<expires ms>|slug=qty,slug=qty" in one hash, so a script can read them all.
// The scripts run inside Redis one at a time, so two checkouts can't both take the last piece.
const HOLD = `
local now = tonumber(ARGV[1])
local held = {}
local holds = redis.call('HGETALL', KEYS[2])
for i = 1, #holds, 2 do
  local expires, items = string.match(holds[i + 1], '^(%d+)|(.*)$')
  if not expires or tonumber(expires) <= now then
    redis.call('HDEL', KEYS[2], holds[i])
  else
    for slug, qty in string.gmatch(items, '([^,=]+)=(%d+)') do
      held[slug] = (held[slug] or 0) + tonumber(qty)
    end
  end
end
for i = 4, #ARGV, 3 do
  local slug, qty, stock = ARGV[i], tonumber(ARGV[i + 1]), tonumber(ARGV[i + 2])
  local sold = tonumber(redis.call('HGET', KEYS[1], slug) or 0)
  if qty > stock - sold - (held[slug] or 0) then
    return { slug, sold, held[slug] or 0 }
  end
end
redis.call('HSET', KEYS[2], ARGV[2], ARGV[3])
return 0
`;

const RECORD_SALE = `
if redis.call('HSETNX', KEYS[3], ARGV[1], 'sold') == 0 then return 0 end
for i = 3, #ARGV, 2 do
  redis.call('HINCRBY', KEYS[1], ARGV[i], ARGV[i + 1])
end
if ARGV[2] ~= '' then redis.call('HDEL', KEYS[2], ARGV[2]) end
return 1
`;

const CANCEL_SALE = `
if redis.call('HGET', KEYS[2], ARGV[1]) ~= 'sold' then return 0 end
redis.call('HSET', KEYS[2], ARGV[1], 'failed')
for i = 2, #ARGV, 2 do
  redis.call('HINCRBY', KEYS[1], ARGV[i], -tonumber(ARGV[i + 1]))
end
return 1
`;

function redisStore(): StockStore | null {
  // Vercel's Upstash integration sets the KV_ names; Upstash's own console uses the UPSTASH_ ones
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  const prefix = keyPrefix();
  const sold = `${prefix}:sold`;
  const holds = `${prefix}:holds`;
  // Every counted order, so a webhook Stripe sends twice is only counted once
  const orders = `${prefix}:orders`;
  const holdScript = redis.createScript<0 | [string, number, number]>(HOLD);
  const recordScript = redis.createScript<0 | 1>(RECORD_SALE);
  const cancelScript = redis.createScript<0 | 1>(CANCEL_SALE);

  return {
    async soldCounts() {
      return (await redis.hgetall<Record<string, number>>(sold)) ?? {};
    },
    async hold(holdId, lines, expiresAt) {
      const value = `${expiresAt}|${lines.map((l) => `${l.slug}=${l.qty}`).join(",")}`;
      const args = lines.flatMap((l) => [l.slug, String(l.qty), String(l.stock)]);
      const short = await holdScript.exec([sold, holds], [String(Date.now()), holdId, value, ...args]);
      return short === 0 ? null : { slug: short[0], sold: Number(short[1]), held: Number(short[2]) };
    },
    async release(holdId) {
      await redis.hdel(holds, holdId);
    },
    async recordSale(orderId, holdId, lines) {
      const args = lines.flatMap((l) => [l.slug, String(l.qty)]);
      return (await recordScript.exec([sold, holds, orders], [orderId, holdId ?? "", ...args])) === 1;
    },
    async cancelSale(orderId, lines) {
      const args = lines.flatMap((l) => [l.slug, String(l.qty)]);
      return (await cancelScript.exec([sold, orders], [orderId, ...args])) === 1;
    },
  };
}

// Same rules as the Redis scripts, for trying the shop on your computer. Resets when the dev server restarts.
function memoryStore(): StockStore {
  console.warn("Stock counts are kept in memory until you connect Upstash Redis (see README).");
  type Memory = {
    sold: Map<string, number>;
    holds: Map<string, { expiresAt: number; lines: Line[] }>;
    orders: Map<string, "sold" | "failed">;
  };
  // Shared by every route in the dev server
  const g = globalThis as { crocheStock?: Memory };
  const m: Memory = (g.crocheStock ??= { sold: new Map(), holds: new Map(), orders: new Map() });
  const add = (lines: Line[], sign: number) =>
    lines.forEach((l) => m.sold.set(l.slug, (m.sold.get(l.slug) ?? 0) + sign * l.qty));

  return {
    async soldCounts() {
      return Object.fromEntries(m.sold);
    },
    async hold(holdId, lines, expiresAt) {
      const held = new Map<string, number>();
      for (const [id, h] of m.holds) {
        if (h.expiresAt <= Date.now()) m.holds.delete(id);
        else h.lines.forEach((l) => held.set(l.slug, (held.get(l.slug) ?? 0) + l.qty));
      }
      for (const l of lines) {
        const short = { slug: l.slug, sold: m.sold.get(l.slug) ?? 0, held: held.get(l.slug) ?? 0 };
        if (l.qty > l.stock - short.sold - short.held) return short;
      }
      m.holds.set(holdId, { expiresAt, lines: lines.map(({ slug, qty }) => ({ slug, qty })) });
      return null;
    },
    async release(holdId) {
      m.holds.delete(holdId);
    },
    async recordSale(orderId, holdId, lines) {
      if (m.orders.has(orderId)) return false;
      m.orders.set(orderId, "sold");
      add(lines, 1);
      if (holdId) m.holds.delete(holdId);
      return true;
    },
    async cancelSale(orderId, lines) {
      if (m.orders.get(orderId) !== "sold") return false;
      m.orders.set(orderId, "failed");
      add(lines, -1);
      return true;
    },
  };
}
