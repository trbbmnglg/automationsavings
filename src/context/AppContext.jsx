import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useStickyState } from '../hooks/useStickyState';
import { useSessionState } from '../hooks/useSessionState';
import { useCalculationEngine } from '../hooks/useCalculationEngine';
import { useCurrencyHandlers } from '../hooks/useCurrencyHandlers';
import { useAIHandlers } from '../hooks/useAIHandlers';
import { useExportHandlers } from '../hooks/useExportHandlers';
import { useUI } from './UIContext';
import { useToast } from '../components/Toast';
import { DEFAULT_LCR, providerOptions, currencyConfig, DEFAULT_WORKING_DAYS, DEFAULT_HOURS_PER_DAY } from '../constants/config';
import { isValidLcrData } from '../utils/helpers';

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
  const [baseLcr, setBaseLcr] = useState(DEFAULT_LCR);
  const [hasUserModifiedLcr, setHasUserModifiedLcr] = useState(false);

  // ─── Persistent preferences (localStorage via useStickyState) ───────────────
  // UI preferences and configuration — not project data.
  // These legitimately survive page refresh as disclosed in the privacy panel.
  const [lcrRates, setLcrRates] = useStickyState(DEFAULT_LCR, 'as_lcrRates');
  const [currency, setCurrency] = useStickyState('USD', 'as_currency');
  const [workingDays, setWorkingDays] = useStickyState(DEFAULT_WORKING_DAYS, 'as_workingDays');
  const [hoursPerDay, setHoursPerDay] = useStickyState(DEFAULT_HOURS_PER_DAY, 'as_hoursPerDay');
  const [aiProvider, setAiProvider] = useStickyState('pollinations', 'as_aiProvider');
  const [aiModel, setAiModel] = useStickyState(providerOptions['pollinations'].models[0], 'as_aiModel');
  // FIX: scenario restored to useStickyState (localStorage).
  // It was incorrectly moved to useSessionState in the previous fix pass.
  // Scenario is a UI preference (Optimistic / Realistic / Conservative) — the
  // user's chosen stress-test mode for their analysis — not sensitive project
  // data. Resetting it on every page refresh silently reverts the Results panel
  // to "Realistic", breaking the user's deliberately chosen analysis setting.
  // It contains no PII and is correctly listed as a preference in the privacy
  // disclosure alongside theme and currency.
  const [scenario, setScenario] = useStickyState('realistic', 'as_scenario');

  // ─── Session-only project data (sessionStorage via useSessionState) ──────────
  // These fields match the privacy disclosure: "session-only, cleared on page
  // refresh, never persisted". sessionStorage is cleared automatically by the
  // browser on tab/window close.
  const [toolName, setToolName] = useSessionState('', 'as_toolName');
  const [useCase, setUseCase] = useSessionState('', 'as_useCase');
  const [challenges, setChallenges] = useSessionState('', 'as_challenges');
  const [qualitativeBenefits, setQualitativeBenefits] = useSessionState('', 'as_qualitativeBenefits');
  const [kpis, setKpis] = useSessionState('', 'as_kpis');
  const [aiGeneratedFields, setAiGeneratedFields] = useSessionState({ kpis: false, challenges: false, benefits: false }, 'as_aiGeneratedFields');
  const [laborBreakdown, setLaborBreakdown] = useSessionState(createDefaultLabor, 'as_laborBreakdown');
  const [automationPercent, setAutomationPercent] = useSessionState(0, 'as_automationPercent');
  const [durationMonths, setDurationMonths] = useSessionState('', 'as_durationMonths');
  const [implementationCost, setImplementationCost] = useSessionState('', 'as_implementationCost');
  const [isAdvancedRunCost, setIsAdvancedRunCost] = useSessionState(false, 'as_isAdvancedRunCost');
  const [monthlyRunCost, setMonthlyRunCost] = useSessionState('', 'as_monthlyRunCost');
  const [runCostInflation, setRunCostInflation] = useSessionState('', 'as_runCostInflation');
  const [runCostBreakdown, setRunCostBreakdown] = useSessionState(defaultRunCostBreakdown, 'as_runCostBreakdown');
  const [hasSre, setHasSre] = useSessionState(false, 'as_hasSre');
  const [isAdvancedSre, setIsAdvancedSre] = useSessionState(false, 'as_isAdvancedSre');
  const [sreCostY1, setSreCostY1] = useSessionState('', 'as_sreCostY1');
  const [sreCostY2, setSreCostY2] = useSessionState('', 'as_sreCostY2');
  const [sreBreakdown, setSreBreakdown] = useSessionState(createDefaultSre, 'as_sreBreakdown');
  const [sreUseCase, setSreUseCase] = useSessionState('', 'as_sreUseCase');
  const [aiPitch, setAiPitch] = useSessionState('', 'as_aiPitch');
  const [roiInsights, setRoiInsights] = useSessionState('', 'as_roiInsights');

  // ─── Pure React state (never persisted) ─────────────────────────────────────
  // API key intentionally never touches any storage layer.
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, PHP: 56.5, EUR: 0.92, JPY: 150.5 });
  const [ratesStatus, setRatesStatus] = useState('loading');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isGeneratingSreUseCase, setIsGeneratingSreUseCase] = useState(false);
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [aiApiKey, setAiApiKey] = useState('');
  const [securityError, setSecurityError] = useState(null);

  // ─── Side effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Separate AbortControllers so aborting one does not cancel the other.
    const ratesController = new AbortController();
    const lcrController = new AbortController();

    const fetchLiveRates = async () => {
      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD', { signal: ratesController.signal });
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
          { signal: lcrController.signal }
        );
        if (response.ok) {
          const data = await response.json();
          if (isValidLcrData(data)) {
            setBaseLcr(data);
            setHasUserModifiedLcr(current => {
              if (!current) setLcrRates(data);
              return current;
            });
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

    return () => {
      ratesController.abort();
      lcrController.abort();
    };
  }, []);

  // ─── Toast notifications ───────────────────────────────────────────────────
  const addToast = useToast();

  // ─── UI state from UIContext (theme, modals, score toggle) ─────────────────
  const ui = useUI();
  const {
    isDarkMode, setIsDarkMode, themeColor, setThemeColor,
    showScore, setShowScore,
    isHowItWorksOpen, setIsHowItWorksOpen,
    showClearConfirm, setShowClearConfirm,
    isSettingsOpen, setIsSettingsOpen,
    isSreModalOpen, setIsSreModalOpen,
    isRunCostModalOpen, setIsRunCostModalOpen,
    isMonthlyBreakdownOpen, setIsMonthlyBreakdownOpen,
    ...themeStyles
  } = ui;

  // ─── Derived state / engines ─────────────────────────────────────────────────
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
    setIsGeneratingSreUseCase, setSreUseCase,
    setSecurityError, addToast
  });

  const { isReadyToExport, handleExportXLSX, handleExportPPTX } = useExportHandlers({
    toolName, useCase, laborBreakdown, durationMonths, implementationCost,
    isAdvancedRunCost, monthlyRunCost, results, scenario, automationPercent,
    challenges, qualitativeBenefits, kpis, formatCurrency,
    setIsExportingXLSX, setIsExportingPPTX, addToast
  });

  const handleProviderChange = useCallback((e) => {
    const newProvider = e.target.value;
    if (!providerOptions[newProvider]) return;
    setAiProvider(newProvider);
    setAiModel(providerOptions[newProvider].models[0]);
  }, [setAiProvider, setAiModel]);

  // ─── Labor helpers ───────────────────────────────────────────────────────────
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

  // ─── SRE helpers ─────────────────────────────────────────────────────────────
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

  // ─── Mock data / clear ───────────────────────────────────────────────────────
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
    setSecurityError(null);
    setAiGeneratedFields({ kpis: false, challenges: false, benefits: false });
  }, [
    setCurrency, setToolName, setUseCase, setChallenges, setQualitativeBenefits,
    setKpis, setLaborBreakdown, setWorkingDays, setHoursPerDay, setAutomationPercent,
    setDurationMonths, setImplementationCost, setIsAdvancedRunCost, setRunCostBreakdown,
    setHasSre, setIsAdvancedSre, setSreBreakdown, setSreUseCase,
    setAiPitch, setRoiInsights, setAiGeneratedFields,
    setSecurityError,
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
    setSecurityError(null);
    setShowClearConfirm(false);
    setAiGeneratedFields({ kpis: false, challenges: false, benefits: false });
  }, [
    setToolName, setUseCase, setChallenges, setQualitativeBenefits, setKpis,
    setLaborBreakdown, setAutomationPercent, setDurationMonths, setImplementationCost,
    setMonthlyRunCost, setRunCostInflation, setIsAdvancedRunCost, setRunCostBreakdown,
    setHasSre, setIsAdvancedSre, setSreCostY1, setSreCostY2, setSreBreakdown,
    setSreUseCase, setCurrency, setScenario, setAiPitch, setRoiInsights,
    setShowClearConfirm, setAiGeneratedFields,
    setSecurityError,
  ]);

  // ─── Clipboard ───────────────────────────────────────────────────────────────
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

  // ─── Context value ───────────────────────────────────────────────────────────
  const contextValue = {
    toolName, setToolName, useCase, setUseCase, challenges, setChallenges,
    qualitativeBenefits, setQualitativeBenefits, kpis, setKpis,
    aiGeneratedFields, setAiGeneratedFields,
    laborBreakdown, setLaborBreakdown, lcrRates, setLcrRates, baseLcr,
    automationPercent, setAutomationPercent, durationMonths, setDurationMonths,
    implementationCost, setImplementationCost,
    monthlyRunCost, setMonthlyRunCost, runCostInflation, setRunCostInflation,
    isAdvancedRunCost, setIsAdvancedRunCost, runCostBreakdown, setRunCostBreakdown,
    hasSre, setHasSre, isAdvancedSre, setIsAdvancedSre,
    sreCostY1, setSreCostY1, sreCostY2, setSreCostY2,
    sreBreakdown, setSreBreakdown, sreUseCase, setSreUseCase,
    isSreModalOpen, setIsSreModalOpen, isRunCostModalOpen, setIsRunCostModalOpen,
    isMonthlyBreakdownOpen, setIsMonthlyBreakdownOpen,
    currency, setCurrency, scenario, setScenario,
    workingDays, setWorkingDays, hoursPerDay, setHoursPerDay,
    isDarkMode, setIsDarkMode,
    themeColor, setThemeColor,
    exchangeRates, ratesStatus,
    copied, setCopied,
    aiPitch, setAiPitch,
    isGenerating, setIsGenerating,
    isGeneratingSuggestions, setIsGeneratingSuggestions,
    isGeneratingInsights, setIsGeneratingInsights,
    isGeneratingSreUseCase, setIsGeneratingSreUseCase,
    roiInsights, setRoiInsights,
    isHowItWorksOpen, setIsHowItWorksOpen,
    showScore, setShowScore,
    showClearConfirm, setShowClearConfirm,
    isSettingsOpen, setIsSettingsOpen,
    isExportingXLSX, setIsExportingXLSX,
    isExportingPPTX, setIsExportingPPTX,
    aiProvider, setAiProvider,
    aiApiKey, setAiApiKey,
    aiModel, setAiModel,
    securityError, setSecurityError,
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
