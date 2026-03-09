import { useState, useEffect } from 'react';

export function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) {
        return JSON.parse(stickyValue);
      }
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Error setting localStorage key "${key}":`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
