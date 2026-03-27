import React from 'react';
import { X, Moon, Sun, Settings2, Palette, Coins, Calendar, Clock, Key, RotateCcw, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SettingsModal() {
  const {
    isDarkMode, setIsDarkMode,
    themeColor, setThemeColor,
    setIsSettingsOpen,
    aiProvider, aiApiKey, setAiApiKey, aiModel, setAiModel,
    handleProviderChange,
    lcrRates, setLcrRates, baseLcr,
    workingDays, setWorkingDays,
    hoursPerDay, setHoursPerDay,
    textHeading, textSub, inputStyle,
  } = useApp();

  const handleResetLcr = () => setLcrRates(baseLcr);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border flex flex-col max-h-[90vh]`}>

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
            <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${textSub}`}>
              <Palette size={14} /> Theme Style
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setThemeColor('default')}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                  themeColor === 'default'
                    ? (isDarkMode ? 'border-blue-500 bg-blue-950/30 text-blue-400' : 'border-blue-500 bg-blue-50 text-blue-700')
                    : (isDarkMode ? 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300')
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0" />
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
                <div className="w-4 h-4 rounded-full bg-violet-500 shrink-0" />
                <span>Electric Violet</span>
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${textSub}`}>
              <Sun size={14} /> Appearance
            </h3>
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

          {/* Work Schedule */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${textSub}`}>
              <Calendar size={14} /> Work Schedule
            </h3>
            <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 grid grid-cols-2 gap-4`}>
              <div>
                <label className={`block text-xs font-bold ${textSub} uppercase mb-2`}>Working Days / Mo</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(Number(e.target.value))}
                  className={`${inputStyle} py-2.5 text-sm font-mono`}
                />
                <p className={`text-[10px] font-medium ${textSub} mt-1`}>Default: 22 days</p>
              </div>
              <div>
                <label className={`block text-xs font-bold ${textSub} uppercase mb-2`}>Hours / Day</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className={`${inputStyle} py-2.5 text-sm font-mono`}
                />
                <p className={`text-[10px] font-medium ${textSub} mt-1`}>Default: 8 hrs</p>
              </div>
            </div>
            <p className={`text-[11px] font-medium ${textSub} px-1`}>
              Determines FTE hours/month ({workingDays} × {hoursPerDay} = <strong>{workingDays * hoursPerDay} hrs/mo</strong>) and converts daily task volumes to monthly.
            </p>
          </div>

          {/* LCR Rates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${textSub}`}>
                <Coins size={14} /> Labor Cost Rates (USD/hr)
              </h3>
              <button
                onClick={handleResetLcr}
                className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:text-amber-600 hover:bg-amber-50'}`}
              >
                <RotateCcw size={11} /> Reset to Default
              </button>
            </div>
            <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 space-y-3`}>
              {Object.entries(lcrRates).map(([cl, rate]) => (
                <div key={cl} className="flex items-center gap-3">
                  <div className={`text-xs font-extrabold w-10 shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{cl}</div>
                  <div className="flex-1 relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}>
                      <Coins size={13} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={rate}
                      onChange={(e) => setLcrRates(prev => ({ ...prev, [cl]: Number(e.target.value) }))}
                      className={`${inputStyle} py-2 pl-8 text-sm font-mono`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${textSub} w-6 shrink-0`}>/hr</span>
                </div>
              ))}
            </div>
            <p className={`text-[11px] font-medium ${textSub} px-1`}>
              Mapped to each resource row in the Labor Breakdown. Changes apply immediately to all calculations.
            </p>
          </div>

          {/* AI Provider */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${textSub}`}>
              <Key size={14} /> AI Provider
            </h3>
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
                <>
                  <div>
                    <label className={`block text-xs font-bold ${textSub} uppercase mb-2`}>API Key</label>
                    <input
                      type="password"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="Paste your API key here..."
                      className={`w-full px-3 py-2.5 text-sm font-mono rounded-xl border outline-none transition-colors ${isDarkMode ? 'bg-[#1E293B] border-slate-700 text-slate-200 placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                    />
                    <p className={`text-[10px] font-medium ${textSub} mt-1.5`}>Never stored — cleared on page refresh for security.</p>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold ${textSub} uppercase mb-2`}>Model</label>
                    <input
                      type="text"
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className={`w-full px-3 py-2.5 text-sm font-mono rounded-xl border outline-none transition-colors ${isDarkMode ? 'bg-[#1E293B] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                    />
                  </div>
                </>
              )}

              {/* Data transmission disclosure */}
              <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} space-y-3`}>
                <div className={`${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-100 border-slate-200'} border rounded-xl p-3 flex gap-2.5`}>
                  <Shield size={14} className={`shrink-0 mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} aria-hidden="true" />
                  <p className={`text-[11px] font-medium ${textSub} leading-relaxed`}>
                    When using AI features, your <strong>Automation Name</strong> and <strong>Use Case</strong> are sent to the selected provider. Financial figures are stripped before transmission. Avoid entering confidential project names if data residency is a concern.
                  </p>
                </div>
                <div className={`text-[10px] font-medium ${textSub} px-1 space-y-1`}>
                  <p className="font-bold uppercase tracking-widest mb-1.5">Provider Privacy Policies</p>
                  <p><a href="https://pollinations.ai/privacy" target="_blank" rel="noopener noreferrer" className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Pollinations.ai Privacy Policy</a></p>
                  <p><a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Groq Privacy Policy</a></p>
                  <p><a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>OpenRouter Privacy Policy</a></p>
                </div>
              </div>
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
