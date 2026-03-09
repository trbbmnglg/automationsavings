import React, { useState, useMemo, useEffect, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator, DollarSign, Clock, TrendingUp, Briefcase, Target, FileText, Cpu, Activity,
  Award, Users, Copy, Check, BarChart3, HelpCircle, Info, Sparkles, Loader2, ChevronDown, 
  Settings, X, ExternalLink, ArrowRightLeft, Coins, Wrench, Download, Presentation, Eye, 
  EyeOff, Trash2, Moon, Sun, FlaskConical, AlertTriangle, Plus, ShieldCheck, Server
} from 'lucide-react';

// --- Global Constants & Configurations ---
const providerOptions = {
  'pollinations': { name: 'Pollinations.ai', models: ['openai', 'mistral', 'llama'], url: null, needsKey: false },
  'groq': { name: 'Groq', models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'], url: 'https://console.groq.com/keys', needsKey: true },
  'openrouter': { name: 'OpenRouter Free', models: ['meta-llama/llama-3-8b-instruct:free', 'google/gemini-2.5-flash:free'], url: 'https://openrouter.ai/keys', needsKey: true }
};

// Default Backend LCR Table (USD Base)
const DEFAULT_LCR = {
  'CL12': 15,
  'CL11': 25,
  'CL10': 40,
  'CL9': 60,
  'CL8': 85,
  'CL7': 110,
  'CL6': 150
};

// Factory functions to prevent UUID generation on every render
const createDefaultLabor = () => [{ id: crypto.randomUUID(), cl: 'CL12', executions: '', volumePeriod: 'monthly', effortMinutes: '', effortHours: '' }];
const createDefaultSre = () => [{ id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: '', effortMinutes: '', effortHours: '', y2Reduction: 50 }];

const loadingPromises = {};
const loadScript = (src, globalName) => {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  if (loadingPromises[globalName]) return loadingPromises[globalName];
  
  loadingPromises[globalName] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(window[globalName]);
    script.onerror = () => {
      delete loadingPromises[globalName]; // Prevent memory leak / permanent cache poisoning on failure
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(script);
  });
  return loadingPromises[globalName];
};

