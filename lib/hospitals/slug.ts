/** "Kochi" -> "kochi", "Ernakulam, Kerala" -> "ernakulam-kerala", "682001" -> "682001". */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "search";
}

/** Best-effort reading of a slug when no `?q=` text came with the URL. */
export function unslugify(slug: string): string {
  let text = slug;
  try {
    text = decodeURIComponent(slug);
  } catch {
    /* keep the raw slug */
  }
  return text.replace(/[-_+]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Place text shown/searched for a results URL: the original `?q=` text wins over the slug. */
export function queryFor(slug: string, q: string | string[] | undefined): string {
  const raw = (Array.isArray(q) ? q[0] : q) ?? "";
  const text = raw.replace(/\s+/g, " ").trim().slice(0, 100);
  return text.length >= 2 ? text : unslugify(slug).slice(0, 100);
}

/** Results page URL for a searched place; the original text travels in `?q=`. */
export function resultsHref(query: string): string {
  const clean = query.replace(/\s+/g, " ").trim();
  return `/hospitals/${slugify(clean)}?${new URLSearchParams({ q: clean })}`;
}
