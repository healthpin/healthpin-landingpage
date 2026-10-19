// Abstract, illustrative map - not real geography.
export function MapArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={className}
    >
      <rect width="400" height="300" fill="#F4EEDB" />
      <path d="M-10 230 C60 190 120 250 200 215 S340 150 420 190 V310 H-10Z" fill="#EBDFC4" />
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M-10 90 C80 70 150 120 240 95 S360 40 420 60" strokeWidth="9" />
        <path d="M120 -10 C140 80 110 160 150 310" strokeWidth="9" />
        <path d="M290 -10 C270 90 320 170 300 310" strokeWidth="7" />
        <path d="M-10 170 H420" strokeWidth="5" />
        <path d="M200 -10 V310" strokeWidth="4" />
      </g>
      <g fill="#EBDCAE">
        <rect x="30" y="110" width="60" height="38" rx="6" />
        <rect x="220" y="110" width="50" height="40" rx="6" />
        <rect x="320" y="200" width="60" height="45" rx="6" />
        <rect x="40" y="30" width="55" height="30" rx="6" />
      </g>
    </svg>
  );
}

export function MapPin({
  className = "",
  label,
  active = false,
}: {
  className?: string;
  label?: string;
  active?: boolean;
}) {
  return (
    <span className={`absolute flex -translate-x-1/2 -translate-y-full flex-col items-center ${className}`}>
      {label && (
        <span className="mb-1 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap text-white">
          {label}
        </span>
      )}
      <svg width="26" height="32" viewBox="0 0 26 32" aria-hidden>
        <path
          d="M13 0C5.8 0 0 5.6 0 12.6 0 22 13 32 13 32s13-10 13-19.4C26 5.6 20.2 0 13 0Z"
          fill={active ? "#9A1646" : "#6F0A33"}
        />
        <path d="M11 7h4v4h4v4h-4v4h-4v-4H7v-4h4V7Z" fill="#fff" />
      </svg>
    </span>
  );
}

