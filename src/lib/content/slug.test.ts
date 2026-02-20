/**
 * slug.test.ts
 *
 * Use-case driven tests for slug validation and normalisation utilities.
 *
 * Structure follows the TDD principle of describing behaviour through
 * scenario names rather than implementation details.  Each describe block
 * maps to a function; tests within it map to observable outcomes.
 */

import { describe, it, expect } from "vitest";
import { isValidSlug, normaliseSlug } from "./slug";

// ---------------------------------------------------------------------------
// isValidSlug
// ---------------------------------------------------------------------------

describe("isValidSlug", () => {
  describe("valid slugs", () => {
    it("accepts a simple lowercase word", () => {
      expect(isValidSlug("hello")).toBe(true);
    });

    it("accepts a hyphen-separated multi-word slug", () => {
      expect(isValidSlug("hello-world")).toBe(true);
    });

    it("accepts a slug containing digits", () => {
      expect(isValidSlug("typescript-tips-2024")).toBe(true);
    });

    it("accepts a single lowercase letter", () => {
      expect(isValidSlug("a")).toBe(true);
    });

    it("accepts a single digit", () => {
      expect(isValidSlug("1")).toBe(true);
    });

    it("accepts a slug with digits between hyphens", () => {
      expect(isValidSlug("post-2024-01-15")).toBe(true);
    });

    it("accepts a slug that starts with a digit", () => {
      expect(isValidSlug("2024-review")).toBe(true);
    });

    it("accepts a slug that ends with a digit", () => {
      expect(isValidSlug("version-2")).toBe(true);
    });

    it("accepts a slug that is only digits", () => {
      expect(isValidSlug("12345")).toBe(true);
    });
  });

  describe("invalid slugs — structural violations", () => {
    it("rejects an empty string", () => {
      expect(isValidSlug("")).toBe(false);
    });

    it("rejects a slug that starts with a hyphen", () => {
      expect(isValidSlug("-hello")).toBe(false);
    });

    it("rejects a slug that ends with a hyphen", () => {
      expect(isValidSlug("hello-")).toBe(false);
    });

    it("rejects a slug with consecutive hyphens", () => {
      expect(isValidSlug("hello--world")).toBe(false);
    });

    it("rejects a slug that is only a hyphen", () => {
      expect(isValidSlug("-")).toBe(false);
    });

    it("rejects a slug that is only hyphens", () => {
      expect(isValidSlug("---")).toBe(false);
    });
  });

  describe("invalid slugs — disallowed characters", () => {
    it("rejects uppercase letters", () => {
      expect(isValidSlug("Hello")).toBe(false);
    });

    it("rejects all-uppercase slug", () => {
      expect(isValidSlug("HELLO-WORLD")).toBe(false);
    });

    it("rejects a slug with spaces", () => {
      expect(isValidSlug("hello world")).toBe(false);
    });

    it("rejects a slug with underscore", () => {
      expect(isValidSlug("hello_world")).toBe(false);
    });

    it("rejects a slug with a forward slash", () => {
      expect(isValidSlug("path/segment")).toBe(false);
    });

    it("rejects a slug with a period", () => {
      expect(isValidSlug("file.name")).toBe(false);
    });

    it("rejects a slug with unicode characters", () => {
      expect(isValidSlug("résumé")).toBe(false);
    });

    it("rejects a slug with a colon", () => {
      expect(isValidSlug("post:title")).toBe(false);
    });

    it("rejects a slug with an exclamation mark", () => {
      expect(isValidSlug("hello!")).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// normaliseSlug
// ---------------------------------------------------------------------------

describe("normaliseSlug", () => {
  describe("basic normalisation", () => {
    it("lowercases the input", () => {
      expect(normaliseSlug("Hello")).toBe("hello");
    });

    it("converts spaces to hyphens", () => {
      expect(normaliseSlug("hello world")).toBe("hello-world");
    });

    it("converts multiple consecutive spaces to a single hyphen", () => {
      expect(normaliseSlug("hello   world")).toBe("hello-world");
    });

    it("lowercases and hyphenates a mixed-case title", () => {
      expect(normaliseSlug("TypeScript Tips")).toBe("typescript-tips");
    });

    it("strips leading whitespace", () => {
      expect(normaliseSlug("  hello")).toBe("hello");
    });

    it("strips trailing whitespace", () => {
      expect(normaliseSlug("hello  ")).toBe("hello");
    });

    it("handles a string with both leading and trailing spaces", () => {
      expect(normaliseSlug("  hello world  ")).toBe("hello-world");
    });
  });

  describe("special character replacement", () => {
    it("replaces colon with a hyphen", () => {
      expect(normaliseSlug("post: 2024")).toBe("post-2024");
    });

    it("replaces exclamation mark with a hyphen and collapses it", () => {
      expect(normaliseSlug("hello!")).toBe("hello");
    });

    it("replaces periods with hyphens", () => {
      expect(normaliseSlug("v1.2.3")).toBe("v1-2-3");
    });

    it("replaces underscores with hyphens", () => {
      expect(normaliseSlug("hello_world")).toBe("hello-world");
    });

    it("replaces forward slashes with hyphens", () => {
      expect(normaliseSlug("path/to/post")).toBe("path-to-post");
    });

    it("replaces unicode characters with hyphens and collapses", () => {
      expect(normaliseSlug("café")).toBe("caf");
    });

    it("strips leading hyphens produced by replacement", () => {
      expect(normaliseSlug("!hello")).toBe("hello");
    });

    it("strips trailing hyphens produced by replacement", () => {
      expect(normaliseSlug("hello!")).toBe("hello");
    });
  });

  describe("already-valid slug passthrough", () => {
    it("returns an already-valid slug unchanged", () => {
      expect(normaliseSlug("hello-world")).toBe("hello-world");
    });

    it("lowercases an otherwise-valid mixed-case slug", () => {
      expect(normaliseSlug("Already-a-Slug")).toBe("already-a-slug");
    });
  });

  describe("null return cases", () => {
    it("returns null for an empty string", () => {
      expect(normaliseSlug("")).toBeNull();
    });

    it("returns null for a string composed entirely of hyphens", () => {
      expect(normaliseSlug("---")).toBeNull();
    });

    it("returns null for a string of only special characters", () => {
      expect(normaliseSlug("!@#$%")).toBeNull();
    });

    it("returns null for a string of only whitespace", () => {
      expect(normaliseSlug("   ")).toBeNull();
    });
  });

  describe("round-trip consistency with isValidSlug", () => {
    it("normalised output satisfies isValidSlug when result is non-null", () => {
      const inputs = [
        "Hello World",
        "TypeScript Tips 2024",
        "My Post: A Deep Dive",
        "already-valid",
        "v1.2.3",
      ];
      for (const input of inputs) {
        const slug = normaliseSlug(input);
        if (slug !== null) {
          expect(isValidSlug(slug)).toBe(true);
        }
      }
    });
  });
});
