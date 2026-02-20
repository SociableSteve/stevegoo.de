/**
 * date-format.ts
 *
 * Human-readable date formatting utilities for the content domain.
 *
 * The Post domain stores dates as ISO 8601 calendar strings (YYYY-MM-DD).
 * These utilities convert those strings into the display formats used by
 * listing cards, post headers, and <time> elements.
 *
 * Design decisions:
 * - All functions accept and return plain strings to avoid Date object
 *   timezone hazards.  Constructing a Date from "2024-01-15" in a UTC-minus
 *   environment produces 2024-01-14 locally — these utilities avoid that
 *   trap by splitting the string directly.
 * - `Intl.DateTimeFormat` is used for locale-aware month names, keeping the
 *   output human-readable without a date library dependency.  The locale is
 *   pinned to "en-US" for consistent output across server and client renders.
 * - The UTC timezone is forced so that month/day values are derived from the
 *   ISO date components, not from the user's local offset.
 *
 * Single Responsibility: this module only converts date string representations.
 * It has no knowledge of Post types or any other domain concept.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Regex used to validate and parse YYYY-MM-DD formatted strings. */
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

// ---------------------------------------------------------------------------
// formatDisplayDate
// ---------------------------------------------------------------------------

/**
 * Formats a YYYY-MM-DD date string into a long human-readable format.
 *
 * Output example: "January 15, 2024"
 *
 * Designed for use in post headers and article bylines where the full month
 * name improves readability.
 *
 * @param isoDate - A YYYY-MM-DD formatted date string.
 * @returns The formatted date string, or the original input if it does not
 *   match the expected format (fail-safe for malformed data in templates).
 *
 * @example
 * formatDisplayDate("2024-01-15")  // "January 15, 2024"
 * formatDisplayDate("2024-03-01")  // "March 1, 2024"
 */
export function formatDisplayDate(isoDate: string): string {
  const match = ISO_DATE_REGEX.exec(isoDate);
  if (!match) return isoDate;

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr ?? "0", 10);
  const month = parseInt(monthStr ?? "0", 10);
  const day = parseInt(dayStr ?? "0", 10);

  // Use UTC noon to completely avoid timezone boundary effects
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// ---------------------------------------------------------------------------
// formatShortDate
// ---------------------------------------------------------------------------

/**
 * Formats a YYYY-MM-DD date string into a short abbreviated format.
 *
 * Output example: "Jan 15, 2024"
 *
 * Designed for use in listing cards and compact metadata rows where space
 * is constrained.
 *
 * @param isoDate - A YYYY-MM-DD formatted date string.
 * @returns The formatted date string, or the original input if it does not
 *   match the expected format.
 *
 * @example
 * formatShortDate("2024-01-15")  // "Jan 15, 2024"
 * formatShortDate("2024-11-01")  // "Nov 1, 2024"
 */
export function formatShortDate(isoDate: string): string {
  const match = ISO_DATE_REGEX.exec(isoDate);
  if (!match) return isoDate;

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr ?? "0", 10);
  const month = parseInt(monthStr ?? "0", 10);
  const day = parseInt(dayStr ?? "0", 10);

  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// ---------------------------------------------------------------------------
// toIsoDatetime
// ---------------------------------------------------------------------------

/**
 * Converts a YYYY-MM-DD date string into the ISO 8601 datetime string
 * expected by the HTML `<time>` element's `dateTime` attribute.
 *
 * Output example: "2024-01-15" → "2024-01-15"
 *
 * The function validates the format and returns the input unchanged if it
 * already conforms, making it safe to pass directly to a `<time dateTime>`
 * attribute without extra parsing overhead.
 *
 * Returns null when the input does not match the expected YYYY-MM-DD format,
 * enabling callers to conditionally render the `<time>` element.
 *
 * @param isoDate - A YYYY-MM-DD formatted date string.
 *
 * @example
 * toIsoDatetime("2024-01-15")        // "2024-01-15"
 * toIsoDatetime("not-a-date")        // null
 * toIsoDatetime("")                  // null
 */
export function toIsoDatetime(isoDate: string): string | null {
  if (!ISO_DATE_REGEX.test(isoDate)) return null;
  return isoDate;
}

// ---------------------------------------------------------------------------
// isAfter
// ---------------------------------------------------------------------------

/**
 * Returns true when `dateA` is strictly after `dateB`.
 *
 * Comparison is lexicographic, which is correct for ISO 8601 date strings
 * in YYYY-MM-DD format.  Both arguments must conform to YYYY-MM-DD.
 *
 * @param dateA - The first date string.
 * @param dateB - The second date string.
 *
 * @example
 * isAfter("2024-06-01", "2024-01-01")  // true
 * isAfter("2024-01-01", "2024-06-01")  // false
 * isAfter("2024-01-01", "2024-01-01")  // false (equal, not strictly after)
 */
export function isAfter(dateA: string, dateB: string): boolean {
  return dateA > dateB;
}
