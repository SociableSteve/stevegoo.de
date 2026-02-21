import type { Post, PostSummary, PostSlug } from "./post.types";

// ---------------------------------------------------------------------------
// Pagination support types
// ---------------------------------------------------------------------------

/**
 * Cursor-free, page-number-based pagination parameters.
 *
 * Both fields are required at the interface boundary to make the caller
 * explicit about pagination intent.  Callers that want all results should
 * fetch page 1 with a large `perPage` value or use a dedicated `findAll`
 * method.
 */
export interface PaginationParams {
  /** 1-based page number. */
  readonly page: number;
  /** Maximum number of items to return per page. */
  readonly perPage: number;
}

/**
 * A single page of results together with total-count metadata so that
 * consumers can render paginators without issuing a second count query.
 */
export interface PaginatedResult<T> {
  /** Items on this page. May be empty when `page` exceeds `totalPages`. */
  readonly items: readonly T[];
  /** Total number of matching items across all pages. */
  readonly total: number;
  /** The page number that was requested. */
  readonly page: number;
  /** The perPage value that was used. */
  readonly perPage: number;
  /** Derived: `Math.ceil(total / perPage)`.  Always at least 1. */
  readonly totalPages: number;
}

// ---------------------------------------------------------------------------
// PostRepository — the port (interface)
//
// This interface defines the contract that the application layer expects from
// any content source.  It is intentionally free of implementation details so
// that the initial markdown-file adapter, a future headless CMS adapter, or
// a test double can each satisfy it without any changes to callers.
//
// Naming follows the Repository pattern from Domain-Driven Design.  All
// methods return Promises so that both synchronous (filesystem at build time)
// and asynchronous (CMS API) implementations conform to the same interface.
//
// Dependency Inversion Principle: higher-level modules (pages, use-case
// functions) depend on this abstraction, not on filesystem or HTTP details.
// ---------------------------------------------------------------------------

export interface PostRepository {
  /**
   * Returns every post in the repository, regardless of draft status.
   *
   * Intended for internal tooling (e.g. sitemap generation, RSS feed for
   * all posts including drafts in a preview environment).  Production
   * listing pages should prefer `findPublished`.
   *
   * @returns All posts sorted by `publishedAt` descending (newest first).
   */
  findAll(): Promise<readonly Post[]>;

  /**
   * Returns a single post by its branded slug.
   *
   * @param slug - The PostSlug to look up.
   * @returns The matching Post, or `null` if no post exists for that slug.
   */
  findBySlug(slug: PostSlug): Promise<Post | null>;


  /**
   * Returns a paginated page of published posts across all categories.
   *
   * Only posts where `draft === false` are included.  Returns PostSummary
   * projections to avoid loading full HTML content for listing pages.
   *
   * Posts are sorted by `publishedAt` descending (newest first) so that the
   * most recent content appears at the top of listing pages.
   *
   * @param pagination - Page and perPage parameters.
   * @returns A paginated result containing PostSummary projections.
   */
  findPublished(
    pagination: PaginationParams,
  ): Promise<PaginatedResult<PostSummary>>;
}
