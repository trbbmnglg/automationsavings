import React from 'react';
import { X, Moon, Sun, Settings2, Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SettingsModal() {
  const {
    isDarkMode,
    setIsDarkMode,
    themeColor,
    setThemeColor,
    setIsSettingsOpen,
    aiProvider,
    setAiProvider,
    aiApiKey,
    setAiApiKey,
    aiModel,
    setAiModel,
    handleProviderChange,
    isDarkMode: dark,
    textHeading,
    textSub,
    borderMuted,
  } = useApp();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-b px-6 py-5 flex items-center justify-between shrink-0`}>
          <div className="flex items-center space-x-3">
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm'} p-2 rounded-xl`}>
              <Settings2 size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <h2 id="settings-modal-title" className={`text-xl font-bold ${textHeading}`}>Settings</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 shadow-sm'} p-2 rounded-full transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">

          {/* Theme Color */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${textSub}`}>Theme Style</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setThemeColor('default')}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                  themeColor === 'default'
                    ? (isDarkMode ? 'border-blue-500 bg-blue-950/30 text-blue-400' : 'border-blue-500 bg-blue-50 text-blue-700')
                    : (isDarkMode ? 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300')
                }`}
              >
                <Palette size={18} />
                <span>Default Blue</span>
              </button>
              <button
                onClick={() => setThemeColor('violet')}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                  themeColor === 'violet'
                    ? (isDarkMode ? 'border-violet-500 bg-violet-950/30 text-violet-400' : 'border-violet-500 bg-violet-50 text-violet-700')
                    : (isDarkMode ? 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300')
                }`}
              >
                <Palette size={18} />
                <span>Electric Violet</span>
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${textSub}`}>Appearance</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                  !isDarkMode
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Sun size={18} />
                <span>Light</span>
              </button>
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                  isDarkMode
                    ? 'border-blue-500 bg-blue-950/30 text-blue-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Moon size={18} />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* AI Provider */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${textSub}`}>AI Provider</h3>
            <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 space-y-4`}>
              <div>
                <label className={`block text-xs font-bold ${textSub} uppercase mb-2`}>Provider</label>
                <select
                  value={aiProvider}
                  onChange={handleProviderChange}
                  className={`w-full px-3 py-2.5 text-sm font-medium rounded-xl border outline-none transition-colors ${isDarkMode ? 'bg-[#1E293B] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  <option value="pollinations">Pollinations.ai (Free, no key needed)</option>
                  <option value="groq">Groq</option>
                  <option value="openrouter">OpenRouter Free</option>
                </select>
              </div>
              {aiProvider !== 'pollinations' && (
                <div>
                  <label className={`block text-xs font-bold ${textSub} uppercase mb-2`}>API Key</label>
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder="Paste your API key here..."
                    className={`w-full px-3 py-2.5 text-sm font-mono rounded-xl border outline-none transition-colors ${isDarkMode ? 'bg-[#1E293B] border-slate-700 text-slate-200 placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                  />
                  <p className={`text-[10px] font-medium ${textSub} mt-1.5`}>Never stored — cleared on page refresh.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-t shrink-0`}>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold transition-colors shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
