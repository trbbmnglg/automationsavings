import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useStickyState } from '../hooks/useStickyState';
import { useCalculationEngine } from '../hooks/useCalculationEngine';
import { useCurrencyHandlers } from '../hooks/useCurrencyHandlers';
import { useAIHandlers } from '../hooks/useAIHandlers';
import { useExportHandlers } from '../hooks/useExportHandlers';
import { useTheme } from '../hooks/useTheme';
import { DEFAULT_LCR, providerOptions, currencyConfig, DEFAULT_WORKING_DAYS, DEFAULT_HOURS_PER_DAY } from '../constants/config';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
export const useAppContext = () => useContext(AppContext);

const createDefaultLabor = () => [{ id: crypto.randomUUID(), cl: 'CL12', executions: '', volumePeriod: 'monthly', effortMinutes: '', effortHours: '' }];
const createDefaultSre = () => [{ id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: '', effortMinutes: '', effortHours: '', y2Reduction: 50 }];
const defaultRunCostBreakdown = {
  productLicense: { cost: '', inflation: 5 },
  ai: { enabled: false, cost: '', inflation: 5 },
  splunk: { enabled: false, cost: '', inflation: 5 },
  infra: { enabled: false, cost: '', inflation: 5 },
  other: { enabled: false, cost: '', inflation: 5 }
};

const minutesToHours = (minutes) => minutes / 60;

const safeRate = (value, fallback) =>
  (typeof value === 'number' && isFinite(value) && value > 0) ? value : fallback;

