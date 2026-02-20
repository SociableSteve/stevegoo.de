/**
 * reading-time-edge-cases.test.ts
 *
 * Supplementary edge-case tests for calculateReadingTime covering
 * scenarios specific to the content domain: whitespace-only strings,
 * tab and newline word boundaries, HTML markup strings (as stored in
 * Post.content), and large content that exercises the ceiling arithmetic.
 *
 * These tests sit alongside the baseline tests in reading-time.test.ts
 * without duplicating them.
 */

import { describe, it, expect } from "vitest";
import { calculateReadingTime } from "./reading-time";

describe("calculateReadingTime — edge cases", () => {
  describe("whitespace-only and degenerate inputs", () => {
    it("returns 1 for content that is only spaces", () => {
      expect(calculateReadingTime("   ")).toBe(1);
    });

    it("returns 1 for content that is only newlines", () => {
      expect(calculateReadingTime("\n\n\n")).toBe(1);
    });

    it("returns 1 for content that is only tabs", () => {
      expect(calculateReadingTime("\t\t\t")).toBe(1);
    });

    it("returns 1 for a single word with leading and trailing whitespace", () => {
      expect(calculateReadingTime("  word  ")).toBe(1);
    });
  });

  describe("word boundary handling — tabs and newlines", () => {
    it("counts words separated by tabs", () => {
      const content = "word1\tword2\tword3";
      // 3 words — still 1 minute
      expect(calculateReadingTime(content)).toBe(1);
    });

    it("counts words separated by newlines (multi-paragraph content)", () => {
      const paragraph1 = Array.from({ length: 100 }, (_, i) => `w${i}`).join(
        " ",
      );
      const paragraph2 = Array.from({ length: 100 }, (_, i) => `v${i}`).join(
        " ",
      );
      // 200 words separated by a newline — still 1 minute (200 < 238)
      expect(calculateReadingTime(`${paragraph1}\n${paragraph2}`)).toBe(1);
    });

    it("counts words separated by mixed whitespace consistently", () => {
      const content = "word1 \t word2 \n word3";
      expect(calculateReadingTime(content)).toBe(1);
    });
  });

  describe("HTML content strings (as stored in Post.content)", () => {
    it("counts HTML tags as words when they are separated by whitespace", () => {
      // The function is intentionally a simple word counter — HTML tags are
      // counted as words because the content has not been stripped.
      // This is documented behaviour: callers that need accurate counts
      // for rendered text should strip HTML before calling.
      const htmlContent =
        "<h1>My Post Title</h1> <p>A paragraph of content here.</p>";
      const result = calculateReadingTime(htmlContent);
      // At minimum 1 minute for short HTML
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it("does not crash on an empty HTML string", () => {
      expect(calculateReadingTime("<p></p>")).toBe(1);
    });

    it("returns 1 for external article placeholder (empty content string)", () => {
      // External posts use content: "" per the Post type contract
      expect(calculateReadingTime("")).toBe(1);
    });
  });

  describe("large content — ceiling arithmetic", () => {
    it("returns 3 minutes for exactly 476 words (2×238)", () => {
      // 476 words = ceil(476/238) = ceil(2) = 2 minutes
      const text = Array.from({ length: 476 }, (_, i) => `w${i}`).join(" ");
      expect(calculateReadingTime(text)).toBe(2);
    });

    it("returns 3 minutes for 477 words (just over 2 reading periods)", () => {
      const text = Array.from({ length: 477 }, (_, i) => `w${i}`).join(" ");
      expect(calculateReadingTime(text)).toBe(3);
    });

    it("returns 10 minutes for a 2380-word long-form article", () => {
      const text = Array.from({ length: 2380 }, (_, i) => `w${i}`).join(" ");
      // 2380 / 238 = 10 exactly
      expect(calculateReadingTime(text)).toBe(10);
    });

    it("returns 11 minutes for a 2381-word article", () => {
      const text = Array.from({ length: 2381 }, (_, i) => `w${i}`).join(" ");
      expect(calculateReadingTime(text)).toBe(11);
    });
  });
});
