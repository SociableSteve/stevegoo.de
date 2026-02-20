/**
 * post.builders.ts
 *
 * Builder utilities for constructing Post and PostSummary test objects.
 *
 * Design decisions:
 * - `buildPost` merges caller-supplied partial overrides onto a sensible
 *   default, removing the repetition of specifying every required field in
 *   each individual test.
 * - `buildPostSummary` mirrors buildPost but omits `content`, matching the
 *   PostSummary projection returned by findPublished / findByCategory.
 * - Defaults are deliberately generic ("test-post", "2024-01-01") so that
 *   tests that only care about one field are not confused by fixture-flavoured
 *   data bleeding in from another concern.
 * - `buildPosts` constructs N posts with unique slugs and staggered dates,
 *   useful for pagination tests where the exact content is irrelevant.
 *
 * Single Responsibility: builders know about Post shapes only. They do not
 * know about the repository or any infrastructure concern.
 */

import {
  createPostSlug,
  createCategorySlug,
  type Post,
  type PostSummary,
  type PostSlug,
  type CategorySlug,
} from "@/content/post.types";

// ---------------------------------------------------------------------------
// Default base — valid in all scenarios where no override is supplied
// ---------------------------------------------------------------------------

const DEFAULT_POST: Post = {
  slug: createPostSlug("test-post"),
  title: "Test Post",
  description: "A test post used as a builder default.",
  publishedAt: "2024-01-01",
  updatedAt: null,
  tags: [],
  category: null,
  draft: false,
  externalUrl: null,
  content: "<p>Default test content.</p>",
  readingTimeMinutes: 1,
};

// ---------------------------------------------------------------------------
// Post builder
// ---------------------------------------------------------------------------

/**
 * Constructs a valid Post by merging the supplied partial overrides onto
 * the default base object.
 *
 * @example
 * // Published engineering post with specific slug
 * const post = buildPost({ slug: createPostSlug("my-post"), category: "engineering" });
 *
 * @example
 * // Draft post
 * const draft = buildPost({ draft: true });
 */
export function buildPost(overrides: Partial<Post> = {}): Post {
  return { ...DEFAULT_POST, ...overrides };
}

/**
 * Constructs a valid PostSummary by merging the supplied partial overrides
 * onto the default base (sans content field).
 */
export function buildPostSummary(
  overrides: Partial<PostSummary> = {},
): PostSummary {
  const { content: _omit, ...defaultSummary } = DEFAULT_POST;
  return { ...defaultSummary, ...overrides };
}

// ---------------------------------------------------------------------------
// Bulk builder — unique slugs and staggered publish dates
// ---------------------------------------------------------------------------

/**
 * Constructs an array of `count` Post objects with unique slugs derived from
 * an index.  The `publishedAt` dates step backwards from the supplied base
 * date (one day per post) so the first element is the newest.
 *
 * Callers may supply a shared `overrides` object to set a common field across
 * all generated posts (e.g. `{ category: "engineering", draft: false }`).
 *
 * @param count - Number of posts to generate.
 * @param baseDate - ISO date string (YYYY-MM-DD) for the first (newest) post.
 * @param overrides - Optional shared field overrides applied to each post.
 *
 * @example
 * // Ten published engineering posts for a pagination test
 * const posts = buildPosts(10, "2024-06-01", {
 *   category: "engineering",
 *   draft: false,
 * });
 */
export function buildPosts(
  count: number,
  baseDate = "2024-06-01",
  overrides: Omit<Partial<Post>, "slug" | "publishedAt"> = {},
): Post[] {
  const [year, month, day] = baseDate.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const base = new Date(year, (month ?? 1) - 1, day ?? 1);

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(base);
    date.setDate(date.getDate() - i);
    const publishedAt = date.toISOString().slice(0, 10);

    return buildPost({
      ...overrides,
      slug: createPostSlug(`generated-post-${String(i + 1).padStart(3, "0")}`),
      publishedAt,
    });
  });
}

// ---------------------------------------------------------------------------
// Slug / category helpers — keep branded-type construction out of test files
// ---------------------------------------------------------------------------

/**
 * Convenience wrapper so test files import one module instead of two.
 */
export { createPostSlug, createCategorySlug };
export type { PostSlug, CategorySlug };
