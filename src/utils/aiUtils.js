export const fetchWithRetry = async (url, options) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < delays.length; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        const err = new Error(`HTTP ${response.status}: ${text}`);
        err.status = response.status;
        throw err;
      }
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        if (i === delays.length - 1) throw new Error('Request timed out after multiple retries.');
      } else if (i === delays.length - 1 || (error.status >= 400 && error.status < 500 && error.status !== 429)) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

/**
 * sanitizeStr — basic sanitization for any user input.
 * Strips prompt injection attempts and limits length.
 */
export const sanitizeStr = (str, limit = 400) =>
  (str || '')
    .substring(0, limit)
    .replace(/[{}`\\]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/ignore\s+(previous|all|prior)\s+instructions?/gi, '[REDACTED]')
    .replace(/\bsystem\s*prompt\b/gi, '[REDACTED]')
    .trim();

/**
 * sanitizeForAI — used specifically before sending user text to an AI provider.
 * Extends sanitizeStr by also stripping large numbers (financial figures)
 * since the AI only needs qualitative context, not dollar amounts or volumes.
 */
export const sanitizeForAI = (str, limit = 400) =>
  sanitizeStr(str, limit)
    .replace(/\b\d{5,}\b/g, '[NUM]')   // strip large numbers (5+ digits) e.g. "5000 jobs", "$25000"
    .replace(/\$[\d,]+/g, '[AMOUNT]');  // strip explicit dollar amounts e.g. "$10,000"
