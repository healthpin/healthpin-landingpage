import { CalendarDays, FileText, Tags, Smartphone } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Phone } from "@/components/previews/Phone";
import { PrescriptionSheet } from "@/components/previews/Cards";

const points = [
  { icon: FileText, title: "Prescriptions & documents", text: "Save a photo or scan so it’s never lost in a drawer." },
  { icon: CalendarDays, title: "Organized by date", text: "Find the right record quickly by when it was issued." },
  { icon: Tags, title: "Clear labels", text: "Name and sort documents so each one is easy to recognize." },
  { icon: Smartphone, title: "Always in your pocket", text: "Open your records from your phone whenever you need them." },
];

const collection = [
  { t: "Prescription", m: "12 Mar 2026" },
  { t: "Lab report", m: "28 Feb 2026" },
  { t: "Discharge summary", m: "19 Jan 2026" },
];

export function Vault() {
  return (
    <section id="medical-vault" aria-labelledby="vault-title" className="relative overflow-hidden bg-mint py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-8">
        <div>
          <SectionHeading id="vault-title" eyebrow="Digital Medical Vault" title="Your Prescriptions. Always Within Reach.">
            Keep important prescriptions and medical documents organized in one convenient digital space.
          </SectionHeading>
          <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {points.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={i * 0.07}>
                  <Icon aria-hidden className="mb-2 size-5 text-brand-dark" />
                  <h3 className="text-base font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/70">{text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-lg border-l-2 border-brand pl-4 text-sm leading-relaxed text-ink/70">
            Your health records are personal. The vault is designed so that your documents are kept for you —
            privacy and security details will be shared as they are confirmed.
          </p>
        </div>

        <Reveal delay={0.1}>
          <div className="relative mx-auto flex min-h-[520px] max-w-[520px] items-center justify-center">
            <div aria-hidden className="absolute inset-x-6 inset-y-4 rounded-[3rem] bg-accent/60" />
            <PrescriptionSheet className="absolute top-6 left-0 hidden w-60 -rotate-3 sm:block" />
            <div className="relative z-10">
              <Phone />
            </div>
            <div
              aria-hidden
              className="absolute right-0 bottom-6 z-20 hidden w-52 rounded-2xl border border-line bg-white p-4 shadow-[0_18px_40px_-24px_rgba(23,43,58,.35)] sm:block"
            >
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">Collection</p>
              <ul className="space-y-2">
                {collection.map((c) => (
                  <li key={c.t} className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-md bg-mint text-brand-dark">
                      <FileText className="size-3.5" />
                    </span>
                    <span className="text-xs">
                      <span className="block font-bold">{c.t}</span>
                      <span className="text-muted">{c.m}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
