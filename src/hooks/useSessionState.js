import { useState, useEffect } from 'react';

/**
 * useSessionState — persists state to sessionStorage only.
 *
 * This is intentionally separate from useStickyState (localStorage).
 * Use this for any data that must NOT survive a page refresh:
 *   - Automation project name / use case
 *   - Labor breakdown inputs
 *   - Cost figures, KPIs, challenges, qualitative benefits
 *   - AI-generated content (pitches, insights, suggestions)
 *   - All financial inputs and calculation results
 *
 * sessionStorage is automatically cleared by the browser when the tab or
 * window is closed, and is never shared between tabs, satisfying the
 * privacy disclosure made in ConsentGate and PrivacyPanel.
 *
 * API is intentionally identical to useStickyState so it can be swapped
 * in place without changing call sites.
 */
export function useSessionState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw === null) {
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`useSessionState: error reading sessionStorage key "${key}":`, err);
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`useSessionState: error writing sessionStorage key "${key}":`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
