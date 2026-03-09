import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStickyState } from '../hooks/useStickyState';
import { useCalculationEngine } from '../hooks/useCalculationEngine';
import { useCurrencyHandlers } from '../hooks/useCurrencyHandlers';
import { useAIHandlers } from '../hooks/useAIHandlers';
import { useExportHandlers } from '../hooks/useExportHandlers';
import { DEFAULT_LCR, providerOptions, currencyConfig } from '../constants/config';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Factory initializers
const createDefaultLabor = () => [{ id: crypto.randomUUID(), cl: 'CL12', executions: '', volumePeriod: 'monthly', effortMinutes: '', effortHours: '' }];
const createDefaultSre = () => [{ id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: '', effortMinutes: '', effortHours: '', y2Reduction: 50 }];
const defaultRunCostBreakdown = { productLicense: { cost: '', inflation: 5 }, ai: { enabled: false, cost: '', inflation: 5 }, splunk: { enabled: false, cost: '', inflation: 5 }, infra: { enabled: false, cost: '', inflation: 5 }, other: { enabled: false, cost: '', inflation: 5 } };

export function AppProvider({ children }) {
  // --- Core States ---
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

  // --- Network Effects ---
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
      } catch (error) { /* Silently fallback */ }
    };
    fetchLiveRates(); fetchRemoteLcr();
    return () => controller.abort();
  }, []);

  // --- Compose Hooks ---
  const results = useCalculationEngine({ laborBreakdown, automationPercent, durationMonths, implementationCost, monthlyRunCost, runCostInflation, isAdvancedRunCost, runCostBreakdown, lcrRates, hasSre, isAdvancedSre, sreCostY1, sreCostY2, sreBreakdown, workingDays, hoursPerDay, scenario, currency, exchangeRates });
  
  const { formatCurrency, handleCurrencyChange } = useCurrencyHandlers({ currency, setCurrency, exchangeRates, implementationCost, setImplementationCost, monthlyRunCost, setMonthlyRunCost, setRunCostBreakdown, currencyConfig });
  
  const { generateAIPitch, generateSuggestions, generateROIInsights, generateSreUseCase } = useAIHandlers({ aiProvider, aiApiKey, aiModel, providerOptions, toolName, useCase, scenario, durationMonths, results, formatCurrency, automationPercent, challenges, kpis, qualitativeBenefits, setAiPitch, setIsGenerating, setIsGeneratingSuggestions, setKpis, setChallenges, setQualitativeBenefits, setAiGeneratedFields, setIsGeneratingInsights, setRoiInsights, setIsGeneratingSreUseCase, setSreUseCase });
  
  const { isReadyToExport, handleExportXLSX, handleExportPPTX } = useExportHandlers({ toolName, useCase, laborBreakdown, durationMonths, implementationCost, isAdvancedRunCost, monthlyRunCost, results, scenario, automationPercent, challenges, qualitativeBenefits, kpis, formatCurrency, setIsExportingXLSX, setIsExportingPPTX });

  // --- Local Handlers ---
  const handleProviderChange = (e) => { setAiProvider(e.target.value); setAiModel(providerOptions[e.target.value].models[0]); };

  const updateLabor = (id, field, value) => setLaborBreakdown(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  const addLabor = () => setLaborBreakdown(prev => [...prev, { id: crypto.randomUUID(), cl: 'CL12', executions: '', volumePeriod: 'monthly', effortMinutes: '', effortHours: '' }]);
  const removeLabor = (id) => setLaborBreakdown(prev => prev.filter(item => item.id !== id));
  const handleLaborMinutesChange = (id, val) => { if (val === '') { updateLabor(id, 'effortMinutes', ''); updateLabor(id, 'effortHours', ''); } else { updateLabor(id, 'effortMinutes', val); updateLabor(id, 'effortHours', Math.max(0, Number(val)) / 60); } };
  const handleLaborHoursChange = (id, val) => { if (val === '') { updateLabor(id, 'effortHours', ''); updateLabor(id, 'effortMinutes', ''); } else { updateLabor(id, 'effortHours', val); updateLabor(id, 'effortMinutes', Math.max(0, Number(val)) * 60); } };

  const updateSreRole = (id, field, value) => setSreBreakdown(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  const addSreRole = () => setSreBreakdown(prev => [...prev, { id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: '', effortMinutes: '', effortHours: '', y2Reduction: 50 }]);
  const removeSreRole = (id) => setSreBreakdown(prev => prev.filter(item => item.id !== id));
  const handleSreMinutesChange = (id, val) => { if (val === '') { updateSreRole(id, 'effortMinutes', ''); updateSreRole(id, 'effortHours', ''); } else { updateSreRole(id, 'effortMinutes', val); updateSreRole(id, 'effortHours', Math.max(0, Number(val)) / 60); } };
  const handleSreHoursChange = (id, val) => { if (val === '') { updateSreRole(id, 'effortHours', ''); updateSreRole(id, 'effortMinutes', ''); } else { updateSreRole(id, 'effortHours', val); updateSreRole(id, 'effortMinutes', Math.max(0, Number(val)) * 60); } };

  const updateRunCostBreakdown = (category, field, value) => setRunCostBreakdown(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));

  const handleGenerateMockData = () => {
    setCurrency('USD'); setToolName('GenWizard Batch Automation'); setUseCase('Automate manual monitoring of 5000 Control M jobs to resolve delays and missed SLAs.');
    setChallenges('• Scalability for 5000+ jobs\n• Operator fatigue from manual checks\n• Reactive instead of proactive response');
    setQualitativeBenefits('• Improved SLA adherence\n• Team transition to proactive operations\n• Reduced alert flood noise');
    setKpis('• Job Completion Rate\n• SLA Compliance %\n• Mean Time to Resolve (MTTR)');
    setLaborBreakdown([{ id: crypto.randomUUID(), cl: 'CL12', executions: 5000, volumePeriod: 'monthly', effortMinutes: 10, effortHours: 0.1667 }, { id: crypto.randomUUID(), cl: 'CL9', executions: 100, volumePeriod: 'monthly', effortMinutes: 30, effortHours: 0.5 }, { id: crypto.randomUUID(), cl: 'CL7', executions: 20, volumePeriod: 'daily', effortMinutes: 15, effortHours: 0.25 }]);
    setWorkingDays(22); setHoursPerDay(8); setAutomationPercent(90); setDurationMonths(36); setImplementationCost(5000);
    setIsAdvancedRunCost(true);
    setRunCostBreakdown({ productLicense: { cost: 100, inflation: 5 }, ai: { enabled: true, cost: 50, inflation: 3 }, splunk: { enabled: true, cost: 200, inflation: 8 }, infra: { enabled: true, cost: 150, inflation: 5 }, other: { enabled: false, cost: '', inflation: 5 } });
    setHasSre(true); setIsAdvancedSre(true);
    setSreBreakdown([ { id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: 20, effortMinutes: 45, effortHours: 0.75, y2Reduction: 50 }, { id: crypto.randomUUID(), cl: 'CL7', tasksPerMonth: 5, effortMinutes: 60, effortHours: 1.0, y2Reduction: 80 } ]);
    setSreUseCase('• Maintain API integrations.\n• Optimize bot rulesets.');
    setAiPitch(''); setRoiInsights(''); setAiGeneratedFields({ kpis: false, challenges: false, benefits: false });
  };

  const handleClearAll = () => {
    setToolName(''); setUseCase(''); setChallenges(''); setQualitativeBenefits(''); setKpis('');
    setLaborBreakdown(createDefaultLabor()); setAutomationPercent(0); setDurationMonths(''); setImplementationCost('');
    setMonthlyRunCost(''); setRunCostInflation(''); setIsAdvancedRunCost(false); setRunCostBreakdown(defaultRunCostBreakdown);
    setHasSre(false); setIsAdvancedSre(false); setSreCostY1(''); setSreCostY2(''); setSreBreakdown(createDefaultSre()); setSreUseCase('');
    setCurrency('USD'); setScenario('realistic'); setAiPitch(''); setRoiInsights(''); setShowClearConfirm(false);
    setAiGeneratedFields({ kpis: false, challenges: false, benefits: false });
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-999999px"; textArea.style.top = "-999999px";
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (err) { console.error('Fallback: Oops, unable to copy', err); }
    document.body.removeChild(textArea);
  };

  const handleCopy = () => {
    if (!aiPitch) return;
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(aiPitch).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => fallbackCopyTextToClipboard(aiPitch)); } 
    else { fallbackCopyTextToClipboard(aiPitch); }
  };

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
    toolName, setToolName, useCase, setUseCase, challenges, setChallenges, qualitativeBenefits, setQualitativeBenefits, kpis, setKpis,
    aiGeneratedFields, setAiGeneratedFields, laborBreakdown, setLaborBreakdown, lcrRates, setLcrRates, baseLcr,
    automationPercent, setAutomationPercent, durationMonths, setDurationMonths, implementationCost, setImplementationCost,
    monthlyRunCost, setMonthlyRunCost, runCostInflation, setRunCostInflation, isAdvancedRunCost, setIsAdvancedRunCost, runCostBreakdown, setRunCostBreakdown,
    hasSre, setHasSre, isAdvancedSre, setIsAdvancedSre, sreCostY1, setSreCostY1, sreCostY2, setSreCostY2, sreBreakdown, setSreBreakdown, sreUseCase, setSreUseCase, isSreModalOpen, setIsSreModalOpen, isRunCostModalOpen, setIsRunCostModalOpen,
    currency, setCurrency, scenario, setScenario, workingDays, setWorkingDays, hoursPerDay, setHoursPerDay, isDarkMode, setIsDarkMode,
    exchangeRates, ratesStatus, copied, setCopied, aiPitch, setAiPitch, isGenerating, setIsGenerating, isGeneratingSuggestions, setIsGeneratingSuggestions,
    isGeneratingInsights, setIsGeneratingInsights, isGeneratingSreUseCase, setIsGeneratingSreUseCase, roiInsights, setRoiInsights, isHowItWorksOpen, setIsHowItWorksOpen, showScore, setShowScore,
    showClearConfirm, setShowClearConfirm, isSettingsOpen, setIsSettingsOpen, isExportingXLSX, setIsExportingXLSX, isExportingPPTX, setIsExportingPPTX,
    aiProvider, setAiProvider, aiApiKey, setAiApiKey, aiModel, setAiModel, currencyConfig, isReadyToExport, results,
    handleCurrencyChange, handleLaborMinutesChange, handleLaborHoursChange, handleSreMinutesChange, handleSreHoursChange, updateLabor, addLabor, removeLabor, updateSreRole, addSreRole, removeSreRole, updateRunCostBreakdown, handleGenerateMockData, handleClearAll, formatCurrency,
    generateAIPitch, generateSuggestions, generateROIInsights, generateSreUseCase, handleProviderChange, handleExportXLSX, handleExportPPTX, handleCopy,
    bgMain, textMain, textHeading, textSub, borderMuted, panelBg, cardStyle, inputStyle, inputErrorStyle
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
