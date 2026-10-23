import type { NextRequest } from "next/server";

/**
 * Place text -> search centre, via OpenStreetMap Nominatim.
 *
 * Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/)
 * asks for: an identifying User-Agent, at most 1 request/second, cached results,
 * and no autocomplete use. This route is only called on an explicit search
 * submit, caches every answer, and spaces upstream calls >= 1.1 s apart.
 * Cache and limits are per server instance (in memory). For high traffic point
 * GEOCODER_URL at a self-hosted or commercial Nominatim-compatible service.
 */

const UPSTREAM = process.env.GEOCODER_URL ?? "https://nominatim.openstreetmap.org/search";
const USER_AGENT = process.env.GEOCODER_USER_AGENT ?? "HealthPinLanding/1.0 (https://www.healthpin.in)";

const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const NOT_FOUND_TTL_MS = 60 * 60 * 1000;
const MAX_ENTRIES = 1000;
const MIN_GAP_MS = 1100;
const CLIENT_LIMIT = { max: 20, windowMs: 60_000 };

type Result = { lat: number; lng: number; name: string } | null;

const cache = new Map<string, { value: Result; expires: number }>();
const inflight = new Map<string, Promise<Result>>();
const clients = new Map<string, { count: number; reset: number }>();
let queue: Promise<unknown> = Promise.resolve();
let lastCall = 0;

function limited(ip: string): boolean {
  const now = Date.now();
  if (clients.size > 5000) for (const [k, v] of clients) if (v.reset < now) clients.delete(k);
  const entry = clients.get(ip);
  if (!entry || entry.reset < now) {
    clients.set(ip, { count: 1, reset: now + CLIENT_LIMIT.windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > CLIENT_LIMIT.max;
}

function remember(key: string, value: Result) {
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
  cache.set(key, { value, expires: Date.now() + (value ? TTL_MS : NOT_FOUND_TTL_MS) });
}

async function lookup(query: string): Promise<Result> {
  const url = new URL(UPSTREAM);
  url.search = new URLSearchParams({ q: query, format: "jsonv2", limit: "1", countrycodes: "in" }).toString();
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`geocoder ${res.status}`);
  const rows = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  const first = rows[0];
  if (!first) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng, name: first.display_name } : null;
}

/** Serialises upstream calls so they never exceed one per MIN_GAP_MS. */
function throttled(query: string): Promise<Result> {
  const run = queue.then(async () => {
    const wait = lastCall + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall = Date.now();
    return lookup(query);
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (query.length < 2) return Response.json({ error: "invalid_query" }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });

  const key = query.toLowerCase();
  const hit = cache.get(key);
  let result: Result;
  if (hit && hit.expires > Date.now()) {
    result = hit.value;
  } else {
    let pending = inflight.get(key);
    if (!pending) {
      pending = throttled(query).finally(() => inflight.delete(key));
      inflight.set(key, pending);
    }
    try {
      result = await pending;
      remember(key, result);
    } catch {
      return Response.json({ error: "geocoder_unavailable" }, { status: 502 });
    }
  }
  if (!result) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json(result, { headers: { "Cache-Control": "public, max-age=86400" } });
}
