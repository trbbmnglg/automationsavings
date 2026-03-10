import React from 'react';
import { Calculator, Sun, FlaskConical, Trash2, Settings, Loader2, Download, Presentation } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';

export default function Header() {
  const { 
    cardStyle, textHeading, textSub, ratesStatus, currencyConfig, handleCurrencyChange, currency, isDarkMode, 
    isReadyToExport, isExportingXLSX, isExportingPPTX, setIsDarkMode, handleGenerateMockData, setShowClearConfirm, setIsSettingsOpen,
    handleExportXLSX, handleExportPPTX, themeColor
  } = useApp();

  const calcIconClass = themeColor === 'violet'
    ? 'bg-gradient-to-br from-violet-600 to-purple-700 shadow-violet-500/20'
    : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20';

  return (
    <header className={`${cardStyle} p-4 pr-6 flex items-center justify-between z-20`}>
      <div className="flex items-center space-x-4">
        <div className={`${calcIconClass} p-3.5 rounded-[20px] text-white shadow-lg`}>
          <Calculator size={26} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className={`text-xl md:text-2xl font-extrabold ${textHeading} tracking-tight`}>Automation Savings</h1>
          <p className={`${textSub} text-sm font-medium hidden sm:block`}>Quantify ROI, time recaptured, and dynamic operational impact.</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className="hidden md:flex items-center mr-1">
          <Tooltip text={ratesStatus === 'live' ? 'Live Exchange Rates Active' : 'Offline Fallback Rates'}>
            <div className={`flex items-center ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-100 border-slate-200/50'} p-1 rounded-2xl border relative transition-colors`}>
              {ratesStatus === 'live' && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-100 rounded-full z-10"></div>}
              {Object.keys(currencyConfig).map((curr) => (
                <button key={curr} onClick={() => handleCurrencyChange(curr)} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${currency === curr ? (isDarkMode ? 'bg-[#1E293B] text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}`}>{curr}</button>
              ))}
            </div>
          </Tooltip>
        </div>

        <div className="hidden sm:flex items-center">
          <Tooltip text={isReadyToExport ? "Export Options" : "Please fill out basic Qualitative and Quantitative details to enable exports."}>
            <div className={`flex ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200/60'} border rounded-2xl overflow-hidden shadow-sm transition-opacity ${isReadyToExport ? 'opacity-100' : 'opacity-40 grayscale'}`}>
              <button onClick={handleExportXLSX} disabled={isExportingXLSX || !isReadyToExport} className={`flex items-center space-x-1.5 text-xs font-bold ${isDarkMode ? 'text-emerald-400 hover:bg-emerald-900/40 border-emerald-900/50' : 'text-emerald-700 hover:bg-emerald-100 border-emerald-200/60'} px-3 py-3 transition-all border-r disabled:cursor-not-allowed`} title="Export Report to Excel">
                {isExportingXLSX ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span className="hidden lg:inline">Excel</span>
              </button>
              <button onClick={handleExportPPTX} disabled={isExportingPPTX || !isReadyToExport} className={`flex items-center space-x-1.5 text-xs font-bold ${isDarkMode ? 'text-orange-400 bg-orange-950/20 hover:bg-orange-900/40' : 'text-orange-700 bg-orange-50 hover:bg-orange-100'} px-3 py-3 transition-all disabled:cursor-not-allowed`} title="Export 1-Slide Summary to PowerPoint">
                {isExportingPPTX ? <Loader2 size={16} className="animate-spin" /> : <Presentation size={16} />}
                <span className="hidden lg:inline">PPTX</span>
              </button>
            </div>
          </Tooltip>
        </div>

        <div className={`flex items-center space-x-1 ${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-slate-100 border-transparent'} p-1 rounded-[20px] border`}>
            <Tooltip text={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode"}><button onClick={() => setIsDarkMode(!isDarkMode)} className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-amber-400 hover:bg-[#1E293B]' : 'text-slate-600 hover:text-amber-600 hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><Sun size={18} /></button></Tooltip>
            <Tooltip text="Generate Mock Data (Quick Test)"><button onClick={handleGenerateMockData} className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-emerald-400 hover:bg-[#1E293B]' : 'text-slate-600 hover:text-emerald-600 hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><FlaskConical size={18} /></button></Tooltip>
            <Tooltip text="Clear Project Data"><button onClick={() => setShowClearConfirm(true)} className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-[#1E293B]' : 'text-slate-600 hover:text-red-600 hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><Trash2 size={18} /></button></Tooltip>
            <Tooltip text="Settings"><button onClick={() => setIsSettingsOpen(true)} className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-[#1E293B]' : 'text-slate-600 hover:text-blue-600 hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><Settings size={18} /></button></Tooltip>
        </div>
      </div>
    </header>
  );
}
