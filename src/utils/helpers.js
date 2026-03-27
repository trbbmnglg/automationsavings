/**
 * Shared utility functions used across hooks and components.
 */

/**
 * Returns the score color based on automation score value.
 * @param {number} score - The automation score (0-100)
 * @param {'tailwind'|'hex'} format - Output format
 * @returns {string} Color string in the requested format
 */
export const getScoreColor = (score, format = 'tailwind') => {
  const colors = {
    tailwind: { green: 'text-emerald-400', blue: 'text-blue-400', amber: 'text-amber-400', red: 'text-red-400' },
    hex: { green: '10B981', blue: '3B82F6', amber: 'F59E0B', red: 'EF4444' }
  };
  const palette = colors[format] || colors.tailwind;
  if (score >= 80) return palette.green;
  if (score >= 60) return palette.blue;
  if (score >= 40) return palette.amber;
  return palette.red;
};

/**
 * Returns the score label based on automation score value.
 * @param {number} score - The automation score (0-100)
 * @returns {string} Human-readable label
 */
export const getScoreLabel = (score) => {
  if (score >= 80) return 'Strong Investment';
  if (score >= 60) return 'Good Investment';
  if (score >= 40) return 'Marginal Return';
  return 'High Risk / Reject';
};

/**
 * Sanitizes a string for use as a filename by removing unsafe characters.
 * @param {string} str - The input string
 * @returns {string} Sanitized filename-safe string
 */
export const sanitizeFilename = (str) =>
  (str || '').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();

/**
 * Validates that a value is a non-empty, non-negative number.
 * Used for input error styling checks.
 * @param {string|number} value - The input value
 * @returns {boolean} True if the value is invalid (present but negative)
 */
export const isNegativeInput = (value) =>
  value !== '' && Number(value) < 0;

/**
 * Validates remote LCR data has the expected shape.
 * @param {object} data - The remote LCR data
 * @returns {boolean} True if data is valid
 */
export const isValidLcrData = (data) => {
  if (!data || typeof data !== 'object') return false;
  const entries = Object.entries(data);
  if (entries.length === 0) return false;
  return entries.every(([key, value]) =>
    typeof key === 'string' &&
    typeof value === 'number' &&
    isFinite(value) &&
    value >= 0
  );
};
