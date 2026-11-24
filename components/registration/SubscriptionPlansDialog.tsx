"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Gift, Loader2, X } from "lucide-react";
import { apiUrl } from "@/lib/api/baseUrl";

/** Mirrors GET /api/v1/subscription-plans/ (public; active plans only). */
type Plan = {
  id: number;
  name: string;
  duration_months: number;
  trial_months: number;
  original_price: string;
  offer_price: string;
  discount_percent: number;
  description: string;
};

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; plans: Plan[] };

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: 0 });
const months = (count: number) => `${count} Month${count === 1 ? "" : "s"}`;

async function fetchPlans(): Promise<Plan[]> {
  const response = await fetch(apiUrl("/api/v1/subscription-plans/"), { headers: { Accept: "application/json" }, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(data.plans)) throw new Error(data.message ?? "Plans could not be loaded.");
  return data.plans;
}

/**
 * Plans and prices from the backend, never hard-coded. A newly registered
 * hospital's first activation includes the plan's free trial; the trial is
 * once per hospital, and hospitals that already used it pay the offer price
 * (their own eligibility is shown after login on the Subscription page).
 */
export function SubscriptionPlansDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [attempt, setAttempt] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchPlans()
      .then((plans) => !cancelled && setLoad({ state: "ready", plans }))
      .catch((error: unknown) => !cancelled && setLoad({ state: "error", message: error instanceof Error ? error.message : "Plans could not be loaded." }));
    return () => {
      cancelled = true;
    };
  }, [open, attempt]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-ink/60 sm:items-center sm:p-5" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plans-title"
        onClick={(event) => event.stopPropagation()}
        className="hp-modal-in flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:rounded-[1.75rem]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Health Pin for hospitals</p>
            <h2 id="plans-title" className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink">Subscription plans</h2>
            <p className="mt-1 text-sm text-muted">Choose a plan after your registration is approved and you log in.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close plans" className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink">
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          {load.state === "loading" && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted" role="status">
              <Loader2 aria-hidden className="size-5 animate-spin" /> Loading plans…
            </div>
          )}
          {load.state === "error" && (
            <div role="alert" className="mx-auto max-w-md py-12 text-center">
              <p className="text-sm font-medium text-red-800">{load.message}</p>
              <button type="button" onClick={() => { setLoad({ state: "loading" }); setAttempt((n) => n + 1); }} className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                Try again
              </button>
            </div>
          )}
          {load.state === "ready" && load.plans.length === 0 && (
            <p className="py-12 text-center text-sm text-muted">No plans are available right now. Please check back soon.</p>
          )}
          {load.state === "ready" && load.plans.length > 0 && (
            <>
              <ul className="grid gap-4 md:grid-cols-3">
                {load.plans.map((plan) => (
                  <li key={plan.id} className="flex flex-col rounded-2xl border border-line bg-canvas/60 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-ink">{plan.name} Plan</h3>
                      {plan.discount_percent > 0 && (
                        <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">{plan.discount_percent}% off</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted">{months(plan.duration_months)} subscription</p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold tracking-[-0.02em] text-brand">{money.format(Number(plan.offer_price))}</span>
                      {Number(plan.original_price) > Number(plan.offer_price) && (
                        <span className="text-sm text-muted line-through" aria-label={`Original price ${money.format(Number(plan.original_price))}`}>
                          {money.format(Number(plan.original_price))}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">for {months(plan.duration_months).toLowerCase()}</p>
                    <ul className="mt-4 space-y-2 text-sm text-ink">
                      <li className="flex gap-2"><Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />{months(plan.duration_months)} of full dashboard access</li>
                      {plan.trial_months > 0 ? (
                        <li className="flex gap-2"><Gift aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" /><span><strong>{months(plan.trial_months)} free trial</strong> for a new hospital&apos;s first activation</span></li>
                      ) : (
                        <li className="flex gap-2 text-muted"><X aria-hidden className="mt-0.5 size-4 shrink-0" />No free trial on this plan</li>
                      )}
                    </ul>
                    {plan.description && <p className="mt-3 text-xs leading-5 text-muted">{plan.description}</p>}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl bg-mint p-4 text-sm leading-6 text-brand-dark">
                <strong>About the free trial:</strong> each hospital gets one free trial, only on its first activation. Hospitals that have
                already used it, or that switch plans later, pay the offer price with no additional trial. Nothing is charged
                automatically: every payment is made by you through Razorpay.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
