import { ChevronRight, FileText, Image as ImageIcon, Plus, Search } from "lucide-react";

const records = [
  { title: "Prescription", meta: "Cardiology · 12 Mar 2026", icon: FileText },
  { title: "Lab report", meta: "Blood panel · 28 Feb 2026", icon: FileText },
  { title: "Prescription photo", meta: "General · 03 Jan 2026", icon: ImageIcon },
];

export function Phone({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Illustration of the Health Pin vault on a phone, listing prescriptions and documents by date"
      className={`relative w-[250px] rounded-[2.4rem] border-[7px] border-ink bg-ink shadow-[0_40px_70px_-30px_rgba(23,43,58,.6)] ${className}`}
    >
      <div className="overflow-hidden rounded-[1.9rem] bg-canvas">
        <div className="mx-auto mt-2 h-4 w-20 rounded-full bg-ink" aria-hidden />
        <div className="px-4 pt-4 pb-5" aria-hidden>
          <p className="text-[11px] font-medium text-muted">My vault</p>
          <p className="font-heading text-lg font-extrabold text-ink">Medical records</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs text-muted">
            <Search className="size-3.5" /> Search documents
          </div>
          <div className="mt-3 flex gap-1.5 text-[11px] font-semibold">
            <span className="rounded-full bg-brand px-3 py-1 text-white">All</span>
            <span className="rounded-full bg-mint px-3 py-1 text-brand-dark">Prescriptions</span>
            <span className="rounded-full bg-mint px-3 py-1 text-brand-dark">Reports</span>
          </div>
          <ul className="mt-3 space-y-2">
            {records.map(({ title, meta, icon: Icon }) => (
              <li
                key={title}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-2.5"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-mint text-brand-dark">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-ink">{title}</span>
                  <span className="block truncate text-[10px] text-muted">{meta}</span>
                </span>
                <ChevronRight className="size-3.5 text-muted" />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-xs font-semibold text-white">
            <Plus className="size-3.5" /> Add document
          </div>
        </div>
      </div>
    </div>
  );
}
