/**
 * GrowthIcon - SVG icon for promotion processes and career growth
 * Accessible replacement for 📈 emoji
 */
interface GrowthIconProps {
  className?: string;
}

export function GrowthIcon({ className }: GrowthIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
      <path d="m14 9h5v5" />
    </svg>
  );
}