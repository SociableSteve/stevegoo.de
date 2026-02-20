/**
 * MentorIcon - SVG icon for technical mentoring
 * Accessible replacement for 👨‍🏫 emoji
 */
interface MentorIconProps {
  className?: string;
}

export function MentorIcon({ className }: MentorIconProps) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m22 11-3-3-3 3" />
      <path d="m19 8-3 3" />
    </svg>
  );
}