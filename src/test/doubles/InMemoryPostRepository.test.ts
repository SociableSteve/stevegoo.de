/**
 * InMemoryPostRepository tests
 *
 * These tests verify that the test double upholds the PostRepository contract.
 * They exercise every method across the full range of expected use cases —
 * not just the happy path — so that consuming tests can rely on the double's
 * behaviour without re-testing the repository contract themselves.
 *
 * Testing approach:
 * - Each describe block corresponds to one repository method.
 * - Tests use the default fixture seed (ALL_POSTS) for scenarios that span
 *   the whole dataset and a custom seed for focused/edge-case scenarios.
 * - Assertions target observable outputs (item counts, field values, metadata)
 *   rather than internal state.
 */

import { describe, it, expect } from "vitest";
import { InMemoryPostRepository } from "./InMemoryPostRepository";
import { buildPost, buildPosts, createPostSlug } from "@/test/helpers/post.builders";
import {
  ALL_POSTS,
  PUBLISHED_POSTS,
  POST_TYPESCRIPT_GENERICS,
  POST_CLEAN_ARCHITECTURE,
  POST_DRAFT_WIP,
  POST_DRAFT_NO_CATEGORY,
  POST_EXTERNAL_DEVTO,
} from "@/test/fixtures/post.fixtures";

// ---------------------------------------------------------------------------
// findAll
// ---------------------------------------------------------------------------

describe("InMemoryPostRepository.findAll", () => {
  it("returns all seeded posts including drafts", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findAll();
    expect(result).toHaveLength(ALL_POSTS.length);
  });

  it("includes draft posts in the result", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findAll();
    const draftSlugs = result.filter((p) => p.draft).map((p) => p.slug);
    expect(draftSlugs).toContain(POST_DRAFT_WIP.slug);
    expect(draftSlugs).toContain(POST_DRAFT_NO_CATEGORY.slug);
  });

  it("returns posts sorted by publishedAt descending", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findAll();
    for (let i = 0; i < result.length - 1; i++) {
      const current = result[i];
      const next = result[i + 1];
      expect(
        (current?.publishedAt ?? "") >= (next?.publishedAt ?? ""),
      ).toBe(true);
    }
  });

  it("returns an empty array when seeded with no posts", async () => {
    const repo = new InMemoryPostRepository([]);
    const result = await repo.findAll();
    expect(result).toHaveLength(0);
  });

  it("returns a single post when seeded with one post", async () => {
    const singlePost = buildPost({ slug: createPostSlug("only-post") });
    const repo = new InMemoryPostRepository([singlePost]);
    const result = await repo.findAll();
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("only-post");
  });

  it("does not mutate the original seed array", async () => {
    const seed = [
      buildPost({ publishedAt: "2024-01-01", slug: createPostSlug("a") }),
      buildPost({ publishedAt: "2024-03-01", slug: createPostSlug("b") }),
    ];
    const repo = new InMemoryPostRepository(seed);
    await repo.findAll();
    // The original seed order (a, b) must be unchanged
    expect(seed[0]?.slug).toBe("a");
    expect(seed[1]?.slug).toBe("b");
  });
});

// ---------------------------------------------------------------------------
// findBySlug
// ---------------------------------------------------------------------------

describe("InMemoryPostRepository.findBySlug", () => {
  it("returns a published post by its slug", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findBySlug(POST_TYPESCRIPT_GENERICS.slug);
    expect(result).not.toBeNull();
    expect(result?.slug).toBe(POST_TYPESCRIPT_GENERICS.slug);
    expect(result?.title).toBe(POST_TYPESCRIPT_GENERICS.title);
  });

  it("returns a draft post by its slug (drafts are not filtered)", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findBySlug(POST_DRAFT_WIP.slug);
    expect(result).not.toBeNull();
    expect(result?.draft).toBe(true);
  });

  it("returns null for a slug that does not exist in the repository", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findBySlug(createPostSlug("does-not-exist"));
    expect(result).toBeNull();
  });

  it("returns null from an empty repository", async () => {
    const repo = new InMemoryPostRepository([]);
    const result = await repo.findBySlug(createPostSlug("anything"));
    expect(result).toBeNull();
  });

  it("returns the full Post with content field present", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findBySlug(POST_CLEAN_ARCHITECTURE.slug);
    expect(result).toHaveProperty("content");
    expect(typeof result?.content).toBe("string");
  });

  it("returns the external article post with an externalUrl", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findBySlug(POST_EXTERNAL_DEVTO.slug);
    expect(result?.externalUrl).toBe("https://dev.to/author/building-accessible-forms");
  });

});

// ---------------------------------------------------------------------------
// findPublished
// ---------------------------------------------------------------------------

