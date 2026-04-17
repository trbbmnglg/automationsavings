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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
    >
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-accenture-gray-dark' : 'bg-white border-accenture-gray-light'} rounded-none shadow-2xl w-full max-w-lg overflow-hidden border flex flex-col max-h-[90vh]`}>

        {/* Header */}
        <div className={`${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'} border-b px-6 py-5 flex items-center justify-between shrink-0`}>
          <div className="flex items-center space-x-3">
            <div className={`${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white shadow-sm'} p-2 `}>
              <Settings2 size={18} className={isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark'} />
            </div>
            <h2 id="settings-modal-title" className={`text-xl font-bold ${textHeading}`}>Settings</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className={`${isDarkMode ? 'text-accenture-gray-dark hover:text-white hover:bg-[#0a0a0a]' : 'text-accenture-gray-dark hover:text-black bg-white hover:bg-accenture-gray-off-white shadow-sm'} p-2 rounded-full transition-colors`}
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
                aria-pressed={themeColor === 'default'}
                className={`flex items-center gap-3 p-4  border-2 transition-all font-bold text-sm ${
                  themeColor === 'default'
                    ? (isDarkMode ? 'border-accenture-purple bg-accenture-purple-darkest/30 text-accenture-purple' : 'border-accenture-purple bg-accenture-purple-lightest text-accenture-purple-dark')
                    : (isDarkMode ? 'border-accenture-gray-dark bg-[#0a0a0a]/50 text-accenture-gray-dark hover:border-accenture-gray-dark' : 'border-accenture-gray-light bg-accenture-gray-off-white text-accenture-gray-dark hover:border-accenture-gray-light')
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-accenture-gray-light shrink-0" />
                <span>Standard</span>
              </button>
              <button
                onClick={() => setThemeColor('violet')}
                aria-pressed={themeColor === 'violet'}
                className={`flex items-center gap-3 p-4  border-2 transition-all font-bold text-sm ${
                  themeColor === 'violet'
                    ? (isDarkMode ? 'border-accenture-purple bg-accenture-purple-darkest/30 text-accenture-purple' : 'border-accenture-purple bg-accenture-purple-lightest text-accenture-purple-dark')
                    : (isDarkMode ? 'border-accenture-gray-dark bg-[#0a0a0a]/50 text-accenture-gray-dark hover:border-accenture-gray-dark' : 'border-accenture-gray-light bg-accenture-gray-off-white text-accenture-gray-dark hover:border-accenture-gray-light')
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-accenture-purple shrink-0" />
                <span>Accent Line</span>
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
                className={`flex items-center gap-3 p-4  border-2 transition-all font-bold text-sm ${
                  !isDarkMode
                    ? 'border-accenture-purple bg-accenture-purple-lightest text-accenture-purple-dark'
                    : 'border-accenture-gray-dark bg-[#0a0a0a]/50 text-accenture-gray-dark hover:border-accenture-gray-dark'
                }`}
              >
                <Sun size={18} />
                <span>Light</span>
              </button>
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center gap-3 p-4  border-2 transition-all font-bold text-sm ${
                  isDarkMode
                    ? 'border-accenture-purple bg-accenture-purple-darkest/30 text-accenture-purple'
                    : 'border-accenture-gray-light bg-accenture-gray-off-white text-accenture-gray-dark hover:border-accenture-gray-light'
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
            <div className={`${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'} border  p-4 grid grid-cols-2 gap-4`}>
              <div>
                <label htmlFor="working-days-input" className={`block text-xs font-bold ${textSub} uppercase mb-2`}>Working Days / Mo</label>
                <input
                  id="working-days-input"
                  aria-describedby="working-days-hint"
                  type="number"
                  min="1"
                  max="31"
                  value={workingDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    // Preserve the empty state while typing; clamp to [1, 31]
                    // only once the user enters a real number so the field
                    // doesn't snap to 1 the instant it's cleared.
                    setWorkingDays(v === '' ? '' : Math.max(1, Math.min(31, Number(v))));
                  }}
                  onBlur={(e) => { if (e.target.value === '') setWorkingDays(22); }}
                  className={`${inputStyle} py-2.5 text-sm font-mono`}
                />
                <p id="working-days-hint" className={`text-[10px] font-medium ${textSub} mt-1`}>Default: 22 days</p>
              </div>
              <div>
                <label htmlFor="hours-per-day-input" className={`block text-xs font-bold ${textSub} uppercase mb-2`}>Hours / Day</label>
                <input
                  id="hours-per-day-input"
                  aria-describedby="hours-per-day-hint"
                  type="number"
                  min="1"
                  max="24"
                  value={hoursPerDay}
                  onChange={(e) => {
                    const v = e.target.value;
                    setHoursPerDay(v === '' ? '' : Math.max(1, Math.min(24, Number(v))));
                  }}
                  onBlur={(e) => { if (e.target.value === '') setHoursPerDay(8); }}
                  className={`${inputStyle} py-2.5 text-sm font-mono`}
                />
                <p id="hours-per-day-hint" className={`text-[10px] font-medium ${textSub} mt-1`}>Default: 8 hrs</p>
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
                className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5  transition-colors ${isDarkMode ? 'bg-[#0a0a0a] text-accenture-gray-dark hover:text-accenture-purple hover:bg-[#1a1a1a]' : 'bg-accenture-gray-off-white text-accenture-gray-dark hover:text-accenture-purple-dark hover:bg-accenture-purple-lightest'}`}
              >
                <RotateCcw size={11} /> Reset to Default
              </button>
            </div>
            <div className={`${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'} border  p-4 space-y-3`}>
              {Object.entries(lcrRates).map(([cl, rate]) => (
                <div key={cl} className="flex items-center gap-3">
                  <div className={`text-xs font-extrabold w-10 shrink-0 ${isDarkMode ? 'text-accenture-purple' : 'text-accenture-purple-dark'}`}>{cl}</div>
                  <div className="flex-1 relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}>
                      <Coins size={13} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={rate}
                      onChange={(e) => {
                        const v = e.target.value;
                        // Accept empty string while typing; coerce only on
                        // non-empty so the field doesn't jump to 0 on clear.
                        setLcrRates(prev => ({ ...prev, [cl]: v === '' ? '' : Math.max(0, Number(v)) }));
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          setLcrRates(prev => ({ ...prev, [cl]: baseLcr[cl] ?? 0 }));
                        }
                      }}
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
            <div className={`${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'} border  p-4 space-y-4`}>
              <div>
                <label className={`block text-xs font-bold ${textSub} uppercase mb-2`}>Provider</label>
                <select
                  value={aiProvider}
                  onChange={handleProviderChange}
                  className={`w-full px-3 py-2.5 text-sm font-medium  border outline-none transition-colors ${isDarkMode ? 'bg-[#1E293B] border-accenture-gray-dark text-accenture-gray-light' : 'bg-white border-accenture-gray-light text-black'}`}
                >
                  <option value="pollinations">Pollinations.ai (Free, no key needed)</option>
                  <option value="groq">Groq</option>
                  <option value="openrouter">OpenRouter Free</option>
                </select>
              </div>
              {aiProvider !== 'pollinations' && (
                <>
                  <div>
                    <label htmlFor="api-key-input" className={`block text-xs font-bold ${textSub} uppercase mb-2`}>API Key</label>
                    <input
                      id="api-key-input"
                      aria-describedby="api-key-hint"
                      type="password"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="Paste your API key here..."
                      className={`w-full px-3 py-2.5 text-sm font-mono  border outline-none transition-colors ${isDarkMode ? 'bg-[#1E293B] border-accenture-gray-dark text-accenture-gray-light placeholder-slate-600' : 'bg-white border-accenture-gray-light text-black placeholder-slate-400'}`}
                    />
                    <p id="api-key-hint" className={`text-[10px] font-medium ${textSub} mt-1.5`}>Never stored — cleared on page refresh for security.</p>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold ${textSub} uppercase mb-2`}>Model</label>
                    <input
                      type="text"
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className={`w-full px-3 py-2.5 text-sm font-mono  border outline-none transition-colors ${isDarkMode ? 'bg-[#1E293B] border-accenture-gray-dark text-accenture-gray-light' : 'bg-white border-accenture-gray-light text-black'}`}
                    />
                  </div>
                </>
              )}

              {/* Data transmission disclosure */}
              <div className={`pt-3 border-t ${isDarkMode ? 'border-accenture-gray-dark' : 'border-accenture-gray-light'} space-y-3`}>
                <div className={`${isDarkMode ? 'bg-[#0a0a0a]/60 border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'} border  p-3 flex gap-2.5`}>
                  <Shield size={14} className={`shrink-0 mt-0.5 ${isDarkMode ? 'text-accenture-gray-dark' : 'text-accenture-gray-dark'}`} aria-hidden="true" />
                  <p className={`text-[11px] font-medium ${textSub} leading-relaxed`}>
                    When using AI features, your <strong>Automation Name</strong> and <strong>Use Case</strong> are sent to the selected provider. Financial figures are stripped before transmission. Avoid entering confidential project names if data residency is a concern.
                  </p>
                </div>
                <div className={`text-[10px] font-medium ${textSub} px-1 space-y-1`}>
                  <p className="font-bold uppercase tracking-widest mb-1.5">Provider Privacy Policies</p>
                  <p><a href="https://pollinations.ai/privacy" target="_blank" rel="noopener noreferrer" className={`underline ${isDarkMode ? 'text-accenture-purple hover:text-accenture-purple-light' : 'text-accenture-purple-dark hover:text-accenture-purple-dark'}`}>Pollinations.ai Privacy Policy</a></p>
                  <p><a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className={`underline ${isDarkMode ? 'text-accenture-purple hover:text-accenture-purple-light' : 'text-accenture-purple-dark hover:text-accenture-purple-dark'}`}>Groq Privacy Policy</a></p>
                  <p><a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className={`underline ${isDarkMode ? 'text-accenture-purple hover:text-accenture-purple-light' : 'text-accenture-purple-dark hover:text-accenture-purple-dark'}`}>OpenRouter Privacy Policy</a></p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-[#0F172A] border-accenture-gray-dark' : 'bg-accenture-gray-off-white border-accenture-gray-light'} border-t shrink-0`}>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-full bg-accenture-purple hover:bg-accenture-purple-dark text-white py-3 font-bold transition-colors shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
