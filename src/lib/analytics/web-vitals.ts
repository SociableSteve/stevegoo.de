"use client";

import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";

export type VitalHandler = (metric: Metric) => void;

/**
 * Registers all Core Web Vitals listeners.
 *
 * Follows the Open/Closed principle: the handler function is injected,
 * allowing different reporting strategies (console, analytics APIs, etc.)
 * without modifying this module.
 */
export function reportWebVitals(handler: VitalHandler): void {
  onCLS(handler);
  onFCP(handler);
  onINP(handler);
  onLCP(handler);
  onTTFB(handler);
}
