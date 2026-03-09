import React from 'react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';
import { Activity, Briefcase, Info, Plus, Trash2, Wrench, Coins, TrendingUp, Check } from 'lucide-react';

export default function QuantitativeSection() {
  const { 
    cardStyle, borderMuted, isDarkMode, textHeading, panelBg, textMain, textSub, inputStyle, inputErrorStyle,
    laborBreakdown, addLabor, removeLabor, updateLabor, handleLaborMinutesChange, handleLaborHoursChange, lcrRates, results, formatCurrency, workingDays,
    durationMonths, setDurationMonths, automationPercent, setAutomationPercent, implementationCost, setImplementationCost, monthlyRunCost, setMonthlyRunCost, runCostInflation, setRunCostInflation,
    hasSre, setHasSre, isAdvancedSre, sreCostY1, setSreCostY1, sreCostY2, setSreCostY2, setIsSreModalOpen, isAdvancedRunCost, setIsAdvancedRunCost, setIsRunCostModalOpen
  } = useApp();

  return (
    <section className={cardStyle}>
      <div className={`px-6 md:px-8 py-5 flex items-center justify-between border-b ${borderMuted}`}>
        <div className="flex items-center space-x-3">
          <div className={`${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'} p-2.5 rounded-[14px]`}><Activity size={20} /></div>
          <h2 className={`text-xl font-bold ${textHeading} tracking-tight`}>Labor & Task Breakdown</h2>
        </div>
      </div>
      <div className={`p-6 md:p-8 space-y-7 ${panelBg} rounded-b-[28px]`}>
        
        {/* Dynamic Labor Rows */}
        <div className="space-y-4">
          {laborBreakdown.map((entry, index) => (
            <div key={entry.id} className={`p-5 rounded-[20px] border ${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-white border-slate-200'} relative space-y-4 shadow-sm`}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                     <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Resource {index + 1}</span>
                     <select value={entry.cl} onChange={(e) => updateLabor(entry.id, 'cl', e.target.value)} className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${textHeading} border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded px-1 transition-all`}>
                        {Object.keys(lcrRates).map(cl => <option key={cl} value={cl} className="bg-white dark:bg-slate-800">{cl}</option>)}
                     </select>
                  </div>
                  {laborBreakdown.length > 1 && (
                    <button onClick={() => removeLabor(entry.id)} className={`text-slate-400 hover:text-red-500 ${isDarkMode ? 'hover:bg-red-950/30' : 'hover:bg-red-50'} p-1.5 rounded-lg transition-colors`} title="Remove Role">
                      <Trash2 size={16}/>
                    </button>
                  )}
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                     <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center">Task Volume <Tooltip text={entry.volumePeriod === 'daily' ? `Multiplied by ${workingDays} working days to get monthly volume.` : 'Executions per month.'}><Info size={12} className="ml-1 cursor-help hover:text-blue-500"/></Tooltip></label>
                     <div className="flex space-x-1 items-stretch">
                       <input type="number" min="0" value={entry.executions} onChange={(e) => updateLabor(entry.id, 'executions', e.target.value)} placeholder="0" className={`${entry.executions !== '' && entry.executions < 0 ? inputErrorStyle : inputStyle} py-2.5 text-sm font-mono flex-1`} />
                       <div className={`flex flex-col ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-200/60'} p-0.5 rounded-xl shadow-inner w-12`}>
                          <button onClick={() => updateLabor(entry.id, 'volumePeriod', 'daily')} className={`flex-1 text-[9px] rounded-lg transition-all font-bold ${entry.volumePeriod === 'daily' ? (isDarkMode ? 'bg-[#1E293B] text-slate-200 shadow-sm' : 'bg-white shadow-sm text-slate-800') : 'text-slate-500'}`}>/d</button>
                          <button onClick={() => updateLabor(entry.id, 'volumePeriod', 'monthly')} className={`flex-1 text-[9px] rounded-lg transition-all font-bold ${entry.volumePeriod === 'monthly' ? (isDarkMode ? 'bg-[#1E293B] text-slate-200 shadow-sm' : 'bg-white shadow-sm text-slate-800') : 'text-slate-500'}`}>/mo</button>
                       </div>
                     </div>
                  </div>
                  <div>
                     <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center">Time per Task <Tooltip text='How long does it take this specific role to perform their part of the task?'><Info size={12} className="ml-1 cursor-help hover:text-blue-500"/></Tooltip></label>
                     <div className="flex space-x-2">
                        <div className="relative flex-1"><input type="number" min="0" value={entry.effortMinutes} onChange={(e) => handleLaborMinutesChange(entry.id, e.target.value)} placeholder="0" className={`${entry.effortMinutes !== '' && entry.effortMinutes < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-9 text-sm font-mono`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-[10px] pointer-events-none">MIN</span></div>
                        <div className="relative flex-1"><input type="number" min="0" step="0.01" value={entry.effortHours} onChange={(e) => handleLaborHoursChange(entry.id, e.target.value)} placeholder="0.0" className={`${entry.effortHours !== '' && entry.effortHours < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-8 text-sm font-mono ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-[10px] pointer-events-none">HR</span></div>
                     </div>
                  </div>
                  <div>
                     <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Mapped LCR Rate</label>
                     <div className={`w-full px-4 py-2.5 text-sm font-mono font-bold rounded-xl border ${isDarkMode ? 'bg-blue-950/20 border-blue-900/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                        {formatCurrency(lcrRates[entry.cl] * results.currencyMultiplier)}<span className="text-[10px] text-blue-500/70 ml-1">/hr</span>
                     </div>
                  </div>
               </div>
            </div>
          ))}
          <button onClick={addLabor} className={`w-full py-3 flex items-center justify-center space-x-2 border-2 border-dashed rounded-[20px] text-sm font-bold transition-all ${isDarkMode ? 'border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-950/20' : 'border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'}`}>
             <Plus size={16} /><span>Add Resource Role</span>
          </button>
        </div>

        <div className={`border-t ${borderMuted} pt-5`}>
           <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-indigo-950/10 border-indigo-900/30' : 'bg-indigo-50/50 border-indigo-100'} shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]`}>
              <div className="text-xs font-bold text-indigo-500/80 uppercase tracking-widest flex items-center"><Calculator size={14} className="mr-2"/> Blended As-Is Snapshot</div>
              <div className="flex space-x-6 text-right">
                 <div><div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Executions</div><div className={`text-base font-extrabold ${textHeading} font-mono`}>{Math.round(results.totalEffectiveExecutions)} <span className="text-xs text-slate-400">/mo</span></div></div>
                 <div><div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Effort</div><div className={`text-base font-extrabold ${textHeading} font-mono`}>{Math.round(results.totalManualHoursMonthly)} <span className="text-xs text-slate-400">hrs/mo</span></div></div>
                 <div><div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Current Cost</div><div className={`text-base font-extrabold ${textHeading} font-mono`}>{formatCurrency(results.currentMonthlyCost)} <span className="text-xs text-slate-400">/mo</span></div></div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7 pt-4">
          {/* Duration */}
          <div>
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>Remaining Duration <Tooltip text='How many months will this automation run before the project ends or needs a rebuild?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label>
            <div className="relative"><div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${textSub}`}><Briefcase size={18} /></div><input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} placeholder="0" className={`${durationMonths !== '' && durationMonths < 0 ? inputErrorStyle : inputStyle} pl-10 pr-20 font-mono text-lg`} /><span className={`absolute inset-y-0 right-0 pr-4 flex items-center ${textSub} font-bold text-xs pointer-events-none`}>MONTHS</span></div>
          </div>

          {/* Percent Automated Slider */}
          <div className="pt-1">
            <div className="flex justify-between items-center mb-3">
              <label className={`flex items-center text-sm font-bold ${textMain}`}>Percentage Automated <Tooltip text='What percentage of the manual work is being completely eliminated by the bot?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label>
              <span className={`font-extrabold ${isDarkMode ? 'text-blue-400 bg-blue-950/50' : 'text-blue-700 bg-blue-100'} px-4 py-1.5 rounded-xl text-sm shadow-sm`}>{automationPercent}%</span>
            </div>
            <input type="range" aria-label="Percentage Automated" min="0" max="100" value={automationPercent} onChange={(e) => setAutomationPercent(e.target.value)} className={`w-full h-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30`} />
            <div className={`flex justify-between text-[10px] font-bold ${textSub} mt-2 px-1`}><span>0%</span><span>50%</span><span>100%</span></div>
          </div>
        </div>

        {/* Investment block */}
        <div className={`md:col-span-2 pt-5 border-t ${borderMuted} mt-2`}>
          <div className="flex items-center space-x-2 mb-4"><Wrench size={18} className="text-blue-500" /><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider`}>Investment & Ongoing Costs</h3></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* One-Time Build */}
            <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm flex flex-col justify-between`}>
              <div><label className={`flex items-center text-xs font-bold ${textMain} mb-1`}>One-Time Build <Tooltip text='Total upfront investment required (e.g., developer salaries).'><Info size={12} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label><p className={`text-[10px] ${textSub} mb-3 leading-tight`}>Upfront investment cost.</p></div>
              <div className="relative"><div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><Coins size={14} /></div><input type="number" min="0" value={implementationCost} onChange={(e) => setImplementationCost(e.target.value)} placeholder="0" className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1E293B] border-slate-700 focus:bg-[#0F172A] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8 transition-colors`} /></div>
            </div>
            
            {/* Monthly Run Cost - Toggleable Advanced Mode */}
            <div className={`${isDarkMode ? (isAdvancedRunCost ? 'bg-indigo-950/20 border-indigo-900/40' : 'bg-slate-800/40 border-slate-700/80') : (isAdvancedRunCost ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-200')} p-4 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <label className={`flex items-center text-xs font-bold ${isAdvancedRunCost ? 'text-indigo-600 dark:text-indigo-400' : textMain} mb-1 transition-colors`}>
                    Monthly Run Cost
                    <Tooltip text='Base recurring costs (Product Licenses, cloud) and their projected Annual Percentage Increase.'><Info size={12} className={`${textSub} hover:text-indigo-500 transition-colors cursor-help ml-1`}/></Tooltip>
                  </label>
                  <p className={`text-[10px] ${textSub} mb-2 leading-tight`}>Recurring licenses/infra.</p>
                </div>
                <button onClick={() => { setIsAdvancedRunCost(!isAdvancedRunCost); if(!isAdvancedRunCost) setIsRunCostModalOpen(true); }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isAdvancedRunCost ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAdvancedRunCost ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {isAdvancedRunCost ? (
                 <div className="space-y-3">
                    <div>
                      <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>Blended Cost / Mo</label>
                      <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                        <input type="number" value={Number(results.uiRunCostY1).toFixed(2)} disabled placeholder="0" className={`w-full px-2 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl outline-none text-xs font-mono pl-7 transition-colors disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800`} />
                      </div>
                    </div>
                    <div className={`pt-2 border-t ${isDarkMode ? 'border-indigo-900/50' : 'border-indigo-200'} flex justify-between items-center`}>
                        <div className="flex items-center space-x-2">
                           <span className={`text-[10px] font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center`}><Check size={12} className="mr-1" /> Advanced Config Active</span>
                        </div>
                        <button onClick={() => setIsRunCostModalOpen(true)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                          Edit Advanced
                        </button>
                    </div>
                 </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative"><div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><Coins size={14} /></div><input type="number" min="0" value={monthlyRunCost} onChange={(e) => setMonthlyRunCost(e.target.value)} placeholder="0" className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8 transition-colors`} /></div>
                  <div><label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>YOY Inflation</label><div className="relative"><div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><TrendingUp size={14} /></div><input type="number" min="0" value={runCostInflation} onChange={(e) => setRunCostInflation(e.target.value)} placeholder="0" className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8 pr-8 transition-colors`} /><span className={`absolute inset-y-0 right-0 pr-3 flex items-center ${textSub} font-bold text-xs`}>%</span></div></div>
                </div>
              )}
            </div>

            {/* SRE Configuration Card */}
            <div className={`${isDarkMode ? (hasSre ? 'bg-orange-950/20 border-orange-900/40' : 'bg-[#0F172A] border-slate-700') : (hasSre ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50 border-slate-200')} p-4 rounded-2xl border shadow-sm flex flex-col col-span-1 sm:col-span-2 transition-colors`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <label className={`flex items-center text-xs font-bold ${hasSre ? 'text-orange-600 dark:text-orange-400' : textMain} mb-1 transition-colors`}>
                    SRE / Maintenance Support
                    <Tooltip text='Factor in ongoing human support required to maintain this automation.'><Info size={12} className={`${textSub} hover:text-orange-500 transition-colors cursor-help ml-1`}/></Tooltip>
                  </label>
                  <p className={`text-[10px] ${textSub} leading-tight`}>Dedicated operational oversight.</p>
                </div>
                <button onClick={() => setHasSre(!hasSre)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${hasSre ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${hasSre ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {hasSre ? (
                 <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>Y1 Cost / Mo</label>
                        <div className="relative">
                          <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                          <input type="number" min="0" value={isAdvancedSre ? Number(results.uiSreY1).toFixed(2) : sreCostY1} onChange={(e) => !isAdvancedSre && setSreCostY1(e.target.value)} disabled={isAdvancedSre} placeholder="0" className={`w-full px-2 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl outline-none text-xs font-mono pl-7 transition-colors disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800`} />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>Y2+ Cost / Mo</label>
                        <div className="relative">
                          <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                          <input type="number" min="0" value={isAdvancedSre ? Number(results.uiSreY2).toFixed(2) : sreCostY2} onChange={(e) => !isAdvancedSre && setSreCostY2(e.target.value)} disabled={isAdvancedSre} placeholder="0" className={`w-full px-2 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl outline-none text-xs font-mono pl-7 transition-colors disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800`} />
                        </div>
                      </div>
                    </div>

                    <div className={`pt-2 border-t ${isDarkMode ? 'border-orange-900/50' : 'border-orange-200'} flex justify-between items-center`}>
                        <div className="flex items-center space-x-2">
                           {isAdvancedSre ? (
                              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center`}><Check size={12} className="mr-1" /> Advanced Config Active</span>
                           ) : (
                              <span className={`text-[10px] font-medium ${textSub}`}>Manual entry active</span>
                           )}
                        </div>
                        <button onClick={() => setIsSreModalOpen(true)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors ${isAdvancedSre ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                          {isAdvancedSre ? 'Edit Advanced' : 'Switch to Advanced'}
                        </button>
                    </div>
                 </div>
              ) : (
                <div className={`mt-auto pt-3 border-t ${borderMuted} flex items-center justify-center text-[10px] font-bold ${textSub} uppercase tracking-wider`}>No SRE Configured</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


Example in SreConfigurationModal.jsx:

import React from 'react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';
import { Wrench, X, Trash2, Info, Plus, ShieldCheck, Loader2, Sparkles } from 'lucide-react';

export default function SreConfigurationModal() {
   const { 
     isDarkMode, textHeading, setIsSreModalOpen, textSub, textMain, inputStyle, inputErrorStyle, borderMuted,
     sreBreakdown, updateSreRole, addSreRole, removeSreRole, handleSreMinutesChange, handleSreHoursChange, 
     sreUseCase, setSreUseCase, lcrRates, setIsAdvancedSre, isGeneratingSreUseCase, generateSreUseCase, toolName, useCase
   } = useApp();
 
   const handleSave = () => {
      setIsAdvancedSre(true);
      setIsSreModalOpen(false);
   };
   
   const handleRevert = () => {
      setIsAdvancedSre(false);
      setIsSreModalOpen(false);
   };

   return (
     <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity">
       <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border flex flex-col max-h-[90vh]`}>
         <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-b px-6 py-5 flex items-center justify-between shrink-0`}>
           <div className="flex items-center space-x-3"><div className="bg-orange-500/20 p-2 rounded-xl text-orange-500"><Wrench size={18} /></div><h2 className={`text-xl font-bold ${textHeading}`}>Advanced SRE / Maintenance</h2></div>
           <button onClick={() => setIsSreModalOpen(false)} className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 shadow-sm'} p-2 rounded-full transition-colors`}><X size={20} /></button>
         </div>
         <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Dynamic SRE Roles */}
            <div className="space-y-4">
              {sreBreakdown.map((entry, index) => (
                 <div key={entry.id} className={`p-4 rounded-[20px] border ${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-slate-50 border-slate-200'} shadow-sm`}>
                    
                    {/* Row 1: Role & Remove btn */}
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center space-x-2">
                         <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 shadow-sm'}`}>SRE Role {index + 1}</span>
                         <select value={entry.cl} onChange={(e) => updateSreRole(entry.id, 'cl', e.target.value)} className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${textHeading} border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded px-1 transition-all`}>
                            {Object.keys(lcrRates).map(cl => <option key={cl} value={cl} className="bg-white dark:bg-slate-800">{cl}</option>)}
                         </select>
                       </div>
                       {sreBreakdown.length > 1 && (
                          <button onClick={() => removeSreRole(entry.id)} className={`text-slate-400 hover:text-red-500 ${isDarkMode ? 'hover:bg-red-950/30' : 'hover:bg-red-50'} p-1.5 rounded-lg transition-colors`} title="Remove Role">
                            <Trash2 size={14}/>
                          </button>
                       )}
                    </div>
                    
                    {/* Row 2: Tasks & Mins/Hrs */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                       <div>
                          <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>Maintenance Tasks / Mo</label>
                          <input type="number" min="0" value={entry.tasksPerMonth} onChange={(e) => updateSreRole(entry.id, 'tasksPerMonth', e.target.value)} placeholder="0" className={`${entry.tasksPerMonth !== '' && entry.tasksPerMonth < 0 ? inputErrorStyle : inputStyle} py-2.5 text-sm font-mono`} />
                       </div>
                       <div>
                          <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>Time per Task</label>
                          <div className="flex space-x-2">
                            <div className="relative flex-1"><input type="number" min="0" value={entry.effortMinutes} onChange={(e) => handleSreMinutesChange(entry.id, e.target.value)} placeholder="0" className={`${entry.effortMinutes !== '' && entry.effortMinutes < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-8 text-sm font-mono`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-[10px] pointer-events-none">M</span></div>
                            <div className="relative flex-1"><input type="number" min="0" step="0.01" value={entry.effortHours} onChange={(e) => handleSreHoursChange(entry.id, e.target.value)} placeholder="0.0" className={`${entry.effortHours !== '' && entry.effortHours < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-8 text-sm font-mono ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-[10px] pointer-events-none">H</span></div>
                          </div>
                       </div>
                    </div>

                    {/* Row 3: Y2 Reduction Slider */}
                    <div>
                       <div className="flex justify-between items-center mb-3">
                         <label className={`flex items-center text-[10px] font-bold ${textSub} uppercase`}>Y2+ Efficiency Gain <Tooltip text='Percentage reduction in SRE effort required after Year 1 as the tool stabilizes.'><Info size={12} className={`${textSub} hover:text-orange-500 transition-colors cursor-help ml-1`}/></Tooltip></label>
                         <span className={`font-extrabold ${isDarkMode ? 'text-orange-400 bg-orange-950/50' : 'text-orange-700 bg-orange-100'} px-2.5 py-0.5 rounded-lg text-xs shadow-sm`}>{entry.y2Reduction}%</span>
                       </div>
                       <input type="range" min="0" max="100" value={entry.y2Reduction} onChange={(e) => updateSreRole(entry.id, 'y2Reduction', e.target.value)} className={`w-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full appearance-none cursor-pointer accent-orange-500`} />
                    </div>
                 </div>
              ))}
              <button onClick={addSreRole} className={`w-full py-3 flex items-center justify-center space-x-2 border-2 border-dashed rounded-[20px] text-sm font-bold transition-all ${isDarkMode ? 'border-slate-700 text-slate-400 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-950/20' : 'border-slate-300 text-slate-500 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50'}`}>
                 <Plus size={16} /><span>Add SRE Role</span>
              </button>
            </div>

            <div className={`border-t ${borderMuted} pt-6`}>
               <div className="flex justify-between items-end mb-3">
                 <label className={`flex items-center text-sm font-bold ${textMain}`}><ShieldCheck size={16} className="mr-1.5 text-orange-500" /> SRE Use Case / Justification</label>
                 <Tooltip text={(!toolName && !useCase) ? "Generates a generic justification since Tool Name/Use Case are empty." : "Generate SRE justification based on your Tool Name & Use Case."}>
                   <button onClick={generateSreUseCase} disabled={isGeneratingSreUseCase} className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50 hover:opacity-80 px-2 py-1 rounded-lg flex items-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                     {isGeneratingSreUseCase ? <Loader2 size={12} className="animate-spin mr-1.5"/> : <Sparkles size={12} className="mr-1.5"/>} AI Generate
                   </button>
                 </Tooltip>
               </div>
               <textarea value={sreUseCase} onChange={(e) => setSreUseCase(e.target.value)} rows={3} placeholder="e.g., Ongoing API maintenance, exception handling, and ruleset upgrades..." className={`${inputStyle} resize-none font-medium`} />
            </div>
         </div>
         <div className={`px-6 py-5 ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-t flex justify-between items-center shrink-0`}>
           <button onClick={handleRevert} className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400' : 'text-slate-500 hover:bg-slate-200 hover:text-red-600'}`}>Disable Advanced Config</button>
           <button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-md">Apply Advanced SRE</button>
         </div>
       </div>
     </div>
   );
 }
