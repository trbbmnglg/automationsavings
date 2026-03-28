# Architecture

## Provider Nesting

```
ConsentGate          — blocks app until GDPR/PDPA/CCPA consent is granted
  └─ UIProvider      — theme, modals, score toggle (UIContext)
       └─ ToastProvider  — toast notification queue
            └─ AppProvider   — business state, calculation engine, AI/export (AppContext)
                 └─ AppLayout    — renders all panels and modals
```

**Why this order:** UIProvider must wrap AppProvider because AppContext consumes `useUI()` to merge UI state into its value object. ToastProvider must wrap AppProvider because hooks (AI, export) receive `addToast` for error notifications.

## State Management

### Three Storage Layers

| Layer | Hook | Lifetime | Examples |
|-------|------|----------|----------|
| **localStorage** | `useStickyState` | Survives refresh | Theme, currency, LCR rates, AI provider, scenario |
| **sessionStorage** | `useSessionState` | Tab lifetime | Tool name, use case, labor breakdown, all financials |
| **React state** | `useState` | Component lifetime | API key, exchange rates, loading flags, export state |

This matches the privacy disclosure in ConsentGate and PrivacyPanel.

### Context Split

- **UIContext** (`src/context/UIContext.jsx`) — Theme state (`isDarkMode`, `themeColor`), modal visibility flags, `showScore` toggle, and derived `themeStyles`. Changes here only re-render UI-dependent components.
- **AppContext** (`src/context/AppContext.jsx`) — All business state, calculation results, AI handlers, export handlers, currency handlers. Consumes UIContext via `useUI()` and merges it into the context value for backward compatibility (all consumers use `useApp()`).

## Calculation Engine

`useCalculationEngine.js` runs a month-by-month loop:

1. **For each month** (1 to `durationMonths`):
   - Compounds run cost inflation: `baseCost * (1 + inflation/100)^(year-1)`
   - Applies Y1 vs Y2+ SRE costs (switches at month 13)
   - Calculates net cash flow: `grossSavings - runCost - sreCost - (implCost if month 1)`
   - Tracks cumulative net to find exact payback month
2. **Scenario modifiers** adjust inputs before the loop:
   - Conservative: +25% costs, -25% automation yield
   - Optimistic: -10% costs, +10% automation yield
3. **Viability score** (0-100): ROI (40pts) + Payback (40pts) + FTE savings (20pts)

## Security Model

All AI-bound inputs pass through `checkAllFieldsSecurity()` before any network call:

1. **Prompt injection detection** — regex patterns for common injection techniques
2. **PII scanning** — SSN (with dashes), credit cards (with separators), emails, phone numbers
3. **XSS detection** — script tags, event handlers, javascript: URIs

Blocked requests show an inline error banner with the specific category and field. No blocked content is transmitted.

## Export Pipeline

Both XLSX and PPTX libraries are lazy-loaded via dynamic `import()` on first use:

- **XLSX** (`xlsx-js-style`) — Two sheets: summary + monthly cash flow
- **PPTX** (`pptxgenjs`) — Single-slide executive summary with doughnut chart

Filenames are sanitized via `sanitizeFilename()` to strip OS-illegal characters.

## Error Handling

- **ErrorBoundary** wraps AppLayout — catches render errors, shows fallback UI with reload
- **Toast notifications** surface AI and export errors to the user (replaces silent console.warn/alert)
- **Security errors** display inline in QualitativeSection with category-specific icons
