import React from 'react';
import { Activity, TrendingUp, Eye, EyeOff, Clock, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';

export default function ResultsPanel() {
  const { isDarkMode, textHeading, scenario, setScenario, showScore, setShowScore, results, durationMonths, formatCurrency } = useApp();

  return (
    <>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDarkMode ? 'bg-[#1E293B] border-slate-700/60' : 'bg-white border-slate-200/60'} p-2 pl-5 rounded-3xl border shadow-sm`}>
        <h3 className={`text-sm font-bold ${textHeading} flex items-center`}><Activity size={16} className="mr-2 text-blue-500" /> Forecast Scenario</h3>
        <div className={`flex ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} p-1 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] w-full sm:w-auto`}>
          <button onClick={() => setScenario('optimistic')} className={`flex-1 sm:flex-none px-4 py-2 text-xs rounded-xl transition-all font-bold ${scenario === 'optimistic' ? (isDarkMode ? 'bg-[#1E293B] text-emerald-400 shadow-sm' : 'bg-white shadow-sm text-emerald-600') : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Optimistic</button>
          <button onClick={() => setScenario('realistic')} className={`flex-1 sm:flex-none px-4 py-2 text-xs rounded-xl transition-all font-bold ${scenario === 'realistic' ? (isDarkMode ? 'bg-[#1E293B] text-blue-400 shadow-sm' : 'bg-white shadow-sm text-blue-600') : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Realistic</button>
          <button onClick={() => setScenario('conservative')} className={`flex-1 sm:flex-none px-4 py-2 text-xs rounded-xl transition-all font-bold ${scenario === 'conservative' ? (isDarkMode ? 'bg-[#1E293B] text-amber-400 shadow-sm' : 'bg-white shadow-sm text-amber-600') : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Conservative</button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] rounded-[28px] shadow-xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-[0.08] rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-purple-500 opacity-[0.1] rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-6 right-6 opacity-5 pointer-events-none"><TrendingUp size={160} /></div>
        
        <div className="relative z-10 border-b border-white/10 pb-5 mb-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowScore(!showScore)} className="text-blue-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl" title={showScore ? "Hide Score" : "Show Score"}>{showScore ? <Eye size={18} /> : <EyeOff size={18} />}</button>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Viability Score</span>
          </div>
          {showScore ? (
            <div className="flex items-center space-x-3">
              <span className={`text-[11px] font-black uppercase tracking-widest ${results.scoreColor}`}>{results.scoreLabel}</span>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl text-lg font-black text-white border border-white/10 shadow-sm flex items-baseline space-x-1"><span>{results.automationScore}</span><span className="text-[10px] text-blue-400 font-bold uppercase">/ 100</span></div>
            </div>
          ) : (<div className="text-[11px] font-bold uppercase tracking-widest text-blue-400/50">Score Hidden</div>)}
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <Tooltip text="Net Savings = (Gross Monthly Save × Duration) - Total Dynamic Run/SRE Costs - Implementation Cost">
              <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest text-blue-100 border border-white/10 shadow-sm flex items-center cursor-help">
                Est. Lifetime Net Savings <Info size={16} className="ml-1.5 opacity-70 cursor-help" />
              </span>
            </Tooltip>
            <span className="text-blue-200 text-sm font-semibold flex items-center"><Clock size={14} className="mr-1.5 opacity-70"/> {Number(durationMonths) || 0} Mo Project</span>
          </div>
          <div className={`text-[3.5rem] leading-none xl:text-7xl font-extrabold tracking-tighter mt-6 mb-10 drop-shadow-2xl ${results.netSavings < 0 ? 'text-red-400' : 'text-white'}`}>{formatCurrency(results.netSavings)}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
          <div><Tooltip text="Average Monthly Net Savings (factors in strict month-by-month run cost inflation and variable SRE costs)."><p className="text-blue-300 text-xs mb-1.5 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Avg Net Monthly <Info size={12} className="ml-1 opacity-70 cursor-help"/></p></Tooltip><p className="text-2xl font-bold tracking-tight text-white">{formatCurrency(results.avgNetMonthlySave)}</p></div>
          <div><Tooltip text="Implementation Cost + Total Lifetime Run Costs + Total Lifetime SRE Costs"><p className="text-blue-300 text-xs mb-1.5 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Total Investment <Info size={12} className="ml-1 opacity-70 cursor-help"/></p></Tooltip><p className="text-2xl font-bold tracking-tight text-white">{formatCurrency(results.totalInvestment)}</p></div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
            <Tooltip text="(Net Savings / Total Investment) × 100"><p className="text-blue-300/80 text-xs mb-1 uppercase tracking-wider font-bold flex items-center cursor-help w-max">ROI <Info size={12} className="ml-1 opacity-70 cursor-help"/></p></Tooltip>
            <p className={`text-2xl font-extrabold tracking-tight ${results.roi < 0 ? 'text-red-400' : results.roi >= 100 ? 'text-[#34D399]' : 'text-white'}`}>{results.roi === Infinity ? '∞' : `${Math.round(results.roi).toLocaleString()}%`}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
            <Tooltip text="Exact month where cumulative savings exceeds cumulative implementation, run, and maintenance costs."><p className="text-blue-300/80 text-xs mb-1 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Payback Period <Info size={12} className="ml-1 opacity-70 cursor-help"/></p></Tooltip>
            <p className="text-2xl font-extrabold tracking-tight text-white">{results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod === 0 ? 'Immediate' : `${results.paybackPeriod.toFixed(1)} mo`}</p>
          </div>
        </div>
      </div>
    </>
  );
}
