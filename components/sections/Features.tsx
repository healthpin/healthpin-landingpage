import { CalendarCheck, FileText, FolderLock, MapPinned } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MapArt, MapPin } from "@/components/previews/MapArt";
import { sampleSlots } from "@/components/previews/Cards";

const days = [
  { d: "Mon", n: "14" },
  { d: "Tue", n: "15" },
  { d: "Wed", n: "16" },
  { d: "Thu", n: "17" },
];

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="features-title" eyebrow="What Health Pin does" title="Three ways Health Pin looks after your care">
          One place to find the right facility, plan your visit, and keep what matters.
        </SectionHeading>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {/* 1 — Hospitals */}
          <Reveal className="lg:col-span-7">
            <article className="group relative h-full overflow-hidden rounded-3xl border border-line bg-white">
              <div className="relative h-52 overflow-hidden sm:h-64">
                <MapArt className="size-full transition-transform duration-700 group-hover:scale-105" />
                <MapPin className="top-[45%] left-[28%]" label="Riverside General" active />
                <MapPin className="top-[70%] left-[62%]" label="Northgate Clinic" />
                <MapPin className="top-[38%] left-[82%]" />
              </div>
              <div className="p-7 sm:p-9">
                <MapPinned aria-hidden className="mb-4 size-6 text-brand" />
                <h3 className="text-2xl font-extrabold">Find Hospitals Near You</h3>
                <p className="mt-3 max-w-md leading-relaxed text-muted">
                  Discover nearby healthcare facilities and find the care that fits your needs.
                </p>
              </div>
            </article>
          </Reveal>

          {/* 2 — Appointments */}
          <Reveal delay={0.1} className="lg:col-span-5">
            <article className="h-full rounded-3xl bg-mint p-7 sm:p-9">
              <CalendarCheck aria-hidden className="mb-4 size-6 text-brand-dark" />
              <h3 className="text-2xl font-extrabold">Book Doctor Appointments</h3>
              <p className="mt-3 leading-relaxed text-ink/70">
                Explore doctors, check available time slots, and plan your visit with ease.
              </p>
              <div aria-hidden className="mt-8 rounded-2xl bg-white p-4">
                <div className="grid grid-cols-4 gap-2">
                  {days.map((x, i) => (
                    <div
                      key={x.d}
                      className={`rounded-xl py-2 text-center ${i === 1 ? "bg-brand text-white" : "bg-canvas text-ink"}`}
                    >
                      <p className="text-[10px] font-medium opacity-70">{x.d}</p>
                      <p className="font-heading text-lg font-bold">{x.n}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {sampleSlots.map((s, i) => (
                    <span
                      key={s}
                      className={`rounded-lg border py-1.5 text-center text-xs font-semibold ${
                        i === 2 ? "border-brand bg-mint text-brand-dark" : "border-line text-ink/70"
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>

          {/* 3 — Vault */}
          <Reveal delay={0.05} className="lg:col-span-12">
            <article className="relative grid items-center gap-8 overflow-hidden rounded-3xl bg-brand-dark p-7 text-white sm:p-10 lg:grid-cols-2 lg:p-12">
              <div>
                <FolderLock aria-hidden className="mb-4 size-6 text-accent" />
                <h3 className="text-2xl font-extrabold sm:text-3xl">Your Personal Medical Vault</h3>
                <p className="mt-3 max-w-md leading-relaxed text-white/75">
                  Keep prescriptions and important medical documents organized and accessible when you need them.
                </p>
              </div>
              <div aria-hidden className="relative h-44 sm:h-48">
                {[
                  { t: "Lab report", m: "28 Feb 2026", cls: "left-[4%] top-0 -rotate-6" },
                  { t: "Prescription photo", m: "03 Jan 2026", cls: "left-[28%] top-3 rotate-3" },
                  { t: "Prescription", m: "12 Mar 2026", cls: "left-[50%] top-6 -rotate-1" },
                ].map((d) => (
                  <div
                    key={d.t}
                    className={`absolute w-[46%] max-w-56 rounded-xl bg-white p-4 text-ink shadow-xl transition-transform duration-300 hover:-translate-y-2 ${d.cls}`}
                  >
                    <FileText className="mb-2 size-4 text-brand" />
                    <p className="text-xs font-bold">{d.t}</p>
                    <p className="text-[10px] text-muted">{d.m}</p>
                    <span className="mt-2 block h-1.5 w-4/5 rounded-full bg-line" />
                    <span className="mt-1.5 block h-1.5 w-3/5 rounded-full bg-line" />
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
