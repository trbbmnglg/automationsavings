import React from 'react';
import { Activity, Briefcase, Info, Plus, Trash2, Wrench, Coins, TrendingUp, Check, Calculator, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';

function QuantitativeSection() {
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
          <div className={`${isDarkMode ? 'bg-accenture-purple/20 text-accenture-purple' : 'bg-accenture-purple-lightest text-accenture-purple-dark'} p-2.5 rounded-none`}><Activity size={20} aria-hidden="true" /></div>
          <h2 className={`text-xl font-bold ${textHeading} tracking-tight`}>Labor & Task Breakdown</h2>
        </div>
      </div>
      <div className={`p-6 md:p-8 space-y-7 ${panelBg} rounded-none`}>
        
        {/* Dynamic Labor Rows */}
        <div className="space-y-4">
          {laborBreakdown.map((entry, index) => (
            <div key={entry.id} className={`p-5 rounded-none border ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark/80' : 'bg-white border-accenture-gray-light'} relative space-y-4 shadow-sm`}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                     <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1  ${isDarkMode ? 'bg-[#0a0a0a] text-accenture-gray-light' : 'bg-accenture-gray-off-white text-accenture-gray-dark'}`}>Resource {index + 1}</span>
                     <select value={entry.cl} onChange={(e) => updateLabor(entry.id, 'cl', e.target.value)} className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${textHeading} border border-transparent hover:border-accenture-gray-light dark:hover:border-accenture-gray-dark rounded px-1 transition-all`}>
                        {Object.keys(lcrRates).map(cl => <option key={cl} value={cl} className="bg-white dark:bg-[#0a0a0a]">{cl}</option>)}
                     </select>
                  </div>
                  {laborBreakdown.length > 1 && (
                    <button onClick={() => removeLabor(entry.id)} aria-label={`Remove resource ${index + 1}`} className={`text-accenture-gray-dark hover:text-accenture-pink ${isDarkMode ? 'hover:bg-accenture-pink/30' : 'hover:bg-[#fff0f6]'} p-1.5  transition-colors`} title="Remove Role">
                      <Trash2 size={16}/>
                    </button>
                  )}
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                     <label className="text-[11px] font-bold text-accenture-gray-dark mb-1.5 flex items-center">Task Volume <Tooltip text={entry.volumePeriod === 'daily' ? `Multiplied by ${workingDays} working days to get monthly volume.` : 'Executions per month.'}><Info size={12} className="ml-1 cursor-help hover:text-accenture-purple"/></Tooltip></label>
                     <div className="flex space-x-1 items-stretch">
                       <input type="number" min="0" value={entry.executions} onChange={(e) => updateLabor(entry.id, 'executions', e.target.value)} placeholder="0" className={`${entry.executions !== '' && entry.executions < 0 ? inputErrorStyle : inputStyle} py-2.5 text-sm font-mono flex-1`} />
                       <div className={`flex flex-col ${isDarkMode ? 'bg-[#0F172A]' : 'bg-accenture-gray-off-white/60'} p-0.5  shadow-inner w-12`}>
                          <button onClick={() => updateLabor(entry.id, 'volumePeriod', 'daily')} className={`flex-1 text-[9px]  transition-all font-bold ${entry.volumePeriod === 'daily' ? (isDarkMode ? 'bg-[#1E293B] text-accenture-gray-light shadow-sm' : 'bg-white shadow-sm text-black') : 'text-accenture-gray-dark'}`}>/d</button>
                          <button onClick={() => updateLabor(entry.id, 'volumePeriod', 'monthly')} className={`flex-1 text-[9px]  transition-all font-bold ${entry.volumePeriod === 'monthly' ? (isDarkMode ? 'bg-[#1E293B] text-accenture-gray-light shadow-sm' : 'bg-white shadow-sm text-black') : 'text-accenture-gray-dark'}`}>/mo</button>
                       </div>
                     </div>
                  </div>
                  <div>
                     <label className="text-[11px] font-bold text-accenture-gray-dark mb-1.5 flex items-center">Time per Task <Tooltip text='How long does it take this specific role to perform their part of the task?'><Info size={12} className="ml-1 cursor-help hover:text-accenture-purple"/></Tooltip></label>
                     <div className="flex space-x-2">
                        <div className="relative flex-1"><input type="number" min="0" value={entry.effortMinutes} onChange={(e) => handleLaborMinutesChange(entry.id, e.target.value)} placeholder="0" className={`${entry.effortMinutes !== '' && entry.effortMinutes < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-9 text-sm font-mono`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-accenture-gray-dark font-bold text-[10px] pointer-events-none">MIN</span></div>
                        <div className="relative flex-1"><input type="number" min="0" step="0.01" value={entry.effortHours} onChange={(e) => handleLaborHoursChange(entry.id, e.target.value)} placeholder="0.0" className={`${entry.effortHours !== '' && entry.effortHours < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-8 text-sm font-mono ${isDarkMode ? 'bg-black/50' : 'bg-accenture-gray-off-white/50'}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-accenture-gray-dark font-bold text-[10px] pointer-events-none">HR</span></div>
                     </div>
                  </div>
                  <div>
                     <label className="text-[11px] font-bold text-accenture-gray-dark mb-1.5 block">Mapped LCR Rate</label>
                     {Object.prototype.hasOwnProperty.call(lcrRates, entry.cl) ? (
                       <div className={`w-full px-4 py-2.5 text-sm font-mono font-bold  border ${isDarkMode ? 'bg-accenture-purple-darkest/20 border-accenture-purple-dark/30 text-accenture-purple' : 'bg-accenture-purple-lightest border-accenture-purple-light text-accenture-purple-dark'}`}>
                          {formatCurrency(Number(lcrRates[entry.cl]) * results.currencyMultiplier)}<span className="text-[10px] text-accenture-purple/70 ml-1">/hr</span>
                       </div>
                     ) : (
                       <div className={`w-full px-4 py-2.5 text-xs font-bold border flex items-center gap-2 ${isDarkMode ? 'bg-accenture-pink/10 border-accenture-pink/40 text-accenture-pink' : 'bg-accenture-pink/10 border-accenture-pink text-accenture-pink'}`}>
                          <AlertTriangle size={14} aria-hidden="true" />
                          <span>No rate for {entry.cl} — set in Settings</span>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          ))}
          <button onClick={addLabor} className={`w-full py-3 flex items-center justify-center space-x-2 border-2 border-dashed rounded-none text-sm font-bold transition-all ${isDarkMode ? 'border-accenture-gray-dark text-accenture-gray-dark hover:border-accenture-purple hover:text-accenture-purple hover:bg-accenture-purple-darkest/20' : 'border-accenture-gray-light text-accenture-gray-dark hover:border-accenture-purple hover:text-accenture-purple-dark hover:bg-accenture-purple-lightest'}`}>
             <Plus size={16} /><span>Add Resource Role</span>
          </button>
        </div>

        <div className={`border-t ${borderMuted} pt-5`}>
           <div className={`flex items-center justify-between p-4  border ${isDarkMode ? 'bg-accenture-purple-darkest/10 border-accenture-purple/30' : 'bg-accenture-purple-lightest/50 border-accenture-purple'} shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]`}>
              <div className="text-xs font-bold text-accenture-purple/80 uppercase tracking-widest flex items-center"><Calculator size={14} className="mr-2"/> Blended As-Is Snapshot</div>
              <div className="flex space-x-6 text-right">
                 <div><div className="text-[10px] text-accenture-gray-dark font-bold uppercase mb-0.5">Executions</div><div className={`text-base font-extrabold ${textHeading} font-mono`}>{Math.round(results.totalEffectiveExecutions)} <span className="text-xs text-accenture-gray-dark">/mo</span></div></div>
                 <div><div className="text-[10px] text-accenture-gray-dark font-bold uppercase mb-0.5">Effort</div><div className={`text-base font-extrabold ${textHeading} font-mono`}>{Math.round(results.totalManualHoursMonthly)} <span className="text-xs text-accenture-gray-dark">hrs/mo</span></div></div>
                 <div><div className="text-[10px] text-accenture-gray-dark font-bold uppercase mb-0.5">Current Cost</div><div className={`text-base font-extrabold ${textHeading} font-mono`}>{formatCurrency(results.currentMonthlyCost)} <span className="text-xs text-accenture-gray-dark">/mo</span></div></div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7 pt-4">
          {/* Duration */}
          <div>
            <label htmlFor="duration-input" className={`flex items-center text-sm font-bold ${textMain} mb-2`}>Remaining Duration <Tooltip text='How many months will this automation run before the project ends or needs a rebuild?'><Info size={14} className={`${textSub} hover:text-accenture-purple transition-colors cursor-help`}/></Tooltip></label>
            <div className="relative"><div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${textSub}`}><Briefcase size={18} aria-hidden="true" /></div><input id="duration-input" aria-describedby="duration-hint" type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} placeholder="0" className={`${durationMonths !== '' && durationMonths < 0 ? inputErrorStyle : inputStyle} pl-10 pr-20 font-mono text-lg`} /><span id="duration-hint" className={`absolute inset-y-0 right-0 pr-4 flex items-center ${textSub} font-bold text-xs pointer-events-none`}>MONTHS</span></div>
          </div>

          {/* Percent Automated Slider */}
          <div className="pt-1">
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="automation-pct" className={`flex items-center text-sm font-bold ${textMain}`}>Percentage Automated <Tooltip text='What percentage of the manual work is being completely eliminated by the bot?'><Info size={14} className={`${textSub} hover:text-accenture-purple transition-colors cursor-help`}/></Tooltip></label>
              <span id="automation-pct-value" className={`font-extrabold ${isDarkMode ? 'text-accenture-purple bg-accenture-purple-darkest/50' : 'text-accenture-purple-dark bg-accenture-purple-lightest'} px-4 py-1.5  text-sm shadow-sm`}>{automationPercent}%</span>
            </div>
            <input id="automation-pct" type="range" aria-label="Percentage Automated" aria-describedby="automation-pct-value" min="0" max="100" value={automationPercent} onChange={(e) => setAutomationPercent(e.target.value)} className={`w-full h-3 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-accenture-gray-off-white'} rounded-full appearance-none cursor-pointer accent-accenture-purple focus:outline-none focus:ring-4 focus:ring-accenture-purple/30`} />
            <div className={`flex justify-between text-[10px] font-bold ${textSub} mt-2 px-1`}><span>0%</span><span>50%</span><span>100%</span></div>
          </div>
        </div>

        {/* Investment block */}
        <div className={`md:col-span-2 pt-5 border-t ${borderMuted} mt-2`}>
          <div className="flex items-center space-x-2 mb-4"><Wrench size={18} className="text-accenture-purple" /><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider`}>Investment & Ongoing Costs</h3></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* One-Time Build */}
            <div className={`${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark/80' : 'bg-white border-accenture-gray-light'} p-4  border shadow-sm flex flex-col justify-between`}>
              <div>
                <label className={`flex items-center text-xs font-bold ${textMain} mb-1`}>One-Time Build <Tooltip text='Total upfront investment required (e.g., developer salaries).'><Info size={12} className={`${textSub} hover:text-accenture-purple transition-colors cursor-help`}/></Tooltip></label>
                <p className={`text-[10px] ${textSub} mb-3 leading-tight`}>Upfront investment cost.</p>
              </div>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><Coins size={14} /></div>
                <input type="number" min="0" value={implementationCost} onChange={(e) => setImplementationCost(e.target.value)} placeholder="0" className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1E293B] border-accenture-gray-dark focus:bg-[#0F172A] text-accenture-gray-light' : 'bg-accenture-gray-off-white border-accenture-gray-light text-black'} border  focus:ring-2 focus:ring-accenture-purple outline-none text-sm font-mono pl-8 transition-colors`} />
              </div>
            </div>
            
            {/* Monthly Run Cost - Toggleable Advanced Mode */}
            <div className={`${isDarkMode ? (isAdvancedRunCost ? 'bg-accenture-purple-darkest/20 border-accenture-purple/40' : 'bg-[#0a0a0a]/40 border-accenture-gray-dark/80') : (isAdvancedRunCost ? 'bg-accenture-purple-lightest/50 border-accenture-purple' : 'bg-accenture-gray-off-white border-accenture-gray-light')} p-4  border shadow-sm flex flex-col justify-between transition-colors`}>
              
              {/* FIX: header row — label truncates cleanly, toggle stays right */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <label className={`text-xs font-bold leading-tight ${isAdvancedRunCost ? 'text-accenture-purple-dark dark:text-accenture-purple' : textMain} transition-colors`}>
                    Run Cost
                    <Tooltip text='Base recurring costs (Product Licenses, cloud) and their projected Annual Percentage Increase.'><Info size={12} className={`${textSub} hover:text-accenture-purple transition-colors cursor-help ml-1`}/></Tooltip>
                  </label>
                  <button
                    onClick={() => { setIsAdvancedRunCost(!isAdvancedRunCost); if(!isAdvancedRunCost) setIsRunCostModalOpen(true); }}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center  transition-colors ${isAdvancedRunCost ? 'bg-accenture-purple' : 'bg-accenture-gray-light dark:bg-accenture-gray-dark'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform  bg-white transition-transform ${isAdvancedRunCost ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className={`text-[10px] ${textSub} mb-3 leading-tight`}>Recurring licenses/infra.</p>
              </div>
              
              {isAdvancedRunCost ? (
                <div className="space-y-3">
                  <div>
                    <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>Blended Cost / Mo</label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                      <input type="number" value={Number(results.uiRunCostY1).toFixed(2)} disabled placeholder="0" className={`w-full px-2 py-2 ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark text-accenture-gray-light' : 'bg-white border-accenture-gray-light text-black'} border  outline-none text-xs font-mono pl-7 transition-colors disabled:opacity-60 disabled:bg-accenture-gray-off-white dark:disabled:bg-[#0a0a0a]`} />
                    </div>
                  </div>
                  {/* FIX: stacked vertically to prevent button overflow in narrow card */}
                  <div className={`pt-2 border-t ${isDarkMode ? 'border-accenture-purple/50' : 'border-accenture-purple'} flex flex-col gap-2`}>
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark'} flex items-center gap-1`}>
                      <Check size={11} /> Advanced Config Active
                    </span>
                    <button
                      onClick={() => setIsRunCostModalOpen(true)}
                      className={`w-full text-[10px] font-bold px-3 py-1.5  shadow-sm transition-colors ${isDarkMode ? 'bg-[#1a1a1a] text-accenture-gray-light hover:bg-accenture-gray-dark' : 'bg-accenture-gray-off-white text-accenture-gray-dark hover:bg-accenture-gray-light'}`}
                    >
                      Edit Advanced
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><Coins size={14} /></div>
                    <input type="number" min="0" value={monthlyRunCost} onChange={(e) => setMonthlyRunCost(e.target.value)} placeholder="0" className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark text-accenture-gray-light' : 'bg-white border-accenture-gray-light text-black'} border  focus:ring-2 focus:ring-accenture-purple outline-none text-sm font-mono pl-8 transition-colors`} />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>YOY Inflation</label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><TrendingUp size={14} /></div>
                      <input type="number" min="0" value={runCostInflation} onChange={(e) => setRunCostInflation(e.target.value)} placeholder="0" className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark text-accenture-gray-light' : 'bg-white border-accenture-gray-light text-black'} border  focus:ring-2 focus:ring-accenture-purple outline-none text-sm font-mono pl-8 pr-8 transition-colors`} />
                      <span className={`absolute inset-y-0 right-0 pr-3 flex items-center ${textSub} font-bold text-xs`}>%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SRE Configuration Card */}
            <div className={`${isDarkMode ? (hasSre ? 'bg-accenture-purple-darkest/30 border-accenture-purple' : 'bg-[#0F172A] border-accenture-gray-dark') : (hasSre ? 'bg-accenture-purple-lightest border-accenture-purple' : 'bg-accenture-gray-off-white border-accenture-gray-light')} p-4  border shadow-sm flex flex-col col-span-1 sm:col-span-2 transition-colors`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <label className={`flex items-center text-xs font-bold ${hasSre ? 'text-accenture-purple-dark dark:text-accenture-purple' : textMain} mb-1 transition-colors`}>
                    SRE / Maintenance Support
                    <Tooltip text='Factor in ongoing human support required to maintain this automation.'><Info size={12} className={`${textSub} hover:text-accenture-purple-dark transition-colors cursor-help ml-1`}/></Tooltip>
                  </label>
                  <p className={`text-[10px] ${textSub} leading-tight`}>Dedicated operational oversight.</p>
                </div>
                <button onClick={() => setHasSre(!hasSre)} className={`relative inline-flex h-5 w-9 shrink-0 items-center  transition-colors ${hasSre ? 'bg-accenture-purple-dark' : 'bg-accenture-gray-light dark:bg-accenture-gray-dark'}`}>
                  <span className={`inline-block h-3 w-3 transform  bg-white transition-transform ${hasSre ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {hasSre ? (
                 <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>Y1 Cost / Mo</label>
                        <div className="relative">
                          <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                          <input type="number" min="0" value={isAdvancedSre ? Number(results.uiSreY1).toFixed(2) : sreCostY1} onChange={(e) => !isAdvancedSre && setSreCostY1(e.target.value)} disabled={isAdvancedSre} placeholder="0" className={`w-full px-2 py-2 ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark text-accenture-gray-light' : 'bg-white border-accenture-gray-light text-black'} border  outline-none text-xs font-mono pl-7 transition-colors disabled:opacity-60 disabled:bg-accenture-gray-off-white dark:disabled:bg-[#0a0a0a]`} />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>Y2+ Cost / Mo</label>
                        <div className="relative">
                          <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                          <input type="number" min="0" value={isAdvancedSre ? Number(results.uiSreY2).toFixed(2) : sreCostY2} onChange={(e) => !isAdvancedSre && setSreCostY2(e.target.value)} disabled={isAdvancedSre} placeholder="0" className={`w-full px-2 py-2 ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark text-accenture-gray-light' : 'bg-white border-accenture-gray-light text-black'} border  outline-none text-xs font-mono pl-7 transition-colors disabled:opacity-60 disabled:bg-accenture-gray-off-white dark:disabled:bg-[#0a0a0a]`} />
                        </div>
                      </div>
                    </div>
                    <div className={`pt-2 border-t ${isDarkMode ? 'border-accenture-purple' : 'border-accenture-purple'} flex justify-between items-center`}>
                        <div className="flex items-center space-x-2">
                           {isAdvancedSre ? (
                              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark'} flex items-center`}><Check size={12} className="mr-1" /> Advanced Config Active</span>
                           ) : (
                              <span className={`text-[10px] font-medium ${textSub}`}>Manual entry active</span>
                           )}
                        </div>
                        <button onClick={() => setIsSreModalOpen(true)} className={`text-[10px] font-bold px-3 py-1.5  shadow-sm transition-colors ${isAdvancedSre ? 'bg-accenture-gray-off-white text-accenture-gray-dark hover:bg-accenture-gray-light dark:bg-[#1a1a1a] dark:text-accenture-gray-light dark:hover:bg-accenture-gray-dark' : 'bg-accenture-purple-dark hover:bg-accenture-purple text-white'}`}>
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

export default React.memo(QuantitativeSection);