// --- Custom Hooks ---
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) {
        return JSON.parse(stickyValue);
      }
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
    }
    // Support lazy initializer functions
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Error setting localStorage key "${key}":`, err);
    }
  }, [key, value]);

  return [value, setValue];
}

// --- App Context (Eliminates Prop Drilling in Monolith) ---
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// --- Portal Tooltip Component (Escapes Modal z-index constraints) ---
const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ left: rect.left + rect.width / 2, top: rect.top - 8 });
    }
  };

  const showTooltip = () => { updateCoords(); setIsVisible(true); };
  const hideTooltip = () => setIsVisible(false);

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
      return () => {
        window.removeEventListener('scroll', updateCoords, true);
        window.removeEventListener('resize', updateCoords);
      };
    }
  }, [isVisible]);

  return (
    <div ref={triggerRef} className="relative inline-flex items-center ml-1.5 cursor-help" onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
      {children}
      {isVisible && createPortal(
        <div className="fixed z-[99999] p-2.5 bg-slate-800 text-white text-[12px] font-medium rounded-xl text-center shadow-xl leading-relaxed pointer-events-none w-max max-w-[240px] -translate-x-1/2 -translate-y-full" style={{ left: coords.left, top: coords.top }}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ==========================================
// MAIN APPLICATION ROOT
// ==========================================
export default function App() {
  // LCR Backend Configuration
  const [baseLcr, setBaseLcr] = useState(DEFAULT_LCR);
  const [lcrRates, setLcrRates] = useStickyState(DEFAULT_LCR, 'as_lcrRates');

  const [toolName, setToolName] = useStickyState('', 'as_toolName');
  const [useCase, setUseCase] = useStickyState('', 'as_useCase');
  const [challenges, setChallenges] = useStickyState('', 'as_challenges');
  const [qualitativeBenefits, setQualitativeBenefits] = useStickyState('', 'as_qualitativeBenefits');
  const [kpis, setKpis] = useStickyState('', 'as_kpis');
  
  // AI Identifier State
  const [aiGeneratedFields, setAiGeneratedFields] = useStickyState({ kpis: false, challenges: false, benefits: false }, 'as_aiGeneratedFields');

  // LCR Labor Breakdown Engine
  const [laborBreakdown, setLaborBreakdown] = useStickyState(createDefaultLabor, 'as_laborBreakdown');

  const [automationPercent, setAutomationPercent] = useStickyState(0, 'as_automationPercent');
  const [durationMonths, setDurationMonths] = useStickyState('', 'as_durationMonths');
  const [implementationCost, setImplementationCost] = useStickyState('', 'as_implementationCost');
  
  // Advanced Monthly Run Cost Engine
  const [isAdvancedRunCost, setIsAdvancedRunCost] = useStickyState(false, 'as_isAdvancedRunCost');
  const [monthlyRunCost, setMonthlyRunCost] = useStickyState('', 'as_monthlyRunCost'); 
  const [runCostInflation, setRunCostInflation] = useStickyState('', 'as_runCostInflation'); 
  const defaultRunCostBreakdown = {
    productLicense: { cost: '', inflation: 5 },
    ai: { enabled: false, cost: '', inflation: 5 },
    splunk: { enabled: false, cost: '', inflation: 5 },
    infra: { enabled: false, cost: '', inflation: 5 },
    other: { enabled: false, cost: '', inflation: 5 }
  };
  const [runCostBreakdown, setRunCostBreakdown] = useStickyState(defaultRunCostBreakdown, 'as_runCostBreakdown');
  
  // Advanced SRE Engine
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
  const [roiInsights, setRoiInsights] = useStickyState('', 'as_roiInsights');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [showScore, setShowScore] = useStickyState(true, 'as_showScore');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSreModalOpen, setIsSreModalOpen] = useState(false);
  const [isRunCostModalOpen, setIsRunCostModalOpen] = useState(false);
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [isGeneratingSreUseCase, setIsGeneratingSreUseCase] = useState(false);

  const [aiProvider, setAiProvider] = useStickyState('pollinations', 'as_aiProvider');
  const [aiApiKey, setAiApiKey] = useState(''); 
  const [aiModel, setAiModel] = useStickyState(providerOptions['pollinations'].models[0], 'as_aiModel');

  const currencyConfig = { USD: { locale: 'en-US', code: 'USD' }, PHP: { locale: 'en-PH', code: 'PHP' }, EUR: { locale: 'de-DE', code: 'EUR' }, JPY: { locale: 'ja-JP', code: 'JPY' } };

  // --- Network Logic ---
  useEffect(() => {
    const controller = new AbortController();
    const fetchLiveRates = async () => {
      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD', { signal: controller.signal });
        const data = await response.json();
        if (data && data.rates) {
          setExchangeRates({ USD: 1, PHP: data.rates.PHP || 56.5, EUR: data.rates.EUR || 0.92, JPY: data.rates.JPY || 150.5 });
          setRatesStatus('live');
        } else { setRatesStatus('fallback'); }
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.warn('Failed to fetch live exchange rates. Using fallback rates.', error);
        setRatesStatus('fallback');
      }
    };

    const fetchRemoteLcr = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/trbbmnglg/automationsavings/main/src/lcr.json', { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            setBaseLcr(data);
            
            // Only overwrite lcrRates if the user hasn't explicitly customized them away from defaults
            setLcrRates((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(DEFAULT_LCR)) {
                 return data;
              }
              return prev;
            });
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.warn('Failed to fetch remote LCR JSON. Using fallback defaults.', error);
      }
    };

    fetchLiveRates();
    fetchRemoteLcr();
    return () => controller.abort();
  }, []);

  const fetchWithRetry = async (url, options) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < delays.length; i++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout per request
      
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
           const text = await response.text();
           const err = new Error(`HTTP ${response.status}: ${text}`);
           err.status = response.status;
           throw err;
        }
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Smart Retry: Only backoff for 429 Rate Limits, 5xx Server Errors, and Aborts/Timeouts
        if (error.name === 'AbortError') {
           if (i === delays.length - 1) throw new Error("Request timed out after multiple retries.");
        } else if (i === delays.length - 1 || (error.status >= 400 && error.status < 500 && error.status !== 429)) {
           throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  const sanitizeStr = (str, limit = 400) => (str || '').substring(0, limit).replace(/[{}]/g, '').replace(/[\r\n]+/g, ' ');

  const callAI = async (prompt) => {
    if (providerOptions[aiProvider].needsKey && !aiApiKey.trim()) throw new Error(`Please provide an API key in AI Settings.`);
    if (aiProvider === 'pollinations') {
      const res = await fetch(`https://text.pollinations.ai/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: aiModel }) });
      if (!res.ok) throw new Error("API error");
      return await res.text();
    } else {
      let url = aiProvider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
      const res = await fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiApiKey}` }, body: JSON.stringify({ model: aiModel, messages: [{ role: 'user', content: prompt }] }) });
      const data = await res.json();
      return data?.choices?.[0]?.message?.content;
    }
  };

  // --- Business Logic Handlers ---
  const handleProviderChange = (e) => {
    const newProv = e.target.value;
    setAiProvider(newProv);
    setAiModel(providerOptions[newProv].models[0]);
  };

  const handleCurrencyChange = (newCurrency) => {
    if (newCurrency === currency) return;
    const multiplier = exchangeRates[newCurrency] / exchangeRates[currency];
    if (!isFinite(multiplier) || multiplier === 0) {
       console.warn("Invalid currency multiplier configuration. Aborting conversion.");
       return;
    }
    
    const newIc = implementationCost === '' ? '' : Number((implementationCost * multiplier).toFixed(0));
    const newMc = monthlyRunCost === '' ? '' : Number((monthlyRunCost * multiplier).toFixed(2));
    
    setRunCostBreakdown(prev => {
       const updated = { ...prev };
       Object.keys(updated).forEach(key => {
         if (updated[key].cost !== '') {
            updated[key].cost = Number((updated[key].cost * multiplier).toFixed(2));
         }
       });
       return updated;
    });

    setImplementationCost(newIc); setMonthlyRunCost(newMc); setCurrency(newCurrency);
  };

  const updateLabor = (id, field, value) => setLaborBreakdown(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  const addLabor = () => setLaborBreakdown(prev => [...prev, { id: crypto.randomUUID(), cl: 'CL12', executions: '', volumePeriod: 'monthly', effortMinutes: '', effortHours: '' }]);
  const removeLabor = (id) => setLaborBreakdown(prev => prev.filter(item => item.id !== id));

  const handleLaborMinutesChange = (id, val) => {
    if (val === '') { updateLabor(id, 'effortMinutes', ''); updateLabor(id, 'effortHours', ''); } 
    else { updateLabor(id, 'effortMinutes', val); updateLabor(id, 'effortHours', Math.max(0, Number(val)) / 60); }
  };
  const handleLaborHoursChange = (id, val) => {
    if (val === '') { updateLabor(id, 'effortHours', ''); updateLabor(id, 'effortMinutes', ''); } 
    else { updateLabor(id, 'effortHours', val); updateLabor(id, 'effortMinutes', Math.max(0, Number(val)) * 60); }
  };

  const updateSreRole = (id, field, value) => setSreBreakdown(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  const addSreRole = () => setSreBreakdown(prev => [...prev, { id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: '', effortMinutes: '', effortHours: '', y2Reduction: 50 }]);
  const removeSreRole = (id) => setSreBreakdown(prev => prev.filter(item => item.id !== id));

  const handleSreMinutesChange = (id, val) => {
    if (val === '') { updateSreRole(id, 'effortMinutes', ''); updateSreRole(id, 'effortHours', ''); } 
    else { updateSreRole(id, 'effortMinutes', val); updateSreRole(id, 'effortHours', Math.max(0, Number(val)) / 60); }
  };
  const handleSreHoursChange = (id, val) => {
    if (val === '') { updateSreRole(id, 'effortHours', ''); updateSreRole(id, 'effortMinutes', ''); } 
    else { updateSreRole(id, 'effortHours', val); updateSreRole(id, 'effortMinutes', Math.max(0, Number(val)) * 60); }
  };

  const updateRunCostBreakdown = (category, field, value) => {
    setRunCostBreakdown(prev => ({
      ...prev, [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleGenerateMockData = () => {
    setCurrency('USD');
    setToolName('GenWizard Batch Automation');
    setUseCase('Automate manual monitoring of 5000 Control M jobs to resolve delays and missed SLAs.');
    setChallenges('• Scalability for 5000+ jobs\n• Operator fatigue from manual checks\n• Reactive instead of proactive response');
    setQualitativeBenefits('• Improved SLA adherence\n• Team transition to proactive operations\n• Reduced alert flood noise');
    setKpis('• Job Completion Rate\n• SLA Compliance %\n• Mean Time to Resolve (MTTR)');
    
    setLaborBreakdown([
      { id: crypto.randomUUID(), cl: 'CL12', executions: 5000, volumePeriod: 'monthly', effortMinutes: 10, effortHours: 0.1667 },
      { id: crypto.randomUUID(), cl: 'CL9', executions: 100, volumePeriod: 'monthly', effortMinutes: 30, effortHours: 0.5 },    
      { id: crypto.randomUUID(), cl: 'CL7', executions: 20, volumePeriod: 'daily', effortMinutes: 15, effortHours: 0.25 }       
    ]);
    
    setWorkingDays(22); setHoursPerDay(8); setAutomationPercent(90); setDurationMonths(36); setImplementationCost(5000);
    
    // Advanced Run Cost Mock
    setIsAdvancedRunCost(true);
    setRunCostBreakdown({
      productLicense: { cost: 100, inflation: 5 },
      ai: { enabled: true, cost: 50, inflation: 3 },
      splunk: { enabled: true, cost: 200, inflation: 8 },
      infra: { enabled: true, cost: 150, inflation: 5 },
      other: { enabled: false, cost: '', inflation: 5 }
    });

    // Advanced SRE Mock
    setHasSre(true); setIsAdvancedSre(true);
    setSreBreakdown([
      { id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: 20, effortMinutes: 45, effortHours: 0.75, y2Reduction: 50 },
      { id: crypto.randomUUID(), cl: 'CL7', tasksPerMonth: 5, effortMinutes: 60, effortHours: 1.0, y2Reduction: 80 }
    ]);
    setSreUseCase('Ongoing API endpoint maintenance, error resolution, and bot ruleset optimization.');

    setAiPitch(''); setRoiInsights(''); setAiGeneratedFields({ kpis: false, challenges: false, benefits: false });
  };

  const handleClearAll = () => {
    setToolName(''); setUseCase(''); setChallenges(''); setQualitativeBenefits(''); setKpis('');
    setLaborBreakdown(createDefaultLabor());
    setAutomationPercent(0); setDurationMonths(''); setImplementationCost('');
    setMonthlyRunCost(''); setRunCostInflation(''); 
    setIsAdvancedRunCost(false); setRunCostBreakdown(defaultRunCostBreakdown);
    setHasSre(false); setIsAdvancedSre(false); setSreCostY1(''); setSreCostY2(''); setSreBreakdown(createDefaultSre()); setSreUseCase('');
    setCurrency('USD'); setScenario('realistic'); setAiPitch(''); setRoiInsights(''); setShowClearConfirm(false);
    setAiGeneratedFields({ kpis: false, challenges: false, benefits: false });
  };

  // --- Calculation Engine ---
  const results = useMemo(() => {
    const fteHoursPerMonth = Math.max(1, Number(workingDays)) * Math.max(1, Number(hoursPerDay));
    const currencyMultiplier = exchangeRates[currency] / exchangeRates['USD'];

    const scenarioConfig = { optimistic: { benefit: 1.1, cost: 0.9 }, realistic: { benefit: 1.0, cost: 1.0 }, conservative: { benefit: 0.75, cost: 1.25 } };
    const sc = scenarioConfig[scenario];

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

    // Advanced UI Calculation Output (For UI Display Only - No Scenario Multipliers)
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
    
    // Calculate Advanced Dynamic SRE Costs (For UI Display Only)
    let uiSreY1 = 0;
    let uiSreY2 = 0;
    if (hasSre) {
       if (isAdvancedSre) {
           sreBreakdown.forEach(item => {
               const rawSreTasks = Math.max(0, Number(item.tasksPerMonth));
               const rawSreHours = Math.max(0, Number(item.effortHours));
               const sreHoursMo = rawSreTasks * rawSreHours;
               const sreRateLocal = (lcrRates[item.cl] || 0) * currencyMultiplier;
               
               const costY1 = (sreHoursMo * sreRateLocal);
               const costY2 = (costY1 * (1 - (Math.max(0, Math.min(100, Number(item.y2Reduction))) / 100)));
               
               uiSreY1 += costY1;
               uiSreY2 += costY2;
           });
       } else {
           uiSreY1 = Math.max(0, Number(sreCostY1));
           uiSreY2 = Math.max(0, Number(sreCostY2));
       }
    }
    
    // Financial Model uses scenario adjusted values
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
      
      // Determine Current Month Run Cost
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

      // remainder = how much we went positive (overshoot)
      // monthlyNet = that month's contribution
      // fraction into the month where breakeven hit = 1 - (remainder / monthlyNet)
      // This is correct — but only if monthlyNet > 0
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
  }, [laborBreakdown, automationPercent, durationMonths, implementationCost, monthlyRunCost, runCostInflation, isAdvancedRunCost, runCostBreakdown, lcrRates, hasSre, isAdvancedSre, sreCostY1, sreCostY2, sreBreakdown, workingDays, hoursPerDay, scenario, currency, exchangeRates]);

  const formatCurrency = (value) => new Intl.NumberFormat(currencyConfig[currency].locale, { style: 'currency', currency: currencyConfig[currency].code, maximumFractionDigits: 0 }).format(value);

  // Guardrail for exports
  const isReadyToExport = !!(
    toolName.trim() && useCase.trim() && 
    laborBreakdown.some(l => Number(l.executions) > 0 && Number(l.effortHours) > 0) &&
    Number(durationMonths) > 0 && Number(implementationCost) >= 0 && 
    (isAdvancedRunCost ? Number(results.uiRunCostY1) >= 0 : Number(monthlyRunCost) >= 0)
  );

  // --- External Exports ---
  const handleExportXLSX = async () => {
    if (!isReadyToExport) return;
    setIsExportingXLSX(true);
    try {
      const XLSX = await loadScript('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js', 'XLSX');
      const wb = XLSX.utils.book_new();
      const scenarioLabel = scenario.charAt(0).toUpperCase() + scenario.slice(1);

      // Sheet 1: Summary
      const ws_data = [
        ["", "", "", "", `Quantitative Benefits (${scenarioLabel} Forecast)`, "", "", "", "", ""],
        [
          "Tool", "Use Case Description", "Challenges Addressed", "Qualitative Benefits", 
          "total executions per month", "blended effort per execution in hours", 
          "blended resource cost per hour", "% of task automated", 
          "remaining contract/project duration in months", "Cost Benefit"
        ],
        [
          toolName || 'N/A', useCase || 'N/A', challenges || 'N/A', qualitativeBenefits || 'N/A',
          Math.round(results.totalEffectiveExecutions), Number(results.blendedEffortPerHour).toFixed(2), formatCurrency(results.blendedResourceCostPerHour),
          `${automationPercent}%`, durationMonths, formatCurrency(results.netSavings)
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      ws['!merges'] = [{ s: { r: 0, c: 4 }, e: { r: 0, c: 9 } }];

      const headerStyle = { fill: { fgColor: { rgb: "1E40AF" } }, font: { color: { rgb: "FFFFFF" }, bold: true }, alignment: { wrapText: true, vertical: "center", horizontal: "center" } };
      const dataStyle = { alignment: { wrapText: true, vertical: "top", horizontal: "left" } };

      if (ws['E1']) ws['E1'].s = headerStyle;

      const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      cols.forEach(col => {
        if (ws[`${col}2`]) ws[`${col}2`].s = headerStyle;
        if (ws[`${col}3`]) ws[`${col}3`].s = dataStyle; 
      });

      ws['!cols'] = [ { wch: 25 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 } ];
      ws['!rows'] = [ { hpt: 30 }, { hpt: 60 }, { hpt: 80 } ];

      XLSX.utils.book_append_sheet(wb, ws, "Automation Savings");
      
      // Sheet 2: Monthly Cash Flow
      const monthlySheetData = results.monthlyData.map(row => ({
          Month: row.month,
          Year: row.year,
          "Implementation Cost": formatCurrency(row.implementationCost),
          "Run Cost": formatCurrency(row.runCost),
          "SRE Cost": formatCurrency(row.sreCost),
          "Gross Savings": formatCurrency(row.grossSavings),
          "Net Cash Flow": formatCurrency(row.netCashFlow),
          "Cumulative Net": formatCurrency(row.cumulativeNet)
      }));
      const monthlySheet = XLSX.utils.json_to_sheet(monthlySheetData);
      XLSX.utils.book_append_sheet(wb, monthlySheet, "Monthly Cash Flow");

      XLSX.writeFile(wb, "Automation Savings.xlsx");
    } catch (e) {
      console.error(e);
      alert(`Failed to generate Excel file: ${e.message}`);
    }
    setIsExportingXLSX(false);
  };

  const handleExportPPTX = async () => {
    if (!isReadyToExport) return;
    setIsExportingPPTX(true);
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', 'JSZip');
      const pptxgen = window.pptxgen || await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js', 'PptxGenJS');

      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
      const slide = pptx.addSlide();

      let accentColor = '10B981'; // Emerald (Strong)
      if (results.automationScore < 80 && results.automationScore >= 60) accentColor = '3B82F6'; // Blue (Good)
      if (results.automationScore < 60 && results.automationScore >= 40) accentColor = 'F59E0B'; // Amber (Marginal)
      if (results.automationScore < 40) accentColor = 'EF4444'; // Red (Risk)

      const cBg = 'F8FAFC'; // Slate 50
      const cCardBg = 'FFFFFF';
      const cTextDark = '0F172A'; // Slate 900
      const cTextMuted = '64748B'; // Slate 500
      const cBorder = 'E2E8F0'; // Slate 200

      slide.background = { color: cBg };

      // --- 1. HEADER (Top Strip & Title) ---
      slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 0.1, fill: { color: accentColor } });
      
      slide.addText((toolName || 'Proposed Automation').toUpperCase(), { 
        x: 0.5, y: 0.3, w: 8.5, h: 0.6, fontSize: 28, bold: true, color: cTextDark, fontFace: 'Arial Black' 
      });
      slide.addText(`Business Case & ROI Strategy | Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}`, { 
        x: 0.5, y: 0.9, w: 8.5, h: 0.3, fontSize: 12, color: cTextMuted, bold: true 
      });
      slide.addText(useCase || 'N/A', { 
        x: 0.5, y: 1.2, w: 8.5, h: 0.4, fontSize: 11, color: cTextMuted, italic: true, valign: 'top' 
      });

      // Viability Score Badge
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 9.5, y: 0.4, w: 3.3, h: 0.9, fill: { color: accentColor }, rectRadius: 0.1 
      });
      slide.addText(`VIABILITY SCORE: ${results.automationScore}/100`, { 
        x: 9.5, y: 0.5, w: 3.3, h: 0.3, fontSize: 10, bold: true, color: 'FFFFFF', align: 'center', opacity: 0.9
      });
      slide.addText(results.scoreLabel.toUpperCase(), { 
        x: 9.5, y: 0.8, w: 3.3, h: 0.4, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial Black' 
      });

      const colY = 1.8;
      const colH = 5.2;

      // --- 2. LEFT COLUMN: THE CONTEXT ---
      const col1X = 0.5;
      const col1W = 3.9;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: col1X, y: colY, w: col1W, h: colH, fill: { color: cCardBg }, line: { color: cBorder, width: 1 }, rectRadius: 0.05 });
      slide.addText('01 / THE CONTEXT', { x: col1X + 0.2, y: colY + 0.2, w: col1W - 0.4, h: 0.3, fontSize: 12, bold: true, color: accentColor, fontFace: 'Arial Black' });
      slide.addText('Challenges Addressed', { x: col1X + 0.2, y: colY + 0.7, w: col1W - 0.4, h: 0.3, fontSize: 12, bold: true, color: cTextDark });
      const chalArr = challenges ? challenges.split('\n').filter(k=>k.trim()!=='').map(c => ({ text: c.replace('•','').trim(), options: { bullet: true, color: cTextMuted } })) : [{ text: "None specified", options: { bullet: true, color: cTextMuted } }];
      slide.addText(chalArr, { x: col1X + 0.3, y: colY + 1.0, w: col1W - 0.6, h: 1.8, fontSize: 11, valign: 'top' });
      slide.addShape(pptx.shapes.LINE, { x: col1X + 0.2, y: colY + 3.0, w: col1W - 0.4, h: 0, line: { color: cBorder, width: 1 } });
      slide.addText('Target KPIs', { x: col1X + 0.2, y: colY + 3.2, w: col1W - 0.4, h: 0.3, fontSize: 12, bold: true, color: cTextDark });
      const kpiArr = kpis ? kpis.split('\n').filter(k=>k.trim()!=='').map(k => ({ text: k.replace('•','').trim(), options: { bullet: true, color: cTextMuted } })) : [{ text: "None specified", options: { bullet: true, color: cTextMuted } }];
      slide.addText(kpiArr, { x: col1X + 0.3, y: colY + 3.5, w: col1W - 0.6, h: 1.5, fontSize: 11, valign: 'top' });

      // --- 3. MIDDLE COLUMN: THE SOLUTION ---
      const col2X = 4.6;
      const col2W = 4.2;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: col2X, y: colY, w: col2W, h: colH, fill: { color: cCardBg }, line: { color: cBorder, width: 1 }, rectRadius: 0.05 });
      slide.addText('02 / THE SOLUTION', { x: col2X + 0.2, y: colY + 0.2, w: col2W - 0.4, h: 0.3, fontSize: 12, bold: true, color: accentColor, fontFace: 'Arial Black' });
      slide.addText('Effort Automation Shift', { x: col2X, y: colY + 0.7, w: col2W, h: 0.3, fontSize: 12, bold: true, color: cTextDark, align: 'center' });
      slide.addChart(pptx.charts.DOUGHNUT, [{ name: "Effort", labels: ["Automated", "Manual"], values: [Number(automationPercent), 100 - Number(automationPercent)] }], { x: col2X + 0.85, y: colY + 1.1, w: 2.5, h: 2.0, holeSize: 65, showLegend: true, legendPos: 'b', legendFontSize: 10, showLabel: false, chartColors: [accentColor, 'CBD5E1'], dataBorder: { pt: 0 } });
      slide.addText(`${automationPercent}%`, { x: col2X + 0.85, y: colY + 1.1, w: 2.5, h: 1.7, align: 'center', valign: 'middle', fontSize: 24, bold: true, color: cTextDark, fontFace: 'Arial Black' });
      slide.addShape(pptx.shapes.LINE, { x: col2X + 0.2, y: colY + 3.3, w: col2W - 0.4, h: 0, line: { color: cBorder, width: 1 } });
      slide.addText('Monthly Cost Reduction', { x: col2X + 0.2, y: colY + 3.5, w: col2W - 0.4, h: 0.3, fontSize: 11, bold: true, color: cTextMuted });
      slide.addText(`${formatCurrency(results.currentMonthlyCost)}  →  ${formatCurrency(results.futureMonthlyCostAvg)}`, { x: col2X + 0.2, y: colY + 3.8, w: col2W - 0.4, h: 0.4, fontSize: 18, bold: true, color: cTextDark });
      slide.addText('Capacity Shift (FTEs)', { x: col2X + 0.2, y: colY + 4.3, w: col2W - 0.4, h: 0.3, fontSize: 11, bold: true, color: cTextMuted });
      
      const maxFteW = col2W - 0.6;
      const currentFte = results.currentFte || 1;
      const futureFteW = (results.toBeFte / currentFte) * maxFteW;
      
      slide.addShape(pptx.shapes.RECTANGLE, { x: col2X + 0.3, y: colY + 4.7, w: maxFteW, h: 0.3, fill: { color: 'E2E8F0' } });
      slide.addShape(pptx.shapes.RECTANGLE, { x: col2X + 0.3, y: colY + 4.7, w: Math.max(futureFteW, 0.05), h: 0.3, fill: { color: accentColor } });
      slide.addText(`${results.currentFte.toFixed(1)} FTEs As-Is`, { x: col2X + 0.3, y: colY + 4.7, w: maxFteW, h: 0.3, fontSize: 9, color: cTextMuted, align: 'right', valign: 'middle', pr: 0.1 });

      // --- 4. RIGHT COLUMN: THE IMPACT ---
      const col3X = 9.0;
      const col3W = 3.8;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: col3X, y: colY, w: col3W, h: colH, fill: { color: accentColor, transparency: 95 }, line: { color: accentColor, width: 2 }, rectRadius: 0.05 });
      slide.addText('03 / FINANCIAL IMPACT', { x: col3X + 0.2, y: colY + 0.2, w: col3W - 0.4, h: 0.3, fontSize: 12, bold: true, color: accentColor, fontFace: 'Arial Black' });

      const impactMetrics = [
        { label: "LIFETIME NET SAVINGS", value: formatCurrency(results.netSavings) },
        { label: "RETURN ON INVESTMENT (ROI)", value: results.roi === Infinity ? '>1000%' : `${Math.round(results.roi).toLocaleString()}%` },
        { label: "PAYBACK PERIOD", value: results.paybackPeriod === Infinity ? 'Never' : `${results.paybackPeriod.toFixed(1)} months` },
        { label: "CAPACITY RECAPTURED", value: `${results.fteSavings.toFixed(1)} FTEs/mo` }
      ];

      let currentY = colY + 0.8;
      impactMetrics.forEach((metric, i) => {
        slide.addText(metric.label, { x: col3X + 0.3, y: currentY, w: col3W - 0.6, h: 0.3, fontSize: 11, bold: true, color: cTextMuted });
        slide.addText(metric.value, { x: col3X + 0.3, y: currentY + 0.3, w: col3W - 0.6, h: 0.6, fontSize: 28, bold: true, color: cTextDark, fontFace: 'Arial Black' });
        if (i < 3) {
          slide.addShape(pptx.shapes.LINE, { x: col3X + 0.3, y: currentY + 1.0, w: col3W - 0.6, h: 0, line: { color: accentColor, width: 1, transparency: 80 } });
          currentY += 1.15;
        }
      });

      await pptx.writeFile({ fileName: `${toolName || 'Automation'} Automation 1 Slider.pptx` });
    } catch (e) {
      console.error(e);
      alert(`Failed to generate PPTX file. Error: ${e.message}`);
    }
    setIsExportingPPTX(false);
  };

  // --- AI Gen Handlers ---
  const generateAIPitch = async () => {
    setIsGenerating(true);
    const prompt = `Act as a professional business analyst. Write a persuasive, general business case pitch for an automation project.
    Details: Tool Name: """${sanitizeStr(toolName)}""" | Use Case: """${sanitizeStr(useCase)}""" | Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Forecast
    Financials: Lifetime Net Savings: ${formatCurrency(results.netSavings)} over ${durationMonths} months | ROI: ${Math.round(results.roi)}% | Automation Viability Score: ${results.automationScore}/100 (${results.scoreLabel})
    Write a compelling executive summary (2-3 paragraphs). Do NOT include greetings. Use standard plain text formatting.`;
    try {
      const text = await callAI(prompt);
      if (text) setAiPitch(text.trim());
    } catch (error) { console.error(error); } 
    finally { setIsGenerating(false); }
  };

  const generateSuggestions = async () => {
    if (!toolName && !useCase) { return; }
    setIsGeneratingSuggestions(true);
    const prompt = `Based on Tool Name: """${sanitizeStr(toolName)}""" and Use Case: """${sanitizeStr(useCase)}""", return ONLY a valid JSON object exactly matching this structure: {"kpis": ["..."], "challenges": ["..."], "benefits": ["..."]}. Do NOT include markdown backticks. Do NOT include trailing commas. Escape all internal quotes.`;
    try {
      const text = await callAI(prompt);
      let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const startIndex = cleanText.indexOf('{');
      const endIndex = cleanText.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        let jsonStr = cleanText.substring(startIndex, endIndex + 1);
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1'); 
        jsonStr = jsonStr.replace(/[\x00-\x1F\x7F-\x9F]/g, ""); 
        const parsed = JSON.parse(jsonStr);
        if (parsed.kpis && Array.isArray(parsed.kpis)) setKpis(parsed.kpis.map(k => '• ' + k).join('\n'));
        if (parsed.challenges && Array.isArray(parsed.challenges)) setChallenges(parsed.challenges.map(c => '• ' + c).join('\n'));
        if (parsed.benefits && Array.isArray(parsed.benefits)) setQualitativeBenefits(parsed.benefits.map(b => '• ' + b).join('\n'));
        
        // Activate AI badges
        setAiGeneratedFields({ kpis: true, challenges: true, benefits: true });
      }
    } catch (error) { 
      console.warn("AI Suggestions parsing failed:", error); 
    } 
    finally { setIsGeneratingSuggestions(false); }
  };

  const generateROIInsights = async () => {
    setIsGeneratingInsights(true);
    const prompt = `Act as a financial strategist. Analyze these metrics: Net Savings: ${formatCurrency(results.netSavings)}, ROI: ${Math.round(results.roi)}%, Payback: ${results.paybackPeriod.toFixed(1)} mo. Provide 2-3 brief, actionable bullet points to improve ROI. Use simple dashes for bullets, no bold markdown.`;
    try {
      const text = await callAI(prompt);
      if (text) setRoiInsights(text.trim());
    } catch (error) { console.error(error); } 
    finally { setIsGeneratingInsights(false); }
  };

  const generateSreUseCase = async () => {
    setIsGeneratingSreUseCase(true);
    const tName = toolName?.trim() ? sanitizeStr(toolName) : "this enterprise automation system";
    const uCase = useCase?.trim() ? sanitizeStr(useCase) : "standard automated workflows";
    const prompt = `Based on the automation tool named """${tName}""" and use case """${uCase}""", generate 2 very short, simple bullet points (maximum 5-8 words per point) justifying the need for ongoing SRE/maintenance. Keep it extremely brief. Start each point with '• '. Return ONLY the text without markdown formatting or quotes.`;
    try {
      const text = await callAI(prompt);
      if (text) setSreUseCase(text.replace(/["']/g, "").trim());
    } catch (error) { 
      console.warn("AI SRE Use Case generation failed:", error); 
    } 
    finally { setIsGeneratingSreUseCase(false); }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.left = "-999999px"; textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error('Fallback: Oops, unable to copy', err); }
    document.body.removeChild(textArea);
  };

  const handleCopy = () => {
    if (!aiPitch) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(aiPitch)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
        .catch(() => fallbackCopyTextToClipboard(aiPitch)); 
    } else { fallbackCopyTextToClipboard(aiPitch); }
  };

  // --- Dynamic Styling Context ---
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
    // State
    toolName, setToolName, useCase, setUseCase, challenges, setChallenges, qualitativeBenefits, setQualitativeBenefits, kpis, setKpis,
    aiGeneratedFields, setAiGeneratedFields,
    laborBreakdown, setLaborBreakdown, lcrRates, setLcrRates, baseLcr,
    automationPercent, setAutomationPercent, durationMonths, setDurationMonths, implementationCost, setImplementationCost,
    monthlyRunCost, setMonthlyRunCost, runCostInflation, setRunCostInflation, isAdvancedRunCost, setIsAdvancedRunCost, runCostBreakdown, setRunCostBreakdown,
    hasSre, setHasSre, isAdvancedSre, setIsAdvancedSre, sreCostY1, setSreCostY1, sreCostY2, setSreCostY2, sreBreakdown, setSreBreakdown, sreUseCase, setSreUseCase, isSreModalOpen, setIsSreModalOpen, isRunCostModalOpen, setIsRunCostModalOpen,
    currency, setCurrency, scenario, setScenario, workingDays, setWorkingDays, hoursPerDay, setHoursPerDay, isDarkMode, setIsDarkMode,
    exchangeRates, ratesStatus, copied, setCopied, aiPitch, setAiPitch, isGenerating, setIsGenerating, isGeneratingSuggestions, setIsGeneratingSuggestions,
    isGeneratingInsights, setIsGeneratingInsights, isGeneratingSreUseCase, setIsGeneratingSreUseCase, roiInsights, setRoiInsights, isHowItWorksOpen, setIsHowItWorksOpen, showScore, setShowScore,
    showClearConfirm, setShowClearConfirm, isSettingsOpen, setIsSettingsOpen, isExportingXLSX, setIsExportingXLSX, isExportingPPTX, setIsExportingPPTX,
    aiProvider, setAiProvider, aiApiKey, setAiApiKey, aiModel, setAiModel, currencyConfig, isReadyToExport, results,

    // Functions
    handleCurrencyChange, handleLaborMinutesChange, handleLaborHoursChange, handleSreMinutesChange, handleSreHoursChange, updateLabor, addLabor, removeLabor, updateSreRole, addSreRole, removeSreRole, updateRunCostBreakdown, handleGenerateMockData, handleClearAll, sanitizeStr, callAI, formatCurrency,
    generateAIPitch, generateSuggestions, generateROIInsights, generateSreUseCase, handleProviderChange, handleExportXLSX, handleExportPPTX, handleCopy,

    // Styling
    bgMain, textMain, textHeading, textSub, borderMuted, panelBg, cardStyle, inputStyle, inputErrorStyle
  };

  return (
    <AppContext.Provider value={contextValue}>
      <AppLayout />
    </AppContext.Provider>
  );
}

// ==========================================
// EXTRACTED SUB-COMPONENTS
// ==========================================

function AppLayout() {
  const { bgMain, textMain, showClearConfirm, isSettingsOpen, isSreModalOpen, isRunCostModalOpen } = useApp();
  
  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans p-4 md:p-6 lg:p-8 selection:bg-blue-100 transition-colors duration-300`}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}</style>
      
      <div className="max-w-[1400px] mx-auto space-y-6 relative">
        <Header />
        {showClearConfirm && <ClearConfirmModal />}
        {isSettingsOpen && <SettingsModal />}
        {isSreModalOpen && <SreConfigurationModal />}
        {isRunCostModalOpen && <AdvancedRunCostModal />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
          <div className="lg:col-span-7 space-y-6">
            <QualitativeSection />
            <QuantitativeSection />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <ResultsPanel />
            <CurrentVsFuturePanel />
            <OperationalImpactPanel />
            <PitchPanel />
          </div>
        </div>
        <MethodologyPanel />
      </div>
    </div>
  );
}

