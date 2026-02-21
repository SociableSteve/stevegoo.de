"use client";

/**
 * Header
 *
 * Sticky site header with:
 *   - Logo / home link (site name from SITE_CONFIG)
 *   - Primary navigation links (Writing, About)
 *   - Theme toggle button integrated with ThemeProvider
 *
 * Accessibility decisions:
 *   - `<header>` carries the implicit "banner" landmark role — no explicit
 *     role attribute needed.
 *   - `<nav>` is wrapped in an `aria-label="Main"` to distinguish it from
 *     any other nav elements on the page (e.g. footer nav, breadcrumbs).
 *   - Active page link communicates state with `aria-current="page"` rather
 *     than a purely visual indicator, so screen readers announce it.
 *   - The theme toggle carries a dynamic `aria-label` that reflects the
 *     action it will perform ("Switch to dark mode" / "Switch to light mode"),
 *     following the pattern recommended in WCAG 1.3.3 (Sensory Characteristics)
 *     and ARIA best-practice for toggle buttons that change their own label.
 *   - A visually-hidden live region announces theme changes to screen readers
 *     that are not focused on the toggle button at the moment of activation.
 *
 * Responsive design:
 *   Only two navigation links (Writing, About) are needed for this site, so a
 *   hamburger menu would add complexity without user benefit. Both links fit
 *   comfortably at all breakpoints ≥ 320 px. If the link count grows beyond
 *   four the implementation can be extended with focus-trap-react for a mobile
 *   drawer — focus-trap-react is already installed as a dependency.
 *
 * Performance:
 *   - "use client" is required only because of usePathname and useTheme.
 *   - The SVG icons are inlined to avoid extra network requests and to allow
 *     `currentColor` inheritance, keeping icon colour in sync with the button.
 */

import React, { useId, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { SITE_CONFIG } from "@/lib/config/site.config";
import styles from "./Header.module.css";

/* ============================================================
   Nav items — single source of truth
   ============================================================ */

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

/* ============================================================
   Sun icon (light theme indicator)
   ============================================================ */

function SunIcon({ className }: { className?: string | undefined }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

/* ============================================================
   Moon icon (dark theme indicator)
   ============================================================ */

function MoonIcon({ className }: { className?: string | undefined }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ============================================================
   Header component
   ============================================================ */

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Track whether component has mounted to prevent hydration mismatch
  // During SSR and first client render, we use light theme as placeholder
  const [mounted, setMounted] = useState(false);

  // Announcement text for the screen-reader live region.
  // We start empty and only populate it after a user-initiated toggle
  // so there is no announcement on initial render.
  const [announcement, setAnnouncement] = useState("");
  const liveRegionId = useId();

  // Set mounted to true after initial render to enable theme-dependent content
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Standard pattern for preventing hydration mismatch
    setMounted(true);
  }, []);

  // After toggling, describe the NEW state (what was just applied).
  // We derive from the current `theme` value which has already been updated.
  useEffect(() => {
    if (announcement !== "") {
      // Clear after 3 seconds so stale messages are not re-announced
      const timer = setTimeout(() => setAnnouncement(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  // Use theme only after mount to prevent hydration mismatch
  // Before mount, always use light theme (matches SSR output)
  const isDark = mounted && theme === "dark";

  // The aria-label describes what will happen when clicked (the action),
  // not the current state — this is the pattern most assistive technologies
  // work best with for icon-only toggle controls.
  const toggleLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  function handleThemeToggle() {
    toggleTheme();
    // Announce the resulting theme (after toggle, theme will flip)
    // Use actual theme value for announcement, not the mounted-dependent isDark
    const actualIsDark = theme === "dark";
    const next = actualIsDark ? "light" : "dark";
    setAnnouncement(`Switched to ${next} mode`);
  }

  return (
    <header className={styles["header"]}>
      {/* Hidden live region — announces theme changes to screen readers.
          <output> carries the implicit ARIA role "status" with aria-live="polite"
          built in, satisfying jsx-a11y/prefer-tag-over-role. */}
      <output
        id={liveRegionId}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </output>

      <div className={styles["container"]}>
        {/* ── Logo / Site name ───────────────────────────── */}
        <Link href="/" className={styles["homeLink"]} aria-label={`${SITE_CONFIG.siteName} — home`}>
          {SITE_CONFIG.siteName}
        </Link>

        {/* ── Primary navigation ─────────────────────────── */}
        <nav className={styles["nav"]} aria-label="Main">
          <ul className={styles["navList"]} role="list">
            {NAV_ITEMS.map((item) => {
              // Treat the current page and any sub-pages as active.
              // The root "/" check is intentionally excluded because
              // nearly every path would match it.
              const isActive =
                item.href !== "/" &&
                (pathname === item.href ||
                  pathname.startsWith(item.href + "/"));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles["navLink"]}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Actions (theme toggle) ──────────────────────── */}
        <button
          type="button"
          className={styles["themeToggle"]}
          aria-label={toggleLabel}
          onClick={handleThemeToggle}
        >
          {isDark ? (
            <SunIcon className={styles["themeIcon"]} />
          ) : (
            <MoonIcon className={styles["themeIcon"]} />
          )}
        </button>
      </div>
    </header>
  );
}
