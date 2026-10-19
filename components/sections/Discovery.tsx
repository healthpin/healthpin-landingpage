import { Hospital, MapPin, Search, SlidersHorizontal, Stethoscope } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MapArt, MapPin as Pin } from "@/components/previews/MapArt";
import { DoctorCard, SampleBadge } from "@/components/previews/Cards";

const results = [
  { name: "Riverside General", meta: "Hospital · 2.4 km", active: true },
  { name: "Northgate Clinic", meta: "Clinic · 3.1 km", active: false },
  { name: "St. Elm Medical Centre", meta: "Hospital · 4.8 km", active: false },
];

export function Discovery() {
  return (
    <section id="find-care" aria-labelledby="find-title" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading id="find-title" eyebrow="Find care" title="Search nearby. Choose a doctor. Pick a time.">
            See hospitals around you, learn about the doctors who work there, and view appointment times in one flow.
          </SectionHeading>
          <Reveal>
            <SampleBadge />
          </Reveal>
        </div>

        <Reveal className="mt-12">
          <div
            role="img"
            aria-label="Illustrative preview of Health Pin's discovery screen with a search bar, a map of nearby hospitals, a hospital summary and a doctor profile with sample appointment times"
            className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_30px_60px_-40px_rgba(23,43,58,.5)]"
          >
            {/* Search bar */}
            <div aria-hidden className="flex flex-wrap items-center gap-3 border-b border-line bg-canvas p-4 sm:p-5">
              <div className="flex min-w-0 flex-1 basis-64 items-center gap-2.5 rounded-full border border-line bg-white px-4 py-3 text-sm text-muted">
                <Search className="size-4 shrink-0 text-brand" />
                <span className="truncate">Search hospitals, doctors or specialties</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-mint px-4 py-3 text-sm font-semibold text-brand-dark">
                <MapPin className="size-4" /> Near me
              </span>
              <span className="hidden items-center gap-1.5 rounded-full border border-line bg-white px-4 py-3 text-sm font-medium text-ink/70 sm:flex">
                <SlidersHorizontal className="size-4" /> Filters
              </span>
            </div>

            <div aria-hidden className="grid lg:grid-cols-[1.25fr_1fr]">
              {/* Map + results */}
              <div className="relative min-h-[360px] border-b border-line lg:border-r lg:border-b-0">
                <MapArt className="absolute inset-0 size-full" />
                <Pin className="top-[38%] left-[34%]" label="Riverside General" active />
                <Pin className="top-[66%] left-[60%]" label="Northgate Clinic" />
                <Pin className="top-[30%] left-[78%]" />
                <span className="absolute top-[56%] left-[22%] grid size-4 place-items-center rounded-full bg-brand/25">
                  <span className="size-2 rounded-full bg-brand ring-2 ring-white" />
                </span>
                <ul className="absolute right-3 bottom-3 left-3 space-y-2 sm:right-auto sm:w-72">
                  {results.slice(0, 2).map((r) => (
                    <li
                      key={r.name}
                      className={`flex items-center gap-3 rounded-xl border bg-white p-3 ${
                        r.active ? "border-brand" : "border-line"
                      }`}
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-mint text-brand-dark">
                        <Hospital className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold">{r.name}</span>
                        <span className="block text-xs text-muted">{r.meta}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detail */}
              <div className="space-y-4 bg-canvas p-5 sm:p-6">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-brand uppercase">Hospital</p>
                  <h3 className="mt-1 text-xl font-extrabold">Riverside General</h3>
                  <p className="mt-1 text-sm text-muted">2.4 km away · Open 24 hours · Emergency department</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Cardiology", "Pediatrics", "Orthopedics", "Radiology"].map((t) => (
                      <span key={t} className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink/70">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  <Stethoscope className="size-3" /> Doctors at this hospital
                </p>
                <DoctorCard />
              </div>
            </div>
          </div>
        </Reveal>
        <p className="mt-4 text-sm text-muted">
          Hospitals, doctors and times shown are fictional examples for illustration only. They aren’t real, and
          nothing in this preview can be booked.
        </p>
      </div>
    </section>
  );
}
