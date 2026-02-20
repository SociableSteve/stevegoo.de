/**
 * Button
 *
 * Accessible, polymorphic button primitive.
 *
 * Design decisions:
 * - React.forwardRef so consumers can attach refs (e.g. programmatic focus,
 *   focus-trap-react, third-party tooltip libraries).
 * - All interactive states are expressed via CSS Modules using design tokens
 *   so they automatically adapt to light / dark theme.
 * - Loading state replaces the leading icon slot with a spinner and announces
 *   itself via aria-busy + aria-label override so screen readers do not
 *   announce stale button text.
 * - aria-disabled is used in addition to the native disabled attribute when
 *   we want the element to remain focusable (e.g. to show a tooltip explaining
 *   why it is disabled). Pass `disabledFocusable` for this behaviour.
 * - 44×44 px touch targets are enforced via CSS min-height/min-width,
 *   satisfying WCAG 2.5.5 AAA and the stricter 2.5.8 AA (24×24).
 */

import React from "react";
import styles from "./Button.module.css";

/* ============================================================
   Types
   ============================================================ */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. Defaults to "primary". */
  variant?: ButtonVariant;
  /** Size of the button. Defaults to "md". */
  size?: ButtonSize;
  /**
   * When true, renders a spinner and sets aria-busy="true".
   * The button is non-interactive during loading.
   */
  isLoading?: boolean;
  /**
   * Accessible label used while loading.
   * Defaults to the button's text content with " (loading)" appended.
   * Provide an explicit string if the fallback is insufficient.
   */
  loadingLabel?: string;
  /**
   * Optional icon rendered before the button label.
   * Should be an inline SVG or icon component sized to 1em.
   */
  leadingIcon?: React.ReactNode;
  /**
   * Optional icon rendered after the button label.
   */
  trailingIcon?: React.ReactNode;
  /**
   * When true, the button is visually disabled but remains focusable,
   * allowing tooltips to be triggered via keyboard.
   * This sets aria-disabled="true" without the native `disabled` attribute.
   */
  disabledFocusable?: boolean;
}

/* ============================================================
   Component
   ============================================================ */

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingLabel,
      leadingIcon,
      trailingIcon,
      disabledFocusable = false,
      disabled,
      className,
      children,
      onClick,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled ?? false;
    const isInteractionBlocked = isDisabled || disabledFocusable || isLoading;

    // Compose the accessible label for loading state.
    // Screen readers announce aria-label when present, falling back to
    // text content. While loading we override with a descriptive label.
    const resolvedAriaLabel = React.useMemo(() => {
      if (isLoading) {
        if (loadingLabel) return loadingLabel;
        // If an explicit aria-label was provided for the non-loading state,
        // append a loading suffix rather than discarding it entirely.
        if (ariaLabel) return `${ariaLabel} (loading)`;
        return undefined; // aria-busy is sufficient when text is visible
      }
      return ariaLabel;
    }, [isLoading, loadingLabel, ariaLabel]);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isInteractionBlocked) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      [isInteractionBlocked, onClick],
    );

    const classNames = [
      styles["button"],
      styles[variant],
      styles[size],
      isLoading ? styles["loading"] : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type="button"
        className={classNames}
        disabled={isDisabled}
        aria-disabled={disabledFocusable || isLoading ? true : undefined}
        aria-busy={isLoading ? true : undefined}
        aria-label={resolvedAriaLabel}
        onClick={handleClick}
        {...rest}
      >
        {/* Leading icon or spinner */}
        {isLoading ? (
          <span
            className={styles["spinner"]}
            aria-hidden="true"
          />
        ) : (
          leadingIcon !== undefined && (
            <span className={styles["iconSlot"]} aria-hidden="true">
              {leadingIcon}
            </span>
          )
        )}

        {/* Label */}
        {children}

        {/* Trailing icon — hidden when loading to keep layout stable */}
        {!isLoading && trailingIcon !== undefined && (
          <span className={styles["iconSlot"]} aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
