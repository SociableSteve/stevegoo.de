/**
 * TargetIcon - SVG icon for technical recruitment and targeting
 * Accessible replacement for 🎯 emoji
 */
interface TargetIconProps {
  className?: string;
}

export function TargetIcon({ className }: TargetIconProps) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}