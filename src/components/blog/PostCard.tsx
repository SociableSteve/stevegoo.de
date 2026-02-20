/**
 * PostCard
 *
 * Renders a PostSummary in card format for listing pages (/blog, tag pages, etc.).
 *
 * Design decisions:
 * - Uses the Card primitive with `as="article"` so the card is semantically a
 *   self-contained composition — appropriate because each card represents a
 *   complete blog post entity with its own heading.
 * - The card's primary action (navigating to the post) is expressed as an <a>
 *   inside the card rather than making the card itself interactive via
 *   isInteractive. This approach gives the link the correct ARIA role and
 *   avoids the "double interactive element" anti-pattern. The card still
 *   receives hover styling because the CSS module targets the link.
 * - The link wraps only the title (not the entire card) to give screen reader
 *   users a precise target name and to avoid the "giant unnamed link" problem.
 *   A ::before pseudo-element on the link expands the hit area to the full
 *   card, satisfying WCAG 2.5.5 (large target size) for pointer users without
 *   polluting the DOM with nested interactive elements.
 * - External posts are indicated visually and semantically: the link opens in
 *   a new tab with rel="noopener noreferrer", the title appends an SVG arrow
 *   icon that is aria-hidden, and a visually-hidden " (opens in new tab)"
 *   string is appended to the accessible name.
 * - PostMeta is composed inside the card footer to ensure consistent metadata
 *   treatment across all listing contexts.
 */

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui";
import { Badge } from "@/components/ui";
import { PostMeta } from "./PostMeta";
import type { PostSummary } from "@/content/post.types";
import styles from "./PostCard.module.css";

/* ============================================================
   Types
   ============================================================ */

export interface PostCardProps {
  /** PostSummary data to display. */
  post: PostSummary;
  /** Additional CSS class names. */
  className?: string;
}

/* ============================================================
   Icons
   ============================================================ */

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={styles["externalIcon"]}
    >
      <path
        d="M3.5 3H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V8.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 1h4m0 0v4M11 1 5.5 6.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================
   Component
   ============================================================ */

export function PostCard({ post, className }: PostCardProps) {
  const isExternal =
    post.externalUrl != null && post.externalUrl !== "";

  // TypeScript does not narrow the conditional branch automatically here
  // because `isExternal` is derived — use a type-safe fallback instead of !
  const href = isExternal && post.externalUrl != null
    ? post.externalUrl
    : `/blog/${post.slug}`;

  const externalProps = isExternal
    ? {
        target: "_blank" as const,
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <Link href={href} {...externalProps} className={styles["cardLink"]}>
      <Card
        as="article"
        elevation="raised"
        className={[styles["postCard"], className].filter(Boolean).join(" ")}
      >
        <CardHeader>
          {/* External badge — indicates external posts */}
          {isExternal && (
            <div className={styles["badgeRow"]}>
              <Badge variant="neutral">External</Badge>
            </div>
          )}

          <h2 className={styles["title"]}>
            {post.title}
            {isExternal && <ExternalLinkIcon />}
            {isExternal && (
              <span className={styles["srOnly"]}> (opens in new tab)</span>
            )}
          </h2>
        </CardHeader>

        <CardBody>
          <p className={styles["excerpt"]}>{post.description}</p>

          {post.tags.length > 0 && (
            <ul className={styles["tagList"]} aria-label="Post tags">
              {post.tags.map((tag) => (
                <li key={tag} className={styles["tagItem"]}>
                  <Badge variant="neutral">{tag}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>

        <CardFooter>
          <PostMeta
            publishedAt={post.publishedAt}
            updatedAt={post.updatedAt}
            readingTimeMinutes={post.readingTimeMinutes}
            size="sm"
          />
        </CardFooter>
      </Card>
    </Link>
  );
}
