/**
 * post.fixtures.ts
 *
 * Canonical test data for the Post domain.
 *
 * Design decisions:
 * - Every fixture is a plain object literal typed as `Post` so TypeScript
 *   validates the shape at compile time without requiring a factory function.
 * - Fixtures cover the full space of scenarios exercised by the repository
 *   contract and listing-page use cases:
 *     1. Published posts with category and tags
 *     2. Draft posts (must be excluded by findPublished / findByCategory)
 *     3. External articles (externalUrl set, content empty)
 *     4. Posts with optional fields absent (updatedAt, category, externalUrl)
 *     5. Posts spread across multiple categories for pagination testing
 * - Dates are formatted as YYYY-MM-DD per the PostFrontmatterSchema contract.
 * - readingTimeMinutes values are realistic (derived from content word counts)
 *   rather than arbitrary sentinels, making them usable in integration tests.
 */

import {
  createPostSlug,
  type Post,
  type PostSummary,
} from "@/content/post.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strips the `content` field to produce a PostSummary.
 * Used internally so fixtures don't have to duplicate every field.
 */
function toSummary(post: Post): PostSummary {
  const { content: _content, ...summary } = post;
  return summary;
}

// ---------------------------------------------------------------------------
// 1. Published posts — engineering category
// ---------------------------------------------------------------------------

export const POST_TYPESCRIPT_GENERICS: Post = {
  slug: createPostSlug("understanding-typescript-generics"),
  title: "Understanding TypeScript Generics",
  description:
    "A deep dive into generic types, constraints, and advanced patterns for building reusable, type-safe TypeScript code.",
  publishedAt: "2024-03-15",
  updatedAt: "2024-04-01",
  tags: ["typescript", "generics", "type-safety", "engineering"],
  draft: false,
  externalUrl: null,
  content:
    "<h1>Understanding TypeScript Generics</h1><p>Generics are one of the most powerful features in TypeScript...</p>",
  readingTimeMinutes: 8,
};

export const POST_CLEAN_ARCHITECTURE: Post = {
  slug: createPostSlug("clean-architecture-nextjs"),
  title: "Clean Architecture in Next.js Applications",
  description:
    "How to apply the Dependency Inversion Principle and port/adapter pattern to structure scalable Next.js projects.",
  publishedAt: "2024-02-20",
  updatedAt: null,
  tags: ["nextjs", "architecture", "solid", "engineering"],
  draft: false,
  externalUrl: null,
  content:
    "<h1>Clean Architecture in Next.js</h1><p>The key to maintainability is isolating business logic from framework concerns...</p>",
  readingTimeMinutes: 12,
};

export const POST_REACT_TESTING: Post = {
  slug: createPostSlug("react-testing-patterns"),
  title: "React Testing Patterns That Scale",
  description:
    "Use-case driven testing with Testing Library: how to write tests that survive refactoring and document real behaviour.",
  publishedAt: "2024-01-10",
  updatedAt: null,
  tags: ["react", "testing", "vitest", "engineering"],
  draft: false,
  externalUrl: null,
  content:
    "<h1>React Testing Patterns That Scale</h1><p>Testing implementation details leads to brittle suites...</p>",
  readingTimeMinutes: 6,
};

// ---------------------------------------------------------------------------
// 2. Published posts — career category
// ---------------------------------------------------------------------------

export const POST_DEVELOPER_PORTFOLIO: Post = {
  slug: createPostSlug("building-a-developer-portfolio"),
  title: "Building a Developer Portfolio That Gets You Hired",
  description:
    "Practical advice on what to include, how to structure case studies, and which projects signal the right skills.",
  publishedAt: "2024-05-01",
  updatedAt: null,
  tags: ["career", "portfolio", "jobs"],
  draft: false,
  externalUrl: null,
  content:
    "<h1>Building a Developer Portfolio</h1><p>Your portfolio is your professional handshake...</p>",
  readingTimeMinutes: 7,
};

export const POST_CODE_REVIEW: Post = {
  slug: createPostSlug("effective-code-review"),
  title: "Effective Code Review: A Practical Guide",
  description:
    "How to give feedback that improves the codebase without derailing team dynamics.",
  publishedAt: "2024-04-12",
  updatedAt: null,
  tags: ["code-review", "teamwork", "engineering", "career"],
  draft: false,
  externalUrl: null,
  content:
    "<h1>Effective Code Review</h1><p>A well-run code review process is a force multiplier for the whole team...</p>",
  readingTimeMinutes: 5,
};

// ---------------------------------------------------------------------------
// 3. Draft post — must never appear in published listings
// ---------------------------------------------------------------------------

export const POST_DRAFT_WIP: Post = {
  slug: createPostSlug("draft-work-in-progress"),
  title: "Draft: Advanced Compiler Plugins (WIP)",
  description:
    "Work in progress — exploring TypeScript compiler API to build custom transformations.",
  publishedAt: "2024-06-01",
  updatedAt: null,
  tags: ["typescript", "compiler", "engineering"],
  draft: true,
  externalUrl: null,
  content: "<h1>Draft Post</h1><p>This is a work in progress...</p>",
  readingTimeMinutes: 3,
};

export const POST_DRAFT_NO_CATEGORY: Post = {
  slug: createPostSlug("draft-uncategorised"),
  title: "Draft: Miscellaneous Notes",
  description: "Assorted notes without a permanent home.",
  publishedAt: "2024-07-15",
  updatedAt: null,
  tags: [],
  draft: true,
  externalUrl: null,
  content: "<p>Notes...</p>",
  readingTimeMinutes: 1,
};

