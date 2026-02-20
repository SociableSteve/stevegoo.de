import { describe, it, expect } from "vitest";
import {
  PostFrontmatterSchema,
  createPostSlug,
  createCategorySlug,
  type PostSlug,
  type CategorySlug,
  type Post,
  type PostSummary,
} from "./post.types";

// ---------------------------------------------------------------------------
// Branded type compile-time tests
// ---------------------------------------------------------------------------
// These are type-level assertions verified by tsc; they exercise the branded
// type constraint without needing runtime assertions.
// ---------------------------------------------------------------------------

function _acceptsPostSlug(_slug: PostSlug): void {
  // intentionally empty - tests that the branded type is accepted
}

function _acceptsCategorySlug(_slug: CategorySlug): void {
  // intentionally empty
}

// Verify the factory functions return the correct branded shapes at runtime
describe("createPostSlug", () => {
  it("wraps a raw string into a PostSlug", () => {
    const slug = createPostSlug("my-post");
    expect(slug).toBe("my-post");
    // TypeScript: the function signature ensures it returns PostSlug
    _acceptsPostSlug(slug);
  });

  it("preserves the exact string value", () => {
    const raw = "hello-world-2024";
    expect(createPostSlug(raw)).toBe(raw);
  });

  it("accepts slugs with hyphens and digits", () => {
    const slug = createPostSlug("typescript-tips-2024-01");
    expect(typeof slug).toBe("string");
    _acceptsPostSlug(slug);
  });
});

describe("createCategorySlug", () => {
  it("wraps a raw string into a CategorySlug", () => {
    const slug = createCategorySlug("engineering");
    expect(slug).toBe("engineering");
    _acceptsCategorySlug(slug);
  });

  it("preserves the exact string value", () => {
    const raw = "web-development";
    expect(createCategorySlug(raw)).toBe(raw);
  });
});

// ---------------------------------------------------------------------------
// PostFrontmatterSchema — Zod validation
// ---------------------------------------------------------------------------