function Header() {
  const { 
    cardStyle, textHeading, textSub, ratesStatus, currencyConfig, handleCurrencyChange, currency, isDarkMode, 
    isReadyToExport, isExportingXLSX, isExportingPPTX, setIsDarkMode, handleGenerateMockData, setShowClearConfirm, setIsSettingsOpen,
    handleExportXLSX, handleExportPPTX
  } = useApp();

  return (
    <header className={`${cardStyle} p-4 pr-6 flex items-center justify-between z-20`}>
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 rounded-[20px] text-white shadow-lg shadow-blue-500/20"><Calculator size={26} strokeWidth={2.5} /></div>
        <div>
          <h1 className={`text-xl md:text-2xl font-extrabold ${textHeading} tracking-tight`}>Automation Savings</h1>
          <p className={`${textSub} text-sm font-medium hidden sm:block`}>Quantify ROI, time recaptured, and dynamic operational impact.</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className="hidden md:flex items-center mr-1">
          <Tooltip text={ratesStatus === 'live' ? 'Live Exchange Rates Active' : 'Offline Fallback Rates'}>
            <div className={`flex items-center ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-100 border-slate-200/50'} p-1 rounded-2xl border relative transition-colors`}>
              {ratesStatus === 'live' && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-100 rounded-full z-10"></div>}
              {Object.keys(currencyConfig).map((curr) => (
                <button key={curr} onClick={() => handleCurrencyChange(curr)} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${currency === curr ? (isDarkMode ? 'bg-[#1E293B] text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}`}>{curr}</button>
              ))}
            </div>
          </Tooltip>
        </div>

        <div className="hidden sm:flex items-center">
          <Tooltip text={isReadyToExport ? "Export Options" : "Please fill out basic Qualitative and Quantitative details to enable exports."}>
            <div className={`flex ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200/60'} border rounded-2xl overflow-hidden shadow-sm transition-opacity ${isReadyToExport ? 'opacity-100' : 'opacity-40 grayscale'}`}>
              <button onClick={handleExportXLSX} disabled={isExportingXLSX || !isReadyToExport} className={`flex items-center space-x-1.5 text-xs font-bold ${isDarkMode ? 'text-emerald-400 hover:bg-emerald-900/40 border-emerald-900/50' : 'text-emerald-700 hover:bg-emerald-100 border-emerald-200/60'} px-3 py-3 transition-all border-r disabled:cursor-not-allowed`} title="Export Report to Excel">
                {isExportingXLSX ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span className="hidden lg:inline">Excel</span>
              </button>
              <button onClick={handleExportPPTX} disabled={isExportingPPTX || !isReadyToExport} className={`flex items-center space-x-1.5 text-xs font-bold ${isDarkMode ? 'text-orange-400 bg-orange-950/20 hover:bg-orange-900/40' : 'text-orange-700 bg-orange-50 hover:bg-orange-100'} px-3 py-3 transition-all disabled:cursor-not-allowed`} title="Export 1-Slide Summary to PowerPoint">
                {isExportingPPTX ? <Loader2 size={16} className="animate-spin" /> : <Presentation size={16} />}
                <span className="hidden lg:inline">PPTX</span>
              </button>
            </div>
          </Tooltip>
        </div>

        <div className={`flex items-center space-x-1 ${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-slate-100 border-transparent'} p-1 rounded-[20px] border`}>
            <Tooltip text={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode"}><button onClick={() => setIsDarkMode(!isDarkMode)} className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-amber-400 hover:bg-[#1E293B]' : 'text-slate-600 hover:text-amber-600 hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><Sun size={18} /></button></Tooltip>
            <Tooltip text="Generate Mock Data (Quick Test)"><button onClick={handleGenerateMockData} className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-emerald-400 hover:bg-[#1E293B]' : 'text-slate-600 hover:text-emerald-600 hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><FlaskConical size={18} /></button></Tooltip>
            <Tooltip text="Clear Project Data"><button onClick={() => setShowClearConfirm(true)} className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-[#1E293B]' : 'text-slate-600 hover:text-red-600 hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><Trash2 size={18} /></button></Tooltip>
            <Tooltip text="Settings"><button onClick={() => setIsSettingsOpen(true)} className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-[#1E293B]' : 'text-slate-600 hover:text-blue-600 hover:bg-white shadow-sm'} p-2.5 rounded-[14px] transition-all`}><Settings size={18} /></button></Tooltip>
        </div>
      </div>
    </header>
  );
}

function ClearConfirmModal() {
  const { isDarkMode, textHeading, textSub, handleClearAll, setShowClearConfirm } = useApp();
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-in fade-in duration-200">
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border p-8 text-center`}>
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-6"><AlertTriangle size={32} /></div>
        <h2 className={`text-2xl font-bold ${textHeading} mb-2`}>Clear all data?</h2>
        <p className={`${textSub} text-sm mb-8`}>This will reset all your project inputs back to a clean slate. This action cannot be undone.</p>
        <div className="flex flex-col space-y-3">
          <button onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20">Yes, clear data</button>
          <button onClick={() => setShowClearConfirm(false)} className={`${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} py-3 rounded-2xl font-bold transition-all`}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal() {
  const { 
    isDarkMode, textHeading, setIsSettingsOpen, textSub, borderMuted, textMain, inputStyle, 
    workingDays, setWorkingDays, hoursPerDay, setHoursPerDay, aiProvider, handleProviderChange, 
    aiApiKey, setAiApiKey, lcrRates, setLcrRates, baseLcr
  } = useApp();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity">
      <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border`}>
        <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-b px-6 py-5 flex items-center justify-between`}>
          <div className="flex items-center space-x-3"><div className="bg-blue-500/20 p-2 rounded-xl text-blue-500"><Settings size={18} /></div><h2 className={`text-xl font-bold ${textHeading}`}>Settings</h2></div>
          <button onClick={() => setIsSettingsOpen(false)} className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 shadow-sm'} p-2 rounded-full transition-colors`}><X size={20} /></button>
        </div>
        <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textSub} mb-4 border-b ${borderMuted} pb-2`}>Operational Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={`block text-sm font-bold ${textMain} mb-2`}>Working Days / Mo</label><input type="number" min="1" max="31" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} className={inputStyle} /></div>
              <div><label className={`block text-sm font-bold ${textMain} mb-2`}>Hours / Day</label><input type="number" min="1" max="24" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} className={inputStyle} /></div>
            </div>
            <div className={`mt-3 p-3 rounded-xl ${isDarkMode ? 'bg-blue-950/30 border border-blue-900/50 text-blue-200' : 'bg-blue-50 border border-blue-100 text-blue-800'} text-xs font-medium`}>
              <strong>FTE Baseline:</strong> {Math.max(1, Number(workingDays)) * Math.max(1, Number(hoursPerDay))} hours per month.
            </div>
          </div>
          <div>
            <div className={`flex justify-between items-end border-b ${borderMuted} pb-2 mb-4`}>
               <h3 className={`text-xs font-bold uppercase tracking-wider ${textSub}`}>LCR Database Mapping</h3>
               <button onClick={() => setLcrRates(baseLcr)} className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors">Reset Defaults</button>
            </div>
            <p className={`text-xs ${textSub} mb-4`}>Define the base hourly rate in USD for each Career Level. This ensures the backend pricing calculation never breaks.</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(lcrRates).map(([cl, rate]) => (
                 <div key={cl} className="flex items-center space-x-2">
                    <span className={`text-xs font-bold w-10 ${textSub}`}>{cl}</span>
                    <div className="relative flex-1">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">$</div>
                       <input type="number" min="0" value={rate} onChange={(e) => setLcrRates(prev => ({...prev, [cl]: Math.max(0, Number(e.target.value))}))} className={`${inputStyle} pl-7 py-2 text-xs`} />
                    </div>
                 </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textSub} mb-4 border-b ${borderMuted} pb-2`}>AI Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold ${textMain} mb-2`}>AI Provider</label>
                <select value={aiProvider} onChange={handleProviderChange} className={inputStyle}>
                  {Object.entries(providerOptions).map(([key, opt]) => (<option key={key} value={key}>{opt.name}</option>))}
                </select>
              </div>
              {providerOptions[aiProvider].needsKey && (
                <div>
                  <label className={`block text-sm font-bold ${textMain} mb-2`}>API Key <span className="text-[10px] text-red-500 ml-2">(Not Saved)</span></label>
                  <input type="password" value={aiApiKey} onChange={(e) => setAiApiKey(e.target.value)} placeholder="Enter API key..." className={`${inputStyle} font-mono`} />
                  {providerOptions[aiProvider].url && (<a href={providerOptions[aiProvider].url} target="_blank" rel="noreferrer" className="inline-flex items-center mt-2 text-xs font-bold text-blue-500 hover:text-blue-400">Get your free key <ExternalLink size={12} className="ml-1" /></a>)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`px-6 py-5 ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-t flex justify-end`}>
          <button onClick={() => setIsSettingsOpen(false)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-md">Save & Close</button>
        </div>
      </div>
    </div>
  );
}

function SreConfigurationModal() {
   const { 
     isDarkMode, textHeading, setIsSreModalOpen, textSub, textMain, inputStyle, inputErrorStyle, borderMuted,
     sreBreakdown, updateSreRole, addSreRole, removeSreRole, handleSreMinutesChange, handleSreHoursChange, 
     sreUseCase, setSreUseCase, lcrRates, setIsAdvancedSre, isGeneratingSreUseCase, generateSreUseCase, toolName, useCase
   } = useApp();
 
   const handleSave = () => {
      setIsAdvancedSre(true);
      setIsSreModalOpen(false);
   };
   
   const handleRevert = () => {
      setIsAdvancedSre(false);
      setIsSreModalOpen(false);
   };

   return (
     <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity">
       <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border flex flex-col max-h-[90vh]`}>
         <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-b px-6 py-5 flex items-center justify-between shrink-0`}>
           <div className="flex items-center space-x-3"><div className="bg-orange-500/20 p-2 rounded-xl text-orange-500"><Wrench size={18} /></div><h2 className={`text-xl font-bold ${textHeading}`}>Advanced SRE / Maintenance</h2></div>
           <button onClick={() => setIsSreModalOpen(false)} className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 shadow-sm'} p-2 rounded-full transition-colors`}><X size={20} /></button>
         </div>
         <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Dynamic SRE Roles */}
            <div className="space-y-4">
              {sreBreakdown.map((entry, index) => (
                 <div key={entry.id} className={`p-4 rounded-[20px] border ${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-slate-50 border-slate-200'} shadow-sm`}>
                    
                    {/* Row 1: Role & Remove btn */}
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center space-x-2">
                         <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 shadow-sm'}`}>SRE Role {index + 1}</span>
                         <select value={entry.cl} onChange={(e) => updateSreRole(entry.id, 'cl', e.target.value)} className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${textHeading} border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded px-1 transition-all`}>
                            {Object.keys(lcrRates).map(cl => <option key={cl} value={cl} className="bg-white dark:bg-slate-800">{cl}</option>)}
                         </select>
                       </div>
                       {sreBreakdown.length > 1 && (
                          <button onClick={() => removeSreRole(entry.id)} className={`text-slate-400 hover:text-red-500 ${isDarkMode ? 'hover:bg-red-950/30' : 'hover:bg-red-50'} p-1.5 rounded-lg transition-colors`} title="Remove Role">
                            <Trash2 size={14}/>
                          </button>
                       )}
                    </div>
                    
                    {/* Row 2: Tasks & Mins/Hrs */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                       <div>
                          <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>Maintenance Tasks / Mo</label>
                          <input type="number" min="0" value={entry.tasksPerMonth} onChange={(e) => updateSreRole(entry.id, 'tasksPerMonth', e.target.value)} placeholder="0" className={`${entry.tasksPerMonth !== '' && entry.tasksPerMonth < 0 ? inputErrorStyle : inputStyle} py-2.5 text-sm font-mono`} />
                       </div>
                       <div>
                          <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>Time per Task</label>
                          <div className="flex space-x-2">
                            <div className="relative flex-1"><input type="number" min="0" value={entry.effortMinutes} onChange={(e) => handleSreMinutesChange(entry.id, e.target.value)} placeholder="0" className={`${entry.effortMinutes !== '' && entry.effortMinutes < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-8 text-sm font-mono`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-[10px] pointer-events-none">M</span></div>
                            <div className="relative flex-1"><input type="number" min="0" step="0.01" value={entry.effortHours} onChange={(e) => handleSreHoursChange(entry.id, e.target.value)} placeholder="0.0" className={`${entry.effortHours !== '' && entry.effortHours < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-8 text-sm font-mono ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-[10px] pointer-events-none">H</span></div>
                          </div>
                       </div>
                    </div>

                    {/* Row 3: Y2 Reduction Slider */}
                    <div>
                       <div className="flex justify-between items-center mb-3">
                         <label className={`flex items-center text-[10px] font-bold ${textSub} uppercase`}>Y2+ Efficiency Gain <Tooltip text='Percentage reduction in SRE effort required after Year 1 as the tool stabilizes.'><Info size={12} className={`${textSub} hover:text-orange-500 transition-colors cursor-help ml-1`}/></Tooltip></label>
                         <span className={`font-extrabold ${isDarkMode ? 'text-orange-400 bg-orange-950/50' : 'text-orange-700 bg-orange-100'} px-2.5 py-0.5 rounded-lg text-xs shadow-sm`}>{entry.y2Reduction}%</span>
                       </div>
                       <input type="range" min="0" max="100" value={entry.y2Reduction} onChange={(e) => updateSreRole(entry.id, 'y2Reduction', e.target.value)} className={`w-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full appearance-none cursor-pointer accent-orange-500`} />
                    </div>
                 </div>
              ))}
              <button onClick={addSreRole} className={`w-full py-3 flex items-center justify-center space-x-2 border-2 border-dashed rounded-[20px] text-sm font-bold transition-all ${isDarkMode ? 'border-slate-700 text-slate-400 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-950/20' : 'border-slate-300 text-slate-500 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50'}`}>
                 <Plus size={16} /><span>Add SRE Role</span>
              </button>
            </div>

            <div className={`border-t ${borderMuted} pt-6`}>
               <div className="flex justify-between items-end mb-3">
                 <label className={`flex items-center text-sm font-bold ${textMain}`}><ShieldCheck size={16} className="mr-1.5 text-orange-500" /> SRE Use Case / Justification</label>
                 <Tooltip text={(!toolName && !useCase) ? "Generates a generic justification since Tool Name/Use Case are empty." : "Generate SRE justification based on your Tool Name & Use Case."}>
                   <button onClick={generateSreUseCase} disabled={isGeneratingSreUseCase} className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50 hover:opacity-80 px-2 py-1 rounded-lg flex items-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                     {isGeneratingSreUseCase ? <Loader2 size={12} className="animate-spin mr-1.5"/> : <Sparkles size={12} className="mr-1.5"/>} AI Generate
                   </button>
                 </Tooltip>
               </div>
               <textarea value={sreUseCase} onChange={(e) => setSreUseCase(e.target.value)} rows={3} placeholder="e.g., Ongoing API maintenance, exception handling, and ruleset upgrades..." className={`${inputStyle} resize-none font-medium`} />
            </div>
         </div>
         <div className={`px-6 py-5 ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-t flex justify-between items-center shrink-0`}>
           <button onClick={handleRevert} className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400' : 'text-slate-500 hover:bg-slate-200 hover:text-red-600'}`}>Disable Advanced Config</button>
           <button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-md">Apply Advanced SRE</button>
         </div>
       </div>
     </div>
   );
 }

function AdvancedRunCostModal() {
   const { 
     isDarkMode, textHeading, setIsRunCostModalOpen, textSub, textMain, inputStyle, inputErrorStyle,
     runCostBreakdown, updateRunCostBreakdown, setIsAdvancedRunCost
   } = useApp();
 
   const handleSave = () => {
      setIsAdvancedRunCost(true);
      setIsRunCostModalOpen(false);
   };
   
   const handleRevert = () => {
      setIsAdvancedRunCost(false);
      setIsRunCostModalOpen(false);
   };

   const renderRow = (key, title, subtitle, hasToggle) => {
      const data = runCostBreakdown[key];
      const isEnabled = hasToggle ? data.enabled : true;

      return (
         <div className={`p-4 rounded-[20px] border ${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-slate-50 border-slate-200'} shadow-sm transition-all duration-300 ${hasToggle && !isEnabled ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex justify-between items-center mb-3">
               <div>
                  <h4 className={`text-sm font-bold ${textHeading}`}>{title}</h4>
                  {subtitle && <p className={`text-[10px] ${textSub}`}>{subtitle}</p>}
               </div>
               {hasToggle && (
                  <button onClick={() => updateRunCostBreakdown(key, 'enabled', !data.enabled)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${data.enabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                     <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${data.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
               )}
            </div>
            
            {isEnabled && (
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>Cost / Mo</label>
                     <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                        <input type="number" min="0" value={data.cost} onChange={(e) => updateRunCostBreakdown(key, 'cost', e.target.value)} placeholder="0" className={`${data.cost !== '' && data.cost < 0 ? inputErrorStyle : inputStyle} py-2 pl-8 text-sm font-mono`} />
                     </div>
                  </div>
                  <div>
                     <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1.5`}>YOY Inflation</label>
                     <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><TrendingUp size={12} /></div>
                        <input type="number" min="0" value={data.inflation} onChange={(e) => updateRunCostBreakdown(key, 'inflation', e.target.value)} placeholder="0" className={`${data.inflation !== '' && data.inflation < 0 ? inputErrorStyle : inputStyle} py-2 pl-8 pr-8 text-sm font-mono`} />
                        <span className={`absolute inset-y-0 right-0 pr-3 flex items-center ${textSub} font-bold text-xs`}>%</span>
                     </div>
                  </div>
               </div>
            )}
         </div>
      );
   };

   return (
     <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity">
       <div className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border flex flex-col max-h-[90vh]`}>
         <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-b px-6 py-5 flex items-center justify-between shrink-0`}>
           <div className="flex items-center space-x-3"><div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-500"><Server size={18} /></div><h2 className={`text-xl font-bold ${textHeading}`}>Advanced Run Cost</h2></div>
           <button onClick={() => setIsRunCostModalOpen(false)} className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 shadow-sm'} p-2 rounded-full transition-colors`}><X size={20} /></button>
         </div>
         <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {renderRow('productLicense', 'Product License Fee', 'Base software license cost.', false)}
            {renderRow('ai', 'AI Tool Token Usage', 'LLM API or generative token costs.', true)}
            {renderRow('splunk', 'Splunk / Monitoring License', 'Data ingestion or log tracking costs.', true)}
            {renderRow('infra', 'Infrastructure', 'Cloud compute, VMs, databases.', true)}
            {renderRow('other', 'Other Run Costs', 'Miscellaneous recurring fees.', true)}
         </div>
         <div className={`px-6 py-5 ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100'} border-t flex justify-between items-center shrink-0`}>
           <button onClick={handleRevert} className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400' : 'text-slate-500 hover:bg-slate-200 hover:text-red-600'}`}>Disable Advanced Config</button>
           <button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-md">Apply Advanced Costs</button>
         </div>
       </div>
     </div>
   );
}

