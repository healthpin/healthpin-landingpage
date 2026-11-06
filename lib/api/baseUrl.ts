/** Shared browser/server API URL builder. Keeps environment and path slashes normalized. */
export function apiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const normalizedPath = `/${path.replace(/^\/+/, "")}`;
  return `${base}${normalizedPath}`;
}

export function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
}
