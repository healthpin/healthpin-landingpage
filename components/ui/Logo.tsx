import Image from "next/image";

// Official logo tile (635 × 626), shown unaltered apart from rounded corners.
export function Logo({ className = "h-10", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/brand/healthpin-logo.png"
        alt="Health Pin logo"
        width={635}
        height={626}
        priority
        className={`w-auto rounded-[22%] ${className}`}
      />
      <span
        className={`font-heading text-xl font-extrabold tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`}
      >
        Health<span className={tone === "light" ? "text-accent" : "text-brand"}>Pin</span>
      </span>
    </span>
  );
}
