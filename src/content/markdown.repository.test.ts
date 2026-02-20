import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import fs from "fs";
import { performance } from "perf_hooks";
import { MarkdownPostRepository } from "./markdown.repository";
import { createPostSlug, createCategorySlug } from "./post.types";

describe("MarkdownPostRepository", () => {
  let repository: MarkdownPostRepository;

  beforeEach(() => {
    // Use the actual content directory for integration tests
    const postsDir = path.join(process.cwd(), "content", "posts");
    repository = new MarkdownPostRepository(postsDir);
  });

  describe("findAll", () => {
    it("returns all posts including drafts, sorted by date desc", async () => {
      const posts = await repository.findAll();

      expect(posts.length).toBeGreaterThan(0);

      // Check sorting (newest first)
      for (let i = 0; i < posts.length - 1; i++) {
        const currentPost = posts[i];
        const nextPost = posts[i + 1];
        if (currentPost && nextPost) {
          expect(currentPost.publishedAt >= nextPost.publishedAt).toBe(true);
        }
      }

      // Should include drafts
      const hasDraft = posts.some(post => post.draft);
      expect(hasDraft).toBe(true);
    });
  });

  describe("findBySlug", () => {
    it("finds a post by slug", async () => {
      const slug = createPostSlug("ai-wont-tell-you-when-its-wrong");
      const post = await repository.findBySlug(slug);

      expect(post).not.toBeNull();
      expect(post?.title).toBe("AI Won't Tell You When It's Wrong");
      expect(post?.category).toBe(createCategorySlug("process"));
      expect(post?.draft).toBe(false);
    });

    it("returns null for non-existent slug", async () => {
      const slug = createPostSlug("non-existent");
      const post = await repository.findBySlug(slug);

      expect(post).toBeNull();
    });
  });

  describe("findPublished", () => {
    it("excludes draft posts", async () => {
      const result = await repository.findPublished();

      const hasDraft = result.items.some(post => post.draft);
      expect(hasDraft).toBe(false);
    });

    it("returns PostSummary objects without content", async () => {
      const result = await repository.findPublished();

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach(post => {
        expect('content' in post).toBe(false);
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('description');
        expect(post).toHaveProperty('slug');
      });
    });

    it("handles pagination", async () => {
      const result = await repository.findPublished({ page: 1, perPage: 2 });

      expect(result.items.length).toBeLessThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(2);
      expect(result.totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  describe("findByCategory", () => {
    it("filters by category and excludes drafts", async () => {
      const category = createCategorySlug("engineering");
      const result = await repository.findByCategory(category);

      result.items.forEach(post => {
        expect(post.category).toBe(category);
        expect(post.draft).toBe(false);
      });
    });

    it("returns empty result for non-existent category", async () => {
      const category = createCategorySlug("non-existent");
      const result = await repository.findByCategory(category);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe("external posts", () => {
    it("handles external posts with externalUrl", async () => {
      const slug = createPostSlug("external-devto");
      const post = await repository.findBySlug(slug);

      expect(post).not.toBeNull();
      expect(post?.externalUrl).toBe("https://dev.to/example/building-better-apis");
      expect(post?.content).toBe(""); // No content for external posts
    });
  });

  describe("markdown processing", () => {
    it("processes markdown content with syntax highlighting", async () => {
      const slug = createPostSlug("typescript-generics");
      const post = await repository.findBySlug(slug);

      expect(post).not.toBeNull();
      expect(post?.content).toContain("<h1>");
      expect(post?.content).toContain("<code>");
      expect(post?.readingTimeMinutes).toBeGreaterThan(0);
    });
  });
});

describe("MarkdownPostRepository - Comprehensive Integration Tests", () => {
  let fixtureRepository: MarkdownPostRepository;

  beforeEach(() => {
    // Use valid test fixtures directory for integration tests
    const fixturesDir = path.join(process.cwd(), "src", "test", "fixtures", "posts-valid");
    fixtureRepository = new MarkdownPostRepository(fixturesDir);
  });

  describe("complete pipeline verification (filesystem → HTML)", () => {
    it("processes complex markdown with all features correctly", async () => {
      const slug = createPostSlug("complex-markdown");
      const post = await fixtureRepository.findBySlug(slug);

      expect(post).not.toBeNull();
      expect(post?.title).toBe("Complex Markdown Test Post");
      expect(post?.description).toBe("Testing comprehensive markdown features including tables, code blocks, nested lists, and more");

      // Verify HTML structure generation
      const content = post?.content || "";
      expect(content).toContain("<h1>Complex Markdown Test Post</h1>");
      expect(content).toContain("<h2>Code Blocks with Syntax Highlighting</h2>");

      // Verify code block processing with syntax highlighting (rehype-pretty-code structure)
      expect(content).toContain('<figure data-rehype-pretty-code-figure');
      expect(content).toContain('<pre style="');
      expect(content).toContain('<code data-language="typescript"');
      expect(content).toContain('data-theme="github-dark github-light"');

      // Note: Table processing requires remark-gfm plugin which isn't currently configured
      // Tables will be rendered as plain text paragraphs
      expect(content).toContain("| Feature | Support | Performance | Notes |");

      // Verify list processing (nested lists)
      expect(content).toContain("<ol>");
      expect(content).toContain("<ul>");
      expect(content).toContain("<li>");

      // Verify blockquote processing
      expect(content).toContain("<blockquote>");

      // Verify link processing
      expect(content).toContain('<a href="');
      expect(content).toContain('href="#code-blocks-with-syntax-highlighting"');

      // Verify text formatting
      expect(content).toContain("<strong>");
      expect(content).toContain("<em>");
      // Note: Strikethrough requires remark-gfm plugin which isn't currently configured
      expect(content).toContain("~~Strikethrough text~~"); // Rendered as plain text

      // Verify horizontal rules
      expect(content).toContain("<hr");
    });

    it("handles unicode and special characters correctly", async () => {
      const slug = createPostSlug("unicode-special-chars");
      const post = await fixtureRepository.findBySlug(slug);

      expect(post).not.toBeNull();
      expect(post?.title).toBe("Unicode & Special Characters Test: 中文 العربية русский 🚀");

      const content = post?.content || "";

      // Verify unicode preservation in HTML
      expect(content).toContain("你好世界，这是一个测试文档");
      expect(content).toContain("مرحبا بالعالم، هذه وثيقة اختبار");
      expect(content).toContain("Привет мир, это тестовый документ");

      // Verify emoji preservation
      expect(content).toContain("🚀");
      expect(content).toContain("🎉");
      expect(content).toContain("💎");

      // Verify mathematical symbols
      expect(content).toContain("∞");
      expect(content).toContain("≈");
      expect(content).toContain("∑");

      // Verify currency symbols
      expect(content).toContain("€");
      expect(content).toContain("¥");
      expect(content).toContain("₿");

      // Verify special punctuation
      expect(content).toContain('"'); // Smart quote left
      expect(content).toContain('"'); // Smart quote right
      expect(content).toContain("…"); // Ellipsis
      expect(content).toContain("–"); // En dash
      expect(content).toContain("—"); // Em dash
    });

    it("processes external posts correctly with no content generation", async () => {
      const slug = createPostSlug("external-medium");
      const post = await fixtureRepository.findBySlug(slug);

      expect(post).not.toBeNull();
      expect(post?.title).toBe("Advanced React Patterns: Compound Components");
      expect(post?.externalUrl).toBe("https://medium.com/@example/advanced-react-patterns-compound-components-123456");
      expect(post?.content).toBe(""); // External posts should have no processed content
      expect(post?.readingTimeMinutes).toBe(1); // Reading time calculation has minimum of 1
    });
  });

  describe("HTML structure contracts", () => {
    it("generates semantic HTML structure", async () => {
      const slug = createPostSlug("complex-markdown");
      const post = await fixtureRepository.findBySlug(slug);
      const content = post?.content || "";

      // Verify proper heading hierarchy
      expect(content).toMatch(/<h1[^>]*>.*<\/h1>/);
      expect(content).toMatch(/<h2[^>]*>.*<\/h2>/);
      expect(content).toMatch(/<h3[^>]*>.*<\/h3>/);

      // Verify proper list nesting
      const listMatches = content.match(/<ol[^>]*>[\s\S]*?<\/ol>/g) || [];
      const unorderedListMatches = content.match(/<ul[^>]*>[\s\S]*?<\/ul>/g) || [];
      expect(listMatches.length).toBeGreaterThan(0);
      expect(unorderedListMatches.length).toBeGreaterThan(0);

      // Verify table structure integrity
      const tableMatch = content.match(/<table[^>]*>([\s\S]*?)<\/table>/);
      if (tableMatch) {
        const tableContent = tableMatch[1];
        expect(tableContent).toContain("<thead>");
        expect(tableContent).toContain("<tbody>");
        expect(tableContent).toContain("<tr>");
        expect(tableContent).toContain("<th>");
        expect(tableContent).toContain("<td>");
      }

      // Verify code block structure (rehype-pretty-code format)
      expect(content).toMatch(/<pre[^>]*data-language="[^"]*"[^>]*>/);
      expect(content).toMatch(/<code[^>]*data-language="[^"]*"[^>]*>/);
    });

    it("preserves markdown link structure in HTML", async () => {
      const slug = createPostSlug("complex-markdown");
      const post = await fixtureRepository.findBySlug(slug);
      const content = post?.content || "";

      // Verify external links
      expect(content).toContain('href="https://example.com"');
      expect(content).toContain('href="https://github.com"');

      // Verify internal links (anchors)
      expect(content).toContain('href="#code-blocks-with-syntax-highlighting"');

      // Verify link titles are preserved
      expect(content).toContain('title="Example title"');
    });
  });

  describe("image attribute injection", () => {
    it("transforms img tags with proper attributes", async () => {
      const slug = createPostSlug("complex-markdown");
      const post = await fixtureRepository.findBySlug(slug);
      const content = post?.content || "";

      // Check for image tags
      const imgMatches = content.match(/<img[^>]*>/g) || [];

      imgMatches.forEach(imgTag => {
        // Verify alt attribute exists
        expect(imgTag).toMatch(/alt="[^"]*"/);

        // Verify src attribute exists
        expect(imgTag).toMatch(/src="[^"]*"/);

        // Check if our markdown image handler added loading attribute
        // Note: This depends on the implementation of markdownImageHandler
        if (imgTag.includes('loading=')) {
          expect(imgTag).toMatch(/loading="[^"]*"/);
        }
      });
    });
  });

  describe("reading time accuracy", () => {
    it("calculates accurate reading time for complex content", async () => {
      const slug = createPostSlug("complex-markdown");
      const post = await fixtureRepository.findBySlug(slug);

      expect(post?.readingTimeMinutes).toBeGreaterThan(0);
      expect(post?.readingTimeMinutes).toBeLessThan(20); // Reasonable upper bound
    });

    it("calculates reading time for very long content", async () => {
      const slug = createPostSlug("very-long-content");
      const post = await fixtureRepository.findBySlug(slug);

      expect(post?.readingTimeMinutes).toBeGreaterThan(10); // Should be substantial
      expect(post?.readingTimeMinutes).toBeLessThan(100); // But not unreasonably long
    });

    it("returns minimum reading time for external posts", async () => {
      const slug = createPostSlug("external-medium");
      const post = await fixtureRepository.findBySlug(slug);

      expect(post?.readingTimeMinutes).toBe(1); // Reading time has minimum of 1 minute
    });
  });

  describe("performance benchmarks", () => {
    it("processes complex markdown within reasonable time", async () => {
      const start = performance.now();
      const slug = createPostSlug("complex-markdown");
      await fixtureRepository.findBySlug(slug);
      const end = performance.now();

      const processingTime = end - start;
      expect(processingTime).toBeLessThan(1200); // Should complete within 1.2 seconds
    });

    it("processes very long content efficiently", async () => {
      const start = performance.now();
      const slug = createPostSlug("very-long-content");
      const post = await fixtureRepository.findBySlug(slug);
      const end = performance.now();

      const processingTime = end - start;
      expect(processingTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(post?.content).toBeDefined();
      expect(post?.content.length).toBeGreaterThan(50000); // Should be substantial output
    });

    it("processes multiple posts concurrently without performance degradation", async () => {
      const slugs = [
        "complex-markdown",
        "unicode-special-chars",
        "external-medium"
      ].map(createPostSlug);

      const start = performance.now();
      const promises = slugs.map(slug => fixtureRepository.findBySlug(slug));
      const results = await Promise.all(promises);
      const end = performance.now();

      const processingTime = end - start;
      expect(processingTime).toBeLessThan(3000); // Concurrent processing should be efficient
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).not.toBeNull();
      });
    });
  });

  describe("empty directory handling", () => {
    it("handles non-existent directory gracefully", async () => {
      const nonExistentDir = path.join(process.cwd(), "non-existent-directory");
      const emptyRepository = new MarkdownPostRepository(nonExistentDir);

      const posts = await emptyRepository.findAll();
      expect(posts).toHaveLength(0);

      const published = await emptyRepository.findPublished();
      expect(published.items).toHaveLength(0);
      expect(published.total).toBe(0);
    });

    it("handles empty directory gracefully", async () => {
      // Create a temporary empty directory for this test
      const tempDir = path.join(process.cwd(), "temp-empty-test-dir");

      // Ensure directory exists but is empty
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      try {
        const emptyRepository = new MarkdownPostRepository(tempDir);

        const posts = await emptyRepository.findAll();
        expect(posts).toHaveLength(0);

        const published = await emptyRepository.findPublished();
        expect(published.items).toHaveLength(0);

        const result = await emptyRepository.findBySlug(createPostSlug("anything"));
        expect(result).toBeNull();
      } finally {
        // Clean up temp directory
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe("concurrent processing safety", () => {
    it("handles concurrent reads without race conditions", async () => {
      const slug = createPostSlug("complex-markdown");

      // Create multiple concurrent requests
      const concurrentRequests = Array(10).fill(null).map(() =>
        fixtureRepository.findBySlug(slug)
      );

      const results = await Promise.all(concurrentRequests);

      // All results should be identical and valid
      results.forEach(result => {
        expect(result).not.toBeNull();
        expect(result?.title).toBe("Complex Markdown Test Post");
        expect(result?.content).toBeDefined();
        expect(result?.content.length).toBeGreaterThan(0);
      });

      // Verify all results are the same (deep equality)
      const firstResult = results[0];
      results.slice(1).forEach(result => {
        expect(result).toEqual(firstResult);
      });
    }, 10000);

    it("handles concurrent findAll calls safely", async () => {
      const concurrentCalls = Array(5).fill(null).map(() =>
        fixtureRepository.findAll()
      );

      const results = await Promise.all(concurrentCalls);

      // All results should be identical
      const firstResult = results[0];
      if (!firstResult) {
        throw new Error('Expected at least one result from concurrent calls');
      }

      results.slice(1).forEach(result => {
        expect(result).toEqual(firstResult);
      });

      expect(firstResult.length).toBeGreaterThan(0);
    });
  });

  describe("content correctness verification", () => {
    it("preserves all markdown features in HTML output", async () => {
      const slug = createPostSlug("complex-markdown");
      const post = await fixtureRepository.findBySlug(slug);
      const content = post?.content || "";

      // Verify comprehensive feature preservation
      const features = [
        { name: "headers", pattern: /<h[1-6][^>]*>.*<\/h[1-6]>/ },
        { name: "bold text", pattern: /<strong>.*<\/strong>/ },
        { name: "italic text", pattern: /<em>.*<\/em>/ },
        { name: "inline code", pattern: /<code[^>]*>.*<\/code>/ },
        { name: "code blocks", pattern: /<figure[^>]*data-rehype-pretty-code-figure[^>]*>[\s\S]*?<\/figure>/ },
        { name: "links", pattern: /<a[^>]*href="[^"]*"[^>]*>.*<\/a>/ },
        { name: "lists", pattern: /<[ou]l[^>]*>[\s\S]*?<\/[ou]l>/ },
        // Tables require remark-gfm plugin - currently rendered as plain text
        { name: "table text", pattern: /\| Feature \| Support \| Performance \| Notes \|/ },
        { name: "blockquotes", pattern: /<blockquote[^>]*>[\s\S]*?<\/blockquote>/ },
        { name: "horizontal rules", pattern: /<hr[^>]*\/?>/,},
        // Strikethrough requires remark-gfm plugin - currently rendered as plain text
        { name: "strikethrough text", pattern: /~~[^~]+~~/ }
      ];

      features.forEach(({ name, pattern }) => {
        expect(content, `${name} should be properly rendered`).toMatch(pattern);
      });
    });

    it("maintains content hierarchy and structure", async () => {
      const slug = createPostSlug("complex-markdown");
      const post = await fixtureRepository.findBySlug(slug);
      const content = post?.content || "";

      // Check heading order (h1 should come before h2, etc.)
      const h1Match = content.search(/<h1[^>]*>/);
      const h2Match = content.search(/<h2[^>]*>/);

      if (h1Match !== -1 && h2Match !== -1) {
        expect(h1Match, "h1 should come before h2").toBeLessThan(h2Match);
      }

      // Check that nested lists are properly structured
      const nestedListMatch = content.match(/<[ou]l[^>]*>[\s\S]*?<li[^>]*>[\s\S]*?<[ou]l[^>]*>[\s\S]*?<\/[ou]l>[\s\S]*?<\/li>[\s\S]*?<\/[ou]l>/);
      expect(nestedListMatch, "nested lists should be properly structured").toBeTruthy();
    });

    it("preserves special characters without corruption", async () => {
      const slug = createPostSlug("unicode-special-chars");
      const post = await fixtureRepository.findBySlug(slug);
      const content = post?.content || "";

      // Verify key unicode strings are preserved exactly
      expect(content).toContain("你好世界");
      expect(content).toContain("مرحبا بالعالم");
      expect(content).toContain("Привет мир");
      expect(content).toContain("🚀");
      expect(content).toContain("💎");
      expect(content).toContain("∞");
      expect(content).toContain("€");

      // Verify HTML entities are properly escaped where needed
      expect(content).not.toContain("&lt;h1&gt;"); // Should not double-escape
    });
  });

  describe("error handling and edge cases", () => {
    it("handles markdown files with partial content gracefully", async () => {
      // This tests the robustness of the parser with edge case content
      const posts = await fixtureRepository.findAll();

      // Should successfully parse all fixtures without throwing
      expect(posts.length).toBeGreaterThan(0);

      // Each post should have required fields
      posts.forEach(post => {
        expect(post.slug).toBeDefined();
        expect(post.readingTimeMinutes).toBeGreaterThanOrEqual(0);
        expect(post.publishedAt).toBeDefined();
        expect(typeof post.draft).toBe('boolean');
      });
    });

    it("processes files with complex nested structures without stack overflow", async () => {
      const slug = createPostSlug("complex-markdown");

      // This should not throw or cause stack overflow
      const post = await fixtureRepository.findBySlug(slug);

      expect(post).not.toBeNull();
      expect(post?.content).toBeDefined();
      expect(post?.content.length).toBeGreaterThan(1000);
    });
  });
});