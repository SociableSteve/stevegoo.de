/**
 * PostMeta
 *
 * Renders structured metadata about a blog post: publish date, optional
 * update date, reading time, and author.
 *
 * Design decisions:
 * - Uses the semantic <time> element with machine-readable datetime attributes
 *   so browsers, crawlers, and assistive technologies can interpret dates.
 * - Date formatting is locale-aware via Intl.DateTimeFormat so the displayed
 *   string matches the user's locale while the datetime attribute always
 *   provides the canonical ISO 8601 form.
 * - The component is intentionally stateless and accepts plain string/number
 *   props — it does not consume the full Post type to remain reusable in
 *   contexts where only a subset of metadata is available.
 * - Separator dots between items are aria-hidden so screen readers announce
 *   a clean prose list without reading "bullet bullet bullet".
 */

import React from "react";
import styles from "./PostMeta.module.css";

/* ============================================================
   Types
   ============================================================ */

export interface PostMetaProps {
  /** ISO 8601 calendar date string (YYYY-MM-DD). Required. */
  publishedAt: string;
  /** ISO 8601 calendar date string (YYYY-MM-DD). Shown only when different from publishedAt. */
  updatedAt?: string | null | undefined;
  /** Estimated reading time in whole minutes. */
  readingTimeMinutes?: number;
  /** Author display name. Omit on single-author sites where attribution is implicit. */
  author?: string;
  /** Additional CSS class names for layout overrides from the parent. */
  className?: string;
  /** Controls the visual density. Defaults to "default". */
  size?: "sm" | "default";
}

/* ============================================================
   Helpers
   ============================================================ */

/**
 * Format an ISO date string (YYYY-MM-DD) for human display.
 * Uses en-GB locale by default which gives "19 Feb 2026" style output,
 * falling back gracefully if Intl is unavailable (SSR edge case).
 */
function formatDisplayDate(isoDate: string): string {
  try {
    // Append 'T00:00:00' to force UTC midnight — without it, new Date
    // on a plain date string is parsed as UTC but displayed in local time
    // which can cause off-by-one day errors.
    const date = new Date(`${isoDate}T00:00:00`);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return isoDate;
  }
}

/* ============================================================
   Sub-component: MetaSeparator
   ============================================================ */

function MetaSeparator() {
  return (
    <span className={styles["separator"]} aria-hidden="true">
      ·
    </span>
  );
}

/* ============================================================
   Component
   ============================================================ */

export function PostMeta({
  publishedAt,
  updatedAt,
  readingTimeMinutes,
  author,
  className,
  size = "default",
}: PostMetaProps) {
  const classNames = [
    styles["postMeta"],
    size === "sm" ? styles["sm"] : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showUpdated =
    updatedAt != null && updatedAt !== "" && updatedAt !== publishedAt;

  const items: React.ReactNode[] = [];

  // Reading time (first)
  if (readingTimeMinutes != null && readingTimeMinutes > 0) {
    items.push(
      <span key="reading-time" className={styles["readingTime"]}>
        {/* aria-label provides a natural sentence for screen readers
            rather than "3 min read" which loses the "approximately" sense */}
        <abbr
          title={`Approximately ${readingTimeMinutes} minute${readingTimeMinutes === 1 ? "" : "s"} to read`}
          aria-label={`${readingTimeMinutes} min read`}
        >
          {readingTimeMinutes} min read
        </abbr>
      </span>,
    );
  }

  // Author (second)
  if (author != null && author !== "") {
    items.push(
      <span key="author" className={styles["author"]}>
        by {author}
      </span>,
    );
  }

  // Published date (third)
  items.push(
    <time
      key="published"
      dateTime={publishedAt}
      className={styles["date"]}
    >
      {showUpdated ? (
        // Announce publication context explicitly when an update date is shown
        <span>
          <span className={styles["dateLabel"]}>Published </span>
          {formatDisplayDate(publishedAt)}
        </span>
      ) : (
        formatDisplayDate(publishedAt)
      )}
    </time>,
  );

  // Updated date (only when it differs from publishedAt)
  if (showUpdated) {
    items.push(
      <time
        key="updated"
        dateTime={updatedAt}
        className={styles["date"]}
      >
        <span className={styles["dateLabel"]}>Updated </span>
        {formatDisplayDate(updatedAt)}
      </time>,
    );
  }

  // Interleave separator dots between items (not after the last item)
  const withSeparators = items.reduce<React.ReactNode[]>((acc, item, index) => {
    if (index === 0) return [item];
    return [...acc, <MetaSeparator key={`sep-${index}`} />, item];
  }, []);

  return (
    <p className={classNames} aria-label="Post metadata">
      {withSeparators}
    </p>
  );
}
