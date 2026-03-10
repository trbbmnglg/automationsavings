import React, { useState } from 'react';
import { X, Moon, Sun, Calculator, Settings2, Trash2, Palette } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import SreConfigurationModal from './SreConfigurationModal';
import ClearConfirmModal from './ClearConfirmModal';
import AdvancedRunCostModal from './AdvancedRunCostModal';

export default function SettingsModal({ isOpen, onClose }) {
  const { 
    isDarkMode, 
    setIsDarkMode, 
    themeColor,
    setThemeColor,
    showAdvancedRunCost, 
    setShowAdvancedRunCost 
  } = useAppContext();

  const [showSreConfig, setShowSreConfig] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAdvancedRunCostModal, setShowAdvancedRunCostModal] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-[#131B2C] text-white' : 'bg-white text-slate-900'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between`}>
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Theme Accent Section */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Theme Style
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setThemeColor('default')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  themeColor === 'default'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : `border-transparent ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`
                }`}
              >
                <Palette className="w-5 h-5" />
                <span className="font-medium">Default Blue</span>
              </button>
              <button
                onClick={() => setThemeColor('violet')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  themeColor === 'violet'
                    ? 'border-electric-violet-500 bg-electric-violet-500/10 text-electric-violet-600 dark:text-electric-violet-400'
                    : `border-transparent ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`
                }`}
              >
                <Palette className="w-5 h-5" />
                <span className="font-medium">Electric Violet</span>
              </button>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Appearance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  !isDarkMode 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-transparent bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="font-medium">Light</span>
              </button>
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  isDarkMode 
                    ? 'border-blue-500 bg-slate-800 text-blue-400' 
                    : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-medium">Dark</span>
              </button>
            </div>
          </div>

          {/* Calculation Mode */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Calculation Mode
            </h3>
            <button
              onClick={() => setShowAdvancedRunCostModal(true)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calculator className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="text-left">
                  <div className="font-medium">Run Cost Calculation</div>
                  <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {showAdvancedRunCost ? 'Advanced (CPU/Mem)' : 'Simple (per run)'}
                  </div>
                </div>
              </div>
              <Settings2 className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Configuration
            </h3>
            <button
              onClick={() => setShowSreConfig(true)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings2 className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="text-left">
                  <div className="font-medium">SRE Variables</div>
                  <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Configure hourly rates and defaults
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Data
            </h3>
            <button
              onClick={() => setShowClearConfirm(true)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                isDarkMode 
                  ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' 
                  : 'bg-red-50 hover:bg-red-100 text-red-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Clear All Data</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <SreConfigurationModal 
        isOpen={showSreConfig} 
        onClose={() => setShowSreConfig(false)} 
      />
      
      <ClearConfirmModal 
        isOpen={showClearConfirm} 
        onClose={() => setShowClearConfirm(false)} 
        onSettingsClose={onClose}
      />

      <AdvancedRunCostModal
        isOpen={showAdvancedRunCostModal}
        onClose={() => setShowAdvancedRunCostModal(false)}
      />
    </div>
  );
}
