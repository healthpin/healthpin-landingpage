"use client";

import { FormEvent, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Check, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { apiUrl } from "@/lib/api/baseUrl";
import { SubscriptionPlansDialog } from "./SubscriptionPlansDialog";

const HospitalLocationPicker = dynamic(() => import("./HospitalLocationPicker").then((module) => module.HospitalLocationPicker), {
  ssr: false,
  loading: () => <div className="h-[320px] animate-pulse rounded-2xl bg-mint sm:h-[380px]" aria-label="Loading map" />,
});

/** The hospital portal's login page (the existing Health Pin hospital login). */
const HOSPITAL_LOGIN_URL = (process.env.NEXT_PUBLIC_HOSPITAL_LOGIN_URL ?? "").trim();

const initial = {
  hospital_name: "",
  category: "HOSPITAL",
  email: "",
  password: "",
  confirm_password: "",
  contact_number: "+91 ",
  address: "",
  latitude: "",
  longitude: "",
};
type FormKey = keyof typeof initial;
type Errors = Partial<Record<FormKey, string>>;

const MIN_PASSWORD = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const inputClass =
  "h-12 w-full rounded-xl border bg-white px-4 text-[15px] font-normal text-ink outline-none transition-colors focus:border-brand focus:ring-4 focus:ring-brand/15";

/** Mirrors the backend's rules for quick feedback; Django validates again. */
function validate(form: typeof initial): Errors {
  const errors: Errors = {};
  if (form.hospital_name.trim().length < 2) errors.hospital_name = "Enter the hospital or clinic name.";
  if (!form.email.trim()) errors.email = "Enter the hospital's email address.";
  else if (!EMAIL.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!form.password) errors.password = "Create a password.";
  else if (form.password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  if (!form.confirm_password) errors.confirm_password = "Confirm the password.";
  else if (form.password !== form.confirm_password) errors.confirm_password = "Passwords do not match.";
  if (form.contact_number.replace(/\D/g, "").length < 8) errors.contact_number = "Enter a contact number with country code.";
  if (form.address.trim().length < 5) errors.address = "Enter the full hospital address.";
  return errors;
}

function Label({ htmlFor, children, required = true }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="inline-flex items-center gap-1 text-sm font-semibold leading-5 text-ink">
      {children}
      {required && <span aria-hidden className="text-red-700">*</span>}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="text-sm text-red-700">{message}</p> : null;
}

function TextField({ name, label, value, error, onChange, type = "text", autoComplete, hint }: {
  name: FormKey; label: string; value: string; error?: string; onChange: (value: string) => void; type?: string; autoComplete?: string; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name} name={name} type={type} value={value} required autoComplete={autoComplete}
        aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} ${error ? "border-red-600" : "border-line"}`}
      />
      {hint && !error && <p id={`${name}-hint`} className="text-xs text-muted">{hint}</p>}
      <FieldError id={`${name}-error`} message={error} />
    </div>
  );
}

function PasswordField({ name, label, value, error, onChange, hint }: {
  name: "password" | "confirm_password"; label: string; value: string; error?: string; onChange: (value: string) => void; hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <input
          id={name} name={name} type={visible ? "text" : "password"} value={value} required autoComplete="new-password"
          aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} pr-12 ${error ? "border-red-600" : "border-line"}`}
        />
        <button
          type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}
          className="absolute inset-y-0 right-1 my-1 grid w-10 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
        >
          {visible ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
        </button>
      </div>
      {hint && !error && <p id={`${name}-hint`} className="text-xs text-muted">{hint}</p>}
      <FieldError id={`${name}-error`} message={error} />
    </div>
  );
}

function HospitalLoginLink({ className = "" }: { className?: string }) {
  if (!HOSPITAL_LOGIN_URL) return <span className={className}>Log in from the Health Pin hospital portal.</span>;
  return (
    <a href={HOSPITAL_LOGIN_URL} className={`inline-flex items-center gap-1.5 font-semibold text-brand hover:underline ${className}`}>
      <LogIn aria-hidden className="size-4" /> Hospital Login
    </a>
  );
}

