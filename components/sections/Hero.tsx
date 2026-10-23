"use client";

import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/hospitals/SearchBar";
import { MapArt, MapPin } from "@/components/previews/MapArt";
import { DoctorCard, HospitalCard, PrescriptionSheet, SampleBadge } from "@/components/previews/Cards";

const ease = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

function Float({
  children,
  className,
  delay,
  drift = 6,
  duration = 7,
}: {
  children: React.ReactNode;
  className: string;
  delay: number;
  drift?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay, ease }}
    >
      <motion.div
        animate={{ y: [0, -drift, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24">
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-10 hidden w-[46%] rounded-bl-[8rem] bg-mint/60 lg:block"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <motion.p
            {...rise(0)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-brand-dark"
          >
            <span aria-hidden className="size-2 rounded-full bg-brand" />
            Your Health. All in One Place.
          </motion.p>
          <motion.h1
            {...rise(0.08)}
            className="text-[2.75rem] leading-[1.04] font-extrabold text-balance text-ink sm:text-6xl lg:text-[4.25rem]"
          >
            Your Health Journey, <span className="text-brand">Simplified.</span>
          </motion.h1>
          <motion.p {...rise(0.18)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Discover hospitals near you, book appointments with doctors, and keep your prescriptions
            within reach — all in one secure place.
          </motion.p>
          <motion.div {...rise(0.24)} className="relative z-20 mt-8 max-w-xl">
            <SearchBar />
            <p className="mt-2.5 px-4 text-xs text-muted">Try a city, district, area or 6-digit pincode.</p>
          </motion.div>
          <motion.div {...rise(0.28)} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="#find-care" arrow className="sm:min-w-44">
              Find a Doctor
            </Button>
            <Button href="#features" variant="secondary">
              Explore Health Pin
            </Button>
          </motion.div>
          <motion.p {...rise(0.38)} className="mt-8 flex items-start gap-2.5 text-sm text-muted">
            <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
            Built around your privacy: your records are for you to keep organized and access.
          </motion.p>
        </div>

        {/* Product composition */}
        <div
          role="img"
          aria-label="Illustrated preview of Health Pin: a map of nearby hospitals, a doctor profile with appointment times, and a saved prescription"
          className="relative mx-auto h-[500px] w-full max-w-[540px] sm:h-[560px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease }}
            className="absolute inset-x-4 top-0 bottom-10 overflow-hidden rounded-t-[14rem] rounded-b-3xl border border-line sm:inset-x-8"
          >
            <MapArt className="size-full" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 via-transparent to-transparent" />
            <MapPin className="top-[34%] left-[30%]" />
            <MapPin className="top-[26%] left-[66%]" active />
            <MapPin className="top-[52%] left-[48%]" />
          </motion.div>

          <Float delay={0.5} drift={5} duration={7} className="absolute top-8 -left-1 w-[250px] sm:top-10 sm:-left-4 sm:w-[270px]">
            <HospitalCard />
          </Float>
          <Float delay={0.7} drift={7} duration={8} className="absolute top-[44%] -right-1 w-[262px] sm:-right-4 sm:w-[280px]">
            <DoctorCard />
          </Float>
          <Float delay={0.9} drift={5} duration={9} className="absolute bottom-0 left-2 w-[240px] sm:left-0 sm:w-[260px]">
            <PrescriptionSheet className="-rotate-2" />
          </Float>
          <SampleBadge className="absolute top-1 right-2 sm:right-6" />
        </div>
      </div>
    </section>
  );
}
