import React from 'react';
import { FileText, Sparkles, Loader2, Cpu, Info, BarChart3, Target, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';

function AiBadge() {
  return (
    <span className="ml-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider shadow-sm">
      <Sparkles size={10} /><span>AI</span>
    </span>
  );
}

export default function QualitativeSection() {
  const { 
    cardStyle, borderMuted, isDarkMode, textHeading, panelBg, textMain, textSub, inputStyle, 
    toolName, setToolName, useCase, setUseCase, kpis, setKpis, challenges, setChallenges, 
    qualitativeBenefits, setQualitativeBenefits, isGeneratingSuggestions, generateSuggestions,
    aiGeneratedFields, setAiGeneratedFields
  } = useApp();
  
  const getFieldStyle = (isGenerated) => {
    if (!isGenerated) return inputStyle;
    return `${inputStyle} border-indigo-300 ring-4 ring-indigo-50 dark:border-indigo-700 dark:ring-indigo-900/20 bg-indigo-50/10 dark:bg-indigo-950/10 transition-all duration-500`;
  };

  const handleAiChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (aiGeneratedFields[field]) {
      setAiGeneratedFields(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <section className={cardStyle}>
      <div className={`px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between border-b ${borderMuted} gap-4`}>
        <div className="flex items-center space-x-3">
          <div className={`${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'} p-2.5 rounded-[14px]`}><FileText size={20} /></div>
          <h2 className={`text-xl font-bold ${textHeading} tracking-tight`}>Qualitative Details</h2>
        </div>
        <button onClick={generateSuggestions} disabled={isGeneratingSuggestions || (!toolName && !useCase)} className={`flex items-center justify-center space-x-2 text-sm font-bold ${isDarkMode ? 'bg-amber-950/30 hover:bg-amber-900/50 text-amber-400 border-amber-900/50' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/50'} px-4 py-2.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border`}>
          {isGeneratingSuggestions ? <Loader2 size={16} className="animate-spin text-amber-500" /> : <Sparkles size={16} className="text-amber-500" />}
          <span>{isGeneratingSuggestions ? 'Auto-Filling...' : 'Auto-Fill Details'}</span>
        </button>
      </div>
      <div className={`p-6 md:p-8 space-y-5 ${panelBg} rounded-b-[28px]`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>Automation Name <Tooltip text="Give your automation project a short, recognizable name."><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${textSub}`}><Cpu size={18} /></div>
              <input type="text" value={toolName} onChange={(e) => setToolName(e.target.value)} placeholder="e.g., Ticket Auto-Triage Bot" className={`${inputStyle} pl-12 font-medium`} />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>Use Case Description <Tooltip text='What specific manual process is this bot replacing?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label>
            <textarea value={useCase} onChange={(e) => setUseCase(e.target.value)} rows={2} placeholder="Briefly describe what the automation does..." className={`${inputStyle} resize-none font-medium`} />
          </div>
          <div className="md:col-span-2">
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}><BarChart3 size={16} className="mr-1.5 text-purple-500" /> Target KPIs <Tooltip text='Which business metrics will this improve?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip> {aiGeneratedFields.kpis && <AiBadge/>}</label>
            <textarea value={kpis} onChange={handleAiChange(setKpis, 'kpis')} rows={3} placeholder="e.g., MTTR, CSAT, Error Rate..." className={`${getFieldStyle(aiGeneratedFields.kpis)} resize-none font-medium`} />
          </div>
          <div>
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}><Target size={16} className="mr-1.5 text-red-500" /> Challenges Addressed <Tooltip text='What pain points are solved?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip> {aiGeneratedFields.challenges && <AiBadge/>}</label>
            <textarea value={challenges} onChange={handleAiChange(setChallenges, 'challenges')} rows={4} placeholder="What pain points are solved?" className={`${getFieldStyle(aiGeneratedFields.challenges)} resize-none text-sm font-medium`} />
          </div>
          <div>
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}><Award size={16} className="mr-1.5 text-green-500" /> Qualitative Benefits <Tooltip text='What are the soft benefits?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip> {aiGeneratedFields.benefits && <AiBadge/>}</label>
            <textarea value={qualitativeBenefits} onChange={handleAiChange(setQualitativeBenefits, 'benefits')} rows={4} placeholder="e.g., Improved employee morale..." className={`${getFieldStyle(aiGeneratedFields.benefits)} resize-none text-sm font-medium`} />
          </div>
        </div>
      </div>
    </section>
  );
}
