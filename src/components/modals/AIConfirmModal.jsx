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
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-sm border p-8`}>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
              <Sparkles size={30} className="text-amber-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <AlertTriangle size={13} className="text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 id="ai-confirm-title" className={`text-xl font-bold ${textHeading} text-center mb-2`}>
          AI-Generated Content
        </h2>
        <p className={`text-sm ${textSub} text-center leading-relaxed mb-4`}>
          <strong className="text-amber-500">Auto-Fill Details</strong> will use AI to suggest KPIs, Challenges, and Qualitative Benefits based on your inputs.
        </p>

        {/* What gets sent */}
        <div className={`${isDarkMode ? 'bg-blue-950/20 border-blue-900/40' : 'bg-blue-50 border-blue-100'} border rounded-2xl p-4 mb-3`}>
          <div className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-2 flex items-center gap-1.5`}>
            <Shield size={11} /> Data Transmitted
          </div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} leading-relaxed`}>
            Your <strong>Automation Name</strong> and <strong>Use Case</strong> will be sent to{' '}
            <strong className="text-amber-500">{providerName}</strong> to generate suggestions.
            Financial figures and cost data are <strong>not</strong> transmitted.
          </p>
        </div>

        {/* Review warning */}
        <div className={`${isDarkMode ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50 border-amber-200/60'} border rounded-2xl p-4 mb-6`}>
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'} leading-relaxed`}>
            ⚠️ AI-generated content may be inaccurate. Always review and edit the generated fields before using them in a business case.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-2xl font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Sparkles size={16} />
            Yes, Auto-Fill with AI
          </button>
          <button
            onClick={onCancel}
            className={`w-full py-3 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
