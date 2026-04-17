import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, Lock, Eye, Database, Cpu, AlertTriangle, Wifi } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PrivacyPanel() {
  const { cardStyle, isDarkMode, textSub, textHeading, borderMuted } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    {
      icon: <Database size={16} />,
      color: 'text-accenture-purple',
      bg: isDarkMode ? 'bg-accenture-purple-darkest/30' : 'bg-accenture-purple-lightest',
      // FIX: Retitled from "Local Storage Only" — the app now uses two distinct
      // storage layers. The old title and body were factually wrong after the
      // localStorage → sessionStorage migration for project data (Fix #2).
      title: 'Browser Storage — Two Layers',
      body: 'UI preferences (theme, LCR rates, currency, work schedule, AI provider) are saved in localStorage and persist across sessions. All project data — inputs, cost figures, labor breakdown, AI-generated content — is stored in sessionStorage only and is automatically cleared when you close or refresh the tab. No project data is ever transmitted to any server operated by this tool.'
    },
    {
      icon: <Lock size={16} />,
      color: 'text-accenture-purple',
      bg: isDarkMode ? 'bg-emerald-950/30' : 'bg-accenture-purple-lightest',
      title: 'API Keys Never Stored',
      body: 'If you configure a third-party AI provider (Groq, OpenRouter), your API key is held in React state only and is permanently cleared when you close or refresh the page. It never touches localStorage, sessionStorage, or any server.'
    },
    {
      icon: <Eye size={16} />,
      color: 'text-accenture-purple',
      bg: isDarkMode ? 'bg-accenture-purple-darkest/30' : 'bg-accenture-purple-lightest',
      title: 'No Tracking or Analytics',
      body: 'This tool does not use cookies, advertising trackers, or behavioral analytics. Cloudflare Insights may collect anonymous page-level performance metrics as part of hosting infrastructure.'
    },
    {
      icon: <Cpu size={16} />,
      color: 'text-accenture-purple-dark',
      bg: isDarkMode ? 'bg-accenture-purple-lightest' : 'bg-accenture-purple-lightest',
      title: 'AI Prompt Data',
      body: 'When using AI features, sanitized excerpts of your Automation Name and Use Case are sent to the selected AI provider (Pollinations.ai by default). Prompts are truncated to 400 characters and stripped of dangerous patterns before transmission. Do not enter PII, credentials, or confidential data into any text field.'
    },
    {
      icon: <AlertTriangle size={16} />,
      color: 'text-accenture-pink',
      bg: isDarkMode ? 'bg-accenture-pink/30' : 'bg-[#fff0f6]',
      title: 'Input Security Controls',
      body: 'All AI-bound inputs are scanned client-side before any network call is made. Detected prompt injections, PII patterns (SSNs, credit card numbers, email addresses, phone numbers), and XSS attempts will block the AI request and display an error. No blocked content is transmitted.'
    },
    {
      icon: <Wifi size={16} />,
      color: 'text-accenture-purple',
      bg: isDarkMode ? 'bg-accenture-purple-darkest/30' : 'bg-accenture-purple-lightest',
      title: 'External Network Calls',
      body: 'This tool makes three types of outbound requests: (1) api.frankfurter.app for live currency exchange rates, (2) raw.githubusercontent.com to fetch the latest LCR rate table, and (3) your selected AI provider endpoint when AI features are used. All other origins are blocked by the Content Security Policy.'
    },
  ];

  return (
    <div className={`${cardStyle} mb-6`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full p-6 md:p-8 flex items-center justify-between ${isDarkMode ? 'hover:bg-[#0a0a0a]/50' : 'hover:bg-accenture-gray-off-white'} transition-colors text-left outline-none rounded-[28px]`}
      >
        <div className="flex items-center space-x-4">
          <div className={`${isDarkMode ? 'bg-emerald-950/30 text-accenture-purple' : 'bg-accenture-purple-lightest text-accenture-purple-dark'} p-3 `}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 id="privacy-heading" className={`text-lg font-extrabold ${textHeading} tracking-tight`}>Privacy & Security</h2>
            <p className={`text-sm ${textSub} font-medium`}>How your data is handled and protected</p>
          </div>
        </div>
        <div className={`transform transition-transform duration-300 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-accenture-gray-off-white'} p-2 rounded-full ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} className={textSub} />
        </div>
      </button>

      <div
        role="region"
        aria-labelledby="privacy-heading"
        hidden={!isOpen}
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
        style={!isOpen ? { display: 'none' } : undefined}
      >
        <div className={`p-6 md:p-8 pt-0 border-t ${borderMuted}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {items.map(({ icon, color, bg, title, body }) => (
              <div
                key={title}
                className={`flex gap-4 p-5  border ${borderMuted} ${isDarkMode ? 'bg-[#0a0a0a]/20' : 'bg-white'} shadow-sm`}
              >
                <div className={`shrink-0 w-9 h-9  flex items-center justify-center ${bg} ${color}`}>
                  {icon}
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${textHeading} mb-1`}>{title}</h3>
                  <p className={`text-xs ${textSub} leading-relaxed font-medium`}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Withdraw Consent */}
          <div className={`mt-5 p-5  border ${isDarkMode ? 'bg-accenture-pink/10 border-accenture-pink/30' : 'bg-[#fff0f6]/50 border-accenture-pink/60'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className={`text-sm font-bold ${textHeading} mb-1`}>Withdraw Consent</h3>
                <p className={`text-xs ${textSub} leading-relaxed`}>Revoke your data processing consent and clear all locally stored data.</p>
              </div>
              <button
                onClick={() => {
                  try { window.localStorage.clear(); window.sessionStorage.clear(); } catch {}
                  window.location.reload();
                }}
                className={`shrink-0 text-xs font-bold px-4 py-2.5  transition-colors ${isDarkMode ? 'bg-accenture-pink/30 text-accenture-pink hover:bg-accenture-pink/50 border border-accenture-pink/50' : 'bg-[#fff0f6] text-accenture-pink hover:bg-[#fff0f6] border border-accenture-pink'}`}
              >
                Withdraw & Clear Data
              </button>
            </div>
          </div>

          <div className={`mt-5 p-4  border ${isDarkMode ? 'bg-[#0a0a0a]/30 border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'}`}>
            <p className={`text-xs ${textSub} font-medium leading-relaxed text-center`}>
              This tool is open source. You can inspect all network calls, storage usage, and AI prompts in your browser's DevTools.
              Source code is available at{' '}
              <a
                href="https://github.com/trbbmnglg/automationsavings"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold underline ${isDarkMode ? 'text-accenture-purple hover:text-accenture-purple-light' : 'text-accenture-purple-dark hover:text-accenture-purple-dark'}`}
              >
                github.com/trbbmnglg/automationsavings
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
