import { useMemo } from 'react';

export function useCalculationEngine(deps) {
  const {
    laborBreakdown, automationPercent, durationMonths, implementationCost, 
    monthlyRunCost, runCostInflation, isAdvancedRunCost, runCostBreakdown, 
    lcrRates, hasSre, isAdvancedSre, sreCostY1, sreCostY2, sreBreakdown, 
    workingDays, hoursPerDay, scenario, currency, exchangeRates
  } = deps;

  return useMemo(() => {
    const fteHoursPerMonth = Math.max(1, Number(workingDays)) * Math.max(1, Number(hoursPerDay));
    const currencyMultiplier = exchangeRates[currency] / exchangeRates['USD'];

    const scenarioConfig = { optimistic: { benefit: 1.1, cost: 0.9 }, realistic: { benefit: 1.0, cost: 1.0 }, conservative: { benefit: 0.75, cost: 1.25 } };
    const sc = scenarioConfig[scenario] || scenarioConfig.realistic;

    let totalEffectiveExecutions = 0;
    let hoursMonthlyCurrent = 0;
    let currentMonthlyCost = 0;

    laborBreakdown.forEach(item => {
      const rawExecutions = Math.max(0, Number(item.executions));
      const effectiveExecutions = item.volumePeriod === 'daily' ? rawExecutions * Math.max(1, Number(workingDays)) : rawExecutions;
      const exactEffort = Math.max(0, Number(item.effortHours));
      
      const itemHours = effectiveExecutions * exactEffort;
      totalEffectiveExecutions += effectiveExecutions;
      hoursMonthlyCurrent += itemHours;
      
      const rateUSD = lcrRates[item.cl] || 0;
      const rateLocal = rateUSD * currencyMultiplier;
      currentMonthlyCost += itemHours * rateLocal;
    });

    const autoRatio = Math.max(0, Math.min(100, Number(automationPercent) * sc.benefit)) / 100;
    const months = Math.max(0, Number(durationMonths));
    const implCost = Math.max(0, Number(implementationCost)) * sc.cost;
    const inflationRate = Math.max(0, Number(runCostInflation)) / 100;

    // Advanced UI Calculation Output (For UI Display Only)
    let uiRunCostY1 = 0;
    if (isAdvancedRunCost) {
        uiRunCostY1 += Number(runCostBreakdown.productLicense.cost || 0);
        if (runCostBreakdown.ai.enabled) uiRunCostY1 += Number(runCostBreakdown.ai.cost || 0);
        if (runCostBreakdown.splunk.enabled) uiRunCostY1 += Number(runCostBreakdown.splunk.cost || 0);
        if (runCostBreakdown.infra.enabled) uiRunCostY1 += Number(runCostBreakdown.infra.cost || 0);
        if (runCostBreakdown.other.enabled) uiRunCostY1 += Number(runCostBreakdown.other.cost || 0);
    } else {
        uiRunCostY1 = Number(monthlyRunCost) || 0;
    }
    
    // Calculate Advanced Dynamic SRE Costs
    let uiSreY1 = 0, uiSreY2 = 0;
    if (hasSre) {
       if (isAdvancedSre) {
           sreBreakdown.forEach(item => {
               const rawSreTasks = Math.max(0, Number(item.tasksPerMonth));
               const rawSreHours = Math.max(0, Number(item.effortHours));
               const sreHoursMo = rawSreTasks * rawSreHours;
               const sreRateLocal = (lcrRates[item.cl] || 0) * currencyMultiplier;
               const costY1 = (sreHoursMo * sreRateLocal);
               const costY2 = (costY1 * (1 - (Math.max(0, Math.min(100, Number(item.y2Reduction))) / 100)));
               uiSreY1 += costY1; uiSreY2 += costY2;
           });
       } else {
           uiSreY1 = Math.max(0, Number(sreCostY1));
           uiSreY2 = Math.max(0, Number(sreCostY2));
       }
    }
    
    const baseRunCost = uiRunCostY1 * sc.cost;
    const sreY1 = uiSreY1 * sc.cost;
    const sreY2 = uiSreY2 * sc.cost;

    const hoursMonthlySaved = hoursMonthlyCurrent * autoRatio;
    const hoursSavedTotal = hoursMonthlySaved * months;
    const grossMonthlySave = currentMonthlyCost * autoRatio;
    
    let totalRunCost = 0, totalSreCost = 0, totalGrossSave = 0;
    let cumulativeNet = -implCost;
    let paybackMonth = Infinity;
    
    const monthlyData = [{ month: 0, year: 0, implementationCost: implCost, runCost: 0, sreCost: 0, grossSavings: 0, netCashFlow: -implCost, cumulativeNet: cumulativeNet }];

    for (let m = 1; m <= months; m++) {
      let currentYear = Math.ceil(m / 12);
      let currentRunCost = 0;
      if (isAdvancedRunCost) {
         let tempRunCost = 0;
         tempRunCost += Number(runCostBreakdown.productLicense.cost || 0) * Math.pow(1 + Number(runCostBreakdown.productLicense.inflation || 0) / 100, currentYear - 1);
         if (runCostBreakdown.ai.enabled) tempRunCost += Number(runCostBreakdown.ai.cost || 0) * Math.pow(1 + Number(runCostBreakdown.ai.inflation || 0) / 100, currentYear - 1);
         if (runCostBreakdown.splunk.enabled) tempRunCost += Number(runCostBreakdown.splunk.cost || 0) * Math.pow(1 + Number(runCostBreakdown.splunk.inflation || 0) / 100, currentYear - 1);
         if (runCostBreakdown.infra.enabled) tempRunCost += Number(runCostBreakdown.infra.cost || 0) * Math.pow(1 + Number(runCostBreakdown.infra.inflation || 0) / 100, currentYear - 1);
         if (runCostBreakdown.other.enabled) tempRunCost += Number(runCostBreakdown.other.cost || 0) * Math.pow(1 + Number(runCostBreakdown.other.inflation || 0) / 100, currentYear - 1);
         currentRunCost = tempRunCost * sc.cost;
      } else {
         currentRunCost = baseRunCost * Math.pow(1 + inflationRate, currentYear - 1);
      }

      let currentSreCost = currentYear === 1 ? sreY1 : sreY2;
      
      totalRunCost += currentRunCost; totalSreCost += currentSreCost; totalGrossSave += grossMonthlySave;
      let monthlyNet = grossMonthlySave - currentRunCost - currentSreCost;
      cumulativeNet += monthlyNet;
      monthlyData.push({ month: m, year: currentYear, implementationCost: 0, runCost: currentRunCost, sreCost: currentSreCost, grossSavings: grossMonthlySave, netCashFlow: monthlyNet, cumulativeNet: cumulativeNet });

      if (paybackMonth === Infinity && cumulativeNet >= 0) {
        if (grossMonthlySave <= 0) { paybackMonth = Infinity; } 
        else {
          let remainder = cumulativeNet;
          let fraction = monthlyNet === 0 ? 0 : 1 - (remainder / monthlyNet);
          fraction = Math.max(0, Math.min(1, fraction));
          paybackMonth = m - 1 + fraction;
        }
      }
    }

    if (paybackMonth === Infinity && months === 0 && implCost === 0) paybackMonth = 0;

    const totalInvestment = implCost + totalRunCost + totalSreCost;
    const netSave = totalGrossSave - totalInvestment;
    const roi = totalInvestment > 0 ? (netSave / totalInvestment) * 100 : (netSave > 0 ? Infinity : 0);
    const avgNetMonthlySave = months > 0 ? (totalGrossSave - totalRunCost - totalSreCost) / months : 0;
    const futureMonthlyCostAvg = (currentMonthlyCost - grossMonthlySave) + (months > 0 ? (totalRunCost + totalSreCost) / months : 0);
    const fteSavings = hoursMonthlySaved / fteHoursPerMonth;
    
    const blendedEffortPerHour = totalEffectiveExecutions > 0 ? hoursMonthlyCurrent / totalEffectiveExecutions : 0;
    const blendedResourceCostPerHour = hoursMonthlyCurrent > 0 ? currentMonthlyCost / hoursMonthlyCurrent : 0;

    let score = 0;
    if (roi >= 200) score += 40; else if (roi >= 100) score += 30; else if (roi >= 50) score += 20; else if (roi > 0) score += 10;
    if (paybackMonth <= 6) score += 40; else if (paybackMonth <= 12) score += 30; else if (paybackMonth <= 24) score += 20; else if (paybackMonth <= 36) score += 10;
    if (fteSavings >= 2) score += 20; else if (fteSavings >= 1) score += 15; else if (fteSavings >= 0.5) score += 10; else if (fteSavings > 0) score += 5;
    score = Math.min(100, Math.max(0, score));
    if (netSave <= 0) score = 0;

    let scoreLabel = "", scoreColor = "";
    if (score >= 80) { scoreLabel = "Strong Investment"; scoreColor = "text-emerald-400"; }
    else if (score >= 60) { scoreLabel = "Good Investment"; scoreColor = "text-blue-400"; }
    else if (score >= 40) { scoreLabel = "Marginal Return"; scoreColor = "text-amber-400"; }
    else { scoreLabel = "High Risk / Reject"; scoreColor = "text-red-400"; }

    return {
      totalEffectiveExecutions, currentMonthlyCost, futureMonthlyCostAvg, grossMonthlySave, avgNetMonthlySave, totalGrossSavings: totalGrossSave, 
      totalInvestment, totalRunCost, totalSreCost, netSavings: netSave, roi, paybackPeriod: paybackMonth, hoursSavedMonthly: hoursMonthlySaved, 
      hoursSavedTotal: hoursSavedTotal, fteSavings, currentFte: hoursMonthlyCurrent / fteHoursPerMonth, toBeFte: Math.max(0, hoursMonthlyCurrent - hoursMonthlySaved) / fteHoursPerMonth,
      totalManualHoursMonthly: hoursMonthlyCurrent, remainingManualHoursMonthly: Math.max(0, hoursMonthlyCurrent - hoursMonthlySaved),
      monthlyData, automationScore: score, scoreLabel, scoreColor, fteHoursPerMonth, currencyMultiplier, blendedEffortPerHour, blendedResourceCostPerHour,
      uiSreY1, uiSreY2, uiRunCostY1
    };
  }, Object.values(deps));
}


