import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ClearConfirmModal() {
  const { isDarkMode, textHeading, textSub, handleClearAll, setShowClearConfirm } = useApp();
  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title" 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-in fade-in duration-200"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border p-8 text-center`}>
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-6"><AlertTriangle size={32} /></div>
        <h2 id="modal-title" className={`text-2xl font-bold ${textHeading} mb-2`}>Clear all data?</h2>
        <p className={`${textSub} text-sm mb-8`}>This will reset all your project inputs back to a clean slate. This action cannot be undone.</p>
        <div className="flex flex-col space-y-3">
          <button onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20">Yes, clear data</button>
          <button onClick={() => setShowClearConfirm(false)} className={`${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} py-3 rounded-2xl font-bold transition-all`}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
