/**
 * date-format.test.ts
 *
 * Use-case driven tests for date formatting utilities.
 *
 * Tests cover:
 *  1. formatDisplayDate — long month format used in post headers
 *  2. formatShortDate   — abbreviated format used in listing cards
 *  3. toIsoDatetime     — <time dateTime> attribute helper
 *  4. isAfter           — chronological comparison utility
 *
 * Each test scenario corresponds to a real rendering situation a consumer
 * would encounter, making the suite readable as usage documentation.
 */

import { describe, it, expect } from "vitest";
import {
  formatDisplayDate,
  formatShortDate,
  toIsoDatetime,
  isAfter,
} from "./date-format";

// ---------------------------------------------------------------------------
// formatDisplayDate
// ---------------------------------------------------------------------------

describe("formatDisplayDate", () => {
  describe("correct long-format output", () => {
    it("formats a mid-year date with a two-digit day", () => {
      expect(formatDisplayDate("2024-06-15")).toBe("June 15, 2024");
    });

    it("formats a January date (first month boundary)", () => {
      expect(formatDisplayDate("2024-01-01")).toBe("January 1, 2024");
    });

    it("formats a December date (last month boundary)", () => {
      expect(formatDisplayDate("2024-12-31")).toBe("December 31, 2024");
    });

    it("formats a single-digit day without zero-padding in the output", () => {
      expect(formatDisplayDate("2024-03-01")).toBe("March 1, 2024");
    });

    it("formats February 29 on a leap year", () => {
      expect(formatDisplayDate("2024-02-29")).toBe("February 29, 2024");
    });

    it("formats a date from a past year correctly", () => {
      expect(formatDisplayDate("2020-11-05")).toBe("November 5, 2020");
    });

    it("formats a date from the year 2000", () => {
      expect(formatDisplayDate("2000-01-01")).toBe("January 1, 2000");
    });
  });

  describe("timezone safety — dates must not shift by one day", () => {
    it("January 1 remains January 1 regardless of environment timezone", () => {
      // This is the classic UTC-minus trap: new Date("2024-01-01") in UTC-5
      // produces Dec 31, 2023 at 19:00 local time.
      const result = formatDisplayDate("2024-01-01");
      expect(result).toBe("January 1, 2024");
    });

    it("December 31 remains December 31", () => {
      const result = formatDisplayDate("2023-12-31");
      expect(result).toBe("December 31, 2023");
    });

    it("March 1 non-leap year does not shift to February 29", () => {
      const result = formatDisplayDate("2023-03-01");
      expect(result).toBe("March 1, 2023");
    });
  });

  describe("malformed input passthrough", () => {
    it("returns the original string for an empty input", () => {
      expect(formatDisplayDate("")).toBe("");
    });

    it("returns the original string when format is DD-MM-YYYY", () => {
      expect(formatDisplayDate("15-01-2024")).toBe("15-01-2024");
    });

    it("returns the original string for a plain word", () => {
      expect(formatDisplayDate("not-a-date")).toBe("not-a-date");
    });

    it("returns the original string for an ISO datetime with time component", () => {
      expect(formatDisplayDate("2024-01-15T12:00:00")).toBe(
        "2024-01-15T12:00:00",
      );
    });
  });
});

// ---------------------------------------------------------------------------
// formatShortDate
// ---------------------------------------------------------------------------