describe("PostFrontmatterSchema", () => {
  describe("valid inputs", () => {
    it("parses a minimal valid frontmatter object", () => {
      const input = {
        title: "My Post",
        description: "A description.",
        publishedAt: "2024-03-15",
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("My Post");
        expect(result.data.draft).toBe(false);
        expect(result.data.tags).toEqual([]);
      }
    });

    it("parses a complete frontmatter with all optional fields present", () => {
      const input = {
        title: "Full Post",
        description: "Full description.",
        publishedAt: "2024-03-15",
        updatedAt: "2024-04-01",
        tags: ["typescript", "nextjs"],
        category: "engineering",
        draft: true,
        externalUrl: "https://example.com/my-post",
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.updatedAt).toBe("2024-04-01");
        expect(result.data.category).toBe("engineering");
        expect(result.data.draft).toBe(true);
        expect(result.data.externalUrl).toBe("https://example.com/my-post");
      }
    });

    it("accepts null for optional fields (nullish pattern)", () => {
      const input = {
        title: "Post",
        description: "Desc.",
        publishedAt: "2024-01-01",
        updatedAt: null,
        category: null,
        externalUrl: null,
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it("accepts undefined for optional fields (nullish pattern)", () => {
      const input = {
        title: "Post",
        description: "Desc.",
        publishedAt: "2024-01-01",
        // updatedAt, category, externalUrl all absent
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it("defaults draft to false when absent", () => {
      const input = { title: "T", description: "D", publishedAt: "2024-01-01" };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.draft).toBe(false);
      }
    });

    it("defaults tags to empty array when absent", () => {
      const input = { title: "T", description: "D", publishedAt: "2024-01-01" };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });

    it("accepts a valid external URL", () => {
      const input = {
        title: "T",
        description: "D",
        publishedAt: "2024-01-01",
        externalUrl: "https://dev.to/author/some-post",
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it("accepts tags array with multiple items", () => {
      const input = {
        title: "T",
        description: "D",
        publishedAt: "2024-01-01",
        tags: ["react", "typescript", "testing"],
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toHaveLength(3);
      }
    });
  });

  describe("invalid inputs", () => {
    it("rejects missing title", () => {
      const input = { description: "D", publishedAt: "2024-01-01" };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it("rejects empty title string", () => {
      const input = { title: "", description: "D", publishedAt: "2024-01-01" };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it("rejects missing description", () => {
      const input = { title: "T", publishedAt: "2024-01-01" };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it("rejects empty description string", () => {
      const input = { title: "T", description: "", publishedAt: "2024-01-01" };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it("rejects missing publishedAt", () => {
      const input = { title: "T", description: "D" };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it("rejects publishedAt with wrong format (DD-MM-YYYY)", () => {
      const input = {
        title: "T",
        description: "D",
        publishedAt: "15-01-2024",
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it("rejects publishedAt with wrong format (MM/DD/YYYY)", () => {
      const input = {
        title: "T",
        description: "D",
        publishedAt: "01/15/2024",
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it("rejects invalid external URL (not a URL)", () => {
      const input = {
        title: "T",
        description: "D",
        publishedAt: "2024-01-01",
        externalUrl: "not-a-url",
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it("rejects updatedAt with wrong format", () => {
      const input = {
        title: "T",
        description: "D",
        publishedAt: "2024-01-01",
        updatedAt: "Jan 1 2024",
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it("rejects non-boolean draft field", () => {
      const input = {
        title: "T",
        description: "D",
        publishedAt: "2024-01-01",
        draft: "yes",
      };

      const result = PostFrontmatterSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe("publishedAt date format edge cases", () => {
    it("accepts the earliest valid date string", () => {
      const result = PostFrontmatterSchema.safeParse({
        title: "T",
        description: "D",
        publishedAt: "2000-01-01",
      });
      expect(result.success).toBe(true);
    });

    it("accepts a leap year date", () => {
      const result = PostFrontmatterSchema.safeParse({
        title: "T",
        description: "D",
        publishedAt: "2024-02-29",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a date with extra characters", () => {
      const result = PostFrontmatterSchema.safeParse({
        title: "T",
        description: "D",
        publishedAt: "2024-01-01T00:00:00",
      });
      expect(result.success).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// Post and PostSummary structural type tests
// ---------------------------------------------------------------------------
// Verify that the exported types have the expected shape by constructing
// valid objects and using them where the types are expected.

describe("Post type structure", () => {
  it("accepts a valid Post object with all required and optional fields", () => {
    const post: Post = {
      slug: createPostSlug("test-post"),
      title: "Test Post",
      description: "A description.",
      publishedAt: "2024-01-01",
      updatedAt: null,
      tags: ["typescript"],
      category: null,
      draft: false,
      externalUrl: null,
      content: "<p>Hello</p>",
      readingTimeMinutes: 3,
    };

    expect(post.slug).toBe("test-post");
    expect(post.readingTimeMinutes).toBe(3);
  });

  it("accepts a Post representing an external article", () => {
    const externalPost: Post = {
      slug: createPostSlug("external-article"),
      title: "Published on Dev.to",
      description: "My article cross-posted.",
      publishedAt: "2024-06-01",
      updatedAt: null,
      tags: [],
      category: null,
      draft: false,
      externalUrl: "https://dev.to/author/my-article",
      content: "",
      readingTimeMinutes: 5,
    };

    expect(externalPost.externalUrl).toBe("https://dev.to/author/my-article");
  });
});

describe("PostSummary type structure", () => {
  it("accepts a valid PostSummary without content field", () => {
    const summary: PostSummary = {
      slug: createPostSlug("summary-post"),
      title: "Summary Post",
      description: "Brief description.",
      publishedAt: "2024-02-01",
      updatedAt: null,
      tags: ["nextjs"],
      category: null,
      draft: false,
      externalUrl: null,
      readingTimeMinutes: 2,
    };

    expect(summary.slug).toBe("summary-post");
    // PostSummary must NOT have a content field - verified by the type
    expect("content" in summary).toBe(false);
  });
});