function AiBadge() {
  return (
    <span className="ml-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider shadow-sm">
      <Sparkles size={10} /><span>AI</span>
    </span>
  );
}

function QualitativeSection() {
  const { 
    cardStyle, borderMuted, isDarkMode, textHeading, panelBg, textMain, textSub, inputStyle, 
    toolName, setToolName, useCase, setUseCase, kpis, setKpis, challenges, setChallenges, 
    qualitativeBenefits, setQualitativeBenefits, isGeneratingSuggestions, generateSuggestions,
    aiGeneratedFields, setAiGeneratedFields
  } = useApp();
  
  const getFieldStyle = (isGenerated) => {
    if (!isGenerated) return inputStyle;
    return `${inputStyle} border-indigo-300 ring-4 ring-indigo-50 dark:border-indigo-700 dark:ring-indigo-900/20 bg-indigo-50/10 dark:bg-indigo-950/10 transition-all duration-500`;
  };

  const handleAiChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (aiGeneratedFields[field]) {
      setAiGeneratedFields(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <section className={cardStyle}>
      <div className={`px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between border-b ${borderMuted} gap-4`}>
        <div className="flex items-center space-x-3">
          <div className={`${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'} p-2.5 rounded-[14px]`}><FileText size={20} /></div>
          <h2 className={`text-xl font-bold ${textHeading} tracking-tight`}>Qualitative Details</h2>
        </div>
        <button onClick={generateSuggestions} disabled={isGeneratingSuggestions || (!toolName && !useCase)} className={`flex items-center justify-center space-x-2 text-sm font-bold ${isDarkMode ? 'bg-amber-950/30 hover:bg-amber-900/50 text-amber-400 border-amber-900/50' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/50'} px-4 py-2.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border`}>
          {isGeneratingSuggestions ? <Loader2 size={16} className="animate-spin text-amber-500" /> : <Sparkles size={16} className="text-amber-500" />}
          <span>{isGeneratingSuggestions ? 'Auto-Filling...' : 'Auto-Fill Details'}</span>
        </button>
      </div>
      <div className={`p-6 md:p-8 space-y-5 ${panelBg} rounded-b-[28px]`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>Automation Name <Tooltip text="Give your automation project a short, recognizable name."><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${textSub}`}><Cpu size={18} /></div>
              <input type="text" value={toolName} onChange={(e) => setToolName(e.target.value)} placeholder="e.g., Ticket Auto-Triage Bot" className={`${inputStyle} pl-12 font-medium`} />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>Use Case Description <Tooltip text='What specific manual process is this bot replacing?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label>
            <textarea value={useCase} onChange={(e) => setUseCase(e.target.value)} rows={2} placeholder="Briefly describe what the automation does..." className={`${inputStyle} resize-none font-medium`} />
          </div>
          <div className="md:col-span-2">
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}><BarChart3 size={16} className="mr-1.5 text-purple-500" /> Target KPIs <Tooltip text='Which business metrics will this improve?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip> {aiGeneratedFields.kpis && <AiBadge/>}</label>
            <textarea value={kpis} onChange={handleAiChange(setKpis, 'kpis')} rows={3} placeholder="e.g., MTTR, CSAT, Error Rate..." className={`${getFieldStyle(aiGeneratedFields.kpis)} resize-none font-medium`} />
          </div>
          <div>
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}><Target size={16} className="mr-1.5 text-red-500" /> Challenges Addressed <Tooltip text='What pain points are solved?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip> {aiGeneratedFields.challenges && <AiBadge/>}</label>
            <textarea value={challenges} onChange={handleAiChange(setChallenges, 'challenges')} rows={4} placeholder="What pain points are solved?" className={`${getFieldStyle(aiGeneratedFields.challenges)} resize-none text-sm font-medium`} />
          </div>
          <div>
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}><Award size={16} className="mr-1.5 text-green-500" /> Qualitative Benefits <Tooltip text='What are the soft benefits?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip> {aiGeneratedFields.benefits && <AiBadge/>}</label>
            <textarea value={qualitativeBenefits} onChange={handleAiChange(setQualitativeBenefits, 'benefits')} rows={4} placeholder="e.g., Improved employee morale..." className={`${getFieldStyle(aiGeneratedFields.benefits)} resize-none text-sm font-medium`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuantitativeSection() {
  const { 
    cardStyle, borderMuted, isDarkMode, textHeading, panelBg, textMain, textSub, inputStyle, inputErrorStyle,
    laborBreakdown, addLabor, removeLabor, updateLabor, handleLaborMinutesChange, handleLaborHoursChange, lcrRates, results, formatCurrency, workingDays,
    durationMonths, setDurationMonths, automationPercent, setAutomationPercent, implementationCost, setImplementationCost, 
    monthlyRunCost, setMonthlyRunCost, runCostInflation, setRunCostInflation, isAdvancedRunCost, setIsAdvancedRunCost, setIsRunCostModalOpen,
    hasSre, setHasSre, isAdvancedSre, sreCostY1, setSreCostY1, sreCostY2, setSreCostY2, setIsSreModalOpen 
  } = useApp();

  return (
    <section className={cardStyle}>
      <div className={`px-6 md:px-8 py-5 flex items-center justify-between border-b ${borderMuted}`}>
        <div className="flex items-center space-x-3">
          <div className={`${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'} p-2.5 rounded-[14px]`}><Activity size={20} /></div>
          <h2 className={`text-xl font-bold ${textHeading} tracking-tight`}>Labor & Task Breakdown</h2>
        </div>
      </div>
      <div className={`p-6 md:p-8 space-y-7 ${panelBg} rounded-b-[28px]`}>
        
        {/* Dynamic Labor Rows */}
        <div className="space-y-4">
          {laborBreakdown.map((entry, index) => (
            <div key={entry.id} className={`p-5 rounded-[20px] border ${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-white border-slate-200'} relative space-y-4 shadow-sm`}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                     <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Resource {index + 1}</span>
                     <select value={entry.cl} onChange={(e) => updateLabor(entry.id, 'cl', e.target.value)} className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${textHeading} border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded px-1 transition-all`}>
                        {Object.keys(lcrRates).map(cl => <option key={cl} value={cl} className="bg-white dark:bg-slate-800">{cl}</option>)}
                     </select>
                  </div>
                  {laborBreakdown.length > 1 && (
                    <button onClick={() => removeLabor(entry.id)} className={`text-slate-400 hover:text-red-500 ${isDarkMode ? 'hover:bg-red-950/30' : 'hover:bg-red-50'} p-1.5 rounded-lg transition-colors`} title="Remove Role">
                      <Trash2 size={16}/>
                    </button>
                  )}
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                     <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center">Task Volume <Tooltip text={entry.volumePeriod === 'daily' ? `Multiplied by ${workingDays} working days to get monthly volume.` : 'Executions per month.'}><Info size={12} className="ml-1 cursor-help hover:text-blue-500"/></Tooltip></label>
                     <div className="flex space-x-1 items-stretch">
                       <input type="number" min="0" value={entry.executions} onChange={(e) => updateLabor(entry.id, 'executions', e.target.value)} placeholder="0" className={`${entry.executions !== '' && entry.executions < 0 ? inputErrorStyle : inputStyle} py-2.5 text-sm font-mono flex-1`} />
                       <div className={`flex flex-col ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-200/60'} p-0.5 rounded-xl shadow-inner w-12`}>
                          <button onClick={() => updateLabor(entry.id, 'volumePeriod', 'daily')} className={`flex-1 text-[9px] rounded-lg transition-all font-bold ${entry.volumePeriod === 'daily' ? (isDarkMode ? 'bg-[#1E293B] text-slate-200 shadow-sm' : 'bg-white shadow-sm text-slate-800') : 'text-slate-500'}`}>/d</button>
                          <button onClick={() => updateLabor(entry.id, 'volumePeriod', 'monthly')} className={`flex-1 text-[9px] rounded-lg transition-all font-bold ${entry.volumePeriod === 'monthly' ? (isDarkMode ? 'bg-[#1E293B] text-slate-200 shadow-sm' : 'bg-white shadow-sm text-slate-800') : 'text-slate-500'}`}>/mo</button>
                       </div>
                     </div>
                  </div>
                  <div>
                     <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center">Time per Task <Tooltip text='How long does it take this specific role to perform their part of the task?'><Info size={12} className="ml-1 cursor-help hover:text-blue-500"/></Tooltip></label>
                     <div className="flex space-x-2">
                        <div className="relative flex-1"><input type="number" min="0" value={entry.effortMinutes} onChange={(e) => handleLaborMinutesChange(entry.id, e.target.value)} placeholder="0" className={`${entry.effortMinutes !== '' && entry.effortMinutes < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-9 text-sm font-mono`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-[10px] pointer-events-none">MIN</span></div>
                        <div className="relative flex-1"><input type="number" min="0" step="0.01" value={entry.effortHours} onChange={(e) => handleLaborHoursChange(entry.id, e.target.value)} placeholder="0.0" className={`${entry.effortHours !== '' && entry.effortHours < 0 ? inputErrorStyle : inputStyle} py-2.5 pr-8 text-sm font-mono ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-[10px] pointer-events-none">HR</span></div>
                     </div>
                  </div>
                  <div>
                     <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Mapped LCR Rate</label>
                     <div className={`w-full px-4 py-2.5 text-sm font-mono font-bold rounded-xl border ${isDarkMode ? 'bg-blue-950/20 border-blue-900/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                        {formatCurrency(lcrRates[entry.cl] * results.currencyMultiplier)}<span className="text-[10px] text-blue-500/70 ml-1">/hr</span>
                     </div>
                  </div>
               </div>
            </div>
          ))}
          <button onClick={addLabor} className={`w-full py-3 flex items-center justify-center space-x-2 border-2 border-dashed rounded-[20px] text-sm font-bold transition-all ${isDarkMode ? 'border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-950/20' : 'border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'}`}>
             <Plus size={16} /><span>Add Resource Role</span>
          </button>
        </div>

        <div className={`border-t ${borderMuted} pt-5`}>
           <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-indigo-950/10 border-indigo-900/30' : 'bg-indigo-50/50 border-indigo-100'} shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]`}>
              <div className="text-xs font-bold text-indigo-500/80 uppercase tracking-widest flex items-center"><Calculator size={14} className="mr-2"/> Blended As-Is Snapshot</div>
              <div className="flex space-x-6 text-right">
                 <div><div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Executions</div><div className={`text-base font-extrabold ${textHeading} font-mono`}>{Math.round(results.totalEffectiveExecutions)} <span className="text-xs text-slate-400">/mo</span></div></div>
                 <div><div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Effort</div><div className={`text-base font-extrabold ${textHeading} font-mono`}>{Math.round(results.totalManualHoursMonthly)} <span className="text-xs text-slate-400">hrs/mo</span></div></div>
                 <div><div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Current Cost</div><div className={`text-base font-extrabold ${textHeading} font-mono`}>{formatCurrency(results.currentMonthlyCost)} <span className="text-xs text-slate-400">/mo</span></div></div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7 pt-4">
          {/* Duration */}
          <div>
            <label className={`flex items-center text-sm font-bold ${textMain} mb-2`}>Remaining Duration <Tooltip text='How many months will this automation run before the project ends or needs a rebuild?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label>
            <div className="relative"><div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${textSub}`}><Briefcase size={18} /></div><input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} placeholder="0" className={`${durationMonths !== '' && durationMonths < 0 ? inputErrorStyle : inputStyle} pl-10 pr-20 font-mono text-lg`} /><span className={`absolute inset-y-0 right-0 pr-4 flex items-center ${textSub} font-bold text-xs pointer-events-none`}>MONTHS</span></div>
          </div>

          {/* Percent Automated Slider */}
          <div className="pt-1">
            <div className="flex justify-between items-center mb-3">
              <label className={`flex items-center text-sm font-bold ${textMain}`}>Percentage Automated <Tooltip text='What percentage of the manual work is being completely eliminated by the bot?'><Info size={14} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label>
              <span className={`font-extrabold ${isDarkMode ? 'text-blue-400 bg-blue-950/50' : 'text-blue-700 bg-blue-100'} px-4 py-1.5 rounded-xl text-sm shadow-sm`}>{automationPercent}%</span>
            </div>
            <input type="range" aria-label="Percentage Automated" min="0" max="100" value={automationPercent} onChange={(e) => setAutomationPercent(e.target.value)} className={`w-full h-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30`} />
            <div className={`flex justify-between text-[10px] font-bold ${textSub} mt-2 px-1`}><span>0%</span><span>50%</span><span>100%</span></div>
          </div>
        </div>

        {/* Investment block */}
        <div className={`md:col-span-2 pt-5 border-t ${borderMuted} mt-2`}>
          <div className="flex items-center space-x-2 mb-4"><Wrench size={18} className="text-blue-500" /><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider`}>Investment & Ongoing Costs</h3></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* One-Time Build */}
            <div className={`${isDarkMode ? 'bg-[#0F172A] border-slate-700/80' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm flex flex-col justify-between`}>
              <div><label className={`flex items-center text-xs font-bold ${textMain} mb-1`}>One-Time Build <Tooltip text='Total upfront investment required (e.g., developer salaries).'><Info size={12} className={`${textSub} hover:text-blue-500 transition-colors cursor-help`}/></Tooltip></label><p className={`text-[10px] ${textSub} mb-3 leading-tight`}>Upfront investment cost.</p></div>
              <div className="relative"><div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><Coins size={14} /></div><input type="number" min="0" value={implementationCost} onChange={(e) => setImplementationCost(e.target.value)} placeholder="0" className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1E293B] border-slate-700 focus:bg-[#0F172A] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8 transition-colors`} /></div>
            </div>
            
            {/* Monthly Run Cost - Toggleable Advanced Mode */}
            <div className={`${isDarkMode ? (isAdvancedRunCost ? 'bg-indigo-950/20 border-indigo-900/40' : 'bg-slate-800/40 border-slate-700/80') : (isAdvancedRunCost ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-200')} p-4 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <label className={`flex items-center text-xs font-bold ${isAdvancedRunCost ? 'text-indigo-600 dark:text-indigo-400' : textMain} mb-1 transition-colors`}>
                    Monthly Run Cost
                    <Tooltip text='Base recurring costs (Product Licenses, cloud) and their projected Annual Percentage Increase.'><Info size={12} className={`${textSub} hover:text-indigo-500 transition-colors cursor-help ml-1`}/></Tooltip>
                  </label>
                  <p className={`text-[10px] ${textSub} mb-2 leading-tight`}>Recurring licenses/infra.</p>
                </div>
                <button onClick={() => { setIsAdvancedRunCost(!isAdvancedRunCost); if(!isAdvancedRunCost) setIsRunCostModalOpen(true); }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isAdvancedRunCost ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAdvancedRunCost ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {isAdvancedRunCost ? (
                 <div className="space-y-3">
                    <div>
                      <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>Blended Cost / Mo</label>
                      <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                        <input type="number" value={Number(results.uiRunCostY1).toFixed(2)} disabled placeholder="0" className={`w-full px-2 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl outline-none text-xs font-mono pl-7 transition-colors disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800`} />
                      </div>
                    </div>
                    <div className={`pt-2 border-t ${isDarkMode ? 'border-indigo-900/50' : 'border-indigo-200'} flex justify-between items-center`}>
                        <div className="flex items-center space-x-2">
                           <span className={`text-[10px] font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center`}><Check size={12} className="mr-1" /> Advanced Config Active</span>
                        </div>
                        <button onClick={() => setIsRunCostModalOpen(true)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                          Edit Advanced
                        </button>
                    </div>
                 </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative"><div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><Coins size={14} /></div><input type="number" min="0" value={monthlyRunCost} onChange={(e) => setMonthlyRunCost(e.target.value)} placeholder="0" className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8 transition-colors`} /></div>
                  <div><label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>YOY Inflation</label><div className="relative"><div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${textSub}`}><TrendingUp size={14} /></div><input type="number" min="0" value={runCostInflation} onChange={(e) => setRunCostInflation(e.target.value)} placeholder="0" className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8 pr-8 transition-colors`} /><span className={`absolute inset-y-0 right-0 pr-3 flex items-center ${textSub} font-bold text-xs`}>%</span></div></div>
                </div>
              )}
            </div>

            {/* SRE Configuration Card */}
            <div className={`${isDarkMode ? (hasSre ? 'bg-orange-950/20 border-orange-900/40' : 'bg-[#0F172A] border-slate-700') : (hasSre ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50 border-slate-200')} p-4 rounded-2xl border shadow-sm flex flex-col col-span-1 sm:col-span-2 transition-colors`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <label className={`flex items-center text-xs font-bold ${hasSre ? 'text-orange-600 dark:text-orange-400' : textMain} mb-1 transition-colors`}>
                    SRE / Maintenance Support
                    <Tooltip text='Factor in ongoing human support required to maintain this automation.'><Info size={12} className={`${textSub} hover:text-orange-500 transition-colors cursor-help ml-1`}/></Tooltip>
                  </label>
                  <p className={`text-[10px] ${textSub} leading-tight`}>Dedicated operational oversight.</p>
                </div>
                <button onClick={() => setHasSre(!hasSre)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${hasSre ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${hasSre ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {hasSre ? (
                 <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>Y1 Cost / Mo</label>
                        <div className="relative">
                          <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                          <input type="number" min="0" value={isAdvancedSre ? Number(results.uiSreY1).toFixed(2) : sreCostY1} onChange={(e) => !isAdvancedSre && setSreCostY1(e.target.value)} disabled={isAdvancedSre} placeholder="0" className={`w-full px-2 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl outline-none text-xs font-mono pl-7 transition-colors disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800`} />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold ${textSub} uppercase mb-1`}>Y2+ Cost / Mo</label>
                        <div className="relative">
                          <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${textSub}`}><Coins size={12} /></div>
                          <input type="number" min="0" value={isAdvancedSre ? Number(results.uiSreY2).toFixed(2) : sreCostY2} onChange={(e) => !isAdvancedSre && setSreCostY2(e.target.value)} disabled={isAdvancedSre} placeholder="0" className={`w-full px-2 py-2 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl outline-none text-xs font-mono pl-7 transition-colors disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800`} />
                        </div>
                      </div>
                    </div>

                    <div className={`pt-2 border-t ${isDarkMode ? 'border-orange-900/50' : 'border-orange-200'} flex justify-between items-center`}>
                        <div className="flex items-center space-x-2">
                           {isAdvancedSre ? (
                              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center`}><Check size={12} className="mr-1" /> Advanced Config Active</span>
                           ) : (
                              <span className={`text-[10px] font-medium ${textSub}`}>Manual entry active</span>
                           )}
                        </div>
                        <button onClick={() => setIsSreModalOpen(true)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors ${isAdvancedSre ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                          {isAdvancedSre ? 'Edit Advanced' : 'Switch to Advanced'}
                        </button>
                    </div>
                 </div>
              ) : (
                <div className={`mt-auto pt-3 border-t ${borderMuted} flex items-center justify-center text-[10px] font-bold ${textSub} uppercase tracking-wider`}>No SRE Configured</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultsPanel() {
  const { isDarkMode, textHeading, scenario, setScenario, showScore, setShowScore, results, durationMonths, formatCurrency } = useApp();

  return (
    <>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDarkMode ? 'bg-[#1E293B] border-slate-700/60' : 'bg-white border-slate-200/60'} p-2 pl-5 rounded-3xl border shadow-sm`}>
        <h3 className={`text-sm font-bold ${textHeading} flex items-center`}><Activity size={16} className="mr-2 text-blue-500" /> Forecast Scenario</h3>
        <div className={`flex ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} p-1 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] w-full sm:w-auto`}>
          <button onClick={() => setScenario('optimistic')} className={`flex-1 sm:flex-none px-4 py-2 text-xs rounded-xl transition-all font-bold ${scenario === 'optimistic' ? (isDarkMode ? 'bg-[#1E293B] text-emerald-400 shadow-sm' : 'bg-white shadow-sm text-emerald-600') : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Optimistic</button>
          <button onClick={() => setScenario('realistic')} className={`flex-1 sm:flex-none px-4 py-2 text-xs rounded-xl transition-all font-bold ${scenario === 'realistic' ? (isDarkMode ? 'bg-[#1E293B] text-blue-400 shadow-sm' : 'bg-white shadow-sm text-blue-600') : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Realistic</button>
          <button onClick={() => setScenario('conservative')} className={`flex-1 sm:flex-none px-4 py-2 text-xs rounded-xl transition-all font-bold ${scenario === 'conservative' ? (isDarkMode ? 'bg-[#1E293B] text-amber-400 shadow-sm' : 'bg-white shadow-sm text-amber-600') : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Conservative</button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] rounded-[28px] shadow-xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-[0.08] rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-purple-500 opacity-[0.1] rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-6 right-6 opacity-5 pointer-events-none"><TrendingUp size={160} /></div>
        
        <div className="relative z-10 border-b border-white/10 pb-5 mb-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowScore(!showScore)} className="text-blue-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl" title={showScore ? "Hide Score" : "Show Score"}>{showScore ? <Eye size={18} /> : <EyeOff size={18} />}</button>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Viability Score</span>
          </div>
          {showScore ? (
            <div className="flex items-center space-x-3">
              <span className={`text-[11px] font-black uppercase tracking-widest ${results.scoreColor}`}>{results.scoreLabel}</span>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl text-lg font-black text-white border border-white/10 shadow-sm flex items-baseline space-x-1"><span>{results.automationScore}</span><span className="text-[10px] text-blue-400 font-bold uppercase">/ 100</span></div>
            </div>
          ) : (<div className="text-[11px] font-bold uppercase tracking-widest text-blue-400/50">Score Hidden</div>)}
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <Tooltip text="Net Savings = (Gross Monthly Save × Duration) - Total Dynamic Run/SRE Costs - Implementation Cost"><span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-100 border border-white/10 shadow-sm flex items-center cursor-help">Est. Lifetime Net Savings <Info size={14} className="ml-1.5 opacity-70 cursor-help" /></span></Tooltip>
            <span className="text-blue-200 text-sm font-semibold flex items-center"><Clock size={14} className="mr-1.5 opacity-70"/> {Number(durationMonths) || 0} Mo Project</span>
          </div>
          <div className={`text-[3.5rem] leading-none xl:text-7xl font-extrabold tracking-tighter mt-6 mb-10 drop-shadow-2xl ${results.netSavings < 0 ? 'text-red-400' : 'text-white'}`}>{formatCurrency(results.netSavings)}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
          <div><Tooltip text="Average Monthly Net Savings (factors in strict month-by-month run cost inflation and variable SRE costs)."><p className="text-blue-300 text-xs mb-1.5 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Avg Net Monthly <Info size={12} className="ml-1 opacity-70 cursor-help"/></p></Tooltip><p className="text-2xl font-bold tracking-tight text-white">{formatCurrency(results.avgNetMonthlySave)}</p></div>
          <div><Tooltip text="Implementation Cost + Total Lifetime Run Costs + Total Lifetime SRE Costs"><p className="text-blue-300 text-xs mb-1.5 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Total Investment <Info size={12} className="ml-1 opacity-70 cursor-help"/></p></Tooltip><p className="text-2xl font-bold tracking-tight text-white">{formatCurrency(results.totalInvestment)}</p></div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
            <Tooltip text="(Net Savings / Total Investment) × 100"><p className="text-blue-300/80 text-xs mb-1 uppercase tracking-wider font-bold flex items-center cursor-help w-max">ROI <Info size={12} className="ml-1 opacity-70 cursor-help"/></p></Tooltip>
            <p className={`text-2xl font-extrabold tracking-tight ${results.roi < 0 ? 'text-red-400' : results.roi >= 100 ? 'text-[#34D399]' : 'text-white'}`}>{results.roi === Infinity ? '∞' : `${Math.round(results.roi).toLocaleString()}%`}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
            <Tooltip text="Exact month where cumulative savings exceeds cumulative implementation, run, and maintenance costs."><p className="text-blue-300/80 text-xs mb-1 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Payback Period <Info size={12} className="ml-1 opacity-70 cursor-help"/></p></Tooltip>
            <p className="text-2xl font-extrabold tracking-tight text-white">{results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod === 0 ? 'Immediate' : `${results.paybackPeriod.toFixed(1)} mo`}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function CurrentVsFuturePanel() {
  const { cardStyle, textHeading, isDarkMode, borderMuted, textSub, textMain, formatCurrency, results, challenges, kpis, qualitativeBenefits, toolName, isGeneratingInsights, generateROIInsights, roiInsights, hasSre, sreUseCase } = useApp();

  return (
    <div className={`${cardStyle} flex flex-col`}>
      <div className="p-6 md:p-8 flex-1">
        <h3 className={`text-base font-bold ${textHeading} mb-6 flex items-center`}><ArrowRightLeft size={18} className="mr-2 text-blue-500"/> Current vs. Future State</h3>
        <div className="space-y-6">
          <div className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'} p-5 rounded-[20px] border ${borderMuted} shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]`}>
            <div className={`text-[11px] font-extrabold ${textSub} uppercase tracking-widest mb-4`}>Current State (As-Is)</div>
            <div className="flex justify-between items-start mb-4">
              <div><div className={`text-[11px] font-bold ${textSub} uppercase mb-1`}>Monthly Labor Cost</div><div className={`text-xl font-extrabold ${textHeading} tracking-tight`}>{formatCurrency(results.currentMonthlyCost)}</div></div>
              <div className="text-right"><div className={`text-[11px] font-bold ${textSub} uppercase mb-1`}>Manual Effort</div><div className={`text-xl font-extrabold ${textHeading} tracking-tight`}>{new Intl.NumberFormat().format(Math.round(results.totalManualHoursMonthly))} <span className={`text-sm font-medium ${textSub}`}>hrs/mo</span></div><div className={`text-xs font-semibold ${textSub} mt-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200/50'} inline-block px-2 py-0.5 rounded-md`}>({results.currentFte.toFixed(1)} FTEs)</div></div>
            </div>
            {challenges && (<div className={`border-t ${borderMuted} pt-3`}><div className="text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center"><Activity size={12} className="mr-1.5" /> Existing Challenges</div><p className={`text-xs ${textMain} leading-relaxed whitespace-pre-wrap font-medium`}>{challenges}</p></div>)}
          </div>

          <div className={`${isDarkMode ? 'bg-blue-950/20 border-blue-900/40' : 'bg-blue-50/50 border-blue-100/60'} p-5 rounded-[20px] border shadow-[inset_0_1px_3px_rgba(59,130,246,0.05)]`}>
            <div className="text-[11px] font-extrabold text-blue-500 uppercase tracking-widest mb-4 flex items-center"><Sparkles size={14} className="mr-1.5"/> Future State (To-Be)</div>
            <div className="flex justify-between items-start mb-4">
              <div><Tooltip text="Average future monthly cost (Remaining manual labor + Average run cost + Average SRE cost)."><div className="text-[11px] font-bold text-blue-400 uppercase mb-1 flex items-center cursor-help">Avg Total Cost/Mo <Info size={10} className="ml-1 opacity-80 cursor-help" /></div></Tooltip><div className={`text-xl font-extrabold ${isDarkMode ? 'text-blue-100' : 'text-blue-900'} tracking-tight`}>{formatCurrency(results.futureMonthlyCostAvg)}</div></div>
              <div className="text-right"><div className="text-[11px] font-bold text-blue-400 uppercase mb-1">Residual Effort</div><div className={`text-xl font-extrabold ${isDarkMode ? 'text-blue-100' : 'text-blue-900'} tracking-tight`}>{new Intl.NumberFormat().format(Math.round(results.remainingManualHoursMonthly))} <span className="text-sm font-medium text-blue-500">hrs/mo</span></div><div className={`text-xs font-semibold text-blue-500 mt-1 ${isDarkMode ? 'bg-blue-950/50' : 'bg-blue-100/50'} inline-block px-2 py-0.5 rounded-md`}>({results.toBeFte.toFixed(1)} FTEs)</div></div>
            </div>
            {(kpis || qualitativeBenefits || toolName || (hasSre && sreUseCase)) && (
              <div className={`border-t ${isDarkMode ? 'border-blue-900/40' : 'border-blue-100'} pt-3 space-y-3`}>
                {kpis && (<div><div className="text-[10px] font-bold text-purple-500 uppercase mb-1 flex items-center"><BarChart3 size={12} className="mr-1.5" /> Target KPIs</div><p className={`text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} leading-relaxed whitespace-pre-wrap font-medium`}>{kpis}</p></div>)}
                {qualitativeBenefits && (<div><div className="text-[10px] font-bold text-emerald-500 uppercase mb-1 flex items-center"><Award size={12} className="mr-1.5" /> Strategic Benefits</div><p className={`text-xs ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'} leading-relaxed whitespace-pre-wrap font-medium`}>{qualitativeBenefits}</p></div>)}
                {toolName && (<div><div className="text-[10px] font-bold text-blue-500 uppercase mb-1 flex items-center"><Cpu size={12} className="mr-1.5" /> Automation Solution</div><p className={`text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} leading-relaxed whitespace-pre-wrap font-medium`}>{toolName}</p></div>)}
                {hasSre && sreUseCase && (<div><div className="text-[10px] font-bold text-orange-500 uppercase mb-1 flex items-center"><ShieldCheck size={12} className="mr-1.5" /> SRE / Maintenance Benefits</div><p className={`text-xs ${isDarkMode ? 'text-orange-200' : 'text-orange-800'} leading-relaxed whitespace-pre-wrap font-medium`}>{sreUseCase}</p></div>)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8 pt-0 mt-auto">
        <div className={`border-t ${borderMuted} pt-5`}>
          <button onClick={generateROIInsights} disabled={isGeneratingInsights} className={`w-full flex items-center justify-center space-x-2 text-sm font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm border ${isDarkMode ? 'bg-blue-950/30 hover:bg-blue-900/50 text-blue-400 border-blue-900/50' : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-100'}`}>{isGeneratingInsights ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-amber-500" />}<span>{roiInsights ? 'Regenerate Strategy' : 'Get AI Strategy Insights'}</span></button>
          {roiInsights && (<div className={`mt-4 ${isDarkMode ? 'bg-indigo-950/20 border-indigo-900/30 text-indigo-200' : 'bg-indigo-50/80 border-indigo-100/50 text-indigo-900'} p-5 rounded-2xl text-sm font-medium leading-relaxed border overflow-y-auto max-h-40 shadow-inner custom-scrollbar whitespace-pre-wrap`}>{roiInsights}</div>)}
        </div>
      </div>
    </div>
  );
}

function OperationalImpactPanel() {
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

function PitchPanel() {
  const { toolName, useCase, aiPitch, handleCopy, copied, isGenerating, generateAIPitch, setAiPitch, challenges, kpis, qualitativeBenefits, formatCurrency, implementationCost, durationMonths, results, automationPercent } = useApp();
  return (
    <div className="bg-slate-900 rounded-[28px] shadow-xl text-slate-100 p-6 md:p-8 flex flex-col h-auto relative overflow-hidden border border-slate-800">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 opacity-5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 relative z-10">
        <div className="flex items-center space-x-3"><div className="p-2.5 bg-slate-800 rounded-[14px] text-slate-300 border border-slate-700/50"><FileText size={20} /></div><h3 className="text-lg font-bold text-white tracking-tight">Business Case Pitch</h3></div>
        {(toolName || useCase || aiPitch) && (<button onClick={handleCopy} className="flex items-center space-x-2 text-sm font-bold bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-2xl transition-all shadow-sm">{copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}<span>{copied ? 'Copied!' : 'Copy Pitch'}</span></button>)}
      </div>
      <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl mb-6 gap-3 border border-slate-700/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center space-x-2 pl-2"><Sparkles size={16} className="text-amber-400 flex-shrink-0" /><span className="text-sm font-semibold text-slate-200">General Business Case Pitch</span></div>
        <div className="flex items-center space-x-3">
          <button onClick={generateAIPitch} disabled={isGenerating || (!toolName && !useCase)} className="flex items-center justify-center space-x-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-5 py-2 rounded-xl transition-all font-bold shadow-sm">{isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}<span>{isGenerating ? 'Drafting...' : (aiPitch ? 'Regenerate AI' : 'Generate with AI')}</span></button>
          {aiPitch && !isGenerating && (<button onClick={() => setAiPitch('')} className="text-xs font-bold text-slate-400 hover:text-white underline px-2">Reset</button>)}
        </div>
      </div>
      <div className="bg-slate-950/40 rounded-2xl p-6 border border-white/5 relative z-10 flex-1">
        <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          {isGenerating ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><Loader2 size={36} className="animate-spin mb-4 text-blue-500" /><p className="animate-pulse font-medium">Crafting your perfect pitch...</p></div>) 
          : aiPitch ? (<div className="whitespace-pre-wrap text-[15px]">{aiPitch}</div>) 
          : toolName || useCase ? (
            <>
              <p className="mb-4 text-[15px]">By implementing <strong className="text-white">{toolName || "the proposed automation"}</strong> {useCase && ` to ${useCase}`}, we anticipate automating <strong className="text-blue-400">{automationPercent}%</strong> of the targeted workload. Currently, this task involves {Math.round(results.totalEffectiveExecutions).toLocaleString()} blended executions per month.</p>
              {(challenges || kpis || qualitativeBenefits) && (
                <><p className="mb-2 text-[15px] font-bold text-white">Strategic Value & Pain Points Addressed:</p><div className="mb-4 text-[15px] pl-2 border-l-2 border-slate-700">{challenges && <p className="mb-2"><strong className="text-blue-300">Challenges:</strong><br/><span className="whitespace-pre-wrap">{challenges}</span></p>}{kpis && <p className="mb-2"><strong className="text-purple-300">Target KPIs:</strong><br/><span className="whitespace-pre-wrap">{kpis}</span></p>}{qualitativeBenefits && <p className="mb-2"><strong className="text-emerald-300">Expected Benefits:</strong><br/><span className="whitespace-pre-wrap">{qualitativeBenefits}</span></p>}</div></>
              )}
              <p className="mb-4 text-[15px]">Financially, this requires an initial investment of {formatCurrency(implementationCost)}. Over the {Number(durationMonths) || 0}-month lifecycle, total maintenance and inflated run costs are projected at {formatCurrency(results.totalRunCost + results.totalSreCost)}. The automation yields a gross labor cost avoidance of <strong className="text-emerald-400">{formatCurrency(results.grossMonthlySave)} per month</strong>. After factoring in these dynamic operational costs, this amounts to a <strong>Lifetime Net Savings of <span className="text-emerald-400">{formatCurrency(results.netSavings)}</span></strong>. The precise payback period is <strong>{results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod.toFixed(1) + ' months'}</strong>, delivering an ROI of <strong>{results.roi === Infinity ? 'Infinite' : `${Math.round(results.roi)}%`}</strong>.</p>
              <p className="text-[15px]">Operationally, the automation recaptures {Math.round(results.hoursSavedTotal).toLocaleString()} resource hours over the project life. This represents an ongoing monthly savings of <strong className="text-indigo-300">{results.fteSavings.toFixed(1)} FTEs</strong> (Full-Time Equivalents) that can be redirected toward higher-value, strategic initiatives.</p>
            </>
          ) : (<div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12"><div className="bg-slate-800 p-4 rounded-full mb-4 opacity-50"><Cpu size={40} /></div><p className="font-medium text-lg text-slate-400">Ready to draft your business case.</p><p className="text-sm mt-1">Enter details above to begin.</p></div>)}
        </div>
      </div>
    </div>
  );
}

function MethodologyPanel() {
  const { cardStyle, isHowItWorksOpen, setIsHowItWorksOpen, isDarkMode, textSub, textHeading, borderMuted, results } = useApp();
  return (
    <div className={`${cardStyle} mt-6 mb-12`}>
      <button onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)} aria-expanded={isHowItWorksOpen} className={`w-full p-6 md:p-8 flex items-center justify-between ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-colors text-left outline-none rounded-[28px]`}>
        <div className="flex items-center space-x-4"><div className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} p-3 rounded-2xl ${textSub}`}><HelpCircle size={24} /></div><div><h2 className={`text-lg font-extrabold ${textHeading} tracking-tight`}>Methodology & AI Details</h2><p className={`text-sm ${textSub} font-medium`}>How these numbers are calculated</p></div></div>
        <div className={`transform transition-transform duration-300 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} p-2 rounded-full ${isHowItWorksOpen ? 'rotate-180' : ''}`}><ChevronDown size={20} className={textSub} /></div>
      </button>
      <div aria-hidden={!isHowItWorksOpen} className={`transition-all duration-300 ease-in-out ${isHowItWorksOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className={`p-6 md:p-8 pt-0 border-t ${borderMuted}`} tabIndex={isHowItWorksOpen ? 0 : -1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-6">
              <div><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Month-By-Month Engine</h3><p className={`text-sm ${textSub} leading-relaxed font-medium`}>This calculator doesn't just multiply static numbers. It loops through every month of the project's duration to accurately compound <strong>Run Cost Inflation</strong> and dynamically switch between <strong>Y1 vs Y2+ SRE/Maintenance costs</strong>. This guarantees a mathematically precise Payback Period and ROI.</p></div>
              <div><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Net Savings</h3><p className={`text-sm ${textSub} leading-relaxed font-medium`}>The actual financial gain. Projects the gross savings over the lifetime of the project and subtracts the initial implementation cost, the inflating monthly run costs, and the variable monthly maintenance costs.</p></div>
              <div>
                <h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Automation Score Algorithm</h3>
                <p className={`text-sm ${textSub} leading-relaxed font-medium`}>A quick heuristic score out of 100 to determine investment viability. It evaluates three key pillars:</p>
                <ul className={`list-disc pl-5 mt-2 text-sm ${textSub} leading-relaxed font-medium space-y-1`}>
                  <li><strong>ROI (40 pts):</strong> &ge;200% (40), &ge;100% (30), &ge;50% (20), &gt;0% (10)</li>
                  <li><strong>Payback Period (40 pts):</strong> &le;6 mo (40), &le;12 mo (30), &le;24 mo (20), &le;36 mo (10)</li>
                  <li><strong>FTE Savings (20 pts):</strong> &ge;2 FTEs (20), &ge;1 FTE (15), &ge;0.5 FTE (10), &gt;0 FTE (5)</li>
                </ul>
                <p className={`text-sm ${textSub} leading-relaxed font-medium mt-2`}>Scores over 80 are considered strong investments.</p>
              </div>
              <div><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Scenario Modeling</h3><p className={`text-sm ${textSub} leading-relaxed font-medium`}>The <strong>Forecast Scenario</strong> toggle stress-tests your business case. <em>Realistic</em> uses your exact inputs. <em>Conservative</em> inflates all implementation and run costs by 25% while shrinking the expected automation yield by 25% (simulating delays/complexity). <em>Optimistic</em> reduces costs by 10% and boosts automation yield by 10%.</p></div>
            </div>
            <div className="space-y-6">
              <div><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>SRE / Maintenance Ramp-Down</h3><p className={`text-sm ${textSub} leading-relaxed font-medium`}>Complex automations usually require heavier support when they are first launched, which tapers off as the system stabilizes. The advanced cost settings allow you to accurately forecast this ramp-down.</p></div>
              <div><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>FTE Savings</h3><p className={`text-sm ${textSub} leading-relaxed font-medium`}>FTE stands for "Full-Time Equivalent". In this tool, an FTE is calculated based on your configured Working Days per Month and Hours per Day (currently <strong>{results.fteHoursPerMonth} hours/month</strong>). If your automation saves this amount of hours, it is effectively doing the work of 1 full-time employee.</p></div>
              <div><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Return on Investment (ROI)</h3><p className={`text-sm ${textSub} leading-relaxed font-medium`}>Measures profitability. An ROI of 100% means the automation paid for its total investment and generated that same amount in pure savings.</p></div>
              <div><h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Live Currency Conversion</h3><p className={`text-sm ${textSub} leading-relaxed font-medium`}>Currency switching automatically recalculates all monetary inputs and results using real-time exchange rates fetched securely from <strong>api.frankfurter.app</strong> (updated every working day). A small green dot on the currency selector indicates live rates are active. If you are offline, it seamlessly falls back to standard default rates.</p></div>
              <div className={`${isDarkMode ? 'bg-blue-950/20 border-blue-900/30' : 'bg-blue-50/80 border-blue-100'} border rounded-2xl p-6 mt-4`}>
                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-900'} uppercase tracking-wider mb-2 flex items-center`}><Settings size={16} className={`mr-2 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} /> What AI powers these insights?</h3>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} leading-relaxed font-medium`}>By default, this calculator securely integrates <strong>Pollinations.ai</strong> for free, seamless text generation. You can click the <strong className={`inline-flex items-center ${isDarkMode ? 'text-blue-300 bg-blue-950/50 border border-blue-900' : 'text-blue-900 bg-white shadow-sm'} px-2 py-0.5 rounded mx-1 hover:opacity-80 transition-colors`}><Settings size={12} className="mr-1"/> Settings</strong> button at the top to optionally switch to other high-quality models using your own API keys.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
