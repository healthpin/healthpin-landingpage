import { CalendarDays, Clock, FileText, Hospital, MapPin, Stethoscope } from "lucide-react";

/** Shared surface for all illustrative product previews. */
export function PreviewSurface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-white p-4 shadow-[0_18px_40px_-24px_rgba(23,43,58,.35)] ${className}`}
    >
      {children}
    </div>
  );
}

export function HospitalCard({ className = "" }: { className?: string }) {
  return (
    <PreviewSurface className={className}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint text-brand-dark">
          <Hospital aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">Riverside General</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <MapPin aria-hidden className="size-3" /> 2.4 km away · Open 24 hours
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Emergency", "Cardiology", "Pediatrics"].map((t) => (
          <span key={t} className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink/70">
            {t}
          </span>
        ))}
      </div>
    </PreviewSurface>
  );
}

export const sampleSlots = ["09:30", "10:15", "11:00", "14:45"];

export function DoctorCard({
  className = "",
  selected = 1,
}: {
  className?: string;
  selected?: number;
}) {
  return (
    <PreviewSurface className={className}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-dark text-sm font-bold text-white"
        >
          MC
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">Dr. Maya Collins</p>
          <p className="flex items-center gap-1 text-xs text-muted">
            <Stethoscope aria-hidden className="size-3" /> Cardiologist
          </p>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
        <CalendarDays aria-hidden className="size-3" /> Next available · Tomorrow
      </p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {sampleSlots.map((s, i) => (
          <span
            key={s}
            className={`rounded-lg py-1.5 text-center text-xs font-semibold ${
              i === selected ? "bg-brand text-white" : "bg-mint/70 text-brand-dark"
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </PreviewSurface>
  );
}

export function PrescriptionSheet({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-line bg-white p-5 shadow-[0_24px_50px_-28px_rgba(23,43,58,.4)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-dashed border-line pb-3">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-brand uppercase">Prescription</p>
          <p className="text-sm font-bold text-ink">Dr. Maya Collins</p>
        </div>
        <span className="text-xs text-muted">12 Mar 2026</span>
      </div>
      <div className="mt-3 space-y-2.5" aria-hidden>
        <span className="font-heading text-2xl leading-none font-bold text-brand-dark">℞</span>
        {[78, 92, 64, 84, 52].map((w, i) => (
          <span key={i} className="block h-2 rounded-full bg-line" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="mt-4 flex items-end justify-between">
        <span className="flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[11px] font-semibold text-brand-dark">
          <FileText aria-hidden className="size-3" /> Saved to vault
        </span>
        <span aria-hidden className="font-heading text-lg text-ink/50 italic">
          M. Collins
        </span>
      </div>
    </div>
  );
}

export function SampleBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-2.5 py-1 text-[11px] font-medium text-muted ${className}`}
    >
      <Clock aria-hidden className="size-3" /> Illustrative sample data
    </span>
  );
}