// ---------------------------------------------------------------------------
// 4. External articles — externalUrl set, content is empty string
// ---------------------------------------------------------------------------

export const POST_EXTERNAL_DEVTO: Post = {
  slug: createPostSlug("building-accessible-forms-devto"),
  title: "Building Accessible Forms with React Hook Form",
  description:
    "Originally published on Dev.to — a step-by-step guide to ARIA-compliant form patterns.",
  publishedAt: "2023-11-20",
  updatedAt: null,
  tags: ["react", "accessibility", "forms", "engineering"],
  draft: false,
  externalUrl: "https://dev.to/author/building-accessible-forms",
  content: "",
  readingTimeMinutes: 9,
};

export const POST_EXTERNAL_MEDIUM: Post = {
  slug: createPostSlug("ten-lessons-from-a-decade-of-code"),
  title: "Ten Lessons From a Decade of Writing Code",
  description:
    "Cross-posted from Medium — reflections on a decade as a professional software engineer.",
  publishedAt: "2023-09-05",
  updatedAt: null,
  tags: ["career", "reflections"],
  draft: false,
  externalUrl: "https://medium.com/@author/ten-lessons",
  content: "",
  readingTimeMinutes: 11,
};

// ---------------------------------------------------------------------------
// 5. Posts with optional fields absent (null / undefined)
// ---------------------------------------------------------------------------

/**
 * A published post with no category — exercises the null category code paths
 * inside the repository and listing-page components.
 */
export const POST_NO_CATEGORY: Post = {
  slug: createPostSlug("hello-world"),
  title: "Hello, World",
  description: "My first post on this site — a brief introduction.",
  publishedAt: "2023-01-01",
  updatedAt: undefined,
  tags: [],
  draft: false,
  externalUrl: null,
  content: "<h1>Hello, World</h1><p>Welcome to my blog.</p>",
  readingTimeMinutes: 1,
};

/**
 * A published post with both updatedAt and externalUrl absent,
 * exercising the nullish field rendering paths.
 */
export const POST_MINIMAL_FIELDS: Post = {
  slug: createPostSlug("minimal-fields-post"),
  title: "A Post With Only Required Fields",
  description: "This post has no optional metadata beyond the bare minimum.",
  publishedAt: "2023-03-10",
  updatedAt: null,
  tags: ["engineering"],
  draft: false,
  externalUrl: null,
  content: "<p>Minimal content.</p>",
  readingTimeMinutes: 1,
};

// ---------------------------------------------------------------------------
// Named collections — pre-assembled sets for common test scenarios
// ---------------------------------------------------------------------------

/**
 * All posts including drafts.
 * Equivalent to what PostRepository.findAll() should return.
 * Ordered newest-first by publishedAt.
 */
export const ALL_POSTS: readonly Post[] = [
  POST_DRAFT_NO_CATEGORY, // 2024-07-15
  POST_DRAFT_WIP, // 2024-06-01
  POST_DEVELOPER_PORTFOLIO, // 2024-05-01
  POST_CODE_REVIEW, // 2024-04-12
  POST_TYPESCRIPT_GENERICS, // 2024-03-15
  POST_CLEAN_ARCHITECTURE, // 2024-02-20
  POST_REACT_TESTING, // 2024-01-10
  POST_EXTERNAL_DEVTO, // 2023-11-20
  POST_EXTERNAL_MEDIUM, // 2023-09-05
  POST_MINIMAL_FIELDS, // 2023-03-10
  POST_NO_CATEGORY, // 2023-01-01
];

/**
 * Only published (draft: false) posts, newest-first.
 * Equivalent to what findPublished should draw from.
 */
export const PUBLISHED_POSTS: readonly Post[] = ALL_POSTS.filter(
  (p) => !p.draft,
);

/**
 * Published posts tagged with "engineering", newest-first.
 */
export const ENGINEERING_POSTS: readonly Post[] = PUBLISHED_POSTS.filter(
  (p) => p.tags.includes("engineering"),
);

/**
 * Published posts tagged with "career", newest-first.
 */
export const CAREER_POSTS: readonly Post[] = PUBLISHED_POSTS.filter(
  (p) => p.tags.includes("career"),
);

// ---------------------------------------------------------------------------
// PostSummary projections (content field stripped)
// ---------------------------------------------------------------------------

export const SUMMARY_TYPESCRIPT_GENERICS: PostSummary =
  toSummary(POST_TYPESCRIPT_GENERICS);
export const SUMMARY_CLEAN_ARCHITECTURE: PostSummary =
  toSummary(POST_CLEAN_ARCHITECTURE);
export const SUMMARY_REACT_TESTING: PostSummary =
  toSummary(POST_REACT_TESTING);
export const SUMMARY_DEVELOPER_PORTFOLIO: PostSummary =
  toSummary(POST_DEVELOPER_PORTFOLIO);
export const SUMMARY_CODE_REVIEW: PostSummary = toSummary(POST_CODE_REVIEW);
export const SUMMARY_EXTERNAL_DEVTO: PostSummary =
  toSummary(POST_EXTERNAL_DEVTO);
export const SUMMARY_EXTERNAL_MEDIUM: PostSummary =
  toSummary(POST_EXTERNAL_MEDIUM);
export const SUMMARY_NO_CATEGORY: PostSummary = toSummary(POST_NO_CATEGORY);
export const SUMMARY_MINIMAL_FIELDS: PostSummary =
  toSummary(POST_MINIMAL_FIELDS);
