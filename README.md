# Automation Savings Calculator

A browser-based tool that helps you build data-driven business cases for automation projects by calculating ROI, time savings, FTE reductions, and net financial impact.

**Live:** [automationsavings.pages.dev](https://automationsavings.pages.dev)

## Features

- **Month-by-month calculation engine** — compounds run cost inflation and variable SRE/maintenance costs over the project lifetime
- **Scenario modeling** — Optimistic, Realistic, and Conservative forecasts with dual-lever stress testing
- **Multi-currency** — Live exchange rates from Frankfurter API (USD, PHP, EUR, JPY)
- **AI-powered content generation** — Auto-fill KPIs, challenges, benefits, executive pitches, and ROI strategy insights
- **Export** — XLSX reports with monthly cash flow and PPTX one-slide executive summaries
- **Privacy-first** — No server, no accounts, no analytics; project data lives in sessionStorage only
- **Compliance** — GDPR, PDPA (RA 10173), CCPA, and EU AI Act consent gate

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

Requires **Node.js >= 18**.

## Project Structure

```
src/
├── components/          # UI components
│   ├── modals/          # Modal dialogs (Settings, SRE, RunCost, Breakdown, Clear, AI Confirm)
│   ├── Header.jsx       # Top bar with currency, theme, export, settings
│   ├── QualitativeSection.jsx   # Text inputs + AI auto-fill
│   ├── QuantitativeSection.jsx  # Labor breakdown, costs, SRE toggle
│   ├── ResultsPanel.jsx         # Score, net savings, ROI, payback
│   ├── CurrentVsFuturePanel.jsx # As-Is vs To-Be comparison
│   ├── OperationalImpactPanel.jsx # Time recaptured, FTE savings
│   ├── PitchPanel.jsx           # Business case pitch (manual + AI)
│   ├── PrivacyPanel.jsx         # Privacy & security disclosure
│   ├── MethodologyPanel.jsx     # Calculation methodology
│   ├── ConsentGate.jsx          # GDPR/PDPA/CCPA consent gate
│   ├── Toast.jsx                # Toast notification system
│   └── Tooltip.jsx              # Accessible tooltip component
├── context/
│   ├── AppContext.jsx   # Business state, hooks, derived calculations
│   └── UIContext.jsx    # Theme, modals, score toggle (split for perf)
├── hooks/
│   ├── useCalculationEngine.js  # Core ROI/savings math
│   ├── useAIHandlers.js         # AI provider abstraction + security
│   ├── useExportHandlers.js     # XLSX + PPTX generation
│   ├── useCurrencyHandlers.js   # Currency conversion logic
│   ├── useStickyState.js        # localStorage-backed useState
│   ├── useSessionState.js       # sessionStorage-backed useState
│   └── useTheme.js              # Dark/light + color theme styles
├── utils/
│   ├── aiUtils.js       # Prompt injection, PII, XSS scanning
│   └── helpers.js       # Shared utilities (score color, sanitize, etc.)
├── constants/
│   └── config.js        # LCR rates, provider options, currency config
├── App.jsx              # Root layout with provider nesting
├── main.jsx             # React DOM entry point
└── index.css            # Tailwind + custom styles
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for details on state management, provider nesting, calculation engine, and security model.

## Tech Stack

- **React 18** with hooks and context
- **Vite 6** for dev/build
- **Tailwind CSS 3** for styling
- **lucide-react** for icons
- **xlsx-js-style** for Excel export (lazy-loaded)
- **pptxgenjs** for PowerPoint export (lazy-loaded)

## Security

- Client-side input scanning for prompt injection, PII patterns (SSN, credit cards, emails, phone numbers), and XSS before any AI API call
- API keys held in React state only — never touches storage
- Content Security Policy headers restrict all network calls to known origins
- Session-only project data — cleared automatically on tab close

## License

MIT
