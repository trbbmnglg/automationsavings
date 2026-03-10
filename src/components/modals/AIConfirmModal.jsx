import React from 'react';
import { Sparkles, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AIConfirmModal({ onConfirm, onCancel }) {
  const { isDarkMode, textHeading, textSub, borderMuted } = useApp();

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

        {/* Body */}
        <p className={`text-sm ${textSub} text-center leading-relaxed mb-3`}>
          The <strong className="text-amber-500">Auto-Fill Details</strong> feature will use AI to generate suggestions for your KPIs, Challenges, and Qualitative Benefits based on your Automation Name and Use Case.
        </p>
        <div className={`${isDarkMode ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50 border-amber-200/60'} border rounded-2xl p-4 mb-6`}>
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'} leading-relaxed`}>
            ⚠️ AI-generated content may be inaccurate or incomplete. Always review and edit the generated fields before using them in a business case.
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
