import React from 'react';
import { ArrowRightLeft, Activity, Sparkles, Info, BarChart3, Award, Cpu, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';

export default function CurrentVsFuturePanel() {
  const { cardStyle, textHeading, isDarkMode, borderMuted, textSub, textMain, formatCurrency, results, challenges, kpis, qualitativeBenefits, toolName, isGeneratingInsights, generateROIInsights, roiInsights, hasSre, sreUseCase } = useApp();

  return (
    <div className={`${cardStyle} flex flex-col`}>
      <div className="p-6 md:p-8 flex-1">
        <h3 className={`text-base font-bold ${textHeading} mb-6 flex items-center`}><ArrowRightLeft size={18} className="mr-2 text-blue-500"/> Current vs. Future State</h3>
        <div className="space-y-6">
          <div className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'} p-5 rounded-[20px] border ${borderMuted} shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]`}>
            <div className={`text-[11px] font-extrabold ${textSub} uppercase tracking-widest mb-4`}>Current State (As-Is)</div>
            <div className="flex justify-between items-start mb-4">
              <div><div className={`text-[11px] font-bold ${textSub} uppercase mb-1`}>Monthly Labor Cost</div><div className={`text-xl font-extrabold ${textHeading} tracking-tight`}>{formatCurrency(results.currentMonthlyCost)}</div></div>
              <div className="text-right"><div className={`text-[11px] font-bold ${textSub} uppercase mb-1`}>Manual Effort</div><div className={`text-xl font-extrabold ${textHeading} tracking-tight`}>{new Intl.NumberFormat().format(Math.round(results.totalManualHoursMonthly))} <span className={`text-sm font-medium ${textSub}`}>hrs/mo</span></div><div className={`text-xs font-semibold ${textSub} mt-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200/50'} inline-block px-2 py-0.5 rounded-md`}>({results.currentFte.toFixed(1)} FTEs)</div></div>
            </div>
            {challenges && (<div className={`border-t ${borderMuted} pt-3`}><div className="text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center"><Activity size={12} className="mr-1.5" /> Existing Challenges</div><p className={`text-xs ${textMain} leading-relaxed whitespace-pre-wrap font-medium`}>{challenges}</p></div>)}
          </div>

          <div className={`${isDarkMode ? 'bg-blue-950/20 border-blue-900/40' : 'bg-blue-50/50 border-blue-100/60'} p-5 rounded-[20px] border shadow-[inset_0_1px_3px_rgba(59,130,246,0.05)]`}>
            <div className="text-[11px] font-extrabold text-blue-500 uppercase tracking-widest mb-4 flex items-center"><Sparkles size={14} className="mr-1.5"/> Future State (To-Be)</div>
            <div className="flex justify-between items-start mb-4">
              <div><Tooltip text="Average future monthly cost (Remaining manual labor + Average run cost + Average SRE cost)."><div className="text-[11px] font-bold text-blue-400 uppercase mb-1 flex items-center cursor-help">Avg Total Cost/Mo <Info size={10} className="ml-1 opacity-80 cursor-help" /></div></Tooltip><div className={`text-xl font-extrabold ${isDarkMode ? 'text-blue-100' : 'text-blue-900'} tracking-tight`}>{formatCurrency(results.futureMonthlyCostAvg)}</div></div>
              <div className="text-right"><div className="text-[11px] font-bold text-blue-400 uppercase mb-1">Residual Effort</div><div className={`text-xl font-extrabold ${isDarkMode ? 'text-blue-100' : 'text-blue-900'} tracking-tight`}>{new Intl.NumberFormat().format(Math.round(results.remainingManualHoursMonthly))} <span className="text-sm font-medium text-blue-500">hrs/mo</span></div><div className={`text-xs font-semibold text-blue-500 mt-1 ${isDarkMode ? 'bg-blue-950/50' : 'bg-blue-100/50'} inline-block px-2 py-0.5 rounded-md`}>({results.toBeFte.toFixed(1)} FTEs)</div></div>
            </div>
            {(kpis || qualitativeBenefits || toolName || (hasSre && sreUseCase)) && (
              <div className={`border-t ${isDarkMode ? 'border-blue-900/40' : 'border-blue-100'} pt-3 space-y-3`}>
                {kpis && (<div><div className="text-[10px] font-bold text-purple-500 uppercase mb-1 flex items-center"><BarChart3 size={12} className="mr-1.5" /> Target KPIs</div><p className={`text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} leading-relaxed whitespace-pre-wrap font-medium`}>{kpis}</p></div>)}
                {qualitativeBenefits && (<div><div className="text-[10px] font-bold text-emerald-500 uppercase mb-1 flex items-center"><Award size={12} className="mr-1.5" /> Strategic Benefits</div><p className={`text-xs ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'} leading-relaxed whitespace-pre-wrap font-medium`}>{qualitativeBenefits}</p></div>)}
                {toolName && (<div><div className="text-[10px] font-bold text-blue-500 uppercase mb-1 flex items-center"><Cpu size={12} className="mr-1.5" /> Automation Solution</div><p className={`text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} leading-relaxed whitespace-pre-wrap font-medium`}>{toolName}</p></div>)}
                {hasSre && sreUseCase && (<div><div className="text-[10px] font-bold text-orange-500 uppercase mb-1 flex items-center"><ShieldCheck size={12} className="mr-1.5" /> SRE / Maintenance Benefits</div><p className={`text-xs ${isDarkMode ? 'text-orange-200' : 'text-orange-800'} leading-relaxed whitespace-pre-wrap font-medium`}>{sreUseCase}</p></div>)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8 pt-0 mt-auto">
        <div className={`border-t ${borderMuted} pt-5`}>
          <button onClick={generateROIInsights} disabled={isGeneratingInsights} className={`w-full flex items-center justify-center space-x-2 text-sm font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm border ${isDarkMode ? 'bg-blue-950/30 hover:bg-blue-900/50 text-blue-400 border-blue-900/50' : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-100'}`}>{isGeneratingInsights ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-amber-500" />}<span>{roiInsights ? 'Regenerate Strategy' : 'Get AI Strategy Insights'}</span></button>
          {roiInsights && (<div className={`mt-4 ${isDarkMode ? 'bg-indigo-950/20 border-indigo-900/30 text-indigo-200' : 'bg-indigo-50/80 border-indigo-100/50 text-indigo-900'} p-5 rounded-2xl text-sm font-medium leading-relaxed border overflow-y-auto max-h-40 shadow-inner custom-scrollbar whitespace-pre-wrap`}>{roiInsights}</div>)}
        </div>
      </div>
    </div>
  );
}
