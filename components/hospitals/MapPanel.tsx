"use client";

import dynamic from "next/dynamic";
import { Loader2, MapPinOff } from "lucide-react";
import { hasCoordinates } from "@/lib/hospitals/format";
import type { Hospital, Place } from "@/lib/hospitals/types";

// Leaflet touches `window`, so it only loads in the browser.
const HospitalMap = dynamic(() => import("./HospitalMap"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full min-h-[320px] place-items-center bg-mint text-sm text-muted">
      <span className="inline-flex items-center gap-2">
        <Loader2 aria-hidden className="size-4 animate-spin" /> Loading map…
      </span>
    </div>
  ),
});

type Props = {
  hospitals: Hospital[];
  center?: Place | null;
  selectedId: number | null;
  focusNonce: number;
  onSelect: (id: number) => void;
  loading: boolean;
};

export function MapPanel({ hospitals, center, selectedId, focusNonce, onSelect, loading }: Props) {
  const placed = hospitals.filter(hasCoordinates).length;
  const missing = hospitals.length - placed;
  return (
    <div className="relative size-full min-h-[320px] overflow-hidden rounded-3xl border border-line">
      <HospitalMap hospitals={hospitals} center={center} selectedId={selectedId} focusNonce={focusNonce} onSelect={onSelect} />
      {loading && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-[500] flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink shadow">
            <Loader2 aria-hidden className="size-3.5 animate-spin" /> Updating…
          </span>
        </div>
      )}
      {hospitals.length > 0 && (placed === 0 || missing > 0) && (
        <p
          role="status"
          className="absolute bottom-3 left-3 z-[500] flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-ink shadow sm:max-w-xs"
        >
          <MapPinOff aria-hidden className="size-4 shrink-0 text-brand" />
          {placed === 0
            ? "None of these hospitals have a map location in the directory. Use the address or directions on each card."
            : `${missing} of ${hospitals.length} shown hospitals have no map location and appear only in the list.`}
        </p>
      )}
    </div>
  );
}
