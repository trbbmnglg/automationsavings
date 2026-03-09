import React from 'react';
import { Server, X, Coins, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdvancedRunCostModal() {
   const { 
     isDarkMode, textHeading, setIsRunCostModalOpen, textSub, inputStyle, inputErrorStyle,
     runCostBreakdown, updateRunCostBreakdown, setIsAdvancedRunCost
   } = useApp();
 
   const handleSave = () => {
      setIsAdvancedRunCost(true);
      setIsRunCostModalOpen(false);
   };
   
   const handleRevert = () => {
      setIsAdvancedRunCost(false);
      setIsRunCostModalOpen(false);
   };

   const renderRow = (key, title, subtitle, hasToggle) => {
      const data = runCostBreakdown[key];
      const isEnabled = hasToggle ? data.enabled : true;

      return (
         <div className={`p-4 rounded-[20px] border ${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-slate-50 border-slate-200'} shadow-sm transition-all duration-300 ${hasToggle && !isEnabled ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex justify-between items-center mb-3">
               <div>
                  <h4 className={`text-sm font-bold ${textHeading}`}>{title}</h4>
                  {subtitle && <p className={`text-[10px] ${textSub}`}>{subtitle}</p>}
               </div>
               {hasToggle && (
                  <button onClick={() => updateRunCostBreakdown(key, 'enabled', !data.enabled)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${data.enabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                     <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${data.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
               )}
            </div>
            
            {isEnabled && (
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>Cost / Mo</label>
                     <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                        <input type="number" min="0" value={data.cost} onChange={(e) => updateRunCostBreakdown(key, 'cost', e.target.value)} placeholder="0" className={`${data.cost !== '' && data.cost < 0 ? inputErrorStyle : inputStyle} py-2 pl-8 text-sm font-mono`} />
                     </div>
                  </div>
                  <div>
                     <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>YOY Inflation</label>
                     <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><TrendingUp size={12} /></div>
                        <input type="number" min="0" value={data.inflation} onChange={(e) => updateRunCostBreakdown(key, 'inflation', e.target.value)} placeholder="0" className={`${data.inflation !== '' && data.inflation < 0 ? inputErrorStyle : inputStyle} py-2 pl-8 pr-8 text-sm font-mono`} />
                        <span className={`absolute inset-y-0 right-0 pr-3 flex items-center ${textSub} font-bold text-xs`}>%</span>
                     </div>
                  </div>
               </div>
            )}
         </div>
      );
   };

   return (
     <div 
       role="dialog" 
       aria-modal="true" 
       aria-labelledby="modal-title" 
       className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity"
     >
       <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border flex flex-col max-h-[90vh]`}>
         <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-b px-6 py-5 flex items-center justify-between shrink-0`}>
           <div className="flex items-center space-x-3"><div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-500"><Server size={18} /></div><h2 id="modal-title" className={`text-xl font-bold ${textHeading}`}>Advanced Run Cost</h2></div>
           <button onClick={() => setIsRunCostModalOpen(false)} className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 shadow-sm'} p-2 rounded-full transition-colors`}><X size={20} /></button>
         </div>
         <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {renderRow('productLicense', 'Product License Fee', 'Base software license cost.', false)}
            {renderRow('ai', 'AI Tool Token Usage', 'LLM API or generative token costs.', true)}
            {renderRow('splunk', 'Splunk / Monitoring License', 'Data ingestion or log tracking costs.', true)}
            {renderRow('infra', 'Infrastructure', 'Cloud compute, VMs, databases.', true)}
            {renderRow('other', 'Other Run Costs', 'Miscellaneous recurring fees.', true)}
         </div>
         <div className={`px-6 py-5 ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-t flex justify-between items-center shrink-0`}>
           <button onClick={handleRevert} className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400' : 'text-slate-500 hover:bg-slate-200 hover:text-red-600'}`}>Disable Advanced Config</button>
           <button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-md">Apply Advanced Costs</button>
         </div>
       </div>
     </div>
   );
}
