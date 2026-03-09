import React from 'react';
import { Settings, X, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { providerOptions } from '../../constants/config';

export default function SettingsModal() {
  const { 
    isDarkMode, textHeading, setIsSettingsOpen, textSub, borderMuted, textMain, inputStyle, 
    workingDays, setWorkingDays, hoursPerDay, setHoursPerDay, aiProvider, handleProviderChange, 
    aiApiKey, setAiApiKey, lcrRates, setLcrRates, baseLcr
  } = useApp();

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title" 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border`}>
        <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-b px-6 py-5 flex items-center justify-between`}>
          <div className="flex items-center space-x-3"><div className="bg-blue-500/20 p-2 rounded-xl text-blue-500"><Settings size={18} /></div><h2 id="modal-title" className={`text-xl font-bold ${textHeading}`}>Settings</h2></div>
          <button onClick={() => setIsSettingsOpen(false)} className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 shadow-sm'} p-2 rounded-full transition-colors`}><X size={20} /></button>
        </div>
        <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textSub} mb-4 border-b ${borderMuted} pb-2`}>Operational Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={`block text-sm font-bold ${textMain} mb-2`}>Working Days / Mo</label><input type="number" min="1" max="31" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} className={inputStyle} /></div>
              <div><label className={`block text-sm font-bold ${textMain} mb-2`}>Hours / Day</label><input type="number" min="1" max="24" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} className={inputStyle} /></div>
            </div>
            <div className={`mt-3 p-3 rounded-xl ${isDarkMode ? 'bg-blue-950/30 border border-blue-900/50 text-blue-200' : 'bg-blue-50 border border-blue-100 text-blue-800'} text-xs font-medium`}>
              <strong>FTE Baseline:</strong> {Math.max(1, Number(workingDays)) * Math.max(1, Number(hoursPerDay))} hours per month.
            </div>
          </div>
          <div>
            <div className={`flex justify-between items-end border-b ${borderMuted} pb-2 mb-4`}>
               <h3 className={`text-xs font-bold uppercase tracking-wider ${textSub}`}>LCR Database Mapping</h3>
               <button onClick={() => setLcrRates(baseLcr)} className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors">Reset Defaults</button>
            </div>
            <p className={`text-xs ${textSub} mb-4`}>Define the base hourly rate in USD for each Career Level. This ensures the backend pricing calculation never breaks.</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(lcrRates).map(([cl, rate]) => (
                 <div key={cl} className="flex items-center space-x-2">
                    <span className={`text-xs font-bold w-10 ${textSub}`}>{cl}</span>
                    <div className="relative flex-1">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">$</div>
                       <input type="number" min="0" value={rate} onChange={(e) => setLcrRates(prev => ({...prev, [cl]: Math.max(0, Number(e.target.value))}))} className={`${inputStyle} pl-7 py-2 text-xs`} />
                    </div>
                 </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textSub} mb-4 border-b ${borderMuted} pb-2`}>AI Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold ${textMain} mb-2`}>AI Provider</label>
                <select value={aiProvider} onChange={handleProviderChange} className={inputStyle}>
                  {Object.entries(providerOptions).map(([key, opt]) => (<option key={key} value={key}>{opt.name}</option>))}
                </select>
              </div>
              {providerOptions[aiProvider].needsKey && (
                <div>
                  <label className={`block text-sm font-bold ${textMain} mb-2`}>API Key <span className="text-[10px] text-red-500 ml-2">(Not Saved)</span></label>
                  <input type="password" value={aiApiKey} onChange={(e) => setAiApiKey(e.target.value)} placeholder="Enter API key..." className={`${inputStyle} font-mono`} />
                  {providerOptions[aiProvider].url && (<a href={providerOptions[aiProvider].url} target="_blank" rel="noreferrer" className="inline-flex items-center mt-2 text-xs font-bold text-blue-500 hover:text-blue-400">Get your free key <ExternalLink size={12} className="ml-1" /></a>)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`px-6 py-5 ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-t flex justify-end`}>
          <button onClick={() => setIsSettingsOpen(false)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-md">Save & Close</button>
        </div>
      </div>
    </div>
  );
}