export function AppProvider({ children }) {

  // ─────────────────────────────────────────────────────────────────
  // CONFIG / PREFERENCES — persisted to localStorage (non-sensitive)
  // These are safe to persist: they are user preferences, not project data.
  // ─────────────────────────────────────────────────────────────────
  const [lcrRates, setLcrRates] = useStickyState(DEFAULT_LCR, 'as_lcrRates');
  const [currency, setCurrency] = useStickyState('USD', 'as_currency');
  const [scenario, setScenario] = useStickyState('realistic', 'as_scenario');
  const [workingDays, setWorkingDays] = useStickyState(DEFAULT_WORKING_DAYS, 'as_workingDays');
  const [hoursPerDay, setHoursPerDay] = useStickyState(DEFAULT_HOURS_PER_DAY, 'as_hoursPerDay');
  const [isDarkMode, setIsDarkMode] = useStickyState(false, 'as_theme_dark');
  const [themeColor, setThemeColor] = useStickyState('default', 'as_themeColor');
  const [showScore, setShowScore] = useStickyState(true, 'as_showScore');
  const [aiProvider, setAiProvider] = useStickyState('pollinations', 'as_aiProvider');
  const [aiModel, setAiModel] = useStickyState(providerOptions['pollinations'].models[0], 'as_aiModel');

  // ─────────────────────────────────────────────────────────────────
  // PROJECT DATA — plain useState (session-only, NOT persisted)
  // These may contain sensitive business context. They are cleared on
  // page refresh intentionally — users should start fresh each session.
  // ─────────────────────────────────────────────────────────────────
  const [toolName, setToolName] = useState('');
  const [useCase, setUseCase] = useState('');
  const [challenges, setChallenges] = useState('');
  const [qualitativeBenefits, setQualitativeBenefits] = useState('');
  const [kpis, setKpis] = useState('');
  const [aiGeneratedFields, setAiGeneratedFields] = useState({ kpis: false, challenges: false, benefits: false });
  const [laborBreakdown, setLaborBreakdown] = useState(createDefaultLabor);
  const [automationPercent, setAutomationPercent] = useState(0);
  const [durationMonths, setDurationMonths] = useState('');
  const [implementationCost, setImplementationCost] = useState('');
  const [isAdvancedRunCost, setIsAdvancedRunCost] = useState(false);
  const [monthlyRunCost, setMonthlyRunCost] = useState('');
  const [runCostInflation, setRunCostInflation] = useState('');
  const [runCostBreakdown, setRunCostBreakdown] = useState(defaultRunCostBreakdown);
  const [hasSre, setHasSre] = useState(false);
  const [isAdvancedSre, setIsAdvancedSre] = useState(false);
  const [sreCostY1, setSreCostY1] = useState('');
  const [sreCostY2, setSreCostY2] = useState('');
  const [sreBreakdown, setSreBreakdown] = useState(createDefaultSre);
  const [sreUseCase, setSreUseCase] = useState('');
  const [aiPitch, setAiPitch] = useState('');
  const [roiInsights, setRoiInsights] = useState('');

  // ─────────────────────────────────────────────────────────────────
  // SECURITY: API key — memory-only, NEVER touches localStorage
  // ─────────────────────────────────────────────────────────────────
  const [aiApiKey, setAiApiKey] = useState('');

  // ─────────────────────────────────────────────────────────────────
  // UI STATE — transient, no persistence needed
  // ─────────────────────────────────────────────────────────────────
  const [baseLcr, setBaseLcr] = useState(DEFAULT_LCR);
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, PHP: 56.5, EUR: 0.92, JPY: 150.5 });
  const [ratesStatus, setRatesStatus] = useState('loading');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isGeneratingSreUseCase, setIsGeneratingSreUseCase] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSreModalOpen, setIsSreModalOpen] = useState(false);
  const [isRunCostModalOpen, setIsRunCostModalOpen] = useState(false);
  const [isMonthlyBreakdownOpen, setIsMonthlyBreakdownOpen] = useState(false);
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);

  // ─────────────────────────────────────────────────────────────────
  // NETWORK
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    const fetchLiveRates = async () => {
      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD', { signal: controller.signal });
        const data = await response.json();
        if (data && data.rates) {
          setExchangeRates({
            USD: 1,
            PHP: safeRate(data.rates.PHP, 56.5),
            EUR: safeRate(data.rates.EUR, 0.92),
            JPY: safeRate(data.rates.JPY, 150.5)
          });
          setRatesStatus('live');
        } else {
          setRatesStatus('fallback');
        }
      } catch (error) {
        if (error.name !== 'AbortError') setRatesStatus('fallback');
      }
    };

    const fetchRemoteLcr = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/trbbmnglg/automationsavings/main/src/lcr.json',
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            setBaseLcr(data);
            setLcrRates(prev => (JSON.stringify(prev) === JSON.stringify(DEFAULT_LCR)) ? data : prev);
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Remote LCR fetch failed, using DEFAULT_LCR fallback:', error.message);
        }
      }
    };

    fetchLiveRates();
    fetchRemoteLcr();
    return () => controller.abort();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // COMPOSED HOOKS
  // ─────────────────────────────────────────────────────────────────
  const results = useCalculationEngine({
    laborBreakdown, automationPercent, durationMonths, implementationCost,
    monthlyRunCost, runCostInflation, isAdvancedRunCost, runCostBreakdown,
    lcrRates, hasSre, isAdvancedSre, sreCostY1, sreCostY2, sreBreakdown,
    workingDays, hoursPerDay, scenario, currency, exchangeRates
  });

  const { formatCurrency, handleCurrencyChange } = useCurrencyHandlers({
    currency, setCurrency, exchangeRates,
    implementationCost, setImplementationCost,
    monthlyRunCost, setMonthlyRunCost,
    setRunCostBreakdown, currencyConfig,
    sreCostY1, setSreCostY1,
    sreCostY2, setSreCostY2
  });

  const { generateAIPitch, generateSuggestions, generateROIInsights, generateSreUseCase } = useAIHandlers({
    aiProvider, aiApiKey, aiModel, providerOptions,
    toolName, useCase, scenario, durationMonths, results, formatCurrency, automationPercent,
    challenges, kpis, qualitativeBenefits,
    setAiPitch, setIsGenerating,
    setIsGeneratingSuggestions, setKpis, setChallenges, setQualitativeBenefits, setAiGeneratedFields,
    setIsGeneratingInsights, setRoiInsights,
    setIsGeneratingSreUseCase, setSreUseCase
  });

  const { isReadyToExport, handleExportXLSX, handleExportPPTX } = useExportHandlers({
    toolName, useCase, laborBreakdown, durationMonths, implementationCost,
    isAdvancedRunCost, monthlyRunCost, results, scenario, automationPercent,
    challenges, qualitativeBenefits, kpis, formatCurrency,
    setIsExportingXLSX, setIsExportingPPTX
  });

  const themeStyles = useTheme(isDarkMode, themeColor);

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────
  const handleProviderChange = useCallback((e) => {
    const newProvider = e.target.value;
    setAiProvider(newProvider);
    setAiModel(providerOptions[newProvider].models[0]);
  }, [providerOptions, setAiProvider, setAiModel]);

  const updateLabor = (id, field, value) =>
    setLaborBreakdown(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  const addLabor = () =>
    setLaborBreakdown(prev => [...prev, { id: crypto.randomUUID(), cl: 'CL12', executions: '', volumePeriod: 'monthly', effortMinutes: '', effortHours: '' }]);
  const removeLabor = (id) =>
    setLaborBreakdown(prev => prev.filter(item => item.id !== id));

  const handleLaborMinutesChange = (id, val) => {
    setLaborBreakdown(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (val === '') return { ...item, effortMinutes: '', effortHours: '' };
      return { ...item, effortMinutes: val, effortHours: minutesToHours(Math.max(0, Number(val))) };
    }));
  };

  const handleLaborHoursChange = (id, val) => {
    setLaborBreakdown(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (val === '') return { ...item, effortHours: '', effortMinutes: '' };
      return { ...item, effortHours: val, effortMinutes: Math.max(0, Number(val)) * 60 };
    }));
  };

  const updateSreRole = (id, field, value) =>
    setSreBreakdown(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  const addSreRole = () =>
    setSreBreakdown(prev => [...prev, { id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: '', effortMinutes: '', effortHours: '', y2Reduction: 50 }]);
  const removeSreRole = (id) =>
    setSreBreakdown(prev => prev.filter(item => item.id !== id));

  const handleSreMinutesChange = (id, val) => {
    setSreBreakdown(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (val === '') return { ...item, effortMinutes: '', effortHours: '' };
      return { ...item, effortMinutes: val, effortHours: minutesToHours(Math.max(0, Number(val))) };
    }));
  };

  const handleSreHoursChange = (id, val) => {
    setSreBreakdown(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (val === '') return { ...item, effortHours: '', effortMinutes: '' };
      return { ...item, effortHours: val, effortMinutes: Math.max(0, Number(val)) * 60 };
    }));
  };

  const updateRunCostBreakdown = (category, field, value) =>
    setRunCostBreakdown(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));

  const handleGenerateMockData = useCallback(() => {
    setCurrency('USD');
    setToolName('GenWizard Batch Automation');
    setUseCase('Automate manual monitoring of 5000 Control M jobs to resolve delays and missed SLAs.');
    setChallenges('• Scalability for 5000+ jobs\n• Operator fatigue from manual checks\n• Reactive instead of proactive response');
    setQualitativeBenefits('• Improved SLA adherence\n• Team transition to proactive operations\n• Reduced alert flood noise');
    setKpis('• Job Completion Rate\n• SLA Compliance %\n• Mean Time to Resolve (MTTR)');
    setLaborBreakdown([
      { id: crypto.randomUUID(), cl: 'CL12', executions: 5000, volumePeriod: 'monthly', effortMinutes: 10, effortHours: minutesToHours(10) },
      { id: crypto.randomUUID(), cl: 'CL9', executions: 100, volumePeriod: 'monthly', effortMinutes: 30, effortHours: minutesToHours(30) },
      { id: crypto.randomUUID(), cl: 'CL7', executions: 20, volumePeriod: 'daily', effortMinutes: 15, effortHours: minutesToHours(15) }
    ]);
    setWorkingDays(22);
    setHoursPerDay(8);
    setAutomationPercent(90);
    setDurationMonths(36);
    setImplementationCost(5000);
    setIsAdvancedRunCost(true);
    setRunCostBreakdown({
      productLicense: { cost: 100, inflation: 5 },
      ai: { enabled: true, cost: 50, inflation: 3 },
      splunk: { enabled: true, cost: 200, inflation: 8 },
      infra: { enabled: true, cost: 150, inflation: 5 },
      other: { enabled: false, cost: '', inflation: 5 }
    });
    setHasSre(true);
    setIsAdvancedSre(true);
    setSreBreakdown([
      { id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: 20, effortMinutes: 45, effortHours: minutesToHours(45), y2Reduction: 50 },
      { id: crypto.randomUUID(), cl: 'CL7', tasksPerMonth: 5, effortMinutes: 60, effortHours: minutesToHours(60), y2Reduction: 80 }
    ]);
    setSreUseCase('• Maintain API integrations.\n• Optimize bot rulesets.');
    setAiPitch('');
    setRoiInsights('');
    setAiGeneratedFields({ kpis: false, challenges: false, benefits: false });
  }, [
    setCurrency, setWorkingDays, setHoursPerDay
  ]);

  const handleClearAll = useCallback(() => {
    setToolName(''); setUseCase(''); setChallenges(''); setQualitativeBenefits(''); setKpis('');
    setLaborBreakdown(createDefaultLabor());
    setAutomationPercent(0); setDurationMonths(''); setImplementationCost('');
    setMonthlyRunCost(''); setRunCostInflation('');
    setIsAdvancedRunCost(false); setRunCostBreakdown(defaultRunCostBreakdown);
    setHasSre(false); setIsAdvancedSre(false);
    setSreCostY1(''); setSreCostY2('');
    setSreBreakdown(createDefaultSre()); setSreUseCase('');
    setCurrency('USD'); setScenario('realistic');
    setAiPitch(''); setRoiInsights('');
    setShowClearConfirm(false);
    setAiGeneratedFields({ kpis: false, challenges: false, benefits: false });
  }, [setCurrency, setScenario, setShowClearConfirm]);

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback clipboard copy failed:', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopy = () => {
    if (!aiPitch) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(aiPitch)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
        .catch(() => fallbackCopyTextToClipboard(aiPitch));
    } else {
      fallbackCopyTextToClipboard(aiPitch);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────────────────────────
  const contextValue = {
    // Project data (session-only)
    toolName, setToolName, useCase, setUseCase, challenges, setChallenges,
    qualitativeBenefits, setQualitativeBenefits, kpis, setKpis,
    aiGeneratedFields, setAiGeneratedFields,
    laborBreakdown, setLaborBreakdown,
    automationPercent, setAutomationPercent, durationMonths, setDurationMonths,
    implementationCost, setImplementationCost,
    monthlyRunCost, setMonthlyRunCost, runCostInflation, setRunCostInflation,
    isAdvancedRunCost, setIsAdvancedRunCost, runCostBreakdown, setRunCostBreakdown,
    hasSre, setHasSre, isAdvancedSre, setIsAdvancedSre,
    sreCostY1, setSreCostY1, sreCostY2, setSreCostY2,
    sreBreakdown, setSreBreakdown, sreUseCase, setSreUseCase,
    aiPitch, setAiPitch, roiInsights, setRoiInsights,

    // Config (persisted)
    lcrRates, setLcrRates, baseLcr,
    currency, setCurrency, scenario, setScenario,
    workingDays, setWorkingDays, hoursPerDay, setHoursPerDay,
    isDarkMode, setIsDarkMode, themeColor, setThemeColor,
    showScore, setShowScore,
    aiProvider, setAiProvider, aiModel, setAiModel,

    // Security
    aiApiKey, setAiApiKey,

    // UI state
    exchangeRates, ratesStatus,
    copied, setCopied,
    isGenerating, setIsGenerating,
    isGeneratingSuggestions, setIsGeneratingSuggestions,
    isGeneratingInsights, setIsGeneratingInsights,
    isGeneratingSreUseCase, setIsGeneratingSreUseCase,
    isHowItWorksOpen, setIsHowItWorksOpen,
    showClearConfirm, setShowClearConfirm,
    isSettingsOpen, setIsSettingsOpen,
    isSreModalOpen, setIsSreModalOpen,
    isRunCostModalOpen, setIsRunCostModalOpen,
    isMonthlyBreakdownOpen, setIsMonthlyBreakdownOpen,
    isExportingXLSX, setIsExportingXLSX,
    isExportingPPTX, setIsExportingPPTX,

    // Computed / handlers
    currencyConfig, isReadyToExport, results,
    handleCurrencyChange, handleLaborMinutesChange, handleLaborHoursChange,
    handleSreMinutesChange, handleSreHoursChange,
    updateLabor, addLabor, removeLabor,
    updateSreRole, addSreRole, removeSreRole,
    updateRunCostBreakdown,
    handleGenerateMockData, handleClearAll, formatCurrency,
    generateAIPitch, generateSuggestions, generateROIInsights, generateSreUseCase,
    handleProviderChange, handleExportXLSX, handleExportPPTX, handleCopy,
    ...themeStyles
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
