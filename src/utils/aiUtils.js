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
         if (i === delays.length - 1) throw new Error("Request timed out after multiple retries.");
      } else if (i === delays.length - 1 || (error.status >= 400 && error.status < 500 && error.status !== 429)) {
         throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

export const sanitizeStr = (str, limit = 400) => 
  (str || '')
    .substring(0, limit)
    .replace(/[{}`\\]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/ignore\s+(previous|all|prior)\s+instructions?/gi, '[REDACTED]')
    .replace(/\bsystem\s*prompt\b/gi, '[REDACTED]')
    .trim();

// ─── Preemptive Security Detection ────────────────────────────────────────────

// Prompt injection patterns
const INJECTION_PATTERNS = [
  /ignore\s+(the\s+)?(previous|all|prior|above|any)\s+(instructions?|context|prompt|rules?|constraints?)/i,
  /forget\s+(everything|all|what|your|previous|prior|above)/i,
  /you\s+are\s+now\s+(DAN|GPT|an?\s+AI|a\s+different|unrestricted|jailbroken)/i,
  /\bDAN\b/,
  /jailbreak/i,
  /act\s+as\s+(if\s+you\s+(are|were)|a\s+different|an?\s+unrestricted)/i,
  /do\s+anything\s+now/i,
  /(reveal|output|print|show|display|give\s+me)\s+(your|the)\s+(system\s+)?prompt/i,
  /what\s+(are|were)\s+your\s+(system\s+)?instructions/i,
  /(override|disregard|bypass|circumvent)\s+(your\s+)?(instructions?|safety|rules?|constraints?|filters?|restrictions?|previous)/i,
  /new\s+instruction[s:]/i,
  /\[SYSTEM\]/i,
  /<\|system\|>/i,
  /###\s*instruction/i,
];

// PII patterns — tightened to reduce false positives on business quantities
const PII_PATTERNS = [
  // SSN: strict 123-45-6789 format (requires dashes to avoid matching plain numbers)
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/, label: 'Social Security Number (SSN)' },
  // Credit/debit card: 16 digits with separators (requires at least one separator to avoid matching plain numbers)
  { pattern: /\b\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}\b/, label: 'Credit/Debit Card Number' },
  // Passport: 1-2 letters + 6-9 digits
  { pattern: /\b[A-Z]{1,2}\d{6,9}\b/, label: 'Passport Number' },
  // Philippine TIN: strict 000-000-000 or 000-000-000-000 (requires dashes)
  { pattern: /\b\d{3}-\d{3}-\d{3}(-\d{3})?\b/, label: 'Tax Identification Number (TIN)' },
  // Email addresses
  { pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/, label: 'Email Address' },
  // Phone numbers (PH format +63 or 09xx, or generic international — requires country code prefix)
  { pattern: /(\+63|0)[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/, label: 'Phone Number' },
  { pattern: /\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,4}[\s-]?\d{4}\b/, label: 'Phone Number' },
  // Bank account: requires keyword context
  { pattern: /\bbank\s+account\s*(number|no\.?)?\s*:?\s*\d{8,16}\b/i, label: 'Bank Account Number' },
];

// XSS / code injection patterns
const XSS_PATTERNS = [
  /<script[\s>]/gi,
  /<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=\s*["']?[^"'\s>]+/gi,  // onerror=, onclick=, etc.
  /<img[^>]+onerror/gi,
  /<iframe/gi,
  /eval\s*\(/gi,
  /document\s*\.\s*(cookie|localStorage|write)/gi,
  /window\s*\.\s*(location|open)/gi,
  /fetch\s*\(\s*['"]https?:\/\//gi,
  /\bexec\s*\(/gi,
];

/**
 * Runs all security checks on a given string.
 * Returns { safe: true } or { safe: false, reason: string, category: string }
 */
export const checkInputSecurity = (str) => {
  if (typeof str !== 'string') return { safe: true, skipped: true };
  if (!str.trim()) return { safe: true };

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(str)) {
      return {
        safe: false,
        category: 'prompt_injection',
        reason: 'Potential prompt injection detected. Instructions or directives to manipulate AI behavior are not allowed in this field.'
      };
    }
  }

  for (const { pattern, label } of PII_PATTERNS) {
    if (pattern.test(str)) {
      return {
        safe: false,
        category: 'pii',
        reason: `Personal information detected (${label}). Please remove sensitive data before using AI features. This tool does not accept PII.`
      };
    }
  }

  for (const pattern of XSS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(str)) {
      return {
        safe: false,
        category: 'xss',
        reason: 'Potentially unsafe content detected (script or HTML injection). Please remove any code or HTML tags from your input.'
      };
    }
  }

  return { safe: true };
};

/**
 * Checks all relevant fields before any AI call.
 * Returns { safe: true } or { safe: false, reason, category, field }
 */
export const checkAllFieldsSecurity = ({ toolName = '', useCase = '', challenges = '', kpis = '', qualitativeBenefits = '' }) => {
  const fields = [
    { key: 'toolName', label: 'Automation Name', value: toolName },
    { key: 'useCase', label: 'Use Case Description', value: useCase },
    { key: 'challenges', label: 'Challenges Addressed', value: challenges },
    { key: 'kpis', label: 'Target KPIs', value: kpis },
    { key: 'qualitativeBenefits', label: 'Qualitative Benefits', value: qualitativeBenefits },
  ];

  for (const { key, label, value } of fields) {
    const result = checkInputSecurity(value);
    if (!result.safe) {
      return { ...result, field: label };
    }
  }

  return { safe: true };
};
