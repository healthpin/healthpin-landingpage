"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Hash, Loader2, MapPin, Search, X } from "lucide-react";
import { fetchSuggestions, isConfigured } from "@/lib/hospitals/api";
import { resultsHref } from "@/lib/hospitals/slug";
import type { Suggestion } from "@/lib/hospitals/types";

const icons = { district: MapPin, area: MapPin, place: MapPin, pincode: Hash, hospital: Building2 } as const;
const typeLabels = { district: "District", area: "Area", place: "Place", pincode: "Pincode", hospital: "Hospital" } as const;

/** Submitting opens the results route (/hospitals/<slug>?q=<text>). `initialValue` pre-fills it on that page. */
export function SearchBar({ className = "", initialValue = "" }: { className?: string; initialValue?: string }) {
  const router = useRouter();
  const [busy, startNavigation] = useTransition();
  const query = initialValue;
  // null = untouched: show the submitted query (e.g. a shared /?q=Kochi link).
  const [draft, setValue] = useState<string | null>(null);
  const value = draft ?? query ?? "";
  const [suggestions, setSuggestions] = useState<{ q: string; items: Suggestion[] }>({ q: "", items: [] });
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [fetching, setFetching] = useState(false);
  const [touched, setTouched] = useState(false);
  const cache = useRef(new Map<string, Suggestion[]>());
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const listId = `${id}-list`;

  const term = value.replace(/\s+/g, " ").trim();
  const canSuggest = isConfigured && term.length >= 2;

  // Debounced, abortable autocomplete: a slower older response can never replace a newer one.
  useEffect(() => {
    if (!canSuggest) return;
    const cached = cache.current.get(term.toLowerCase());
    if (cached) {
      setSuggestions({ q: term, items: cached });
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setFetching(true);
      fetchSuggestions(term, ctrl.signal)
        .then((items) => {
          cache.current.set(term.toLowerCase(), items);
          setSuggestions({ q: term, items });
          setFetching(false);
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setFetching(false); // Typing still works without suggestions.
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
      setFetching(false);
    };
  }, [term, canSuggest]);

  const items = canSuggest && suggestions.q === term ? suggestions.items : [];
  const expanded = open && items.length > 0;

  function submit(text: string) {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length < 2) {
      setTouched(true);
      inputRef.current?.focus();
      return;
    }
    setTouched(false);
    setOpen(false);
    setHighlight(-1);
    startNavigation(() => router.push(resultsHref(clean)));
  }

  function choose(s: Suggestion) {
    setValue(s.label);
    submit(s.query);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % items.length);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h <= 0 ? items.length - 1 : h - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    } else if (e.key === "Enter" && expanded && highlight >= 0) {
      e.preventDefault();
      choose(items[highlight]);
    }
  }

  const invalid = touched && term.length < 2;

  return (
    <form
      role="search"
      aria-label="Search hospitals"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
      className={className}
    >
      <label htmlFor={`${id}-input`} className="sr-only">
        Search hospitals by city, area or pincode
      </label>
      <div className="relative">
        <div className="flex flex-col gap-2 rounded-3xl border border-line bg-white p-2 shadow-[0_18px_40px_-24px_rgba(111,10,51,.45)] transition-shadow focus-within:border-brand focus-within:shadow-[0_18px_40px_-20px_rgba(111,10,51,.55)] sm:flex-row sm:items-center sm:rounded-full">
          <div className="relative flex min-w-0 flex-1 items-center">
            <MapPin aria-hidden className="pointer-events-none absolute left-4 size-5 text-brand" />
            <input
              ref={inputRef}
              id={`${id}-input`}
              type="text"
              role="combobox"
              aria-expanded={expanded}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={expanded && highlight >= 0 ? `${id}-opt-${highlight}` : undefined}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-error` : undefined}
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="search"
              maxLength={100}
              placeholder="Search hospitals by city, area or pincode..."
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setOpen(true);
                setHighlight(-1);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              onKeyDown={onKeyDown}
              className="h-12 w-full min-w-0 rounded-full bg-transparent pr-20 pl-12 text-base text-ink !outline-none placeholder:text-muted/80"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {fetching && <Loader2 aria-hidden className="size-4 animate-spin text-muted" />}
              {value && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setValue("");
                    setTouched(false);
                    setOpen(false);
                    inputRef.current?.focus();
                  }}
                  className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-mint hover:text-ink"
                >
                  <X aria-hidden className="size-4" />
                </button>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-brand-dark enabled:hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-80 sm:min-w-44"
          >
            {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Search aria-hidden className="size-4" />}
            {busy ? "Searching…" : "Find Hospitals"}
          </button>
        </div>

        {expanded && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Suggestions"
            className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded-2xl border border-line bg-white p-1.5 shadow-[0_24px_50px_-20px_rgba(42,22,32,.35)]"
          >
            {items.map((s, i) => {
              const Icon = icons[s.type];
              return (
                <li
                  key={`${s.type}-${s.label}-${s.detail}`}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={i === highlight}
                  // mousedown (not click) so it fires before the input's blur closes the list.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(s);
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === highlight ? "bg-mint" : ""}`}
                >
                  <Icon aria-hidden className="size-4 shrink-0 text-brand" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{s.label}</span>
                    {s.detail && <span className="block truncate text-xs text-muted">{s.detail}</span>}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold tracking-wide text-muted uppercase">{typeLabels[s.type]}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {invalid && (
        <p id={`${id}-error`} role="alert" className="mt-2 px-4 text-sm text-brand-dark">
          Enter at least 2 characters: a city, area or pincode.
        </p>
      )}
    </form>
  );
}
