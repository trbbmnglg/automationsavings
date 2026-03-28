import { useMemo, useEffect } from 'react';

/**
 * Generates memoized Tailwind class strings for the active theme combination.
 * Supports two color schemes (default blue, electric violet) in both light and dark modes.
 * Sets data-theme attribute on document.body for CSS targeting.
 * @param {boolean} isDarkMode - Whether dark mode is active
 * @param {string} [themeColor='default'] - Color scheme ('default' | 'violet')
 * @returns {Object} Theme style strings: bgMain, textMain, textHeading, textSub, borderMuted, panelBg, cardStyle, inputStyle, inputErrorStyle
 */
export function useTheme(isDarkMode, themeColor = 'default') {

  useEffect(() => {
    document.body.setAttribute('data-theme', themeColor);
  }, [themeColor]);

  return useMemo(() => {
    if (themeColor === 'violet') {
      return {
        bgMain: isDarkMode ? "bg-[#0B0410]" : "bg-[#FAF8FC]",
        textMain: isDarkMode ? "text-violet-100" : "text-slate-800",
        textHeading: isDarkMode ? "text-white" : "text-slate-900",
        textSub: isDarkMode ? "text-violet-300/80" : "text-slate-500",
        borderMuted: isDarkMode ? "border-electric-violet-900/50" : "border-electric-violet-200/80",
        panelBg: isDarkMode ? "bg-[#140822]" : "bg-white/60",
        cardStyle: `${isDarkMode ? 'bg-[#1C0D2E] border-electric-violet-800/60 shadow-none' : 'bg-white border-electric-violet-200/60 shadow-sm'} rounded-[28px] border relative transition-colors duration-300`,
        inputStyle: `w-full px-4 py-3.5 ${isDarkMode ? 'bg-[#140822]/80 border-electric-violet-800 text-violet-100 placeholder-violet-400 focus:bg-[#1C0D2E]' : 'bg-electric-violet-50/50 border-electric-violet-200/80 text-slate-800 placeholder-slate-400 hover:bg-electric-violet-50 focus:bg-white'} border rounded-2xl focus:ring-2 focus:ring-electric-violet-500 focus:border-electric-violet-500 transition-all duration-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`,
        inputErrorStyle: `w-full px-4 py-3.5 ${isDarkMode ? 'bg-red-950/30 border-red-900 text-red-400 focus:bg-[#140822]' : 'bg-red-50/70 border-red-200 text-red-900 focus:bg-white'} border rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`
      };
    }

    // Default Theme (Blue/Slate)
    return {
      bgMain: isDarkMode ? "bg-[#0B0F19]" : "bg-[#F8FAFC]",
      textMain: isDarkMode ? "text-slate-200" : "text-slate-800",
      textHeading: isDarkMode ? "text-white" : "text-slate-900",
      textSub: isDarkMode ? "text-slate-400" : "text-slate-500",
      borderMuted: isDarkMode ? "border-slate-800/60" : "border-slate-200",
      panelBg: isDarkMode ? "bg-[#131B2C]" : "bg-white/60",
      cardStyle: `${isDarkMode ? 'bg-[#1A233A] border-slate-800/60 shadow-none' : 'bg-white border-slate-200 shadow-sm'} rounded-[28px] border relative transition-colors duration-300`,
      inputStyle: `w-full px-4 py-3.5 ${isDarkMode ? 'bg-[#131B2C]/80 border-slate-800 text-slate-200 placeholder-slate-500 focus:bg-[#1A233A]' : 'bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 hover:bg-slate-50 focus:bg-white'} border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`,
      inputErrorStyle: `w-full px-4 py-3.5 ${isDarkMode ? 'bg-red-900/20 border-red-900/50 text-red-400 focus:bg-[#131B2C]' : 'bg-red-50 border-red-200 text-red-900 focus:bg-white'} border rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`
    };
  }, [isDarkMode, themeColor]);
}
