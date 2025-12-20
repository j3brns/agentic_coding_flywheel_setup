"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect user's reduced motion preference.
 * Respects the `prefers-reduced-motion` media query for accessibility.
 *
 * @returns boolean - true if user prefers reduced motion
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * const animation = prefersReducedMotion ? {} : { y: [20, 0], opacity: [0, 1] };
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns animation props that respect reduced motion preferences.
 * Use this to wrap animation objects for accessible animations.
 *
 * @param animation - The animation properties when motion is enabled
 * @returns The animation or an empty object if reduced motion is preferred
 *
 * @example
 * const fadeUp = useAccessibleAnimation({ y: 20, opacity: 0 });
 * <motion.div initial={fadeUp} animate={{ y: 0, opacity: 1 }} />
 */
export function useAccessibleAnimation<T extends object>(animation: T): T | Record<string, never> {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? {} : animation;
}