Step 4: The App Context Provider

src/context/AppContext.jsx

Note: This file becomes the centralized nervous system for your app. It houses all state declarations and the useCalculationEngine call, then exports a useApp() hook that all child components will consume.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStickyState } from '../hooks/useStickyState';
import { useCalculationEngine } from '../hooks/useCalculationEngine';
import { DEFAULT_LCR, providerOptions, currencyConfig } from '../constants/config';
import { fetchWithRetry, sanitizeStr } from '../utils/aiUtils';
import { loadScript } from '../utils/scriptLoader';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Factory initializers
const createDefaultLabor = () => [{ id: crypto.randomUUID(), cl: 'CL12', executions: '', volumePeriod: 'monthly', effortMinutes: '', effortHours: '' }];
const createDefaultSre = () => [{ id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: '', effortMinutes: '', effortHours: '', y2Reduction: 50 }];
const defaultRunCostBreakdown = { productLicense: { cost: '', inflation: 5 }, ai: { enabled: false, cost: '', inflation: 5 }, splunk: { enabled: false, cost: '', inflation: 5 }, infra: { enabled: false, cost: '', inflation: 5 }, other: { enabled: false, cost: '', inflation: 5 } };

export function AppProvider({ children }) {
  // --- All State Declarations from Original App.jsx go here ---
  const [baseLcr, setBaseLcr] = useState(DEFAULT_LCR);
  const [lcrRates, setLcrRates] = useStickyState(DEFAULT_LCR, 'as_lcrRates');
  const [toolName, setToolName] = useStickyState('', 'as_toolName');
  const [useCase, setUseCase] = useStickyState('', 'as_useCase');
  const [challenges, setChallenges] = useStickyState('', 'as_challenges');
  const [qualitativeBenefits, setQualitativeBenefits] = useStickyState('', 'as_qualitativeBenefits');
  const [kpis, setKpis] = useStickyState('', 'as_kpis');
  const [aiGeneratedFields, setAiGeneratedFields] = useStickyState({ kpis: false, challenges: false, benefits: false }, 'as_aiGeneratedFields');
  const [laborBreakdown, setLaborBreakdown] = useStickyState(createDefaultLabor, 'as_laborBreakdown');
  const [automationPercent, setAutomationPercent] = useStickyState(0, 'as_automationPercent');
  const [durationMonths, setDurationMonths] = useStickyState('', 'as_durationMonths');
  const [implementationCost, setImplementationCost] = useStickyState('', 'as_implementationCost');
  const [isAdvancedRunCost, setIsAdvancedRunCost] = useStickyState(false, 'as_isAdvancedRunCost');
  const [monthlyRunCost, setMonthlyRunCost] = useStickyState('', 'as_monthlyRunCost'); 
  const [runCostInflation, setRunCostInflation] = useStickyState('', 'as_runCostInflation'); 
  const [runCostBreakdown, setRunCostBreakdown] = useStickyState(defaultRunCostBreakdown, 'as_runCostBreakdown');
  const [hasSre, setHasSre] = useStickyState(false, 'as_hasSre');
  const [isAdvancedSre, setIsAdvancedSre] = useStickyState(false, 'as_isAdvancedSre');
  const [sreCostY1, setSreCostY1] = useStickyState('', 'as_sreCostY1'); 
  const [sreCostY2, setSreCostY2] = useStickyState('', 'as_sreCostY2'); 
  const [sreBreakdown, setSreBreakdown] = useStickyState(createDefaultSre, 'as_sreBreakdown');
  const [sreUseCase, setSreUseCase] = useStickyState('', 'as_sreUseCase');
  const [currency, setCurrency] = useStickyState('USD', 'as_currency');
  const [scenario, setScenario] = useStickyState('realistic', 'as_scenario');
  const [workingDays, setWorkingDays] = useStickyState(22, 'as_workingDays');
  const [hoursPerDay, setHoursPerDay] = useStickyState(8, 'as_hoursPerDay');
  const [isDarkMode, setIsDarkMode] = useStickyState(false, 'as_theme_dark');
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, PHP: 56.5, EUR: 0.92, JPY: 150.5 });
  const [ratesStatus, setRatesStatus] = useState('loading'); 
  const [copied, setCopied] = useState(false);
  const [aiPitch, setAiPitch] = useStickyState('', 'as_aiPitch');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isGeneratingSreUseCase, setIsGeneratingSreUseCase] = useState(false);
  const [roiInsights, setRoiInsights] = useStickyState('', 'as_roiInsights');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [showScore, setShowScore] = useStickyState(true, 'as_showScore');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSreModalOpen, setIsSreModalOpen] = useState(false);
  const [isRunCostModalOpen, setIsRunCostModalOpen] = useState(false);
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [aiProvider, setAiProvider] = useStickyState('pollinations', 'as_aiProvider');
  const [aiApiKey, setAiApiKey] = useState(''); 
  const [aiModel, setAiModel] = useStickyState(providerOptions['pollinations'].models[0], 'as_aiModel');

  // --- Network Effects (Rates & LCR JSON) ---
  useEffect(() => {
    const controller = new AbortController();
    const fetchLiveRates = async () => {
      try {
        const response = await fetch('[https://api.frankfurter.app/latest?from=USD](https://api.frankfurter.app/latest?from=USD)', { signal: controller.signal });
        const data = await response.json();
        if (data && data.rates) {
          setExchangeRates({ USD: 1, PHP: data.rates.PHP || 56.5, EUR: data.rates.EUR || 0.92, JPY: data.rates.JPY || 150.5 });
          setRatesStatus('live');
        } else { setRatesStatus('fallback'); }
      } catch (error) {
        if (error.name !== 'AbortError') setRatesStatus('fallback');
      }
    };
    const fetchRemoteLcr = async () => {
      try {
        const response = await fetch('[https://raw.githubusercontent.com/trbbmnglg/automationsavings/main/src/lcr.json](https://raw.githubusercontent.com/trbbmnglg/automationsavings/main/src/lcr.json)', { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            setBaseLcr(data);
            setLcrRates(prev => (JSON.stringify(prev) === JSON.stringify(DEFAULT_LCR)) ? data : prev);
          }
        }
      } catch (error) { /* Silently fallback to DEFAULT_LCR */ }
    };
    fetchLiveRates(); fetchRemoteLcr();
    return () => controller.abort();
  }, []);

  // --- Inject Calculation Engine ---
  const calculationDeps = { laborBreakdown, automationPercent, durationMonths, implementationCost, monthlyRunCost, runCostInflation, isAdvancedRunCost, runCostBreakdown, lcrRates, hasSre, isAdvancedSre, sreCostY1, sreCostY2, sreBreakdown, workingDays, hoursPerDay, scenario, currency, exchangeRates };
  const results = useCalculationEngine(calculationDeps);

  // --- Helper Functions (Copy exactly from original App.jsx) ---
  const formatCurrency = (value) => new Intl.NumberFormat(currencyConfig[currency].locale, { style: 'currency', currency: currencyConfig[currency].code, maximumFractionDigits: 0 }).format(value);
  
  // Add all other handlers here (handleCurrencyChange, handleLaborMinutesChange, updateLabor, generateAIPitch, etc.)
  // Note: Omitted for brevity in this guide, just paste the handler logic from the monolith here.

  // --- Dynamic Styling ---
  const bgMain = isDarkMode ? "bg-[#0B1120]" : "bg-[#F8FAFC]";
  const textMain = isDarkMode ? "text-slate-200" : "text-slate-800";
  const textHeading = isDarkMode ? "text-white" : "text-slate-900";
  const textSub = isDarkMode ? "text-slate-400" : "text-slate-500";
  const borderMuted = isDarkMode ? "border-slate-800/80" : "border-slate-100";
  const panelBg = isDarkMode ? "bg-[#0F172A]" : "bg-slate-50/30";
  const cardStyle = `${isDarkMode ? 'bg-[#1E293B] border-slate-700/60 shadow-none' : 'bg-white border-slate-200/60 shadow-sm'} rounded-[28px] border relative transition-colors duration-300`;
  const inputStyle = `w-full px-4 py-3.5 ${isDarkMode ? 'bg-[#0F172A]/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:bg-[#0F172A]' : 'bg-slate-50/70 border-slate-200/80 text-slate-800 placeholder-slate-400 hover:bg-slate-50 focus:bg-white'} border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`;
  const inputErrorStyle = `w-full px-4 py-3.5 ${isDarkMode ? 'bg-red-950/30 border-red-900 text-red-400 focus:bg-[#0F172A]' : 'bg-red-50/70 border-red-200 text-red-900 focus:bg-white'} border rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]`;

  const contextValue = {
    // Add all states, functions, styling vars, and `results` here
    toolName, setToolName, results, isDarkMode, setIsDarkMode, /* etc... */
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
