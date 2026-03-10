import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, Lock, Eye, Database, Cpu, AlertTriangle, Wifi } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PrivacyPanel() {
  const { cardStyle, isDarkMode, textSub, textHeading, borderMuted } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    {
      icon: <Database size={16} />,
      color: 'text-blue-500',
      bg: isDarkMode ? 'bg-blue-950/30' : 'bg-blue-50',
      title: 'Local Storage Only',
      body: 'All project data (inputs, results, settings) is saved exclusively in your browser\'s localStorage. No data is ever transmitted to any server operated by this tool.'
    },
    {
      icon: <Lock size={16} />,
      color: 'text-emerald-500',
      bg: isDarkMode ? 'bg-emerald-950/30' : 'bg-emerald-50',
      title: 'API Keys Never Stored',
      body: 'If you configure a third-party AI provider (Groq, OpenRouter), your API key is held in React state only and is permanently cleared when you close or refresh the page. It never touches localStorage or any server.'
    },
    {
      icon: <Eye size={16} />,
      color: 'text-purple-500',
      bg: isDarkMode ? 'bg-purple-950/30' : 'bg-purple-50',
      title: 'No Tracking or Analytics',
      body: 'This tool does not use cookies, advertising trackers, or behavioral analytics. Cloudflare Insights may collect anonymous page-level performance metrics as part of hosting infrastructure.'
    },
    {
      icon: <Cpu size={16} />,
      color: 'text-amber-500',
      bg: isDarkMode ? 'bg-amber-950/30' : 'bg-amber-50',
      title: 'AI Prompt Data',
      body: 'When using AI features, sanitized excerpts of your Automation Name and Use Case are sent to the selected AI provider (Pollinations.ai by default). Prompts are truncated to 400 characters and stripped of dangerous patterns before transmission. Do not enter PII, credentials, or confidential data into any text field.'
    },
    {
      icon: <AlertTriangle size={16} />,
      color: 'text-red-500',
      bg: isDarkMode ? 'bg-red-950/30' : 'bg-red-50',
      title: 'Input Security Controls',
      body: 'All AI-bound inputs are scanned client-side before any network call is made. Detected prompt injections, PII patterns (SSNs, credit card numbers, email addresses, phone numbers), and XSS attempts will block the AI request and display an error. No blocked content is transmitted.'
    },
    {
      icon: <Wifi size={16} />,
      color: 'text-indigo-500',
      bg: isDarkMode ? 'bg-indigo-950/30' : 'bg-indigo-50',
      title: 'External Network Calls',
      body: 'This tool makes three types of outbound requests: (1) api.frankfurter.app for live currency exchange rates, (2) raw.githubusercontent.com to fetch the latest LCR rate table, and (3) your selected AI provider endpoint when AI features are used. All other origins are blocked by the Content Security Policy.'
    },
  ];

  return (
    <div className={`${cardStyle} mb-6`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full p-6 md:p-8 flex items-center justify-between ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-colors text-left outline-none rounded-[28px]`}
      >
        <div className="flex items-center space-x-4">
          <div className={`${isDarkMode ? 'bg-emerald-950/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} p-3 rounded-2xl`}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className={`text-lg font-extrabold ${textHeading} tracking-tight`}>Privacy & Security</h2>
            <p className={`text-sm ${textSub} font-medium`}>How your data is handled and protected</p>
          </div>
        </div>
        <div className={`transform transition-transform duration-300 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} p-2 rounded-full ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} className={textSub} />
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className={`p-6 md:p-8 pt-0 border-t ${borderMuted}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {items.map(({ icon, color, bg, title, body }) => (
              <div
                key={title}
                className={`flex gap-4 p-5 rounded-2xl border ${borderMuted} ${isDarkMode ? 'bg-slate-800/20' : 'bg-white'} shadow-sm`}
              >
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                  {icon}
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${textHeading} mb-1`}>{title}</h3>
                  <p className={`text-xs ${textSub} leading-relaxed font-medium`}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-5 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs ${textSub} font-medium leading-relaxed text-center`}>
              This tool is open source. You can inspect all network calls, storage usage, and AI prompts in your browser's DevTools.
              Source code is available at{' '}
              <a
                href="https://github.com/trbbmnglg/automationsavings"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
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
