/**
 * slug.ts
 *
 * Slug validation and normalisation utilities.
 *
 * A valid URL slug is:
 *  - non-empty
 *  - composed only of lowercase letters (a-z), digits (0-9), and hyphens (-)
 *  - does not start or end with a hyphen
 *  - does not contain consecutive hyphens
 *
 * These rules ensure slugs are safe for use in URL path segments without
 * percent-encoding and that they map consistently to file names on
 * case-insensitive file systems.
 *
 * Single Responsibility: this module only knows about slug strings.
 * It has no dependency on PostSlug branded types so that it can be
 * used by infrastructure adapters (e.g. filename normalisation) before
 * the domain layer is involved.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Regular expression describing a valid slug.
 *
 * - ^[a-z0-9]  — must start with a lowercase alphanumeric character
 * - (?:[a-z0-9]|-(?=[a-z0-9]))*  — followed by zero or more groups that are
 *   either an alphanumeric character or a hyphen immediately followed by an
 *   alphanumeric character (lookahead prevents trailing/consecutive hyphens)
 * - [a-z0-9]$  — must end with a lowercase alphanumeric character
 *   (this clause is only reached when length > 1)
 *
 * Single-character slugs that are alphanumeric (e.g. "a", "1") are valid
 * and are matched by the ^[a-z0-9] anchor alone (the final clause allows
 * zero occurrences).
 */
const VALID_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9]))*$/;

// ---------------------------------------------------------------------------
// isValidSlug
// ---------------------------------------------------------------------------

/**
 * Returns true when `raw` is a well-formed URL slug.
 *
 * @param raw - The string to test.
 *
 * @example
 * isValidSlug("hello-world")       // true
 * isValidSlug("typescript-tips-2024") // true
 * isValidSlug("a")                 // true
 * isValidSlug("-starts-with-hyphen") // false
 * isValidSlug("trailing-hyphen-")  // false
 * isValidSlug("double--hyphen")    // false
 * isValidSlug("UpperCase")         // false
 * isValidSlug("")                  // false
 */
export function isValidSlug(raw: string): boolean {
  if (raw.length === 0) return false;
  return VALID_SLUG_REGEX.test(raw);
}

// ---------------------------------------------------------------------------
// normaliseSlug
// ---------------------------------------------------------------------------

/**
 * Converts a raw string into a slug by applying the following
 * transformations in order:
 *
 * 1. Convert to lowercase.
 * 2. Replace any character that is not a-z, 0-9, or a hyphen with a hyphen.
 * 3. Collapse consecutive hyphens into a single hyphen.
 * 4. Strip leading and trailing hyphens.
 *
 * Returns null if the result after normalisation is an empty string (e.g.
 * when the input contained only characters that map to hyphens).
 *
 * @param raw - The raw string to normalise.
 *
 * @example
 * normaliseSlug("Hello World")          // "hello-world"
 * normaliseSlug("  TypeScript Tips  ")  // "typescript-tips"
 * normaliseSlug("Already-a-Slug")       // "already-a-slug"
 * normaliseSlug("post: 2024!")          // "post-2024"
 * normaliseSlug("---")                  // null
 */
export function normaliseSlug(raw: string): string | null {
  const normalised = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalised.length > 0 ? normalised : null;
}
