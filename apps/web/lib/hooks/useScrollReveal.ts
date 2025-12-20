"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface UseScrollRevealOptions {
  /** Threshold for intersection (0-1). Default: 0.1 */
  threshold?: number;
  /** Root margin for earlier/later triggering. Default: "0px 0px -50px 0px" */
  rootMargin?: string;
  /** Whether to trigger only once. Default: true */
  triggerOnce?: boolean;
  /** Delay before marking as visible (ms). Default: 0 */
  delay?: number;
  /** Whether the reveal is disabled. Default: false */
  disabled?: boolean;
}

export interface UseScrollRevealReturn {
  /** Ref to attach to the element */
  ref: React.RefObject<HTMLElement | null>;
  /** Whether the element is in view */
  isInView: boolean;
  /** Whether the element has ever been in view (for triggerOnce) */
  hasBeenInView: boolean;
}

/**
 * Hook for scroll-triggered reveal animations using IntersectionObserver.
 * Automatically respects reduced motion preferences.
 *
 * @param options - Configuration options
 * @returns Object with ref to attach and visibility states
 *
 * @example
 * const { ref, isInView } = useScrollReveal({ threshold: 0.2 });
 *
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0, y: 30 }}
 *   animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
 * />
 */
export function useScrollReveal(options: UseScrollRevealOptions = {}): UseScrollRevealReturn {
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    triggerOnce = true,
    delay = 0,
    disabled = false,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // If disabled or reduced motion, show immediately
    if (disabled || prefersReducedMotion) {
      setIsInView(true);
      setHasBeenInView(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      setHasBeenInView(true);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              timeoutId = setTimeout(() => {
                setIsInView(true);
                setHasBeenInView(true);
              }, delay);
            } else {
              setIsInView(true);
              setHasBeenInView(true);
            }

            // Unobserve if triggerOnce
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            // Reset if not triggerOnce
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            setIsInView(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay, disabled, prefersReducedMotion]);

  return { ref, isInView, hasBeenInView };
}

/**
 * Creates staggered delay values for a list of items.
 * Useful for creating cascading reveal animations.
 *
 * @param index - The item's index in the list
 * @param baseDelay - Base delay in seconds. Default: 0.1
 * @param maxDelay - Maximum delay cap in seconds. Default: 0.5
 * @returns Delay value in seconds
 *
 * @example
 * items.map((item, i) => (
 *   <motion.div
 *     key={item.id}
 *     transition={{ delay: staggerDelay(i) }}
 *   />
 * ))
 */
export function staggerDelay(index: number, baseDelay = 0.1, maxDelay = 0.5): number {
  return Math.min(index * baseDelay, maxDelay);
}

/**
 * Hook variant that returns Framer Motion-compatible animation props.
 * Provides a complete set of props for common scroll reveal patterns.
 *
 * @param options - Configuration options
 * @returns Object with ref and motion props
 *
 * @example
 * const { ref, motionProps } = useScrollRevealMotion();
 * <motion.div ref={ref} {...motionProps} />
 */
export function useScrollRevealMotion(options: UseScrollRevealOptions = {}) {
  const { ref, isInView } = useScrollReveal(options);
  const prefersReducedMotion = useReducedMotion();

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
        transition: { type: "spring", stiffness: 200, damping: 25 },
      };

  return { ref, motionProps, isInView };
}
