/**
 * Card
 *
 * Surface container for blog posts, content listings, and grouped UI sections.
 *
 * Design decisions:
 * - Polymorphic `as` prop allows rendering as <article> for blog-post cards
 *   (semantically a self-contained composition) or <div> for generic panels.
 *   The default is <div> to avoid accidental misuse of <article>.
 * - Compound-component pattern (<Card.Header>, <Card.Body>, <Card.Footer>)
 *   provides structure without rigid prop drilling, following the principle
 *   of least surprise for component consumers.
 * - React.forwardRef on the root so focus-trap-react and programmatic focus
 *   work correctly on interactive cards (e.g. dialog-trigger surfaces).
 * - `isInteractive` adds hover/focus styles and the appropriate ARIA markup.
 *   When the card itself is the link target, consumers should render an <a>
 *   inside and NOT pass isInteractive — the link carries semantics.
 *   isInteractive is for cases where the card IS the interactive element
 *   (e.g. rendered as a <button> via `as`).
 * - `noPadding` removes outer padding for image-bleed layouts; inner slots
 *   restore their own padding via CSS.
 */

import React from "react";
import styles from "./Card.module.css";

/* ============================================================
   Types
   ============================================================ */

export type CardElevation = "flat" | "raised" | "elevated";

/**
 * Valid HTML element tags the Card root can render as.
 * Restricting to block-level semantics prevents misuse.
 */
export type CardRootElement =
  | "div"
  | "article"
  | "section"
  | "aside"
  | "li"
  | "button";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The underlying HTML element to render.
   * Use "article" for blog-post cards that contain a heading and body.
   * Defaults to "div".
   */
  as?: CardRootElement;
  /** Shadow depth. Defaults to "raised". */
  elevation?: CardElevation;
  /**
   * When true, the card gains hover/active visual feedback and
   * aria-label should be provided so screen readers know the card
   * is interactive.
   */
  isInteractive?: boolean;
  /**
   * Remove outer padding. Use when a card contains a full-bleed image.
   * Inner sub-components (<Card.Header>, etc.) restore their own padding.
   */
  noPadding?: boolean;
}

/* ============================================================
   Root component
   ============================================================ */

export const Card = React.forwardRef<HTMLElement, CardProps>(
  (
    {
      as: Tag = "div",
      elevation = "raised",
      isInteractive = false,
      noPadding = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const classNames = [
      styles["card"],
      styles[elevation],
      isInteractive ? styles["interactive"] : undefined,
      noPadding ? styles["noPadding"] : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // React.forwardRef infers the ref type from the first generic.
    // Since we use a polymorphic `as` prop we cast — this is a known
    // trade-off with polymorphic forwardRef in TypeScript without
    // bringing in a generic helper type.
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Tag ref={ref as any} className={classNames} {...rest}>
        {children}
      </Tag>
    );
  },
);

Card.displayName = "Card";

/* ============================================================
   Sub-components
   ============================================================ */

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Card.Header
 * Renders the title and optional metadata row of a card.
 * Consumers should place the primary heading here.
 */
export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <div
      className={[styles["header"], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

CardHeader.displayName = "Card.Header";

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Card.Body
 * Main content area. Flex-grows to push the footer to the bottom.
 */
export function CardBody({ className, children, ...rest }: CardBodyProps) {
  return (
    <div
      className={[styles["body"], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

CardBody.displayName = "Card.Body";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Card.Footer
 * Action area — CTAs, author info, timestamps, tag lists.
 * Separated from the body by a top border.
 */
export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div
      className={[styles["footer"], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

CardFooter.displayName = "Card.Footer";
