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
