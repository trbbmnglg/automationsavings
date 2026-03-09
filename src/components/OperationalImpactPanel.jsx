import React from 'react';
import { Clock, Info, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Tooltip from './Tooltip';

export default function OperationalImpactPanel() {
  const { cardStyle, isDarkMode, textHeading, results, textSub, borderMuted } = useApp();
  return (
    <div className={`${cardStyle} p-6 md:p-8 grid grid-cols-2 gap-6`}>
      <div>
        <Tooltip text="Total manual hours saved over the project duration."><div className={`flex items-center space-x-2 text-emerald-600 mb-3 ${isDarkMode ? 'bg-emerald-950/30' : 'bg-emerald-50'} w-max px-3 py-1.5 rounded-xl font-bold text-sm cursor-help`}><Clock size={16} /><span>Time Recaptured</span><Info size={14} className="opacity-70 cursor-help" /></div></Tooltip>
        <div className={`text-3xl font-extrabold ${textHeading} tracking-tight`}>{new Intl.NumberFormat().format(Math.round(results.hoursSavedMonthly))} <span className={`text-base ${textSub} font-medium`}>hrs/mo</span></div>
        <p className={`text-xs font-bold ${textSub} mt-2 uppercase tracking-wide`}>{new Intl.NumberFormat().format(Math.round(results.hoursSavedTotal))} hrs over life</p>
      </div>
      <div className={`border-l ${borderMuted} pl-6`}>
        <Tooltip text={`Full-Time Equivalents (Assumes configured ${results.fteHoursPerMonth} hours/month per employee).`}><div className={`flex items-center space-x-2 text-indigo-500 mb-3 ${isDarkMode ? 'bg-indigo-950/30' : 'bg-indigo-50'} w-max px-3 py-1.5 rounded-xl font-bold text-sm cursor-help`}><Users size={16} /><span>FTE Savings</span><Info size={14} className="opacity-70 cursor-help" /></div></Tooltip>
        <div className={`text-3xl font-extrabold ${textHeading} tracking-tight`}>{results.fteSavings.toFixed(1)} <span className={`text-base ${textSub} font-medium`}>FTEs</span></div>
        <p className={`text-xs font-bold ${textSub} mt-2 uppercase tracking-wide`}>Reallocated capacity</p>
      </div>
    </div>
  );
}
