import { useState, useEffect } from "react";

/**
 * Delays updating the returned value until the user stops typing.
 * This prevents an API call on every single keystroke.
 *
 * @param {any} value - The raw input value to debounce
 * @param {number} delay - Milliseconds to wait (default: 350ms)
 */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // If the value changes before the timer fires, clear and restart
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
