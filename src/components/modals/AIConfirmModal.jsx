import React from 'react';
import { Sparkles, AlertTriangle, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PROVIDER_LABELS = {
  pollinations: 'Pollinations.ai',
  groq: 'Groq',
  openrouter: 'OpenRouter',
};

export default function AIConfirmModal({ onConfirm, onCancel }) {
  const { isDarkMode, textHeading, textSub, aiProvider } = useApp();

  const providerName = PROVIDER_LABELS[aiProvider] || aiProvider;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-confirm-title"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-accenture-gray-dark' : 'bg-white border-accenture-gray-light'} rounded-none shadow-2xl w-full max-w-sm border p-8`}>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className={`w-16 h-16  flex items-center justify-center ${isDarkMode ? 'bg-accenture-purple' : 'bg-accenture-purple-lightest'}`}>
              <Sparkles size={30} className="text-accenture-purple-dark" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accenture-purple flex items-center justify-center">
              <AlertTriangle size={13} className="text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 id="ai-confirm-title" className={`text-xl font-bold ${textHeading} text-center mb-2`}>
          AI-Generated Content
        </h2>
        <p className={`text-sm ${textSub} text-center leading-relaxed mb-4`}>
          <strong className="text-accenture-purple-dark">Auto-Fill Details</strong> will use AI to suggest KPIs, Challenges, and Qualitative Benefits based on your inputs.
        </p>

        {/* What gets sent */}
        <div className={`${isDarkMode ? 'bg-accenture-purple-darkest/20 border-accenture-purple-dark/40' : 'bg-accenture-purple-lightest border-accenture-purple-light'} border  p-4 mb-3`}>
          <div className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark'} mb-2 flex items-center gap-1.5`}>
            <Shield size={11} /> Data Transmitted
          </div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-accenture-purple-light' : 'text-accenture-purple-dark'} leading-relaxed`}>
            Your <strong>Automation Name</strong> and <strong>Use Case</strong> will be sent to{' '}
            <strong className="text-accenture-purple-dark">{providerName}</strong> to generate suggestions.
            Financial figures and cost data are <strong>not</strong> transmitted.
          </p>
        </div>

        {/* Review warning */}
        <div className={`${isDarkMode ? 'bg-accenture-purple-lightest border-accenture-purple-light' : 'bg-accenture-purple-lightest border-accenture-purple-light'} border  p-4 mb-6`}>
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark'} leading-relaxed`}>
            ⚠️ AI-generated content may be inaccurate. Always review and edit the generated fields before using them in a business case.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 bg-accenture-purple hover:bg-accenture-purple text-white py-3 font-bold transition-all shadow-md shadow-accenture-purple/20"
          >
            <Sparkles size={16} />
            Yes, Auto-Fill with AI
          </button>
          <button
            onClick={onCancel}
            className={`w-full py-3  font-bold transition-all ${isDarkMode ? 'bg-[#0a0a0a] text-accenture-gray-light hover:bg-[#1a1a1a]' : 'bg-accenture-gray-off-white text-accenture-gray-dark hover:bg-accenture-gray-off-white'}`}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
