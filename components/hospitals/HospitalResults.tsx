"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { AlertTriangle, List, Loader2, Map as MapIcon, SearchX, SlidersHorizontal } from "lucide-react";
import { isConfigured } from "@/lib/hospitals/api";
import type { Hospital } from "@/lib/hospitals/types";
import { Filters } from "./Filters";
import { HospitalCard } from "./HospitalCard";
import { useHospitalSearch, type Mode } from "./HospitalSearchProvider";
import { MapPanel } from "./MapPanel";

const NO_HOSPITALS: Hospital[] = [];

function useIsDesktop() {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );
}

function Skeletons() {
  return (
    <ul aria-hidden className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="animate-pulse rounded-2xl border border-line bg-white p-5">
          <div className="h-5 w-3/5 rounded bg-line" />
          <div className="mt-3 flex gap-2">
            <div className="h-5 w-16 rounded-full bg-line" />
            <div className="h-5 w-20 rounded-full bg-line" />
          </div>
          <div className="mt-4 h-4 w-full rounded bg-line" />
          <div className="mt-2 h-4 w-4/5 rounded bg-line" />
          <div className="mt-5 flex gap-2">
            <div className="h-10 w-28 rounded-full bg-line" />
            <div className="h-10 w-32 rounded-full bg-line" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StateCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div role="status" className="rounded-2xl border border-line bg-white p-8 text-center">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-mint text-brand">{icon}</div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <div className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export function HospitalResults() {
  const s = useHospitalSearch();
  const { query, place, mode, active, nearby, listed, resolving, selectedId, focusNonce } = s;
  const isDesktop = useIsDesktop();
  const uid = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterCount = Object.values(s.filters).filter(Boolean).length;

  // A marker click highlights its card: bring it into view inside the list.
  useEffect(() => {
    if (selectedId == null) return;
    // Scoped to this section: earlier searches stay mounted (hidden) with the same hospital ids.
    sectionRef.current?.querySelector(`[data-hospital-id="${selectedId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  const showMap = isDesktop || s.view === "map";
  const showList = isDesktop || s.view === "list";
  const loading = resolving || active.loading;
  const tabs: { mode: Mode; label: string; count: number | null }[] = [
    ...(place ? [{ mode: "nearby" as const, label: "Nearest first", count: nearby.loading ? null : nearby.total }] : []),
    { mode: "listed", label: `Listed in “${query}”`, count: listed.loading ? null : listed.total },
  ];

  let heading = `Hospitals near ${query}`;
  let note = `Sorted by straight-line distance from the centre of the searched place, within ${s.radius} km. Only hospitals with a valid map location can be placed.`;
  if (mode === "listed") {
    heading = `Hospitals listed in ${query}`;
    note = place === null
      ? `We couldn't find “${query}” on the map, so these are text matches (name, district, area or pincode), not sorted by distance.`
      : "Text matches on name, district, area or pincode, best match first. They are not sorted by distance, so they aren't necessarily the nearest.";
  }

  function viewOnMap(id: number) {
    s.select(id, true);
    s.setView("map");
  }

  return (
    <section ref={sectionRef} aria-labelledby={`${uid}-title`} className="pb-12 lg:pb-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 id={`${uid}-title`} className="mt-1 text-3xl leading-tight font-extrabold text-ink break-words sm:text-4xl">
              {heading}
            </h1>
            <p aria-live="polite" className="mt-2 text-sm font-medium text-ink/80">
              {loading ? "Searching…" : active.error ? "" : `${active.total} ${active.total === 1 ? "hospital" : "hospitals"} found${active.hospitals.length < active.total ? ` · showing ${active.hospitals.length}` : ""}`}
            </p>
          </div>
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls={`${uid}-filters`}
            onClick={() => setFiltersOpen((o) => !o)}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand lg:self-auto"
          >
            <SlidersHorizontal aria-hidden className="size-4" />
            Filters{filterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand text-xs text-white">{filterCount}</span>}
            {mode === "nearby" && <span className="text-muted">· {s.radius} km</span>}
          </button>
        </div>

        {tabs.length > 1 && (
          <div role="group" aria-label="Result type" className="mt-5 inline-flex max-w-full flex-wrap gap-1 rounded-3xl border border-line bg-white p-1">
            {tabs.map((t) => (
              <button
                key={t.mode}
                type="button"
                aria-pressed={mode === t.mode}
                onClick={() => s.setMode(t.mode)}
                className={`inline-flex min-h-10 max-w-full items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  mode === t.mode ? "bg-brand text-white" : "text-ink hover:bg-mint"
                }`}
              >
                <span className="truncate">{t.label}</span>
                {t.count !== null && <span className={`text-xs ${mode === t.mode ? "text-white/80" : "text-muted"}`}>{t.count}</span>}
              </button>
            ))}
          </div>
        )}
        {!loading && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{note}</p>}

        {filtersOpen && (
          <div id={`${uid}-filters`} className="mt-4 rounded-2xl border border-line bg-white p-4">
            <Filters />
          </div>
        )}

        {/* Mobile: one panel at a time. */}
        <div role="group" aria-label="Show list or map" className="mt-5 grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1 lg:hidden">
          {([
            ["list", "List", List],
            ["map", "Map", MapIcon],
          ] as const).map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              aria-pressed={s.view === v}
              onClick={() => s.setView(v)}
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${s.view === v ? "bg-brand text-white" : "text-ink"}`}
            >
              <Icon aria-hidden className="size-4" /> {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:h-[780px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {showList && (
            <div className="min-w-0 lg:overflow-y-auto lg:pr-2" tabIndex={isDesktop ? 0 : undefined} aria-label={isDesktop ? "Hospital results" : undefined}>
              {!isConfigured ? (
                <StateCard icon={<AlertTriangle aria-hidden className="size-6" />} title="Hospital search isn't configured">
                  Set <code>NEXT_PUBLIC_API_BASE_URL</code> to the Health Pin backend and reload.
                </StateCard>
              ) : loading ? (
                <Skeletons />
              ) : active.error ? (
                <StateCard icon={<AlertTriangle aria-hidden className="size-6" />} title="We couldn't load hospitals">
                  <p>{active.error}</p>
                  <button type="button" onClick={s.retry} className="mt-4 inline-flex min-h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark">
                    Try again
                  </button>
                </StateCard>
              ) : active.hospitals.length === 0 ? (
                <StateCard icon={<SearchX aria-hidden className="size-6" />} title={`No hospitals found for “${query}”`}>
                  <p>
                    {filterCount > 0
                      ? "Nothing matches these filters. Try removing some."
                      : mode === "nearby"
                        ? `No hospitals with a map location within ${s.radius} km. Try a wider distance or the other result list.`
                        : "Try a nearby city, the district name, or a 6-digit pincode."}
                  </p>
                  {filterCount > 0 && (
                    <button type="button" onClick={() => s.setFilters({ category: "", discipline: "", specialty: "", facility: "" })} className="mt-4 inline-flex min-h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark">
                      Clear filters
                    </button>
                  )}
                </StateCard>
              ) : (
                <>
                  <ul className="space-y-3">
                    {active.hospitals.map((h) => (
                      <li key={h.id} className="hp-rise">
                        <HospitalCard hospital={h} selected={h.id === selectedId} onSelect={(id) => s.select(id, true)} onViewOnMap={viewOnMap} />
                      </li>
                    ))}
                  </ul>
                  {active.hasMore && (
                    <button
                      type="button"
                      disabled={active.loadingMore}
                      onClick={s.loadMore}
                      className="mx-auto mt-5 flex min-h-11 items-center gap-2 rounded-full border border-ink/15 bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand disabled:opacity-70"
                    >
                      {active.loadingMore && <Loader2 aria-hidden className="size-4 animate-spin" />}
                      {active.loadingMore ? "Loading…" : `Load more (${active.total - active.hospitals.length} left)`}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          {showMap && (
            <div className="h-[420px] min-w-0 sm:h-[520px] lg:h-full">
              <MapPanel
                hospitals={loading || active.error ? NO_HOSPITALS : active.hospitals}
                center={mode === "nearby" ? place : null}
                selectedId={selectedId}
                focusNonce={focusNonce}
                onSelect={(id) => s.select(id)}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
