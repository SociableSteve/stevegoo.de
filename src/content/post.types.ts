import { z } from "zod";

// ---------------------------------------------------------------------------
// Branded primitive types
//
// Branded types attach a phantom property to a primitive to prevent
// accidental mixing of semantically different string values at compile time.
// The `_brand` field exists only in the type system — it carries no runtime
// representation, so there is zero performance overhead.
//
// Example: passing a CategorySlug where a PostSlug is expected becomes a
// type error, even though both are strings at runtime.
// ---------------------------------------------------------------------------

declare const _brand: unique symbol;

type Brand<T, B> = T & { readonly [_brand]: B };

/** A URL-safe slug string that uniquely identifies a Post. */
export type PostSlug = Brand<string, "PostSlug">;


/**
 * Constructs a PostSlug from a raw string.
 *
 * This is the only intended way to create a PostSlug value. All values
 * that come from untrusted sources (filesystem paths, query params) should
 * pass through this function so that callers know the type is intentional.
 */
export function createPostSlug(raw: string): PostSlug {
  return raw as PostSlug;
}


// ---------------------------------------------------------------------------
// Zod schema — PostFrontmatter
//
// Uses `.nullish()` instead of `.optional()` throughout for compatibility
// with `exactOptionalPropertyTypes: true`. Under this strict TypeScript
// flag, `T | undefined` and a missing property are distinct types. Zod's
// `.optional()` on its own does not produce a stable round-trip through
// the Zod infer type; `.nullish()` (which is `.optional().nullable()`)
// lets callers pass `null`, `undefined`, or omit the key entirely.
// ---------------------------------------------------------------------------

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const PostFrontmatterSchema = z.object({
  /** Post headline shown in listings and as the HTML <title>. */
  title: z.string().min(1),

  /** Short summary used in <meta description> and listing cards. */
  description: z.string().min(1),

  /**
   * ISO 8601 calendar date of original publication (YYYY-MM-DD).
   * Time and timezone components are deliberately excluded to avoid
   * timezone-related off-by-one rendering issues in static sites.
   */
  publishedAt: z.string().regex(ISO_DATE_REGEX, {
    message: "publishedAt must be in YYYY-MM-DD format",
  }),

  /**
   * ISO 8601 calendar date of last meaningful update (YYYY-MM-DD).
   * Use null or omit when the post has not been updated since publication.
   */
  updatedAt: z
    .string()
    .regex(ISO_DATE_REGEX, { message: "updatedAt must be in YYYY-MM-DD format" })
    .nullish(),

  /** Taxonomy tags for filtering and discovery. Defaults to empty array. */
  tags: z.array(z.string()).default([]),


  /**
   * When true, the post is excluded from published listings.
   * Defaults to false so posts are published unless explicitly marked.
   */
  draft: z.boolean().default(false),

  /**
   * Absolute URL of the canonical source when this post was originally
   * published on an external platform (e.g. Dev.to, Medium).
   * Null/omitted for posts whose canonical home is this site.
   */
  externalUrl: z.string().url().nullish(),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

// ---------------------------------------------------------------------------
// Post — the full domain entity
//
// Extends the parsed frontmatter with the slug (derived from filename),
// the rendered HTML content, and the calculated reading time.  The slug uses
// the branded PostSlug type rather than a plain string so that repository
// methods and routing utilities cannot accidentally receive an unvalidated
// string from an index access.
// ---------------------------------------------------------------------------

export interface Post {
  /** Branded slug, derived from the markdown filename. */
  readonly slug: PostSlug;

  // Frontmatter fields inlined for ergonomic access
  readonly title: string;
  readonly description: string;
  readonly publishedAt: string;
  readonly updatedAt: string | null | undefined;
  readonly tags: string[];
  readonly draft: boolean;
  readonly externalUrl: string | null | undefined;

  /** Rendered HTML body of the post. Empty string for pure external articles. */
  readonly content: string;

  /** Estimated reading time in whole minutes (minimum 1). */
  readonly readingTimeMinutes: number;
}

// ---------------------------------------------------------------------------
// PostSummary — lightweight projection for listing pages
//
// Listing pages (e.g. /blog) do not need the full HTML content of every post.
// PostSummary is Post without `content`, which avoids loading kilobytes of
// HTML for each card rendered in a listing.  This follows the Interface
// Segregation Principle: consumers that only need summary data depend only
// on the smaller PostSummary interface.
// ---------------------------------------------------------------------------

export type PostSummary = Omit<Post, "content">;
