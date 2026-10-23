"use client";

import { useEffect, useState } from "react";
import { RADII_KM } from "@/lib/hospitals/api";
import { EMPTY_FILTERS, type Filters as FilterValues } from "@/lib/hospitals/types";
import { useHospitalSearch } from "./HospitalSearchProvider";

const field =
  "h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-brand";

/** Text filter that waits for a pause in typing before querying. */
function DebouncedInput({ label, value, onCommit, placeholder }: { label: string; value: string; onCommit: (v: string) => void; placeholder: string }) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    // The filter changed from outside (e.g. "Clear filters").
    setSynced(value);
    setDraft(value);
  }
  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onCommit(draft), 400);
    return () => clearTimeout(timer);
  }, [draft, value, onCommit]);
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      <input type="search" value={draft} maxLength={60} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} className={field} />
    </label>
  );
}

export function Filters() {
  const { filters, setFilters, filterOptions, mode, radius, setRadius } = useHospitalSearch();
  const active = Object.values(filters).filter(Boolean).length;
  const set = (patch: Partial<FilterValues>) => setFilters({ ...filters, ...patch });

  return (
    <fieldset className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <legend className="sr-only">Filter hospitals</legend>
      {filterOptions && filterOptions.categories.length > 0 && (
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Hospital category</span>
          <select value={filters.category} onChange={(e) => set({ category: e.target.value })} className={field}>
            <option value="">All categories</option>
            {filterOptions.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}
      {filterOptions && filterOptions.disciplines.length > 0 && (
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Medical discipline</span>
          <select value={filters.discipline} onChange={(e) => set({ discipline: e.target.value })} className={field}>
            <option value="">All disciplines</option>
            {filterOptions.disciplines.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      )}
      <DebouncedInput label="Specialty" value={filters.specialty} placeholder="e.g. Cardiology" onCommit={(v) => set({ specialty: v })} />
      <DebouncedInput label="Facility" value={filters.facility} placeholder="e.g. ICU" onCommit={(v) => set({ facility: v })} />
      {mode === "nearby" && (
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Distance</span>
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className={field}>
            {RADII_KM.map((km) => (
              <option key={km} value={km}>
                Within {km} km
              </option>
            ))}
          </select>
        </label>
      )}
      {active > 0 && (
        <div className="flex items-end">
          <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="h-10 rounded-xl px-3 text-sm font-semibold text-brand hover:bg-mint">
            Clear filters ({active})
          </button>
        </div>
      )}
    </fieldset>
  );
}
