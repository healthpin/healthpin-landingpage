"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiError,
  fetchFilterOptions,
  geocode,
  isConfigured,
  searchListed,
  searchNearby,
} from "@/lib/hospitals/api";
import { toHospitals } from "@/lib/hospitals/format";
import {
  EMPTY_FILTERS,
  type ApiHospital,
  type ApiPage,
  type FilterOptions,
  type Filters,
  type Hospital,
  type Place,
} from "@/lib/hospitals/types";

export type Mode = "nearby" | "listed";
export type View = "list" | "map";

/** Rows loaded for one request key. A result for any other key is stale. */
type Loaded = { key: string; rows: ApiHospital[]; total: number; page: number; error: string | null };
const NONE: Loaded = { key: "", rows: [], total: 0, page: 0, error: null };

export type ModeResults = {
  hospitals: Hospital[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
};

type HospitalSearch = {
  /** The place text this results page is for. */
  query: string;
  retry: () => void;
  /** Search centre from the geocoder: undefined while resolving, null if it couldn't be found. */
  place: Place | null | undefined;
  mode: Mode;
  setMode: (mode: Mode) => void;
  /** True until we know which mode to open with (geocoding + first nearby request). */
  resolving: boolean;
  nearby: ModeResults;
  listed: ModeResults;
  active: ModeResults;
  radius: number;
  setRadius: (km: number) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  filterOptions: FilterOptions | null;
  loadMore: () => void;
  selectedId: number | null;
  focusNonce: number;
  /** Highlight a hospital (and pan the map to it when `pan`). */
  select: (id: number | null, pan?: boolean) => void;
  view: View;
  setView: (view: View) => void;
};

const Context = createContext<HospitalSearch | null>(null);

export function useHospitalSearch() {
  const value = useContext(Context);
  if (!value) throw new Error("useHospitalSearch must be used inside <HospitalSearchProvider>");
  return value;
}

const errorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : "Something went wrong while loading hospitals.";

/** One provider per results URL: render it with `key={query}` so a new search starts clean. */
export function HospitalSearchProvider({ query, children }: { query: string; children: React.ReactNode }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [radius, setRadius] = useState(25);
  const [userMode, setUserMode] = useState<Mode | null>(null);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [placeResult, setPlaceResult] = useState<{ query: string; place: Place | null } | null>(null);
  const [listedData, setListedData] = useState<Loaded>(NONE);
  const [nearbyData, setNearbyData] = useState<Loaded>(NONE);
  const [loadingMore, setLoadingMore] = useState<Mode | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const filterKey = JSON.stringify(filters);
  const place = placeResult?.query === query ? placeResult.place : undefined;

  const listedKey = `${retryCount}|${query}|${filterKey}`;
  const nearbyKey = place ? `${retryCount}|${place.lat},${place.lng}|${radius}|${filterKey}` : "";

  // Latest keys, so a "load more" response that arrives after a newer request is dropped.
  const current = useRef({ listedKey, nearbyKey });
  useEffect(() => {
    current.current = { listedKey, nearbyKey };
  });

  // Filter dropdown options come from the directory itself; load them once.
  const wantsOptions = isConfigured && filterOptions === null;
  useEffect(() => {
    if (!wantsOptions) return;
    const ctrl = new AbortController();
    fetchFilterOptions(ctrl.signal)
      .then(setFilterOptions)
      .catch(() => undefined); // Filters just stay hidden.
    return () => ctrl.abort();
  }, [wantsOptions]);

  // 1. Resolve the place text to a search centre.
  useEffect(() => {
    const ctrl = new AbortController();
    geocode(query, ctrl.signal)
      .then((p) => setPlaceResult({ query, place: p }))
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [query, retryCount]);

  // 2. Hospitals listed under the place text.
  useEffect(() => {
    const ctrl = new AbortController();
    searchListed(query, filters, 1, ctrl.signal)
      .then((p) => setListedData({ key: listedKey, rows: p.results, total: p.count, page: p.page, error: null }))
      .catch((err) => {
        if (!ctrl.signal.aborted) setListedData({ ...NONE, key: listedKey, error: errorMessage(err) });
      });
    return () => ctrl.abort();
    // `filters` is represented by `filterKey` inside `listedKey`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listedKey]);

  // 3. Hospitals within a radius of the search centre, nearest first.
  useEffect(() => {
    if (!nearbyKey || !place) return;
    const ctrl = new AbortController();
    searchNearby(place, radius, filters, 1, ctrl.signal)
      .then((p) => setNearbyData({ key: nearbyKey, rows: p.results, total: p.count, page: p.page, error: null }))
      .catch((err) => {
        if (!ctrl.signal.aborted) setNearbyData({ ...NONE, key: nearbyKey, error: errorMessage(err) });
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearbyKey]);

  const loadMoreRef = useRef<AbortController | null>(null);
  const loadMore = useCallback(
    (mode: Mode) => {
      const data = mode === "nearby" ? nearbyData : listedData;
      const key = mode === "nearby" ? nearbyKey : listedKey;
      if (data.key !== key || loadingMore) return;
      loadMoreRef.current?.abort();
      const ctrl = new AbortController();
      loadMoreRef.current = ctrl;
      setLoadingMore(mode);
      const request: Promise<ApiPage> =
        mode === "nearby" && place
          ? searchNearby(place, radius, filters, data.page + 1, ctrl.signal)
          : searchListed(query, filters, data.page + 1, ctrl.signal);
      const apply = (next: (prev: Loaded) => Loaded) => (mode === "nearby" ? setNearbyData(next) : setListedData(next));
      request
        .then((p) => {
          if (current.current[mode === "nearby" ? "nearbyKey" : "listedKey"] !== key) return;
          apply((prev) => {
            if (prev.key !== key) return prev;
            const known = new Set(prev.rows.map((r) => r.id));
            return { ...prev, rows: [...prev.rows, ...p.results.filter((r) => !known.has(r.id))], total: p.count, page: p.page, error: null };
          });
        })
        .catch((err) => {
          if (!ctrl.signal.aborted) apply((prev) => (prev.key === key ? { ...prev, error: errorMessage(err) } : prev));
        })
        .finally(() => {
          if (loadMoreRef.current === ctrl) setLoadingMore(null);
        });
    },
    [query, nearbyData, listedData, nearbyKey, listedKey, loadingMore, place, radius, filters],
  );

  const retry = useCallback(() => setRetryCount((n) => n + 1), []);

  const build = useCallback((data: Loaded, key: string): ModeResults => {
    const loading = key === "" || data.key !== key;
    const rows = loading ? [] : data.rows;
    return {
      hospitals: toHospitals(rows),
      total: loading ? 0 : data.total,
      loading,
      loadingMore: false,
      error: loading ? null : data.error,
      hasMore: !loading && data.rows.length < data.total,
    };
  }, []);
  const listed = useMemo(
    () => ({ ...build(listedData, listedKey), loadingMore: loadingMore === "listed" }),
    [build, listedData, listedKey, loadingMore],
  );
  const nearby = useMemo(() => {
    // No centre (geocoding failed): there is nothing to load.
    const base = build(nearbyData, nearbyKey);
    return { ...base, loading: place === null ? false : base.loading, loadingMore: loadingMore === "nearby" };
  }, [build, nearbyData, nearbyKey, place, loadingMore]);

  const nearbyUsable = place != null && nearby.error === null && nearby.total > 0;
  const resolving = userMode === null && (place === undefined || (place !== null && nearby.loading));
  const mode: Mode = userMode ?? (nearbyUsable ? "nearby" : "listed");
  const active = mode === "nearby" ? nearby : listed;

  const select = useCallback((id: number | null, pan = false) => {
    setSelectedId(id);
    if (id !== null && pan) setFocusNonce((n) => n + 1);
  }, []);

  const value: HospitalSearch = {
    query,
    retry,
    place,
    mode,
    setMode: setUserMode,
    resolving,
    nearby,
    listed,
    active,
    radius,
    setRadius,
    filters,
    setFilters,
    filterOptions,
    loadMore: () => loadMore(mode),
    selectedId,
    focusNonce,
    select,
    view,
    setView,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
