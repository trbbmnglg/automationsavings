import React, { useState } from 'react';
import { FileText, Sparkles, Loader2, Cpu, Info, BarChart3, Target, Award, ShieldAlert, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';
import AIConfirmModal from './modals/AIConfirmModal';

function AiBadge() {
  return (
    <span className="ml-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-accenture-purple-light bg-accenture-purple-lightest text-accenture-purple-dark dark:border-accenture-purple-light dark:bg-accenture-purple dark:text-accenture-purple text-[10px] font-bold uppercase tracking-wider shadow-sm">
      <Sparkles size={10} /><span>AI</span>
    </span>
  );
}

const CATEGORY_ICON = {
  prompt_injection: '🚫',
  pii: '🔒',
  xss: '⚠️',
};

export default function QualitativeSection() {
  const { 
    cardStyle, borderMuted, isDarkMode, textHeading, panelBg, textMain, textSub, inputStyle, 
    toolName, setToolName, useCase, setUseCase, kpis, setKpis, challenges, setChallenges, 
    qualitativeBenefits, setQualitativeBenefits, isGeneratingSuggestions, generateSuggestions,
    aiGeneratedFields, setAiGeneratedFields,
    securityError, setSecurityError
  } = useApp();

  const [showAIConfirm, setShowAIConfirm] = useState(false);

  const getFieldStyle = (isGenerated) => {
    if (!isGenerated) return inputStyle;
    return `${inputStyle} border-accenture-purple-light ring-4 ring-accenture-purple-light dark:border-accenture-purple-light dark:ring-accenture-purple-light bg-accenture-purple-lightest dark:bg-accenture-purple-lightest transition-all duration-500`;
  };

  const handleAiChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (aiGeneratedFields[field]) {
      setAiGeneratedFields(prev => ({ ...prev, [field]: false }));
    }
    // Clear security error when user edits fields
    if (securityError) setSecurityError(null);
  };

  const handleAutoFillClick = () => {
    if (!toolName && !useCase) return;
    setSecurityError(null);
    setShowAIConfirm(true);
  };

  const handleConfirm = () => {
    setShowAIConfirm(false);
    generateSuggestions();
  };

  return (
    <>
      {showAIConfirm && (
        <AIConfirmModal onConfirm={handleConfirm} onCancel={() => setShowAIConfirm(false)} />
      )}

      <section className={cardStyle}>
        <div className={`px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between border-b ${borderMuted} gap-4`}>
          <div className="flex items-center space-x-3">
            <div className={`${isDarkMode ? 'bg-accenture-purple/20 text-accenture-purple' : 'bg-accenture-purple-lightest text-accenture-purple-dark'} p-2.5 rounded-none`}>
              <FileText size={20} aria-hidden="true" />
            </div>
            <h2 className={`text-xl font-bold ${textHeading} tracking-tight`}>Qualitative Details</h2>
          </div>
          <button
            onClick={handleAutoFillClick}
            disabled={isGeneratingSuggestions || (!toolName && !useCase)}
            className={`flex items-center justify-center space-x-2 text-sm font-bold ${isDarkMode ? 'bg-accenture-purple-lightest hover:bg-accenture-purple text-accenture-purple border-accenture-purple-light' : 'bg-accenture-purple-lightest hover:bg-accenture-purple-lightest text-accenture-purple-dark border-accenture-purple-light'} px-4 py-2.5  transition-all disabled:opacity-50 disabled:cursor-not-allowed border`}
          >
            {isGeneratingSuggestions
              ? <Loader2 size={16} className="animate-spin text-accenture-purple-dark" />
              : <Sparkles size={16} className="text-accenture-purple-dark" />}
            <span>{isGeneratingSuggestions ? 'Auto-Filling...' : 'Auto-Fill Details'}</span>
          </button>
        </div>

        <div className={`p-6 md:p-8 space-y-5 ${panelBg} rounded-none`}>

          {/* Security Error Banner */}
          {securityError && (
            <div className={`flex items-start gap-3 p-4  border ${
              isDarkMode
                ? 'bg-accenture-pink/30 border-accenture-pink/50 text-accenture-pink'
                : 'bg-[#fff0f6] border-accenture-pink text-accenture-pink'
            }`}>
              <div className="shrink-0 mt-0.5">
                <ShieldAlert size={18} className="text-accenture-pink" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-extrabold uppercase tracking-widest mb-1 text-accenture-pink">
                  {CATEGORY_ICON[securityError.category]} AI Feature Blocked
                  {securityError.field && <span className="ml-2 font-bold normal-case tracking-normal opacity-80">— detected in: {securityError.field}</span>}
                </div>
                <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-accenture-pink' : 'text-accenture-pink'}`}>
                  {securityError.reason}
                </p>
              </div>
              <button
                onClick={() => setSecurityError(null)}
                className={`shrink-0 p-1  transition-colors ${isDarkMode ? 'hover:bg-accenture-pink/40 text-accenture-pink' : 'hover:bg-[#fff0f6] text-accenture-pink'}`}
              >
                <X size={15} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>
                Automation Name
                <Tooltip text="Give your automation project a short, recognizable name.">
                  <Info size={14} className={`${textSub} hover:text-accenture-purple transition-colors cursor-help`}/>
                </Tooltip>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${textSub}`}><Cpu size={18} /></div>
                <input
                  type="text"
                  value={toolName}
                  onChange={(e) => { setToolName(e.target.value); if (securityError) setSecurityError(null); }}
                  placeholder="e.g., Ticket Auto-Triage Bot"
                  className={`${inputStyle} pl-12 font-medium`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>
                Use Case Description
                <Tooltip text='What specific manual process is this bot replacing?'>
                  <Info size={14} className={`${textSub} hover:text-accenture-purple transition-colors cursor-help`}/>
                </Tooltip>
              </label>
              <textarea
                value={useCase}
                onChange={(e) => { setUseCase(e.target.value); if (securityError) setSecurityError(null); }}
                rows={2}
                placeholder="Briefly describe what the automation does..."
                className={`${inputStyle} resize-none font-medium`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>
                <BarChart3 size={16} className="mr-1.5 text-accenture-purple" />
                Target KPIs
                <Tooltip text='Which business metrics will this improve?'>
                  <Info size={14} className={`${textSub} hover:text-accenture-purple transition-colors cursor-help`}/>
                </Tooltip>
                {aiGeneratedFields.kpis && <AiBadge />}
              </label>
              <textarea
                value={kpis}
                onChange={handleAiChange(setKpis, 'kpis')}
                rows={3}
                placeholder="e.g., MTTR, CSAT, Error Rate..."
                className={`${getFieldStyle(aiGeneratedFields.kpis)} resize-none font-medium`}
              />
            </div>

            <div>
              <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>
                <Target size={16} className="mr-1.5 text-accenture-pink" />
                Challenges Addressed
                <Tooltip text='What pain points are solved?'>
                  <Info size={14} className={`${textSub} hover:text-accenture-purple transition-colors cursor-help`}/>
                </Tooltip>
                {aiGeneratedFields.challenges && <AiBadge />}
              </label>
              <textarea
                value={challenges}
                onChange={handleAiChange(setChallenges, 'challenges')}
                rows={4}
                placeholder="What pain points are solved?"
                className={`${getFieldStyle(aiGeneratedFields.challenges)} resize-none text-sm font-medium`}
              />
            </div>

            <div>
              <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>
                <Award size={16} className="mr-1.5 text-green-500" />
                Qualitative Benefits
                <Tooltip text='What are the soft benefits?'>
                  <Info size={14} className={`${textSub} hover:text-accenture-purple transition-colors cursor-help`}/>
                </Tooltip>
                {aiGeneratedFields.benefits && <AiBadge />}
              </label>
              <textarea
                value={qualitativeBenefits}
                onChange={handleAiChange(setQualitativeBenefits, 'benefits')}
                rows={4}
                placeholder="e.g., Improved employee morale..."
                className={`${getFieldStyle(aiGeneratedFields.benefits)} resize-none text-sm font-medium`}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