export function HospitalRegistrationForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [plansOpen, setPlansOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  function update(key: FormKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (key === "latitude" || key === "longitude") setConfirmed(false);
  }

  function reset() {
    setForm(initial);
    setErrors({});
    setConfirmed(false);
    setError("");
    setSuccessEmail("");
    setResetToken((token) => token + 1);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setError("Please fix the highlighted fields.");
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (!Number.isFinite(latitude) || latitude < 6.4627 || latitude > 35.6745 || !Number.isFinite(longitude) || longitude < 68.1097 || longitude > 97.3956) {
      setError("Select the exact hospital location within India before submitting.");
      return;
    }
    if (!confirmed) {
      setError("Please confirm that the selected pin is the hospital location.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(apiUrl("/api/v1/hospital-registration/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, email: form.email.trim(), latitude, longitude }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const fieldErrors: Errors = {};
        for (const [key, value] of Object.entries((data.errors ?? {}) as Record<string, string[] | string>)) {
          if (key in initial) fieldErrors[key as FormKey] = ([] as string[]).concat(value).join(" ");
        }
        setErrors(fieldErrors);
        throw new Error(Object.keys(fieldErrors).length ? "Please fix the highlighted fields." : data.message ?? "Please check the form and try again.");
      }
      setSuccessEmail(form.email.trim().toLowerCase());
    } catch (e) {
      setError(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "We couldn't reach Health Pin. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh bg-canvas px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" aria-label="Health Pin home"><Logo /></Link>
          <p className="text-sm text-muted">
            Already have an account? <HospitalLoginLink />
          </p>
        </header>

        <div className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_18px_55px_rgba(42,22,32,.08)]">
          <div className="flex flex-col gap-6 bg-brand px-7 py-10 text-white sm:px-12 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Join the Health Pin network</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Register your hospital or clinic</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
                Create your hospital account with your email and a password. Our team verifies every registration; once approved,
                log in and choose a plan to start using the Hospital Dashboard.
              </p>
            </div>
            <button
              type="button" onClick={() => setPlansOpen(true)}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-brand-dark transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              <BadgeIndianRupee aria-hidden className="size-5" /> View Subscription Plans
            </button>
          </div>

          <ol className="grid gap-3 border-b border-line bg-mint/60 px-7 py-5 text-sm text-brand-dark sm:grid-cols-3 sm:px-12">
            {["Register with email & password", "Health Pin verifies your details", "Log in and choose a plan"].map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>

          <form onSubmit={submit} noValidate className="space-y-10 p-7 sm:p-12">
            {error && <div role="alert" className="rounded-xl bg-[#fde8e8] p-4 text-sm font-medium text-red-800">{error}</div>}

            <section aria-labelledby="details-title" className="space-y-5">
              <h2 id="details-title" className="text-lg font-bold text-ink">Hospital details</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField name="hospital_name" label="Hospital Name" value={form.hospital_name} error={errors.hospital_name} onChange={(v) => update("hospital_name", v)} autoComplete="organization" />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select id="category" value={form.category} onChange={(event) => update("category", event.target.value)} className={`${inputClass} border-line`}>
                    <option value="HOSPITAL">Hospital</option>
                    <option value="CLINIC">Clinic</option>
                  </select>
                </div>
                <TextField name="contact_number" label="Contact Number" type="tel" value={form.contact_number} error={errors.contact_number} onChange={(v) => update("contact_number", v)} autoComplete="tel" hint="Shown to patients. Include the country code." />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="address">Hospital Address</Label>
                <textarea
                  id="address" required rows={3} value={form.address} onChange={(event) => update("address", event.target.value)} autoComplete="street-address"
                  aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "address-error" : undefined}
                  className={`rounded-xl border bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15 ${errors.address ? "border-red-600" : "border-line"}`}
                />
                <FieldError id="address-error" message={errors.address} />
              </div>
            </section>

            <section aria-labelledby="account-title" className="space-y-5">
              <div>
                <h2 id="account-title" className="text-lg font-bold text-ink">Login details</h2>
                <p className="mt-1 text-sm text-muted">You will log in to the Hospital Dashboard with this email and password.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextField name="email" label="Hospital Email Address" type="email" value={form.email} error={errors.email} onChange={(v) => update("email", v)} autoComplete="email" />
                </div>
                <PasswordField name="password" label="Password" value={form.password} error={errors.password} onChange={(v) => update("password", v)} hint={`At least ${MIN_PASSWORD} characters.`} />
                <PasswordField name="confirm_password" label="Confirm Password" value={form.confirm_password} error={errors.confirm_password} onChange={(v) => update("confirm_password", v)} />
              </div>
            </section>

            <section aria-labelledby="location-title" className="rounded-2xl border border-line bg-mint p-5 sm:p-6">
              <h2 id="location-title" className="inline-flex items-center gap-1 text-lg font-bold text-ink">Hospital Location<span aria-hidden className="text-sm text-red-700">*</span></h2>
              <p className="mt-1 text-sm leading-6 text-muted">Search within India or click the map to place the exact hospital location.</p>
              <div className="mt-5">
                <HospitalLocationPicker
                  resetToken={resetToken} latitude={form.latitude} longitude={form.longitude}
                  onChange={(latitude, longitude) => { setForm((current) => ({ ...current, latitude, longitude })); setConfirmed(false); }}
                />
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <TextField name="latitude" label="Latitude" type="number" value={form.latitude} onChange={(v) => update("latitude", v)} />
                <TextField name="longitude" label="Longitude" type="number" value={form.longitude} onChange={(v) => update("longitude", v)} />
              </div>
              {form.latitude && form.longitude && (
                <label className="mt-5 flex items-start gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm leading-5 text-brand-dark">
                  <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 size-4 accent-brand" />
                  <span>I confirm that the selected pin marks the hospital or clinic location.</span>
                </label>
              )}
            </section>

            <div className="space-y-4">
              <button
                type="submit" disabled={busy}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,.2)_inset] transition-all hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? <><Loader2 aria-hidden className="size-5 animate-spin" /> Submitting…</> : <>Register Hospital <ArrowRight aria-hidden className="size-4" /></>}
              </button>
              <p className="text-center text-sm text-muted">
                Registering is free and doesn&apos;t start a subscription. You choose a plan after approval.{" "}
                <button type="button" onClick={() => setPlansOpen(true)} className="font-semibold text-brand hover:underline">See plans</button>
              </p>
              <p className="text-center text-sm text-muted">Already have an account? <HospitalLoginLink /></p>
            </div>
          </form>
        </div>
      </div>

      <SubscriptionPlansDialog open={plansOpen} onClose={() => setPlansOpen(false)} />

      {successEmail && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink/60 p-5" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="registration-success-title" className="hp-modal-in w-full max-w-md rounded-[1.5rem] bg-white px-7 py-8 text-center shadow-2xl sm:px-10">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#dcfce7] text-[#16803c]"><Check aria-hidden className="size-8" strokeWidth={2.5} /></div>
            <h2 id="registration-success-title" className="mt-5 text-2xl font-extrabold text-ink">Registration submitted</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Our team will review your details. Once approved, log in with <strong className="text-ink">{successEmail}</strong> and
              the password you chose, then pick a subscription plan.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              {HOSPITAL_LOGIN_URL && (
                <a href={HOSPITAL_LOGIN_URL} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark">
                  <LogIn aria-hidden className="size-4" /> Go to Hospital Login
                </a>
              )}
              <button type="button" onClick={reset} className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line px-6 font-semibold text-ink transition-colors hover:border-brand hover:text-brand">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