describe("InMemoryPostRepository.findPublished", () => {
  it("returns only published (non-draft) posts", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findPublished({ page: 1, perPage: 100 });
    const hasDraft = result.items.some((p) => p.draft);
    expect(hasDraft).toBe(false);
  });

  it("returns the correct total count of published posts", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findPublished({ page: 1, perPage: 100 });
    expect(result.total).toBe(PUBLISHED_POSTS.length);
  });

  it("returns PostSummary objects (no content field)", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findPublished({ page: 1, perPage: 100 });
    for (const summary of result.items) {
      expect("content" in summary).toBe(false);
    }
  });

  it("returns items sorted by publishedAt descending", async () => {
    const repo = new InMemoryPostRepository();
    const result = await repo.findPublished({ page: 1, perPage: 100 });
    const dates = result.items.map((p) => p.publishedAt);
    for (let i = 0; i < dates.length - 1; i++) {
      expect((dates[i] ?? "") >= (dates[i + 1] ?? "")).toBe(true);
    }
  });

  describe("pagination", () => {
    it("returns the first page of results when page=1", async () => {
      const repo = new InMemoryPostRepository();
      const result = await repo.findPublished({ page: 1, perPage: 3 });
      expect(result.items).toHaveLength(3);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(3);
    });

    it("returns the correct second page", async () => {
      const repo = new InMemoryPostRepository();
      const page1 = await repo.findPublished({ page: 1, perPage: 3 });
      const page2 = await repo.findPublished({ page: 2, perPage: 3 });

      // Pages must not overlap
      const page1Slugs = page1.items.map((p) => p.slug);
      const page2Slugs = page2.items.map((p) => p.slug);
      const overlap = page1Slugs.filter((s) => page2Slugs.includes(s));
      expect(overlap).toHaveLength(0);
    });

    it("calculates totalPages correctly", async () => {
      const repo = new InMemoryPostRepository();
      const result = await repo.findPublished({ page: 1, perPage: 3 });
      const expected = Math.ceil(PUBLISHED_POSTS.length / 3);
      expect(result.totalPages).toBe(expected);
    });

    it("returns empty items and preserves metadata when page exceeds totalPages", async () => {
      const repo = new InMemoryPostRepository();
      const result = await repo.findPublished({ page: 999, perPage: 10 });
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(PUBLISHED_POSTS.length);
      expect(result.page).toBe(999);
      expect(result.perPage).toBe(10);
    });

    it("returns all items on a single page when perPage is large", async () => {
      const repo = new InMemoryPostRepository();
      const result = await repo.findPublished({ page: 1, perPage: 1000 });
      expect(result.items).toHaveLength(PUBLISHED_POSTS.length);
      expect(result.totalPages).toBe(1);
    });

    it("returns exactly perPage items on a full page", async () => {
      const seed = buildPosts(10, "2024-06-01", { draft: false });
      const repo = new InMemoryPostRepository(seed);
      const result = await repo.findPublished({ page: 1, perPage: 4 });
      expect(result.items).toHaveLength(4);
    });

    it("returns a partial last page when total is not divisible by perPage", async () => {
      // 10 posts with perPage=3: pages are [3,3,3,1]
      const seed = buildPosts(10, "2024-06-01", { draft: false });
      const repo = new InMemoryPostRepository(seed);
      const lastPage = await repo.findPublished({ page: 4, perPage: 3 });
      expect(lastPage.items).toHaveLength(1);
    });

    it("totalPages is at least 1 even when there are no posts", async () => {
      const repo = new InMemoryPostRepository([]);
      const result = await repo.findPublished({ page: 1, perPage: 10 });
      expect(result.totalPages).toBe(1);
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });
});


// ---------------------------------------------------------------------------
// Cross-method contract consistency
// ---------------------------------------------------------------------------

describe("InMemoryPostRepository — cross-method contract consistency", () => {
  it("findAll total equals findPublished total plus draft count", async () => {
    const repo = new InMemoryPostRepository();
    const allPosts = await repo.findAll();
    const published = await repo.findPublished({ page: 1, perPage: 1000 });

    const draftCount = allPosts.filter((p) => p.draft).length;
    expect(allPosts.length).toBe(published.total + draftCount);
  });

  it("findBySlug result matches the corresponding findAll entry", async () => {
    const repo = new InMemoryPostRepository();
    const all = await repo.findAll();
    const first = all[0];
    if (!first) return; // Guard for empty seed (shouldn't happen here)

    const bySlug = await repo.findBySlug(first.slug);
    expect(bySlug).toEqual(first);
  });

  it("findPublished page 1 first item slug matches the most recent published post", async () => {
    const repo = new InMemoryPostRepository();
    const published = await repo.findPublished({ page: 1, perPage: 10 });
    const mostRecent = PUBLISHED_POSTS[0]; // Already sorted newest-first in fixture
    expect(published.items[0]?.slug).toBe(mostRecent?.slug);
  });

});
