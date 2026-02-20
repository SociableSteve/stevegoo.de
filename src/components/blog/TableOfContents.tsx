/**
 * TableOfContents
 *
 * Generates a navigable TOC from a list of heading items extracted from
 * the article. The TOC highlights the currently-visible section using
 * IntersectionObserver.
 *
 * Design decisions:
 * - Accepts a `headings` prop (extracted by the parent) rather than querying
 *   the DOM directly. This keeps the component pure and testable: DOM queries
 *   are an implementation detail of the data-extraction step.
 * - Rendered as a <nav> with an aria-label so it appears as a distinct
 *   landmark and screen reader users can jump to it via the landmarks menu.
 * - The active item is communicated via aria-current="true" on the <a>, not
 *   just via CSS class, so screen readers announce "current" alongside the
 *   heading text.
 * - Smooth scroll behaviour respects prefers-reduced-motion: the scroll is
 *   still performed but without the animation when the user has opted out.
 * - Keyboard navigation uses the browser's built-in tab sequence — no custom
 *   arrow-key handler needed for a flat list of links.
 * - The component is a Client Component because IntersectionObserver is a
 *   browser API unavailable during SSR.
 *
 * Data contract:
 *   Each TocHeading has:
 *     id:    The id attribute on the corresponding <h2>/<h3> in the article.
 *     text:  The visible heading text.
 *     level: Numeric heading level (2 or 3 are the typical depths for a TOC).
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./TableOfContents.module.css";

/* ============================================================
   Types
   ============================================================ */

export interface TocHeading {
  /** The id attribute on the heading element in the article. */
  id: string;
  /** Visible heading text. */
  text: string;
  /** Numeric heading level (2 or 3 recommended). */
  level: 2 | 3;
}

export interface TableOfContentsProps {
  /** Ordered list of heading items extracted from the article. */
  headings: TocHeading[];
  /**
   * Accessible label for the <nav> landmark.
   * Defaults to "Table of contents".
   */
  label?: string;
  /** Additional CSS class names. */
  className?: string;
}

/* ============================================================
   Hook — active section tracking
   ============================================================ */

/**
 * Returns the id of the currently-visible heading using IntersectionObserver.
 * Picks the topmost heading that is at or above the mid-point of the viewport.
 */
function useActiveHeading(headingIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track visible headings in a stable ref so the observer callback does not
  // close over stale state.
  const visibleRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (headingIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleRef.current.add(entry.target.id);
          } else {
            visibleRef.current.delete(entry.target.id);
          }
        });

        // Among visible headings, choose the one that appears first in
        // document order (headingIds array is ordered top-to-bottom).
        const firstVisible = headingIds.find((id) =>
          visibleRef.current.has(id),
        );
        if (firstVisible !== undefined) {
          setActiveId(firstVisible);
        }
      },
      {
        // Fire when the heading crosses the top quarter of the viewport.
        // This gives a generous lead time so the highlight updates before
        // the heading scrolls off screen.
        rootMargin: "0px 0px -60% 0px",
        threshold: 0,
      },
    );

    headingIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element !== null) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headingIds]);

  return activeId;
}

/* ============================================================
   Component
   ============================================================ */

export function TableOfContents({
  headings,
  label = "Table of contents",
  className,
}: TableOfContentsProps) {
  const headingIds = headings.map((h) => h.id);
  const activeId = useActiveHeading(headingIds);

  function handleLinkClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) {
    event.preventDefault();
    const target = document.getElementById(id);
    if (target === null) return;

    // Query prefers-reduced-motion at click time (not render time) so the
    // check occurs in a browser event context where matchMedia is available.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia != null &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "start",
    });

    // Move focus to the heading for keyboard users so the next Tab
    // continues from the heading rather than jumping back to the TOC.
    // tabIndex=-1 allows programmatic focus without adding a tab stop.
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    // Remove tabindex once focus moves away so the heading is not a
    // permanent tab stop.
    target.addEventListener(
      "blur",
      () => {
        target.removeAttribute("tabindex");
      },
      { once: true },
    );
  }

  if (headings.length === 0) {
    return null;
  }

  const containerClassNames = [styles["container"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav
      aria-label={label}
      className={containerClassNames}
    >
      <p className={styles["heading"]} aria-hidden="true">
        On this page
      </p>

      <ol className={styles["list"]} role="list">
        {headings.map((heading) => {
          const isActive = heading.id === activeId;

          return (
            <li
              key={heading.id}
              className={[
                styles["item"],
                heading.level === 3 ? styles["nested"] : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <a
                href={`#${heading.id}`}
                className={[
                  styles["link"],
                  isActive ? styles["active"] : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={isActive ? true : undefined}
                onClick={(e) => handleLinkClick(e, heading.id)}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
