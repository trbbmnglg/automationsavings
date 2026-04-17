import React from 'react';
import { useApp } from '../../context/AppContext';
import Tooltip from '../Tooltip';
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
     <div 
       role="dialog" 
       aria-modal="true" 
       aria-labelledby="modal-title" 
       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity"
     >
       <div className={`${isDarkMode ? 'bg-[#1E293B] border-accenture-gray-dark' : 'bg-white border-accenture-gray-light'} rounded-none shadow-2xl w-full max-w-xl overflow-hidden border flex flex-col max-h-[90vh]`}>
         <div className={`${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'} border-b px-6 py-5 flex items-center justify-between shrink-0`}>
           <div className="flex items-center space-x-3"><div className="bg-accenture-purple-dark p-2 text-accenture-purple-dark"><Wrench size={18} /></div><h2 id="modal-title" className={`text-xl font-bold ${textHeading}`}>Advanced SRE / Maintenance</h2></div>
           <button onClick={() => setIsSreModalOpen(false)} className={`${isDarkMode ? 'text-accenture-gray-dark hover:text-white hover:bg-[#0a0a0a]' : 'text-accenture-gray-dark hover:text-black bg-white hover:bg-accenture-gray-off-white shadow-sm'} p-2 rounded-full transition-colors`}><X size={20} /></button>
         </div>
         <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Dynamic SRE Roles */}
            <div className="space-y-4">
              {sreBreakdown.map((entry, index) => (
                 <div key={entry.id} className={`p-4 rounded-none border ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark/80' : 'bg-accenture-gray-off-white border-accenture-gray-light'} shadow-sm`}>
                    
                    {/* Row 1: Role & Remove btn */}
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center space-x-2">
                         <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1  ${isDarkMode ? 'bg-[#0a0a0a] text-accenture-gray-light' : 'bg-white text-accenture-gray-dark shadow-sm'}`}>SRE Role {index + 1}</span>
                         <select value={entry.cl} onChange={(e) => updateSreRole(entry.id, 'cl', e.target.value)} className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${textHeading} border border-transparent hover:border-accenture-gray-light dark:hover:border-accenture-gray-dark rounded px-1 transition-all`}>
                            {Object.keys(lcrRates).map(cl => <option key={cl} value={cl} className="bg-white dark:bg-[#0a0a0a]">{cl}</option>)}
                         </select>
                       </div>
                       {sreBreakdown.length > 1 && (
                          <button onClick={() => removeSreRole(entry.id)} className={`text-accenture-gray-dark hover:text-accenture-pink ${isDarkMode ? 'hover:bg-accenture-pink/30' : 'hover:bg-[#fff0f6]'} p-1.5  transition-colors`} title="Remove Role">
                            <Trash2 size={14}/>
                          </button>
                       )}
                    </div>
                    
                    {/* Row 2: Tasks & Mins/Hrs */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                       <div>
                          <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>Maintenance Tasks / Mo</label>
                          <input type="number" min="0" value={entry.tasksPerMonth} onChange={(e) => { const val = e.target.value; if (val === '' || Number(val) >= 0) updateSreRole(entry.id, 'tasksPerMonth', val); }} placeholder="0" className={`${entry.tasksPerMonth !== '' && Number(entry.tasksPerMonth) < 0 ? inputErrorStyle : inputStyle} py-2.5 text-sm font-mono`} />
                       </div>
                       <div>
                          <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>Time per Task</label>
                          <div className="flex space-x-2">
                            <div className="relative flex-1"><input type="number" min="0" value={entry.effortMinutes} onChange={(e) => handleSreMinutesChange(entry.id, e.target.value)} placeholder="0" className={`${entry.effortMinutes !== '' && entry.effortMinutes < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-8 text-sm font-mono`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-accenture-gray-dark font-bold text-[10px] pointer-events-none">MIN</span></div>
                            <div className="relative flex-1"><input type="number" min="0" step="0.01" value={entry.effortHours} onChange={(e) => handleSreHoursChange(entry.id, e.target.value)} placeholder="0.0" className={`${entry.effortHours !== '' && entry.effortHours < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-8 text-sm font-mono ${isDarkMode ? 'bg-black/50' : 'bg-accenture-gray-off-white/50'}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-accenture-gray-dark font-bold text-[10px] pointer-events-none">HR</span></div>
                          </div>
                       </div>
                    </div>

                    {/* Row 3: Y2 Reduction Slider */}
                    <div>
                       <div className="flex justify-between items-center mb-3">
                         <label className={`flex items-center text-[10px] font-bold ${textSub} uppercase`}>Y2+ Efficiency Gain <Tooltip text='Percentage reduction in SRE effort required after Year 1 as the tool stabilizes.'><Info size={12} className={`${textSub} hover:text-accenture-purple-dark transition-colors cursor-help ml-1`}/></Tooltip></label>
                         <span className={`font-extrabold ${isDarkMode ? 'text-accenture-purple bg-accenture-purple-lightest' : 'text-accenture-purple-dark bg-accenture-purple-lightest'} px-2.5 py-0.5  text-xs shadow-sm`}>{entry.y2Reduction}%</span>
                       </div>
                       <input type="range" min="0" max="100" value={entry.y2Reduction} onChange={(e) => updateSreRole(entry.id, 'y2Reduction', e.target.value)} className={`w-full h-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-accenture-gray-off-white'} rounded-full appearance-none cursor-pointer accent-orange-500`} />
                    </div>
                 </div>
              ))}
              <button onClick={addSreRole} className={`w-full py-3 flex items-center justify-center space-x-2 border-2 border-dashed rounded-none text-sm font-bold transition-all ${isDarkMode ? 'border-accenture-gray-dark text-accenture-gray-dark hover:border-accenture-purple hover:text-accenture-purple hover:bg-accenture-purple' : 'border-accenture-gray-light text-accenture-gray-dark hover:border-accenture-purple hover:text-accenture-purple-dark hover:bg-accenture-purple-lightest'}`}>
                 <Plus size={16} /><span>Add SRE Role</span>
              </button>
            </div>

            <div className={`border-t ${borderMuted} pt-6`}>
               <div className="flex justify-between items-end mb-3">
                 <label className={`flex items-center text-sm font-bold ${textMain}`}><ShieldCheck size={16} className="mr-1.5 text-accenture-purple-dark" /> SRE Use Case / Justification</label>
                 <Tooltip text={(!toolName && !useCase) ? "Generates a generic justification since Tool Name/Use Case are empty." : "Generate SRE justification based on your Tool Name & Use Case."}>
                   <button onClick={generateSreUseCase} disabled={isGeneratingSreUseCase} className="text-[10px] font-bold bg-accenture-purple-lightest text-accenture-purple-dark border border-accenture-purple dark:bg-accenture-purple-lightest dark:text-accenture-purple dark:border-accenture-purple hover:opacity-80 px-2 py-1 flex items-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                     {isGeneratingSreUseCase ? <Loader2 size={12} className="animate-spin mr-1.5"/> : <Sparkles size={12} className="mr-1.5"/>} AI Generate
                   </button>
                 </Tooltip>
               </div>
               <textarea value={sreUseCase} onChange={(e) => setSreUseCase(e.target.value)} rows={3} placeholder="e.g., Ongoing API maintenance, exception handling, and ruleset upgrades..." className={`${inputStyle} resize-none font-medium`} />
            </div>
         </div>
         <div className={`px-6 py-5 ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'} border-t flex justify-between items-center shrink-0`}>
           <button onClick={handleRevert} className={`text-xs font-bold px-3 py-2  transition-colors ${isDarkMode ? 'text-accenture-gray-dark hover:bg-[#0a0a0a] hover:text-accenture-pink' : 'text-accenture-gray-dark hover:bg-accenture-gray-off-white hover:text-accenture-pink'}`}>Disable Advanced Config</button>
           <button onClick={handleSave} className="bg-accenture-purple-dark hover:bg-accenture-purple-dark text-white px-6 py-3 font-bold transition-colors shadow-md">Apply Advanced SRE</button>
         </div>
       </div>
     </div>
   );
 }
