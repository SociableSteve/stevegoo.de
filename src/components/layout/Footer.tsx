/**
 * Footer
 *
 * Simple, semantic footer suited to a Head of Engineering's personal brand
 * site. Contains:
 *   - Copyright notice with dynamic year
 *   - Social links: GitHub and LinkedIn (sourced from SITE_CONFIG)
 *
 * Accessibility decisions:
 *   - `<footer>` has the implicit "contentinfo" landmark — no explicit role
 *     needed.
 *   - Each social link is icon-only so it requires a descriptive `aria-label`
 *     to be announced correctly by screen readers.
 *   - The `<nav>` inside the footer carries `aria-label="Social links"` to
 *     disambiguate it from the main navigation landmark in the Header.
 *   - Icons carry `aria-hidden="true"` because the link's `aria-label` is
 *     the authoritative accessible name.
 *
 * Data:
 *   Social links are conditionally rendered based on whether the
 *   corresponding field is present in SITE_CONFIG. This avoids dead links
 *   when the site owner has not configured social accounts.
 */

import React from "react";
import { SITE_CONFIG } from "@/lib/config/site.config";
import styles from "./Footer.module.css";

/* ============================================================
   GitHub icon
   ============================================================ */

function GitHubIcon({ className }: { className?: string | undefined }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* GitHub mark — simplified single-path version */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483
           0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462
           -1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529
           2.341 1.087 2.91.832.092-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.943
           0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025
           A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025
           2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683
           0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012
           2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12
           22 6.477 17.523 2 12 2Z"
      />
    </svg>
  );
}

/* ============================================================
   LinkedIn icon
   ============================================================ */

function LinkedInIcon({ className }: { className?: string | undefined }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853
               0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046
               c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337
               7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782
               13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0
               23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774
               23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

/* ============================================================
   Footer component
   ============================================================ */

interface SocialLink {
  key: string;
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function Footer() {
  const year = new Date().getFullYear();

  // Build the social links array from config — only include entries
  // where the username is a non-empty string.
  const socialLinks: SocialLink[] = [];

  if (SITE_CONFIG.githubUsername) {
    socialLinks.push({
      key: "github",
      href: `https://github.com/${SITE_CONFIG.githubUsername}`,
      label: `${SITE_CONFIG.authorName} on GitHub`,
      icon: <GitHubIcon className={styles["socialIcon"]} />,
    });
  }

  if (SITE_CONFIG.linkedinUsername) {
    socialLinks.push({
      key: "linkedin",
      href: `https://linkedin.com/in/${SITE_CONFIG.linkedinUsername}`,
      label: `${SITE_CONFIG.authorName} on LinkedIn`,
      icon: <LinkedInIcon className={styles["socialIcon"]} />,
    });
  }

  return (
    <footer className={styles["footer"]}>
      <div className={styles["inner"]}>
        {/* Copyright */}
        <p className={styles["copyright"]}>
          &copy; {year} {SITE_CONFIG.authorName}
        </p>

        {/* Social links — only rendered when at least one is configured */}
        {socialLinks.length > 0 && (
          <nav aria-label="Social links">
            <ul className={styles["socialList"]} role="list">
              {socialLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className={styles["socialLink"]}
                    aria-label={link.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.icon}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
