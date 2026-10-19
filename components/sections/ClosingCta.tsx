import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function ClosingCta() {
  return (
    <section aria-labelledby="cta-title" className="px-5 py-20 sm:px-8 lg:py-28">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand px-7 py-16 text-white sm:px-14 lg:py-20">
          {/* Pin-drop rings */}
          <svg
            aria-hidden
            viewBox="0 0 400 400"
            className="pointer-events-none absolute -top-24 -right-24 w-[420px] text-white/10 sm:w-[520px]"
            fill="none"
            stroke="currentColor"
          >
            {[40, 90, 140, 190].map((r) => (
              <circle key={r} cx="200" cy="200" r={r} strokeWidth="1.5" />
            ))}
            <circle cx="200" cy="200" r="10" fill="currentColor" stroke="none" />
          </svg>

          <div className="relative max-w-2xl">
            <h2 id="cta-title" className="text-3xl font-extrabold text-balance sm:text-5xl sm:leading-[1.08]">
              Better Healthcare Starts With One Simple Step.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              Find the care you need and keep your important health documents organized with Health Pin.
            </p>
            <Button href="#features" variant="gold" arrow className="mt-9">
              Explore Health Pin
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

