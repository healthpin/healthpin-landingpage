"use client";

import { useState } from "react";
import { Ambulance, Globe, MapPin, MapPinOff, Navigation, Phone } from "lucide-react";
import { directionsUrl, formatDistance, hasCoordinates } from "@/lib/hospitals/format";
import type { Hospital } from "@/lib/hospitals/types";

type Props = {
  hospital: Hospital;
  selected: boolean;
  onSelect: (id: number) => void;
  onViewOnMap: (id: number) => void;
};

const actionBase =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors";

function ExpandableText({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 140;
  return (
    <div className="text-sm leading-relaxed">
      <span className="font-semibold text-ink">{label}: </span>
      <span className={`text-muted ${open || !long ? "" : "line-clamp-2"}`}>{text}</span>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="mt-0.5 block text-xs font-semibold text-brand hover:underline"
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export function HospitalCard({ hospital: h, selected, onSelect, onViewOnMap }: Props) {
  const mappable = hasCoordinates(h);
  const phone = h.phones[0];
  const emergency = h.emergency[0];
  const regionLine = [h.district, h.state].filter(Boolean).join(", ");

  return (
    <article
      data-hospital-id={h.id}
      aria-label={h.hospital_name}
      data-selected={selected}
      onClick={() => onSelect(h.id)}
      className={`scroll-mt-4 rounded-2xl border bg-white p-4 transition-all duration-200 sm:p-5 ${
        selected ? "border-brand shadow-[0_0_0_3px_rgba(154,22,70,.12)]" : "border-line hover:border-brand/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg leading-snug font-bold text-ink">{h.hospital_name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {h.hospital_category && (
              <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-semibold text-brand-dark">{h.hospital_category}</span>
            )}
            {h.discipline_systems_of_medicine && (
              <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted">
                {h.discipline_systems_of_medicine}
              </span>
            )}
            {!mappable && (
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted">
                <MapPinOff aria-hidden className="size-3" /> Not on map
              </span>
            )}
            {mappable && h.approximate && (
              <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted" title="Several directory hospitals share this exact point">
                Approximate location
              </span>
            )}
          </div>
        </div>
        {h.distance_km != null && (
          <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-sm font-bold text-white" title="Straight-line distance from the search centre">
            {formatDistance(h.distance_km)}
          </span>
        )}
      </div>

      <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-ink/80">
        <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>{h.address || "Address not available"}</span>
      </p>
      {regionLine && !h.address.includes(h.district) && <p className="mt-1 pl-6 text-xs text-muted">{regionLine}</p>}

      <div className="mt-3 space-y-2">
        {h.specialties && <ExpandableText label="Specialties" text={h.specialties} />}
        {h.facilities && <ExpandableText label="Facilities" text={h.facilities} />}
      </div>

      {(phone || emergency || h.websiteUrl) && (
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {h.phones.length > 0 && (
            <div className="flex gap-1.5">
              <dt className="text-muted">Phone</dt>
              <dd className="font-medium text-ink">{h.phones.map((p) => p.label).slice(0, 2).join(" · ")}</dd>
            </div>
          )}
          {emergency && (
            <div className="flex gap-1.5">
              <dt className="text-muted">Emergency</dt>
              <dd className="font-medium text-brand-dark">{emergency.label}</dd>
            </div>
          )}
          {h.websiteUrl && (
            <div className="flex min-w-0 gap-1.5">
              <dt className="text-muted">Website</dt>
              <dd className="truncate font-medium text-ink">{h.websiteLabel}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          disabled={!mappable}
          onClick={() => onViewOnMap(h.id)}
          className={`${actionBase} bg-brand text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted`}
        >
          <MapPin aria-hidden className="size-4" />
          {mappable ? "View on Map" : "No map location"}
        </button>
        <a
          href={directionsUrl(h)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${actionBase} border border-ink/15 text-ink hover:border-brand hover:text-brand`}
        >
          <Navigation aria-hidden className="size-4" />
          Get Directions<span className="sr-only"> to {h.hospital_name} (opens in a new tab)</span>
        </a>
        {phone && (
          <a href={phone.href} className={`${actionBase} border border-ink/15 text-ink hover:border-brand hover:text-brand`}>
            <Phone aria-hidden className="size-4" />
            Call Hospital<span className="sr-only"> {h.hospital_name} on {phone.label}</span>
          </a>
        )}
        {emergency && (
          <a href={emergency.href} className={`${actionBase} border border-brand/30 text-brand-dark hover:bg-mint`}>
            <Ambulance aria-hidden className="size-4" />
            Emergency<span className="sr-only"> call {h.hospital_name} on {emergency.label}</span>
          </a>
        )}
        {h.websiteUrl && (
          <a
            href={h.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${actionBase} border border-ink/15 text-ink hover:border-brand hover:text-brand`}
          >
            <Globe aria-hidden className="size-4" />
            Visit Website<span className="sr-only"> of {h.hospital_name} (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}
