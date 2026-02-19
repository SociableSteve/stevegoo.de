import { describe, it, expect } from "vitest";
import { calculateReadingTime } from "./reading-time";

describe("calculateReadingTime", () => {
  it("returns 1 minute for empty content", () => {
    expect(calculateReadingTime("")).toBe(1);
  });

  it("returns 1 minute for very short content", () => {
    expect(calculateReadingTime("Hello world")).toBe(1);
  });

  it("returns 1 minute for exactly the average words per minute", () => {
    const text = Array.from({ length: 238 }, (_, i) => `word${i}`).join(" ");
    expect(calculateReadingTime(text)).toBe(1);
  });

  it("returns 2 minutes for content that exceeds one reading period", () => {
    const text = Array.from({ length: 239 }, (_, i) => `word${i}`).join(" ");
    expect(calculateReadingTime(text)).toBe(2);
  });

  it("returns correct minute count for a typical blog post", () => {
    // 476 words = ceil(476/238) = 2 minutes
    const text = Array.from({ length: 476 }, (_, i) => `word${i}`).join(" ");
    expect(calculateReadingTime(text)).toBe(2);
  });

  it("ignores extra whitespace when counting words", () => {
    const textWithSpaces = "word1  word2   word3";
    expect(calculateReadingTime(textWithSpaces)).toBe(1);
  });
});
