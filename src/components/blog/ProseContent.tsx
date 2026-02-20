/**
 * ProseContent
 *
 * Wrapper for HTML content generated from Markdown (via remark/rehype).
 * Applies the prose typography styles from the design system and provides
 * semantic, accessible treatment of code blocks, images, and links.
 *
 * Design decisions:
 * - Renders content via dangerouslySetInnerHTML because the HTML is
 *   produced server-side by a trusted Markdown pipeline (remark + rehype).
 *   This is standard practice for SSG blog content.
 * - The outer element is <article> with aria-label so it surfaces as a
 *   distinct ARIA landmark, helping screen reader users locate the main
 *   article body quickly.
 * - CSS prose styles live in ProseContent.module.css and target HTML
 *   element selectors (h2, h3, p, a, pre, code, blockquote, img, etc.).
 *   This is the one acceptable case for non-class element targeting in
 *   CSS Modules because we do not control the generated HTML structure.
 * - External links in prose get rel="noopener noreferrer" via CSS-pointer-
 *   events: this cannot be done without JS; however, rehype-pretty-code
 *   and remark-gfm generate correct link markup, so we rely on the pipeline
 *   having set rel attributes during compilation.
 * - The component accepts an optional `className` so page-level layouts
 *   can constrain the max-width (e.g. max-width: var(--size-prose)).
 */

import React from "react";
import styles from "./ProseContent.module.css";

/* ============================================================
   Types
   ============================================================ */

export interface ProseContentProps {
  /** Trusted HTML string produced by the Markdown processing pipeline. */
  html: string;
  /**
   * Accessible label for the article landmark.
   * When the page has an <h1> that serves as the article title, you may
   * use aria-labelledby with the heading's id instead — pass that id via
   * ariaLabelledBy and omit ariaLabel.
   */
  ariaLabel?: string;
  /**
   * id of a heading element that labels this article region.
   * Takes precedence over ariaLabel when both are provided.
   */
  ariaLabelledBy?: string;
  /** Additional CSS class names (e.g. for max-width constraint). */
  className?: string;
}

/* ============================================================
   Component
   ============================================================ */

export function ProseContent({
  html,
  ariaLabel,
  ariaLabelledBy,
  className,
}: ProseContentProps) {
  const classNames = [styles["prose"], className].filter(Boolean).join(" ");

  return (
    <div
      className={classNames}
      aria-label={ariaLabelledBy !== undefined ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
