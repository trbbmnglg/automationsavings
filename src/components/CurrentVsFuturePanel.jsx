import React from 'react';
import { ArrowRightLeft, Activity, Sparkles, Info, BarChart3, Award, Cpu, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';

function CurrentVsFuturePanel() {
  const { cardStyle, textHeading, isDarkMode, borderMuted, textSub, textMain, formatCurrency, results, challenges, kpis, qualitativeBenefits, toolName, isGeneratingInsights, generateROIInsights, roiInsights, hasSre, sreUseCase } = useApp();

  return (
    <div className={`${cardStyle} flex flex-col`}>
      <div className="p-6 md:p-8 flex-1">
        <h3 className={`text-base font-bold ${textHeading} mb-6 flex items-center`}><ArrowRightLeft size={18} className="mr-2 text-accenture-purple"/> Current vs. Future State</h3>
        <div className="space-y-6">
          <div className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-accenture-gray-off-white'} p-5 rounded-[20px] border ${borderMuted} shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]`}>
            <div className={`text-[11px] font-extrabold ${textSub} uppercase tracking-widest mb-4`}>Current State (As-Is)</div>
            <div className="flex justify-between items-start mb-4">
              <div><div className={`text-[11px] font-bold ${textSub} uppercase mb-1`}>Monthly Labor Cost</div><div className={`text-xl font-extrabold ${textHeading} tracking-tight`}>{formatCurrency(results.currentMonthlyCost)}</div></div>
              <div className="text-right"><div className={`text-[11px] font-bold ${textSub} uppercase mb-1`}>Manual Effort</div><div className={`text-xl font-extrabold ${textHeading} tracking-tight`}>{new Intl.NumberFormat().format(Math.round(results.totalManualHoursMonthly))} <span className={`text-sm font-medium ${textSub}`}>hrs/mo</span></div><div className={`text-xs font-semibold ${textSub} mt-1 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-accenture-gray-off-white/50'} inline-block px-2 py-0.5 `}>({results.currentFte.toFixed(1)} FTEs)</div></div>
            </div>
            {challenges && (<div className={`border-t ${borderMuted} pt-3`}><div className="text-[10px] font-bold text-accenture-pink uppercase mb-2 flex items-center"><Activity size={12} className="mr-1.5" /> Existing Challenges</div><p className={`text-xs ${textMain} leading-relaxed whitespace-pre-wrap font-medium`}>{challenges}</p></div>)}
          </div>

          <div className={`${isDarkMode ? 'bg-accenture-purple-darkest/20 border-accenture-purple-dark/40' : 'bg-accenture-purple-lightest/50 border-accenture-purple-light/60'} p-5 rounded-[20px] border shadow-[inset_0_1px_3px_rgba(59,130,246,0.05)]`}>
            <div className="text-[11px] font-extrabold text-accenture-purple uppercase tracking-widest mb-4 flex items-center"><Sparkles size={14} className="mr-1.5"/> Future State (To-Be)</div>
            <div className="flex justify-between items-start mb-4">
              <div><Tooltip text="Average future monthly cost (Remaining manual labor + Average run cost + Average SRE cost)."><div className="text-[11px] font-bold text-accenture-purple uppercase mb-1 flex items-center cursor-help">Avg Total Cost/Mo <Info size={10} className="ml-1 opacity-80 cursor-help" /></div></Tooltip><div className={`text-xl font-extrabold ${isDarkMode ? 'text-accenture-purple-lightest' : 'text-accenture-purple-dark'} tracking-tight`}>{formatCurrency(results.futureMonthlyCostAvg)}</div></div>
              <div className="text-right"><div className="text-[11px] font-bold text-accenture-purple uppercase mb-1">Residual Effort</div><div className={`text-xl font-extrabold ${isDarkMode ? 'text-accenture-purple-lightest' : 'text-accenture-purple-dark'} tracking-tight`}>{new Intl.NumberFormat().format(Math.round(results.remainingManualHoursMonthly))} <span className="text-sm font-medium text-accenture-purple">hrs/mo</span></div><div className={`text-xs font-semibold text-accenture-purple mt-1 ${isDarkMode ? 'bg-accenture-purple-darkest/50' : 'bg-accenture-purple-lightest/50'} inline-block px-2 py-0.5 `}>({results.toBeFte.toFixed(1)} FTEs)</div></div>
            </div>
            {(kpis || qualitativeBenefits || toolName || (hasSre && sreUseCase)) && (
              <div className={`border-t ${isDarkMode ? 'border-accenture-purple-dark/40' : 'border-accenture-purple-light'} pt-3 space-y-3`}>
                {kpis && (<div><div className="text-[10px] font-bold text-accenture-purple uppercase mb-1 flex items-center"><BarChart3 size={12} className="mr-1.5" /> Target KPIs</div><p className={`text-xs ${isDarkMode ? 'text-accenture-purple-light' : 'text-accenture-purple-dark'} leading-relaxed whitespace-pre-wrap font-medium`}>{kpis}</p></div>)}
                {qualitativeBenefits && (<div><div className="text-[10px] font-bold text-accenture-purple uppercase mb-1 flex items-center"><Award size={12} className="mr-1.5" /> Strategic Benefits</div><p className={`text-xs ${isDarkMode ? 'text-accenture-purple-light' : 'text-accenture-purple-dark'} leading-relaxed whitespace-pre-wrap font-medium`}>{qualitativeBenefits}</p></div>)}
                {toolName && (<div><div className="text-[10px] font-bold text-accenture-purple uppercase mb-1 flex items-center"><Cpu size={12} className="mr-1.5" /> Automation Solution</div><p className={`text-xs ${isDarkMode ? 'text-accenture-purple-light' : 'text-accenture-purple-dark'} leading-relaxed whitespace-pre-wrap font-medium`}>{toolName}</p></div>)}
                {hasSre && sreUseCase && (<div><div className="text-[10px] font-bold text-accenture-purple-dark uppercase mb-1 flex items-center"><ShieldCheck size={12} className="mr-1.5" /> SRE / Maintenance Benefits</div><p className={`text-xs ${isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark'} leading-relaxed whitespace-pre-wrap font-medium`}>{sreUseCase}</p></div>)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8 pt-0 mt-auto">
        <div className={`border-t ${borderMuted} pt-5`}>
          <button onClick={generateROIInsights} disabled={isGeneratingInsights} className={`w-full flex items-center justify-center space-x-2 text-sm font-bold py-3.5  transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm border ${isDarkMode ? 'bg-accenture-purple-darkest/30 hover:bg-accenture-purple-darkest/50 text-accenture-purple border-accenture-purple-dark/50' : 'text-accenture-purple-dark bg-accenture-purple-lightest hover:bg-accenture-purple-lightest border-accenture-purple-light'}`}>{isGeneratingInsights ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-accenture-purple-dark" />}<span>{roiInsights ? 'Regenerate Strategy' : 'Get AI Strategy Insights'}</span></button>
          {roiInsights && (<div className={`mt-4 ${isDarkMode ? 'bg-accenture-purple-darkest/20 border-accenture-purple/30 text-accenture-purple-light' : 'bg-accenture-purple-lightest/80 border-accenture-purple/50 text-accenture-purple-dark'} p-5  text-sm font-medium leading-relaxed border overflow-y-auto max-h-40 shadow-inner custom-scrollbar whitespace-pre-wrap`}>{roiInsights}</div>)}
        </div>
      </div>
    </div>
  );
}

export default React.memo(CurrentVsFuturePanel);
