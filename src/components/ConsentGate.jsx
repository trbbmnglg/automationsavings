import React, { useState, useEffect } from 'react';
import { Shield, ChevronDown, ChevronUp, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';

const CONSENT_KEY = 'as_consent_v1';

// ─────────────────────────────────────────────────────────────────
// NotAllowedPage — shown when user declines consent
// ─────────────────────────────────────────────────────────────────
function NotAllowedPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-900/20 flex items-center justify-center mb-6">
          <ShieldAlert size={40} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
          Access Not Permitted
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          You declined the consent and data processing agreement. Access to the
          Automation Savings Calculator requires acceptance of the terms to proceed.
        </p>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 mb-6 text-left space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Why consent is required</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            This tool uses AI features that may transmit limited text inputs to a third-party
            AI provider. Under <strong className="text-slate-300">GDPR</strong>,{' '}
            <strong className="text-slate-300">PDPA (RA 10173)</strong>, and the{' '}
            <strong className="text-slate-300">EU AI Act</strong>, users must be informed
            and provide consent before such processing occurs.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold transition-colors shadow-lg"
        >
          Return & Review Terms
        </button>
        <p className="text-slate-600 text-xs mt-4">
          No data was stored or transmitted as a result of declining.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ConsentGate — wraps the entire app, renders children only after consent
// ─────────────────────────────────────────────────────────────────
export default function ConsentGate({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'pending' | 'granted' | 'denied'
  const [expandedSection, setExpandedSection] = useState(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    dataProcessing: false,
    aiTransmission: false,
    pdpa: false,
    aiAct: false,
  });

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      if (stored === 'granted') {
        setStatus('granted');
      } else {
        setStatus('pending');
      }
    } catch {
      setStatus('pending');
    }
  }, []);

  const allChecked = Object.values(checkboxes).every(Boolean);

  const handleScroll = (e) => {
    const el = e.target;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
    if (atBottom) setScrolledToBottom(true);
  };

  const handleAgree = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, 'granted');
    } catch { /* ignore */ }
    setStatus('granted');
  };

  const handleDecline = () => {
    try {
      window.localStorage.removeItem(CONSENT_KEY);
    } catch { /* ignore */ }
    setStatus('denied');
  };

  const toggle = (key) => setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleSection = (s) => setExpandedSection(prev => prev === s ? null : s);

  if (status === 'loading') return null;
  if (status === 'denied') return <NotAllowedPage />;
  if (status === 'granted') return <>{children}</>;

  // ── Consent modal ──
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1E293B] border border-slate-700 rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="bg-[#0F172A] border-b border-slate-700 px-8 py-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl">
              <Shield size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Data & Privacy Consent
              </h1>
              <p className="text-sm text-slate-400 font-medium mt-0.5">
                Automation Savings Calculator — Please read before proceeding
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-4"
          onScroll={handleScroll}
        >
          <p className="text-sm text-slate-300 leading-relaxed">
            Before using this tool, please read and acknowledge the following data
            processing and privacy disclosures. This is required under applicable
            privacy and AI regulations.
          </p>

          {/* ── Section 1: What this tool does ── */}
          <DisclosureSection
            id="tool"
            title="1. What This Tool Does"
            badge="General"
            badgeColor="blue"
            expanded={expandedSection === 'tool'}
            onToggle={() => toggleSection('tool')}
          >
            <p>The <strong className="text-white">Automation Savings Calculator</strong> is a browser-based tool
            that helps you build data-driven business cases for automation projects by calculating ROI,
            time savings, FTE reductions, and net financial impact.</p>
            <p className="mt-2">It optionally uses AI language models to generate suggested content (KPIs,
            challenges, qualitative benefits, and business case pitches) based on text you provide.</p>
            <p className="mt-2">The tool operates entirely in your browser. <strong className="text-white">No project
            data is transmitted to our servers.</strong> There is no account, no login, and no server-side storage.</p>
          </DisclosureSection>

          {/* ── Section 2: Data We Process ── */}
          <DisclosureSection
            id="data"
            title="2. Data Collected & Processed"
            badge="Data Processing"
            badgeColor="amber"
            expanded={expandedSection === 'data'}
            onToggle={() => toggleSection('data')}
          >
            <p className="font-semibold text-white mb-2">Stored in your browser (localStorage):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>UI preferences: theme, color scheme, dark/light mode</li>
              <li>Work schedule settings: working days per month, hours per day</li>
              <li>Labor Cost Rate (LCR) configurations</li>
              <li>Currency selection and AI provider preference</li>
            </ul>
            <p className="mt-3 font-semibold text-white mb-2">Session-only (cleared on page refresh, never persisted):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Automation project name and use case description</li>
              <li>Labor breakdown, cost figures, SRE configurations</li>
              <li>AI-generated content (pitches, insights, suggestions)</li>
              <li>All financial inputs and calculation results</li>
            </ul>
            <p className="mt-3 font-semibold text-white mb-2">Never collected:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your name, email address, or any personal identifiers</li>
              <li>Device identifiers, IP address, or browser fingerprints</li>
              <li>Usage analytics or behavioral tracking</li>
            </ul>
          </DisclosureSection>

          {/* ── Section 3: AI Data Transmission ── */}
          <DisclosureSection
            id="ai"
            title="3. AI Features & Third-Party Data Transmission"
            badge="AI Act · GDPR"
            badgeColor="purple"
            expanded={expandedSection === 'ai'}
            onToggle={() => toggleSection('ai')}
          >
            <p>When you use AI-powered features (Auto-Fill Details, Generate Pitch, AI Strategy Insights),
            limited text inputs are transmitted to a third-party AI provider:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-white">Pollinations.ai</strong> — default, free, no account required</li>
              <li><strong className="text-white">Groq</strong> — optional, requires your own API key</li>
              <li><strong className="text-white">OpenRouter</strong> — optional, requires your own API key</li>
            </ul>
            <p className="mt-3"><strong className="text-white">What is transmitted:</strong> Your Automation Name and Use Case description only.</p>
            <p className="mt-2"><strong className="text-white">What is NOT transmitted:</strong> Financial figures, cost data, labor rates, or any numerical inputs.</p>
            <p className="mt-2"><strong className="text-white">PII Protection:</strong> A client-side scanner automatically detects and redacts sensitive data
            (emails, phone numbers, ID numbers, API keys, financial amounts) before any AI call is made.
            You are shown a warning and the specific types detected before confirming transmission.</p>
            <p className="mt-2"><strong className="text-white">EU AI Act Classification:</strong> This tool is classified as <strong>low-risk AI</strong> under
            Regulation (EU) 2024/1689. All AI-generated content is labeled and requires human review.</p>
            <p className="mt-2">Each AI provider operates under their own terms of service and privacy policy.
            By using AI features, you acknowledge that your inputs (after redaction) will be processed
            by the selected provider.</p>
          </DisclosureSection>

          {/* ── Section 4: GDPR ── */}
          <DisclosureSection
            id="gdpr"
            title="4. GDPR — General Data Protection Regulation (EU)"
            badge="EU · GDPR"
            badgeColor="blue"
            expanded={expandedSection === 'gdpr'}
            onToggle={() => toggleSection('gdpr')}
          >
            <p>If you are located in the European Economic Area (EEA), the following applies under
            Regulation (EU) 2016/679 (GDPR):</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong className="text-white">Lawful basis:</strong> Processing is based on your explicit consent (Article 6(1)(a)) provided by accepting these terms.</li>
              <li><strong className="text-white">Data minimization:</strong> Only the minimum data necessary for AI features is transmitted. Financial and numerical data is excluded.</li>
              <li><strong className="text-white">Right to erasure:</strong> Since no data is stored server-side, erasure is automatic on page refresh. Locally stored preferences can be cleared via the Clear Data button.</li>
              <li><strong className="text-white">Third-party processors:</strong> Pollinations.ai, Groq, and OpenRouter act as independent data processors when AI features are used. Review their respective privacy policies.</li>
              <li><strong className="text-white">Data transfers:</strong> AI providers may process data outside the EU/EEA. By using AI features, you acknowledge this cross-border transfer.</li>
              <li><strong className="text-white">Withdraw consent:</strong> You may withdraw consent at any time by declining AI features when prompted, or by not using AI-powered functions.</li>
            </ul>
          </DisclosureSection>

          {/* ── Section 5: PDPA ── */}
          <DisclosureSection
            id="pdpa"
            title="5. PDPA — Data Privacy Act of 2012 (Philippines, RA 10173)"
            badge="PH · PDPA"
            badgeColor="red"
            expanded={expandedSection === 'pdpa'}
            onToggle={() => toggleSection('pdpa')}
          >
            <p>If you are a data subject under Philippine law, the following applies under
            Republic Act No. 10173 (Data Privacy Act of 2012) and its Implementing Rules and Regulations:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong className="text-white">Personal information:</strong> This tool does not collect personally identifiable information as defined under Section 3(g) of RA 10173, including your name, address, or contact details. You are not required to input personal information to use this tool.</li>
              <li><strong className="text-white">Sensitive personal information (SPI):</strong> If you inadvertently enter SPI (e.g., PH TIN, SSS/GSIS numbers, health data, financial records) into text fields, the client-side PII scanner will detect and redact these before any AI transmission occurs.</li>
              <li><strong className="text-white">Cross-border transfer:</strong> When AI features are used, text inputs may be transmitted to servers located outside the Philippines (United States and/or EU). You are hereby informed of and consent to this transfer as required under Section 21 of RA 10173.</li>
              <li><strong className="text-white">Security measures:</strong> Appropriate organizational and technical measures are in place including session-only data storage, automatic PII redaction, and memory-only API key handling.</li>
              <li><strong className="text-white">Your rights under RA 10173:</strong> Right to be informed ✓ (this disclosure), right to access (all data is in your browser), right to erasure (Clear Data button), right to object (decline AI features at any prompt).</li>
              <li><strong className="text-white">NPC:</strong> For concerns, you may contact the National Privacy Commission at <span className="text-blue-400">privacy.gov.ph</span>.</li>
            </ul>
          </DisclosureSection>

          {/* ── Section 6: EU AI Act ── */}
          <DisclosureSection
            id="aiact"
            title="6. EU AI Act — Regulation (EU) 2024/1689"
            badge="EU · AI Act"
            badgeColor="purple"
            expanded={expandedSection === 'aiact'}
            onToggle={() => toggleSection('aiact')}
          >
            <p>This tool uses AI systems for content generation. Under the EU Artificial Intelligence Act:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong className="text-white">Risk classification:</strong> This tool is classified as <strong>LOW RISK</strong>. It does not perform biometric identification, make employment decisions, affect critical infrastructure, or engage in social scoring.</li>
              <li><strong className="text-white">Transparency obligation (Article 52):</strong> You are hereby informed that AI systems are used to generate text suggestions within this tool. All AI-generated content is clearly labeled with an "AI" badge.</li>
              <li><strong className="text-white">Human oversight:</strong> AI-generated content is always presented as suggestions that require your review, editing, and approval before use. The tool does not make autonomous decisions.</li>
              <li><strong className="text-white">General Purpose AI (GPAI):</strong> The underlying AI models (e.g., Pollinations.ai, Groq LLaMA, OpenRouter models) are GPAI systems. Their providers bear primary compliance obligations under Title VIII of the EU AI Act.</li>
            </ul>
          </DisclosureSection>

          {/* ── Section 7: CCPA ── */}
          <DisclosureSection
            id="ccpa"
            title="7. CCPA — California Consumer Privacy Act (US)"
            badge="US · CCPA"
            badgeColor="amber"
            expanded={expandedSection === 'ccpa'}
            onToggle={() => toggleSection('ccpa')}
          >
            <p>If you are a California resident, the following applies under the California Consumer
            Privacy Act (CCPA) as amended by CPRA:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong className="text-white">Personal information collected:</strong> This tool does not collect personal information as defined under Cal. Civ. Code § 1798.140(v).</li>
              <li><strong className="text-white">Sale of personal information:</strong> We do not sell or share your personal information. No personal information is transmitted to third parties for commercial purposes.</li>
              <li><strong className="text-white">Third-party disclosure:</strong> When AI features are used, limited text (after PII redaction) is shared with AI providers (Pollinations.ai, Groq, OpenRouter) solely for the purpose of generating content you requested.</li>
              <li><strong className="text-white">Right to opt-out:</strong> You may decline AI features at any prompt to prevent any data being shared with third-party AI providers.</li>
            </ul>
          </DisclosureSection>

          {/* ── Checkboxes ── */}
          <div className="pt-2 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Please confirm each item to proceed
            </p>

            {[
              {
                key: 'dataProcessing',
                text: 'I have read and understood how this tool stores and processes data, including that project data is session-only and not transmitted to any servers operated by this tool.'
              },
              {
                key: 'aiTransmission',
                text: 'I understand that using AI features will transmit my Automation Name and Use Case to a third-party AI provider (Pollinations.ai by default), and that sensitive data will be automatically redacted before transmission.'
              },
              {
                key: 'pdpa',
                text: 'I acknowledge the disclosures made under the Philippine Data Privacy Act (RA 10173), including cross-border data transfer when AI features are used.'
              },
              {
                key: 'aiAct',
                text: 'I understand this tool uses low-risk AI systems under the EU AI Act, that AI-generated content requires my review before use, and that I retain full human oversight.'
              },
            ].map(({ key, text }) => (
              <label
                key={key}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  checkboxes[key]
                    ? 'bg-emerald-950/20 border-emerald-800/50'
                    : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                  checkboxes[key]
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-600 bg-transparent'
                }`}
                  onClick={() => toggle(key)}
                >
                  {checkboxes[key] && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
                </div>
                <span
                  className={`text-xs leading-relaxed font-medium ${checkboxes[key] ? 'text-emerald-200' : 'text-slate-400'}`}
                  onClick={() => toggle(key)}
                >
                  {text}
                </span>
              </label>
            ))}
          </div>

          {/* Scroll nudge */}
          {!scrolledToBottom && (
            <p className="text-center text-[11px] text-slate-500 font-medium animate-pulse pb-2">
              ↓ Scroll down to read all sections and enable the checkboxes
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0F172A] border-t border-slate-700 px-8 py-5 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 py-3 rounded-2xl font-bold text-sm transition-colors bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            >
              Decline & Exit
            </button>
            <button
              onClick={handleAgree}
              disabled={!allChecked}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                allChecked
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {allChecked ? '✓ I Agree — Proceed to App' : `Confirm all ${Object.values(checkboxes).filter(Boolean).length}/4 items above`}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-3">
            Your consent is stored locally in your browser. You may withdraw by clearing browser data or using the Clear Data button in the app.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DisclosureSection — collapsible section component
// ─────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  blue:   'bg-blue-900/40 text-blue-300',
  amber:  'bg-amber-900/30 text-amber-300',
  purple: 'bg-purple-900/30 text-purple-300',
  red:    'bg-red-900/30 text-red-300',
};

function DisclosureSection({ id, title, badge, badgeColor, expanded, onToggle, children }) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${
      expanded ? 'border-slate-600' : 'border-slate-700/60'
    }`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${
          expanded ? 'bg-slate-700/40' : 'bg-slate-800/40 hover:bg-slate-800/70'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${BADGE_COLORS[badgeColor] || BADGE_COLORS.blue}`}>
            {badge}
          </span>
          <span className="text-sm font-bold text-slate-200">{title}</span>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-slate-400 shrink-0" />
          : <ChevronDown size={16} className="text-slate-400 shrink-0" />
        }
      </button>
      {expanded && (
        <div className="px-5 py-4 bg-slate-900/30 text-xs text-slate-400 leading-relaxed space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
