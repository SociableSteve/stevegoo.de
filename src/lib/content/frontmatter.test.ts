import { describe, it, expect } from "vitest";
import { parseFrontmatter } from "./frontmatter";

const VALID_POST = `---
title: My First Post
description: This is a description
publishedAt: 2024-01-15
tags:
  - typescript
  - nextjs
draft: false
---

# Content here

Some body content.`;

describe("parseFrontmatter", () => {
  describe("successful parsing", () => {
    it("parses a valid post with all required fields", () => {
      const { frontmatter } = parseFrontmatter(VALID_POST);
      expect(frontmatter.title).toBe("My First Post");
      expect(frontmatter.description).toBe("This is a description");
      expect(frontmatter.publishedAt).toBe("2024-01-15");
    });

    it("parses tags array correctly", () => {
      const { frontmatter } = parseFrontmatter(VALID_POST);
      expect(frontmatter.tags).toEqual(["typescript", "nextjs"]);
    });

    it("parses boolean draft field as false", () => {
      const { frontmatter } = parseFrontmatter(VALID_POST);
      expect(frontmatter.draft).toBe(false);
    });

    it("returns body content without frontmatter block", () => {
      const { body } = parseFrontmatter(VALID_POST);
      expect(body).toContain("# Content here");
      expect(body).not.toContain("---");
    });

    it("defaults draft to false when not specified", () => {
      const raw = `---
title: Test Post
description: A test
publishedAt: 2024-01-15
---

Body`;
      const { frontmatter } = parseFrontmatter(raw);
      expect(frontmatter.draft).toBe(false);
    });

    it("defaults tags to empty array when not specified", () => {
      const raw = `---
title: Test Post
description: A test
publishedAt: 2024-01-15
---

Body`;
      const { frontmatter } = parseFrontmatter(raw);
      expect(frontmatter.tags).toEqual([]);
    });
  });

  describe("validation failures", () => {
    it("throws when frontmatter block is missing", () => {
      expect(() => parseFrontmatter("No frontmatter here")).toThrow(
        "Missing or malformed frontmatter block",
      );
    });

    it("throws when title is missing", () => {
      const raw = `---
description: A test
publishedAt: 2024-01-15
---

Body`;
      expect(() => parseFrontmatter(raw)).toThrow();
    });

    it("throws when publishedAt has invalid date format", () => {
      const raw = `---
title: Test
description: A test
publishedAt: 15-01-2024
---

Body`;
      expect(() => parseFrontmatter(raw)).toThrow();
    });
  });
});
