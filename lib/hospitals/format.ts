import type { ApiHospital, Hospital, PhoneNumber } from "./types";

/** "0484 2345678, 98470 12345 / 0484 111" -> separate, dialable numbers. */
export function parsePhones(...fields: string[]): PhoneNumber[] {
  const seen = new Set<string>();
  const out: PhoneNumber[] = [];
  for (const field of fields) {
    for (const chunk of field.split(/[,;/\n]|\bor\b/i)) {
      const label = chunk.trim();
      const digits = label.replace(/\D/g, "");
      // Landlines with STD code are 8-11 digits; mobiles 10; allow +91 prefixes.
      if (!/^[+()\d\s.-]+$/.test(label) || digits.length < 7 || digits.length > 13 || seen.has(digits)) continue;
      seen.add(digits);
      out.push({ label, href: `tel:${label.startsWith("+") ? "+" : ""}${digits}` });
    }
  }
  return out;
}

/** Only http(s) URLs that look like real hosts; bare domains get https://. */
export function parseWebsite(raw: string): { url: string; label: string } | null {
  const value = raw.trim();
  if (!value || /\s/.test(value)) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname.includes(".")) return null;
    return { url: url.href, label: url.hostname.replace(/^www\./, "") };
  } catch {
    return null;
  }
}

export function formatAddress(h: ApiHospital): string {
  const street = h.address_original_first_line || h.location;
  const parts = [street, h.subdistrict, h.district, h.state].filter(Boolean);
  const unique = parts.filter((p, i) => parts.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i);
  const text = unique.join(", ");
  return h.pincode ? `${text} - ${h.pincode}` : text;
}

export function directionsUrl(h: Hospital): string {
  const destination =
    h.latitude != null && h.longitude != null
      ? `${h.latitude},${h.longitude}`
      : [h.hospital_name, h.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/**
 * Directory rows without exact coordinates share a placeholder point (e.g. a
 * city centre). Three or more hospitals on the identical point can't all be
 * at it, so such markers are flagged as approximate.
 */
export function toHospitals(rows: ApiHospital[], pool: ApiHospital[] = rows): Hospital[] {
  const counts = new Map<string, number>();
  for (const r of pool) {
    if (r.latitude != null) counts.set(`${r.latitude},${r.longitude}`, (counts.get(`${r.latitude},${r.longitude}`) ?? 0) + 1);
  }
  return rows.map((r) => {
    const site = parseWebsite(r.website);
    return {
      ...r,
      address: formatAddress(r),
      phones: parsePhones(r.telephone, r.mobile_number),
      emergency: parsePhones(r.emergency_num),
      websiteUrl: site?.url ?? null,
      websiteLabel: site?.label ?? null,
      approximate: r.latitude != null && (counts.get(`${r.latitude},${r.longitude}`) ?? 0) >= 3,
    };
  });
}

export function hasCoordinates(h: Hospital): h is Hospital & { latitude: number; longitude: number } {
  return h.latitude != null && h.longitude != null;
}
