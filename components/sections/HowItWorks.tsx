"use client";

import { motion } from "motion/react";
import { CalendarCheck, FolderLock, Search } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { steps } from "@/lib/content";

const icons = [Search, CalendarCheck, FolderLock];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="border-y border-line bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="how-title" eyebrow="How Health Pin works" title="From finding care to keeping records, in three steps" />

        <ol className="relative mt-16 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {/* connecting line — horizontal on desktop */}
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-8 right-[16.6%] left-[16.6%] hidden h-px origin-left border-t-2 border-dashed border-accent lg:block"
          />
          {/* vertical on mobile */}
          <motion.span
            aria-hidden
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-8 bottom-8 left-8 w-px origin-top border-l-2 border-dashed border-accent lg:hidden"
          />

          {steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-6 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
              >
                <span className="relative z-10 grid size-16 shrink-0 place-items-center rounded-full border-2 border-brand bg-white text-brand">
                  <Icon aria-hidden className="size-6" />
                </span>
                <div className="lg:mt-6">
                  <p className="font-heading text-sm font-bold tracking-widest text-brand">{s.n}</p>
                  <h3 className="mt-1 text-2xl font-extrabold">{s.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-muted lg:mx-auto">{s.text}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
