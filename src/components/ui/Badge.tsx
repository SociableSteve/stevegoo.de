/**
 * Badge
 *
 * Inline label primitive for categories, metadata, and status indicators.
 *
 * Design decisions:
 * - Non-interactive by default (rendered as <span>). This is semantically
 *   correct: badges are annotations, not controls.
 * - When `onDismiss` is provided, a dismiss button is appended. The button
 *   receives an explicit aria-label so screen readers announce
 *   "Remove <label>" rather than just "×".
 * - `showDot` renders a decorative status dot. It is aria-hidden because
 *   the variant conveys the same meaning textually for screen readers.
 * - No React.forwardRef is needed because the outer element is not an
 *   interactive control — consumers rarely need a ref to a badge. If a
 *   consumer does need a ref they can wrap it. If the need becomes common
 *   we can add forwardRef without a breaking change.
 */

import React from "react";
import styles from "./Badge.module.css";

/* ============================================================
   Types
   ============================================================ */

export type BadgeVariant =
  | "default"
  | "neutral"
  | "success"
  | "warning"
  | "error";

export interface BadgeProps {
  /** Visual and semantic colour palette. Defaults to "default". */
  variant?: BadgeVariant;
  /** Renders a small circular dot before the label text. */
  showDot?: boolean;
  /**
   * When provided, appends a dismiss (×) button.
   * The callback receives the current label so the parent can identify
   * which badge was dismissed in list scenarios.
   */
  onDismiss?: () => void;
  /**
   * Accessible label for the dismiss button.
   * Defaults to "Remove <children>" — provide an explicit override when
   * the children are not plain text.
   */
  dismissLabel?: string;
  /** Additional CSS class names. */
  className?: string;
  children: React.ReactNode;
}

/* ============================================================
   Dismiss icon — inline SVG for zero extra dependencies
   ============================================================ */

function DismissIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   Component
   ============================================================ */

export function Badge({
  variant = "default",
  showDot = false,
  onDismiss,
  dismissLabel,
  className,
  children,
}: BadgeProps) {
  const classNames = [styles["badge"], styles[variant], className]
    .filter(Boolean)
    .join(" ");

  // Build a sensible default dismiss label from the badge text.
  // We only attempt this for plain-text children; for complex nodes
  // the consumer must provide an explicit `dismissLabel`.
  const resolvedDismissLabel = React.useMemo(() => {
    if (dismissLabel) return dismissLabel;
    if (typeof children === "string") return `Remove ${children}`;
    if (typeof children === "number") return `Remove ${children}`;
    return "Remove";
  }, [dismissLabel, children]);

  return (
    <span className={classNames}>
      {showDot && (
        <span
          className={styles["dot"]}
          aria-hidden="true"
        />
      )}

      {children}

      {onDismiss !== undefined && (
        <button
          type="button"
          className={styles["dismissButton"]}
          onClick={onDismiss}
          aria-label={resolvedDismissLabel}
        >
          <DismissIcon />
        </button>
      )}
    </span>
  );
}
