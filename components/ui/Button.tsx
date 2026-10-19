import { ArrowRight } from "lucide-react";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light" | "gold";
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
};

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-[0_1px_0_rgba(255,255,255,.2)_inset]",
  secondary: "border border-ink/15 text-ink hover:border-brand hover:text-brand bg-white/60",
  light: "bg-white text-brand-dark hover:bg-mint",
  gold: "bg-accent text-brand-dark hover:bg-white",
};

export function Button({
  href,
  children,
  variant = "primary",
  arrow = false,
  className = "",
  onClick,
}: ButtonProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${variants[variant]} ${className}`}
    >
      {children}
      {arrow && (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </a>
  );
}
