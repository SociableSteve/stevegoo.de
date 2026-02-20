/**
 * CategoryFilter
 *
 * A button-group that lets users filter the blog listing by category.
 * Selection is persisted in the URL search params so the filtered view
 * is shareable and survives page refresh.
 *
 * Architecture notes:
 * - MUST be a Client Component because it calls useSearchParams().
 *   Next.js App Router requires any component that reads searchParams
 *   on the client to be wrapped in a <Suspense> boundary. The exported
 *   CategoryFilterWithSuspense wrapper satisfies this requirement for
 *   consumers that want a drop-in component.
 * - Uses role="group" with aria-label on the button container. The
 *   toolbar pattern (role="toolbar" + arrow-key navigation) is overkill
 *   here — the filters are simple toggle buttons that each stand alone.
 *   A plain group with Tab navigation is more predictable for users.
 * - An aria-live="polite" region announces the result count whenever the
 *   active filter changes, informing screen reader users without stealing
 *   focus.
 * - URL state is preferred over React state so the filtered URL is
 *   bookmarkable and the Back button works correctly.
 */

"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import styles from "./CategoryFilter.module.css";

/* ============================================================
   Types
   ============================================================ */

export interface CategoryFilterProps {
  /** All available categories (plain display names). */
  categories: string[];
  /**
   * Total number of posts currently visible with the active filter.
   * Used for the ARIA live region announcement.
   */
  postCount: number;
  /**
   * The search-param key to read/write the active category.
   * Defaults to "category".
   */
  paramKey?: string;
  /** Additional CSS class names. */
  className?: string;
}

/* ============================================================
   Inner component — uses useSearchParams()
   This component MUST be wrapped in <Suspense> by the caller.
   ============================================================ */

function CategoryFilterInner({
  categories,
  postCount,
  paramKey = "category",
  className,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get(paramKey) ?? null;

  function handleSelect(category: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (category === null || category === activeCategory) {
      // Toggle off — remove the param entirely
      params.delete(paramKey);
    } else {
      params.set(paramKey, category);
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  // Build live region announcement text
  const liveText =
    activeCategory != null
      ? `Showing ${postCount} post${postCount === 1 ? "" : "s"} in ${activeCategory}`
      : `Showing all ${postCount} post${postCount === 1 ? "" : "s"}`;

  const containerClassNames = [styles["container"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassNames}>
      {/* Button group — <fieldset> provides the group semantics natively,
          satisfying jsx-a11y/prefer-tag-over-role and WCAG 1.3.1 */}
      <fieldset className={styles["group"]}>
        <legend className={styles["groupLegend"]}>
          Filter posts by category
        </legend>
        {/* "All" button — clears the filter */}
        <button
          type="button"
          className={[
            styles["filterButton"],
            activeCategory === null ? styles["active"] : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => handleSelect(null)}
          aria-pressed={activeCategory === null}
        >
          All
        </button>

        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              className={[
                styles["filterButton"],
                isActive ? styles["active"] : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelect(category)}
              aria-pressed={isActive}
            >
              {category}
            </button>
          );
        })}
      </fieldset>

      {/*
       * ARIA live region — announces filter result counts to screen readers.
       * aria-live="polite" waits for the user to finish their current
       * interaction before announcing, avoiding interruption.
       * aria-atomic="true" reads the entire message as a unit when it changes.
       */}
      <p
        className={styles["liveRegion"]}
        aria-live="polite"
        aria-atomic="true"
      >
        {liveText}
      </p>
    </div>
  );
}

/* ============================================================
   Loading fallback
   Shown while the Suspense boundary waits for searchParams to resolve.
   Uses the same visual layout as the loaded state to prevent layout shift.
   ============================================================ */

function CategoryFilterFallback({
  categories,
  className,
}: {
  categories: string[];
  className?: string | undefined;
}) {
  const containerClassNames = [styles["container"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassNames}>
      <fieldset className={styles["group"]} aria-busy="true">
        <legend className={styles["groupLegend"]}>
          Filter posts by category
        </legend>
        <button
          type="button"
          className={[styles["filterButton"], styles["active"]]
            .filter(Boolean)
            .join(" ")}
          disabled
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={styles["filterButton"]}
            disabled
          >
            {category}
          </button>
        ))}
      </fieldset>
      <p
        className={styles["liveRegion"]}
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
}

/* ============================================================
   Public export — wrapped in Suspense boundary
   Consumers can import this directly without managing Suspense themselves.
   ============================================================ */

export function CategoryFilter(props: CategoryFilterProps) {
  return (
    <Suspense
      fallback={
        <CategoryFilterFallback
          categories={props.categories}
          className={props.className}
        />
      }
    >
      <CategoryFilterInner {...props} />
    </Suspense>
  );
}
