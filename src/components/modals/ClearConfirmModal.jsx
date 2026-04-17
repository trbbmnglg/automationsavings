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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-in fade-in duration-200"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-accenture-gray-dark' : 'bg-white border-accenture-gray-light'} rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border p-8 text-center`}>
        <div className="mx-auto w-16 h-16 bg-[#fff0f6] dark:bg-accenture-pink/20 rounded-full flex items-center justify-center text-accenture-pink dark:text-accenture-pink mb-6"><AlertTriangle size={32} /></div>
        <h2 id="modal-title" className={`text-2xl font-bold ${textHeading} mb-2`}>Clear all data?</h2>
        <p className={`${textSub} text-sm mb-8`}>This will reset all your project inputs back to a clean slate. This action cannot be undone.</p>
        <div className="flex flex-col space-y-3">
          <button onClick={handleClearAll} className="bg-accenture-pink hover:bg-accenture-pink text-white py-3 font-bold transition-all shadow-lg shadow-red-500/20">Yes, clear data</button>
          <button onClick={() => setShowClearConfirm(false)} className={`${isDarkMode ? 'bg-[#0a0a0a] text-accenture-gray-light hover:bg-[#1a1a1a]' : 'bg-accenture-gray-off-white text-accenture-gray-dark hover:bg-accenture-gray-off-white'} py-3  font-bold transition-all`}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
