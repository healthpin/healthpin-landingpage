import type { ApiPage, FilterOptions, Filters, Place, Suggestion } from "./types";

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
const DIRECTORY = `${BASE}/api/v1/hospitals/public/directory/`;

export const PAGE_SIZE = 20;
export const RADII_KM = [5, 10, 25, 50] as const;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

export const isConfigured = BASE !== "";

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  if (!isConfigured) {
    throw new ApiError("Hospital search is not configured (NEXT_PUBLIC_API_BASE_URL is missing).");
  }
  let res: Response;
  try {
    res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (err) {
    if (signal.aborted) throw err;
    throw new ApiError("Couldn't reach the hospital service. Check your connection and try again.");
  }
  if (res.status === 429) throw new ApiError("Too many searches in a short time. Please wait a moment and retry.", 429);
  if (!res.ok) throw new ApiError("The hospital service had a problem. Please try again.", res.status);
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError("The hospital service sent an unreadable response.", res.status);
  }
}

function filterParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value.trim()) params.set(key, value.trim());
  }
  return params;
}

export function searchListed(query: string, filters: Filters, page: number, signal: AbortSignal) {
  const params = filterParams(filters);
  params.set("q", query);
  params.set("page", String(page));
  params.set("page_size", String(PAGE_SIZE));
  return getJson<ApiPage>(`${DIRECTORY}?${params}`, signal);
}

export function searchNearby(place: Place, radiusKm: number, filters: Filters, page: number, signal: AbortSignal) {
  const params = filterParams(filters);
  params.set("latitude", String(place.lat));
  params.set("longitude", String(place.lng));
  params.set("radius", String(radiusKm));
  params.set("page", String(page));
  params.set("page_size", String(PAGE_SIZE));
  return getJson<ApiPage>(`${DIRECTORY}nearby/?${params}`, signal);
}

export async function fetchSuggestions(q: string, signal: AbortSignal): Promise<Suggestion[]> {
  const data = await getJson<{ suggestions: Suggestion[] }>(`${DIRECTORY}suggest/?${new URLSearchParams({ q })}`, signal);
  return data.suggestions;
}

export function fetchFilterOptions(signal: AbortSignal) {
  return getJson<FilterOptions>(`${DIRECTORY}filters/`, signal);
}

/** Resolves a place text to a map centre through our own /api/geocode route. Null when not found. */
export async function geocode(query: string, signal: AbortSignal): Promise<Place | null> {
  let res: Response;
  try {
    res = await fetch(`/api/geocode?${new URLSearchParams({ q: query })}`, { signal });
  } catch (err) {
    if (signal.aborted) throw err;
    return null;
  }
  if (!res.ok) return null;
  const data = (await res.json()) as Partial<Place>;
  return typeof data.lat === "number" && typeof data.lng === "number"
    ? { lat: data.lat, lng: data.lng, name: data.name ?? query }
    : null;
}
