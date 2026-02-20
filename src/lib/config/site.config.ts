import { z } from "zod";

// ---------------------------------------------------------------------------
// SiteConfigSchema — Zod schema for site-wide configuration
//
// All fields that callers must query at runtime are validated here at module
// initialisation time, causing the build (or server start) to fail fast with
// a clear error message rather than returning undefined deep inside component
// code.
//
// Uses `.nullish()` for optional social links to be consistent with
// `exactOptionalPropertyTypes: true` — callers may pass `null`, `undefined`,
// or omit the key entirely.
// ---------------------------------------------------------------------------

export const SiteConfigSchema = z.object({
  /**
   * Absolute URL of the site (no trailing slash).
   * Used for canonical links, Open Graph meta tags, and the RSS feed.
   */
  siteUrl: z.string().url({ message: "siteUrl must be a valid absolute URL" }),

  /** Display name of the site used in the HTML <title> suffix and headers. */
  siteName: z.string().min(1, { message: "siteName must not be empty" }),

  /** Short description used in <meta name="description"> and OG tags. */
  siteDescription: z
    .string()
    .min(1, { message: "siteDescription must not be empty" }),

  /** Full name of the site author shown in bylines and the footer. */
  authorName: z.string().min(1, { message: "authorName must not be empty" }),

  /** Contact email; validated as a proper email address. */
  authorEmail: z.string().email({ message: "authorEmail must be a valid email address" }),

  /**
   * Twitter/X handle including the @ prefix (e.g. "@janedoe").
   * Null/omitted when the author has no Twitter presence.
   */
  twitterHandle: z.string().nullish(),

  /**
   * GitHub username without the @ prefix.
   * Null/omitted when the author has no GitHub presence.
   */
  githubUsername: z.string().nullish(),

  /**
   * LinkedIn profile username (the segment after linkedin.com/in/).
   * Null/omitted when the author has no LinkedIn presence.
   */
  linkedinUsername: z.string().nullish(),

  /**
   * Number of posts displayed per page on listing pages.
   * Must be a positive integer.  Defaults to 10.
   */
  postsPerPage: z
    .number()
    .int({ message: "postsPerPage must be an integer" })
    .min(1, { message: "postsPerPage must be at least 1" })
    .default(10),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

// ---------------------------------------------------------------------------
// parseSiteConfig — public factory / validator
//
// Accepts an unknown input object and either returns a validated SiteConfig
// or throws a ZodError with field-level error messages.
//
// Separating validation from the module-level constant allows:
//  1. Tests to call it directly with controlled inputs (no env dependency).
//  2. Future CMS/env-parsing code to compose it without re-reading env vars.
// ---------------------------------------------------------------------------

/**
 * Validates and parses a raw configuration object into a typed SiteConfig.
 *
 * @throws {z.ZodError} when any field fails validation.
 */
export function parseSiteConfig(raw: unknown): SiteConfig {
  return SiteConfigSchema.parse(raw);
}

// ---------------------------------------------------------------------------
// SITE_CONFIG — the module-level singleton
//
// This is the value used throughout the application.  It is constructed from
// environment variables so that the site URL and author details can vary
// between deployment environments without code changes (12-factor config).
//
// NEXT_PUBLIC_* variables are inlined by the Next.js bundler at build time,
// making them available on both server and client.  Non-public variables
// (without the prefix) are only available server-side.
//
// Using a hardcoded fallback ensures that `next build` and `vitest` succeed
// in CI environments where env vars may not be set, while production
// deployments override these values via their platform environment.
// ---------------------------------------------------------------------------

export const SITE_CONFIG: SiteConfig = parseSiteConfig({
  siteUrl: process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://stevegoode.dev",
  siteName: process.env["NEXT_PUBLIC_SITE_NAME"] ?? "Steve Goode",
  siteDescription:
    process.env["NEXT_PUBLIC_SITE_DESCRIPTION"] ??
    "Head of Engineering at Nearform. 20+ years experience in technical leadership, mentoring, and building exceptional teams.",
  authorName: process.env["NEXT_PUBLIC_AUTHOR_NAME"] ?? "Steve Goode",
  authorEmail: process.env["NEXT_PUBLIC_AUTHOR_EMAIL"] ?? "steve@stevegoode.dev",
  twitterHandle: process.env["NEXT_PUBLIC_TWITTER_HANDLE"] ?? null,
  githubUsername: process.env["NEXT_PUBLIC_GITHUB_USERNAME"] ?? "stevegoode",
  linkedinUsername: process.env["NEXT_PUBLIC_LINKEDIN_USERNAME"] ?? "stevegoode",
  postsPerPage: process.env["NEXT_PUBLIC_POSTS_PER_PAGE"]
    ? parseInt(process.env["NEXT_PUBLIC_POSTS_PER_PAGE"], 10)
    : 10,
});
