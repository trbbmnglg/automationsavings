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
  // Four distinct Accenture-brand tiers so Strong/Good/Marginal/Risk are
  // visually differentiable in the ResultsPanel viability pill.
  // Hex values are pulled from the Accenture palette so PPTX/XLSX exports
  // stay brand-consistent with the on-screen tier.
  const colors = {
    tailwind: {
      strong:   'text-accenture-purple-dark',
      good:     'text-accenture-purple',
      marginal: 'text-accenture-purple-light',
      risk:     'text-accenture-pink'
    },
    hex: {
      strong:   '460073',
      good:     'A100FF',
      marginal: 'B455FF',
      risk:     'E6007E'
    }
  };
  const palette = colors[format] || colors.tailwind;
  if (score >= 80) return palette.strong;
  if (score >= 60) return palette.good;
  if (score >= 40) return palette.marginal;
  return palette.risk;
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
 * Single source of truth for displaying ROI / payback when the value is
 * Infinity (no run cost + positive savings) or NaN. Keeps the UI, the XLSX
 * export, the PPTX export, and the AI prompts aligned on one string shape.
 * @param {number} roi - ROI percentage (may be Infinity)
 * @returns {string} Formatted ROI string
 */
export const formatRoi = (roi) => {
  if (!isFinite(roi)) return '>1000%';
  return `${Math.round(roi).toLocaleString()}%`;
};

/**
 * @param {number} months - Payback period in months (may be Infinity or 0)
 * @returns {string} Formatted payback period
 */
export const formatPayback = (months) => {
  if (!isFinite(months)) return 'Never';
  if (months === 0) return 'Immediate';
  return `${months.toFixed(1)} mo`;
};

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