describe("formatShortDate", () => {
  describe("correct abbreviated-format output", () => {
    it("abbreviates June correctly", () => {
      expect(formatShortDate("2024-06-15")).toBe("Jun 15, 2024");
    });

    it("abbreviates January correctly", () => {
      expect(formatShortDate("2024-01-01")).toBe("Jan 1, 2024");
    });

    it("abbreviates November correctly", () => {
      expect(formatShortDate("2024-11-01")).toBe("Nov 1, 2024");
    });

    it("abbreviates September correctly", () => {
      expect(formatShortDate("2024-09-05")).toBe("Sep 5, 2024");
    });

    it("abbreviates February on a leap year correctly", () => {
      expect(formatShortDate("2024-02-29")).toBe("Feb 29, 2024");
    });

    it("formats a single-digit day without zero-padding", () => {
      expect(formatShortDate("2024-03-01")).toBe("Mar 1, 2024");
    });
  });

  describe("timezone safety", () => {
    it("January 1 remains January 1 in short format", () => {
      expect(formatShortDate("2024-01-01")).toBe("Jan 1, 2024");
    });

    it("December 31 remains December 31 in short format", () => {
      expect(formatShortDate("2023-12-31")).toBe("Dec 31, 2023");
    });
  });

  describe("malformed input passthrough", () => {
    it("returns the original string for an empty input", () => {
      expect(formatShortDate("")).toBe("");
    });

    it("returns the original string for a non-date string", () => {
      expect(formatShortDate("hello")).toBe("hello");
    });
  });

  describe("difference from formatDisplayDate", () => {
    it("produces a shorter string than formatDisplayDate for the same date", () => {
      const date = "2024-06-15";
      expect(formatShortDate(date).length).toBeLessThan(
        formatDisplayDate(date).length,
      );
    });
  });
});

// ---------------------------------------------------------------------------
// toIsoDatetime
// ---------------------------------------------------------------------------

describe("toIsoDatetime", () => {
  describe("valid YYYY-MM-DD inputs", () => {
    it("returns the input unchanged for a standard date", () => {
      expect(toIsoDatetime("2024-01-15")).toBe("2024-01-15");
    });

    it("returns the input unchanged for January 1", () => {
      expect(toIsoDatetime("2024-01-01")).toBe("2024-01-01");
    });

    it("returns the input unchanged for December 31", () => {
      expect(toIsoDatetime("2024-12-31")).toBe("2024-12-31");
    });

    it("returns the input unchanged for a leap day", () => {
      expect(toIsoDatetime("2024-02-29")).toBe("2024-02-29");
    });
  });

  describe("invalid inputs return null", () => {
    it("returns null for an empty string", () => {
      expect(toIsoDatetime("")).toBeNull();
    });

    it("returns null for a plain word", () => {
      expect(toIsoDatetime("not-a-date")).toBeNull();
    });

    it("returns null when format is DD-MM-YYYY", () => {
      expect(toIsoDatetime("15-01-2024")).toBeNull();
    });

    it("returns null for an ISO datetime string with a time component", () => {
      expect(toIsoDatetime("2024-01-15T00:00:00")).toBeNull();
    });

    it("returns null for a partial date (YYYY-MM only)", () => {
      expect(toIsoDatetime("2024-01")).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// isAfter
// ---------------------------------------------------------------------------

describe("isAfter", () => {
  it("returns true when the first date is in a later year", () => {
    expect(isAfter("2025-01-01", "2024-01-01")).toBe(true);
  });

  it("returns true when the first date is in a later month of the same year", () => {
    expect(isAfter("2024-06-01", "2024-01-01")).toBe(true);
  });

  it("returns true when the first date is a later day in the same month", () => {
    expect(isAfter("2024-01-15", "2024-01-01")).toBe(true);
  });

  it("returns false when the first date is in an earlier year", () => {
    expect(isAfter("2023-12-31", "2024-01-01")).toBe(false);
  });

  it("returns false when the first date is in an earlier month", () => {
    expect(isAfter("2024-01-01", "2024-06-01")).toBe(false);
  });

  it("returns false when both dates are equal", () => {
    expect(isAfter("2024-01-01", "2024-01-01")).toBe(false);
  });

  it("correctly identifies newest date for sorting", () => {
    const dates = [
      "2024-01-10",
      "2024-03-15",
      "2024-02-20",
      "2023-11-20",
    ];
    // Sort using isAfter to produce descending order
    const sorted = [...dates].sort((a, b) =>
      isAfter(a, b) ? -1 : isAfter(b, a) ? 1 : 0,
    );
    expect(sorted).toEqual([
      "2024-03-15",
      "2024-02-20",
      "2024-01-10",
      "2023-11-20",
    ]);
  });
});
