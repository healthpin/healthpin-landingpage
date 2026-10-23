"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { directionsUrl, formatDistance, hasCoordinates } from "@/lib/hospitals/format";
import type { Hospital, Place } from "@/lib/hospitals/types";

const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const INDIA_CENTER: L.LatLngTuple = [22.5, 79];

type Props = {
  hospitals: Hospital[];
  center?: Place | null;
  selectedId: number | null;
  /** Changes whenever the selected hospital should be (re)focused on the map. */
  focusNonce: number;
  onSelect: (id: number) => void;
};

function pinIcon(selected: boolean, approximate: boolean) {
  return L.divIcon({
    className: "hp-marker",
    html: `<span class="hp-pin${selected ? " is-selected" : ""}${approximate ? " is-approx" : ""}"><span></span></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  });
}

function line(parent: HTMLElement, tag: string, text: string, className: string) {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

function link(parent: HTMLElement, label: string, href: string, external = false) {
  const a = document.createElement("a");
  a.textContent = label;
  a.href = href;
  if (external) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  parent.appendChild(a);
}

/** Popup content is built with DOM APIs so directory text can never inject markup. */
function popupContent(h: Hospital): HTMLElement {
  const root = document.createElement("div");
  root.className = "hp-popup";
  line(root, "strong", h.hospital_name, "hp-popup-title");
  if (h.hospital_category) line(root, "span", h.hospital_category, "hp-popup-meta");
  if (h.distance_km != null) line(root, "span", `${formatDistance(h.distance_km)} from search centre`, "hp-popup-meta");
  if (h.address) line(root, "p", h.address, "hp-popup-text");
  if (h.approximate) line(root, "p", "Approximate location: the directory lists several hospitals at this exact point.", "hp-popup-note");
  const actions = document.createElement("div");
  actions.className = "hp-popup-actions";
  const phone = h.phones[0];
  if (phone) link(actions, `Call ${phone.label}`, phone.href);
  const emergency = h.emergency[0];
  if (emergency) link(actions, `Emergency ${emergency.label}`, emergency.href);
  link(actions, "Get directions", directionsUrl(h), true);
  if (h.websiteUrl) link(actions, "Website", h.websiteUrl, true);
  root.appendChild(actions);
  return root;
}

export default function HospitalMap({ hospitals, center, selectedId, focusNonce, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const centerLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(new Map<number, { marker: L.Marker; hospital: Hospital }>());
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  useEffect(() => {
    onSelectRef.current = onSelect;
    selectedRef.current = selectedId;
  });

  // Create the map once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = L.map(container, { zoomControl: false, scrollWheelZoom: false, worldCopyJump: true }).setView(INDIA_CENTER, 5);
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "topright", zoomInTitle: "Zoom in", zoomOutTitle: "Zoom out" }).addTo(map);
    L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    centerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Wheel zoom only after the map is clicked, so scrolling the page doesn't get trapped.
    map.on("focus", () => map.scrollWheelZoom.enable());
    map.on("blur", () => map.scrollWheelZoom.disable());

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    const markers = markersRef.current;
    return () => {
      observer.disconnect();
      map.remove();
      markers.clear();
      mapRef.current = null;
    };
  }, []);

  // Markers + bounds follow the displayed hospitals.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    const centerLayer = centerLayerRef.current;
    if (!map || !layer || !centerLayer) return;
    layer.clearLayers();
    centerLayer.clearLayers();
    markersRef.current.clear();

    const points: L.LatLngTuple[] = [];
    for (const h of hospitals) {
      if (!hasCoordinates(h)) continue;
      const marker = L.marker([h.latitude, h.longitude], {
        icon: pinIcon(h.id === selectedRef.current, h.approximate),
        title: h.hospital_name,
        keyboard: true,
        riseOnHover: true,
      });
      marker.bindPopup(() => popupContent(h), { maxWidth: 280, minWidth: 200, autoPanPadding: [24, 24] });
      marker.on("click", () => onSelectRef.current(h.id));
      marker.addTo(layer);
      markersRef.current.set(h.id, { marker, hospital: h });
      points.push([h.latitude, h.longitude]);
    }
    if (center) {
      L.circleMarker([center.lat, center.lng], { radius: 7, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1, interactive: false }).addTo(centerLayer);
      points.push([center.lat, center.lng]);
    }
    if (points.length) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15, animate: false });
    }
  }, [hospitals, center]);

  // Highlight the selected marker.
  useEffect(() => {
    for (const [id, { marker, hospital }] of markersRef.current) {
      marker.setIcon(pinIcon(id === selectedId, hospital.approximate));
      marker.setZIndexOffset(id === selectedId ? 1000 : 0);
    }
  }, [selectedId, hospitals]);

  // Pan to + open the selected marker when asked.
  useEffect(() => {
    const map = mapRef.current;
    const entry = selectedRef.current != null ? markersRef.current.get(selectedRef.current) : undefined;
    if (!map || !entry || focusNonce === 0) return;
    const { marker } = entry;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 });
    marker.openPopup();
  }, [focusNonce]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Map of hospitals"
      tabIndex={0}
      className="hp-map size-full min-h-[320px] bg-mint"
    />
  );
}
