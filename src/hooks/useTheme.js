import { useMemo } from 'react';

export function useTheme(isDarkMode) {
  return useMemo(() => ({
    bgMain: isDarkMode ? "bg-[#0B1120]" : "bg-[#F8FAFC]",
    textMain: isDarkMode ? "text-slate-200" : "text-slate-800",
    textHeading: isDarkMode ? "text-white" : "text-slate-900",
    textSub: isDarkMode ? "text-slate-400" : "text-slate-500",
    borderMuted: isDarkMode ? "border-slate-800/80" : "border-slate-100",
    panelBg: isDarkMode ? "bg-[#0F172A]" : "bg-slate-50/30",
    cardStyle: `${isDarkMode ? 'bg-[#1E293B] border-slate-700/60 shadow-none' : 'bg-white border-slate-200/60 shadow-sm'} rounded-[28px] border relative transition-colors duration-300`,
    inputStyle: `w-full px-4 py-3.5 ${isDarkMode ? 'bg-[#0F172A]/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:bg-[#0F172A]' : 'bg-slate-50/70 border-slate-200/80 text-slate-800 placeholder-slate-400 hover:bg-slate-50 focus:bg-white'} border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`,
    inputErrorStyle: `w-full px-4 py-3.5 ${isDarkMode ? 'bg-red-950/30 border-red-900 text-red-400 focus:bg-[#0F172A]' : 'bg-red-50/70 border-red-200 text-red-900 focus:bg-white'} border rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`
  }), [isDarkMode]);
}
