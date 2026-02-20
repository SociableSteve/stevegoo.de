import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// site.config tests
//
// The config module reads from process.env at import time, so we must control
// environment variables before importing the module. We use dynamic imports
// inside tests to re-evaluate the module with the desired env state.
// ---------------------------------------------------------------------------

describe("SiteConfigSchema", () => {
  it("exports a parseSiteConfig function", async () => {
    const mod = await import("./site.config");
    expect(typeof mod.parseSiteConfig).toBe("function");
  });

  it("exports SITE_CONFIG as the validated configuration object", async () => {
    const mod = await import("./site.config");
    expect(mod.SITE_CONFIG).toBeDefined();
    expect(typeof mod.SITE_CONFIG).toBe("object");
  });
});

describe("parseSiteConfig", () => {
  describe("valid configuration", () => {
    it("parses a minimal valid configuration with required fields only", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "A personal blog.",
        authorName: "Jane Doe",
        authorEmail: "jane@example.com",
      };

      const result = parseSiteConfig(input);

      expect(result.siteUrl).toBe("https://example.com");
      expect(result.siteName).toBe("My Site");
      expect(result.authorName).toBe("Jane Doe");
    });

    it("parses configuration with all optional social links present", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "Blog.",
        authorName: "Jane",
        authorEmail: "jane@example.com",
        twitterHandle: "@jane",
        githubUsername: "jane-doe",
        linkedinUsername: "janedoe",
      };

      const result = parseSiteConfig(input);

      expect(result.twitterHandle).toBe("@jane");
      expect(result.githubUsername).toBe("jane-doe");
      expect(result.linkedinUsername).toBe("janedoe");
    });

    it("sets postsPerPage to 10 when not specified", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "Blog.",
        authorName: "Jane",
        authorEmail: "jane@example.com",
      };

      const result = parseSiteConfig(input);

      expect(result.postsPerPage).toBe(10);
    });

    it("accepts a custom postsPerPage value", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "Blog.",
        authorName: "Jane",
        authorEmail: "jane@example.com",
        postsPerPage: 5,
      };

      const result = parseSiteConfig(input);

      expect(result.postsPerPage).toBe(5);
    });

    it("accepts null for optional social fields", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "Blog.",
        authorName: "Jane",
        authorEmail: "jane@example.com",
        twitterHandle: null,
        githubUsername: null,
        linkedinUsername: null,
      };

      const result = parseSiteConfig(input);

      expect(result.twitterHandle).toBeNull();
    });
  });

  describe("invalid configuration", () => {
    it("throws when siteUrl is not a valid URL", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "not-a-url",
        siteName: "My Site",
        siteDescription: "Blog.",
        authorName: "Jane",
        authorEmail: "jane@example.com",
      };

      expect(() => parseSiteConfig(input)).toThrow();
    });

    it("throws when siteName is empty", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "",
        siteDescription: "Blog.",
        authorName: "Jane",
        authorEmail: "jane@example.com",
      };

      expect(() => parseSiteConfig(input)).toThrow();
    });

    it("throws when authorEmail is not a valid email", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "Blog.",
        authorName: "Jane",
        authorEmail: "not-an-email",
      };

      expect(() => parseSiteConfig(input)).toThrow();
    });

    it("throws when postsPerPage is less than 1", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "Blog.",
        authorName: "Jane",
        authorEmail: "jane@example.com",
        postsPerPage: 0,
      };

      expect(() => parseSiteConfig(input)).toThrow();
    });

    it("throws when postsPerPage is not an integer", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "Blog.",
        authorName: "Jane",
        authorEmail: "jane@example.com",
        postsPerPage: 5.5,
      };

      expect(() => parseSiteConfig(input)).toThrow();
    });

    it("throws when authorName is missing", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "Blog.",
        authorEmail: "jane@example.com",
      };

      expect(() => parseSiteConfig(input)).toThrow();
    });

    it("throws when siteDescription is empty", async () => {
      const { parseSiteConfig } = await import("./site.config");

      const input = {
        siteUrl: "https://example.com",
        siteName: "My Site",
        siteDescription: "",
        authorName: "Jane",
        authorEmail: "jane@example.com",
      };

      expect(() => parseSiteConfig(input)).toThrow();
    });
  });

  describe("SITE_CONFIG default values", () => {
    it("SITE_CONFIG has postsPerPage property", async () => {
      const { SITE_CONFIG } = await import("./site.config");
      expect(typeof SITE_CONFIG.postsPerPage).toBe("number");
      expect(SITE_CONFIG.postsPerPage).toBeGreaterThan(0);
    });

    it("SITE_CONFIG has siteUrl property", async () => {
      const { SITE_CONFIG } = await import("./site.config");
      expect(typeof SITE_CONFIG.siteUrl).toBe("string");
      expect(SITE_CONFIG.siteUrl.length).toBeGreaterThan(0);
    });

    it("SITE_CONFIG has authorName property", async () => {
      const { SITE_CONFIG } = await import("./site.config");
      expect(typeof SITE_CONFIG.authorName).toBe("string");
      expect(SITE_CONFIG.authorName.length).toBeGreaterThan(0);
    });
  });
});
