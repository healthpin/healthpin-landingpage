import { Logo } from "@/components/ui/Logo";
import { navLinks } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <a href="#home" aria-label="Health Pin — back to top">
            <Logo className="h-10" tone="light" />
          </a>
          <p className="mt-4 leading-relaxed text-white/70">
            Health Pin helps you find hospitals and doctors, plan appointments, and keep your prescriptions
            organized in one place.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[15px] font-medium text-white/80 hover:text-accent">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-sm text-white/60 sm:px-8">
          © 2026 Health Pin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
