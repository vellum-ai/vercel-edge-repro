import { useRef } from "react";

/**
 * useStable returns a stable value across re-renders.
 * Useful for memoizing values that should not change between re-renders, like default values in forms.
 *
 * @param fn - A function that returns the value to be memoized.
 * @returns The memoized value.
 * @example
 * const value = useStable(() => Math.random())
 **/
export function useStable<T>(fn: () => T) {
  const ref = useRef<T>();
  if (!ref.current) {
    ref.current = fn();
  }
  return ref.current;
}
