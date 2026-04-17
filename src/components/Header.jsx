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
    : 'bg-gradient-to-br from-accenture-purple to-indigo-600 shadow-blue-500/20';

  return (
    <header className={`${cardStyle} p-4 pr-6 flex items-center justify-between z-20`}>
      <div className="flex items-center space-x-4">
        <div className={`${calcIconClass} p-3.5 rounded-[20px] text-white shadow-lg`}>
          <Calculator size={26} strokeWidth={2.5} aria-hidden="true" />
        </div>
        <div>
          <h1 className={`text-xl md:text-2xl font-extrabold ${textHeading} tracking-tight`}>Automation Savings</h1>
          <p className={`${textSub} text-sm font-medium hidden sm:block`}>Quantify ROI, time recaptured, and dynamic operational impact.</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className="hidden md:flex items-center mr-1">
          <Tooltip text={ratesStatus === 'live' ? 'Live Exchange Rates Active' : 'Offline Fallback Rates'}>
            <div className={`flex items-center ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light/50'} p-1  border relative transition-colors`}>
              {ratesStatus === 'live' && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accenture-purple border-2 border-accenture-gray-light rounded-full z-10"></div>}
              {Object.keys(currencyConfig).map((curr) => (
                <button key={curr} onClick={() => handleCurrencyChange(curr)} className={`px-3 py-1.5 text-xs font-bold  transition-all ${currency === curr ? (isDarkMode ? 'bg-[#1E293B] text-accenture-purple shadow-sm' : 'bg-white text-accenture-purple-dark shadow-sm') : (isDarkMode ? 'text-accenture-gray-dark hover:text-accenture-gray-light' : 'text-accenture-gray-dark hover:text-black')}`}>{curr}</button>
              ))}
            </div>
          </Tooltip>
        </div>

        <div className="hidden sm:flex items-center">
          <Tooltip text={isReadyToExport ? "Export Options" : "Please fill out basic Qualitative and Quantitative details to enable exports."}>
            <div className={`flex ${isDarkMode ? 'bg-emerald-950/20 border-accenture-purple/50' : 'bg-accenture-purple-lightest border-accenture-purple/60'} border  overflow-hidden shadow-sm transition-opacity ${isReadyToExport ? 'opacity-100' : 'opacity-40 grayscale'}`}>
              <button onClick={handleExportXLSX} disabled={isExportingXLSX || !isReadyToExport} className={`flex items-center space-x-1.5 text-xs font-bold ${isDarkMode ? 'text-accenture-purple hover:bg-accenture-purple-dark/40 border-accenture-purple/50' : 'text-accenture-purple-dark hover:bg-accenture-purple-lightest border-accenture-purple/60'} px-3 py-3 transition-all border-r disabled:cursor-not-allowed`} aria-label="Export Report to Excel">
                {isExportingXLSX ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
                <span className="hidden lg:inline">Excel</span>
              </button>
              <button onClick={handleExportPPTX} disabled={isExportingPPTX || !isReadyToExport} className={`flex items-center space-x-1.5 text-xs font-bold ${isDarkMode ? 'text-accenture-purple bg-accenture-purple-lightest hover:bg-accenture-purple-dark' : 'text-accenture-purple-dark bg-accenture-purple-lightest hover:bg-accenture-purple-lightest'} px-3 py-3 transition-all disabled:cursor-not-allowed`} aria-label="Export Summary to PowerPoint">
                {isExportingPPTX ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Presentation size={16} aria-hidden="true" />}
                <span className="hidden lg:inline">PPTX</span>
              </button>
            </div>
          </Tooltip>
        </div>

        <div className={`flex items-center space-x-1 ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark/80' : 'bg-accenture-gray-off-white border-transparent'} p-1 rounded-[20px] border`}>
            <Tooltip text={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode"}><button onClick={() => setIsDarkMode(!isDarkMode)} aria-label={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode"} className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-accenture-purple hover:bg-[#1E293B]' : 'text-accenture-gray-dark hover:text-accenture-purple-dark hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><Sun size={18} aria-hidden="true" /></button></Tooltip>
            <Tooltip text="Generate Mock Data (Quick Test)"><button onClick={handleGenerateMockData} aria-label="Generate Mock Data" className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-accenture-purple hover:bg-[#1E293B]' : 'text-accenture-gray-dark hover:text-accenture-purple-dark hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><FlaskConical size={18} aria-hidden="true" /></button></Tooltip>
            <Tooltip text="Clear Project Data"><button onClick={() => setShowClearConfirm(true)} aria-label="Clear Project Data" className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-accenture-gray-dark hover:text-accenture-pink hover:bg-[#1E293B]' : 'text-accenture-gray-dark hover:text-accenture-pink hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><Trash2 size={18} aria-hidden="true" /></button></Tooltip>
            <Tooltip text="Settings"><button onClick={() => setIsSettingsOpen(true)} aria-label="Settings" className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-accenture-gray-dark hover:text-accenture-purple hover:bg-[#1E293B]' : 'text-accenture-gray-dark hover:text-accenture-purple-dark hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><Settings size={18} aria-hidden="true" /></button></Tooltip>
        </div>
      </div>
    </header>
  );
}
