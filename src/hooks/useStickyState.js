import { useState, useEffect } from 'react';

/**
 * useStickyState — persists state to localStorage with optional TTL.
 * @param {*} defaultValue
 * @param {string} key — localStorage key
 * @param {number|null} ttlHours — hours before expiry. null = never expires (for config/preferences).
 */
export function useStickyState(defaultValue, key, ttlHours = null) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return typeof defaultValue === 'function' ? defaultValue() : defaultValue;

      const parsed = JSON.parse(raw);

      // Support both legacy plain values and new { value, savedAt } format
      if (parsed !== null && typeof parsed === 'object' && 'savedAt' in parsed) {
        if (ttlHours !== null) {
          const ageHours = (Date.now() - parsed.savedAt) / 1000 / 3600;
          if (ageHours > ttlHours) {
            window.localStorage.removeItem(key);
            return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
          }
        }
        return parsed.value;
      }

      // Legacy format — plain value, no TTL metadata
      return parsed;
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  });

  useEffect(() => {
    try {
      const payload = ttlHours !== null
        ? JSON.stringify({ value, savedAt: Date.now() })
        : JSON.stringify(value);
      window.localStorage.setItem(key, payload);
    } catch (err) {
      console.warn(`Error setting localStorage key "${key}":`, err);
    }
  }, [key, value]); // eslint-disable-line react-hooks/exhaustive-deps -- ttlHours is config, not reactive

  return [value, setValue];
}
