import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Briefcase, 
  Target, 
  FileText, 
  Cpu, 
  Activity,
  Award,
  Users,
  Copy,
  Check, 
  BarChart3, 
  HelpCircle, 
  Info, 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  Settings, 
  X, 
  ExternalLink, 
  ArrowRightLeft,
  Coins,
  Wrench,
  Download,
  Presentation,
  Eye,
  EyeOff
} from 'lucide-react';

// --- Global Constants & Configurations ---
const HOURS_PER_FTE_MONTH = 160;

const providerOptions = {
  'pollinations': { name: 'Pollinations.ai', models: ['openai', 'mistral', 'llama'], url: null, needsKey: false },
  'groq': { name: 'Groq', models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'], url: 'https://console.groq.com/keys', needsKey: true },
  'openrouter': { name: 'OpenRouter Free', models: ['meta-llama/llama-3-8b-instruct:free', 'google/gemini-2.5-flash:free'], url: 'https://openrouter.ai/keys', needsKey: true }
};

// --- Script Loader Utility with Promise Caching ---
const loadingPromises = {};
const loadScript = (src, globalName) => {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  if (loadingPromises[src]) return loadingPromises[src];
  
  loadingPromises[src] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(window[globalName]);
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
  return loadingPromises[src];
};

// --- Custom Tooltip Component ---
const Tooltip = ({ text, children }) => (
  <div className="relative flex items-center group ml-1.5 z-50">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[240px] p-2.5 bg-slate-800 text-white text-[12px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[100] text-center shadow-xl leading-relaxed scale-95 group-hover:scale-100 origin-bottom">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

export default function App() {
  // --- Qualitative State ---
  const [toolName, setToolName] = useState('');
  const [useCase, setUseCase] = useState('');
  const [challenges, setChallenges] = useState('');
  const [qualitativeBenefits, setQualitativeBenefits] = useState('');
  const [kpis, setKpis] = useState('');

  // --- Quantitative State ---
  const [executionsPerMonth, setExecutionsPerMonth] = useState('');
  const [volumePeriod, setVolumePeriod] = useState('monthly');
  const [workingDays, setWorkingDays] = useState(22);
  const [effortHours, setEffortHours] = useState(''); 
  const [resourceCost, setResourceCost] = useState('');
  const [automationPercent, setAutomationPercent] = useState(0);
  const [durationMonths, setDurationMonths] = useState('');
  
  // Base Costs
  const [implementationCost, setImplementationCost] = useState('');
  const [monthlyRunCost, setMonthlyRunCost] = useState(''); 
  
  // Advanced Ongoing Costs
  const [runCostInflation, setRunCostInflation] = useState(''); 
  const [sreCostY1, setSreCostY1] = useState(''); 
  const [sreCostY2, setSreCostY2] = useState(''); 

  const [currency, setCurrency] = useState('USD');
  const [scenario, setScenario] = useState('realistic');

  // --- Live Exchange Rates State ---
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, PHP: 56.5, EUR: 0.92, JPY: 150.5 });
  const [ratesStatus, setRatesStatus] = useState('loading'); // 'loading', 'live', 'fallback'

  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates) {
          setExchangeRates({
            USD: 1,
            PHP: data.rates.PHP || 56.5,
            EUR: data.rates.EUR || 0.92,
            JPY: data.rates.JPY || 150.5
          });
          setRatesStatus('live');
        } else {
          setRatesStatus('fallback');
        }
      } catch (error) {
        console.warn('Failed to fetch live exchange rates. Using fallback rates.', error);
        setRatesStatus('fallback');
      }
    };
    fetchLiveRates();
  }, []);

  const currencyConfig = {
    USD: { locale: 'en-US', code: 'USD' },
    PHP: { locale: 'en-PH', code: 'PHP' },
    EUR: { locale: 'de-DE', code: 'EUR' },
    JPY: { locale: 'ja-JP', code: 'JPY' }
  };

  // --- UI State ---
  const [copied, setCopied] = useState(false);
  const [aiPitch, setAiPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [roiInsights, setRoiInsights] = useState('');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [showScore, setShowScore] = useState(true);
  
  // Export states
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);

  // Ready state logic to enable/disable exports
  const isReadyToExport = !!(
    toolName.trim() && 
    useCase.trim() && 
    Number(executionsPerMonth) > 0 && 
    Number(durationMonths) > 0 &&
    Number(resourceCost) > 0 &&
    Number(effortHours) > 0
  );

  // --- AI Config State ---
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState('pollinations');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState(providerOptions['pollinations'].models[0]);

  const handleProviderChange = (e) => {
    const newProv = e.target.value;
    setAiProvider(newProv);
    setAiModel(providerOptions[newProv].models[0]);
  };

  const handleCurrencyChange = (newCurrency) => {
    if (newCurrency === currency) return;
    const multiplier = exchangeRates[newCurrency] / exchangeRates[currency];
    
    // Safely recalculate avoiding turning empty inputs into "0" strings abruptly
    setResourceCost(prev => prev === '' ? '' : Number((prev * multiplier).toFixed(2)));
    setImplementationCost(prev => prev === '' ? '' : Number((prev * multiplier).toFixed(0)));
    setMonthlyRunCost(prev => prev === '' ? '' : Number((prev * multiplier).toFixed(2)));
    setSreCostY1(prev => prev === '' ? '' : Number((prev * multiplier).toFixed(2)));
    setSreCostY2(prev => prev === '' ? '' : Number((prev * multiplier).toFixed(2)));
    setCurrency(newCurrency);
  };

  // --- Complex Month-by-Month Calculations ---
  const results = useMemo(() => {
    const exactEffort = Math.max(0, Number(effortHours));
    const rawExecutions = Math.max(0, Number(executionsPerMonth));
    const effectiveExecutions = volumePeriod === 'daily' ? rawExecutions * Math.max(1, Number(workingDays)) : rawExecutions;
    const cost = Math.max(0, Number(resourceCost));
    const months = Math.max(0, Number(durationMonths));

    const scenarioConfig = {
      optimistic: { benefit: 1.1, cost: 0.9 },
      realistic: { benefit: 1.0, cost: 1.0 },
      conservative: { benefit: 0.75, cost: 1.25 }
    };
    const sc = scenarioConfig[scenario];

    const autoRatio = Math.max(0, Math.min(100, Number(automationPercent) * sc.benefit)) / 100;
    const implCost = Math.max(0, Number(implementationCost)) * sc.cost;
    
    const baseRunCost = Math.max(0, Number(monthlyRunCost)) * sc.cost;
    const inflationRate = Math.max(0, Number(runCostInflation)) / 100;
    const sreY1 = Math.max(0, Number(sreCostY1)) * sc.cost;
    const sreY2 = Math.max(0, Number(sreCostY2)) * sc.cost;

    const hoursMonthlyCurrent = effectiveExecutions * exactEffort;
    const hoursMonthlySaved = hoursMonthlyCurrent * autoRatio;
    const hoursSavedTotal = hoursMonthlySaved * months;
    
    const currentMonthlyCost = hoursMonthlyCurrent * cost;
    const grossMonthlySave = hoursMonthlySaved * cost;
    
    let totalRunCost = 0;
    let totalSreCost = 0;
    let totalGrossSave = 0;
    
    let cumulativeNet = -implCost;
    let paybackMonth = Infinity;
    
    const monthlyData = [];

    // Month 0
    monthlyData.push({ month: 0, year: 0, implementationCost: implCost, runCost: 0, sreCost: 0, grossSavings: 0, netCashFlow: -implCost, cumulativeNet: cumulativeNet });

    for (let m = 1; m <= months; m++) {
      let currentYear = Math.ceil(m / 12);
      let currentRunCost = baseRunCost * Math.pow(1 + inflationRate, currentYear - 1);
      let currentSreCost = currentYear === 1 ? sreY1 : sreY2;
      
      totalRunCost += currentRunCost;
      totalSreCost += currentSreCost;
      totalGrossSave += grossMonthlySave;

      let monthlyNet = grossMonthlySave - currentRunCost - currentSreCost;
      cumulativeNet += monthlyNet;

      monthlyData.push({ month: m, year: currentYear, implementationCost: 0, runCost: currentRunCost, sreCost: currentSreCost, grossSavings: grossMonthlySave, netCashFlow: monthlyNet, cumulativeNet: cumulativeNet });

      if (paybackMonth === Infinity && cumulativeNet >= 0) {
        let remainder = cumulativeNet;
        // Fix fractional math: if monthlyNet is 0, avoid NaN
        let fraction = monthlyNet === 0 ? 0 : 1 - (remainder / monthlyNet);
        paybackMonth = m - 1 + fraction;
      }
    }

    if (paybackMonth === Infinity && months === 0 && implCost === 0) paybackMonth = 0;

    const totalInvestment = implCost + totalRunCost + totalSreCost;
    const netSave = totalGrossSave - totalInvestment;
    const roi = totalInvestment > 0 ? (netSave / totalInvestment) * 100 : (netSave > 0 ? Infinity : 0);
    
    const avgNetMonthlySave = months > 0 ? (totalGrossSave - totalRunCost - totalSreCost) / months : 0;
    const futureMonthlyCostAvg = (currentMonthlyCost - grossMonthlySave) + (months > 0 ? (totalRunCost + totalSreCost) / months : 0);
    const fteSavings = hoursMonthlySaved / HOURS_PER_FTE_MONTH;

    // --- Calculate Automation Score (0-100) ---
    let score = 0;
    
    // 1. ROI Contribution (Up to 40 points)
    if (roi >= 200) score += 40;
    else if (roi >= 100) score += 30;
    else if (roi >= 50) score += 20;
    else if (roi > 0) score += 10;
    
    // 2. Payback Period Contribution (Up to 40 points)
    if (paybackMonth <= 6) score += 40;
    else if (paybackMonth <= 12) score += 30;
    else if (paybackMonth <= 24) score += 20;
    else if (paybackMonth <= 36) score += 10;
    
    // 3. FTE Savings Contribution (Up to 20 points)
    if (fteSavings >= 2) score += 20;
    else if (fteSavings >= 1) score += 15;
    else if (fteSavings >= 0.5) score += 10;
    else if (fteSavings > 0) score += 5;

    // Cap & Floor
    score = Math.min(100, Math.max(0, score));
    if (netSave <= 0) score = 0; // Negative ROI zeros out score

    let scoreLabel = "";
    let scoreColor = "";
    if (score >= 80) { scoreLabel = "Strong Investment"; scoreColor = "text-emerald-400"; }
    else if (score >= 60) { scoreLabel = "Good Investment"; scoreColor = "text-blue-400"; }
    else if (score >= 40) { scoreLabel = "Marginal Return"; scoreColor = "text-amber-400"; }
    else { scoreLabel = "High Risk / Reject"; scoreColor = "text-red-400"; }

    return {
      effectiveExecutions,
      currentMonthlyCost,
      futureMonthlyCostAvg,
      grossMonthlySave,
      avgNetMonthlySave,
      totalGrossSavings: totalGrossSave,
      totalInvestment,
      totalRunCost,
      totalSreCost,
      netSavings: netSave,
      roi,
      paybackPeriod: paybackMonth,
      hoursSavedMonthly: hoursMonthlySaved,
      hoursSavedTotal: hoursSavedTotal,
      fteSavings,
      currentFte: hoursMonthlyCurrent / HOURS_PER_FTE_MONTH,
      toBeFte: Math.max(0, hoursMonthlyCurrent - hoursMonthlySaved) / HOURS_PER_FTE_MONTH,
      totalManualHoursMonthly: hoursMonthlyCurrent,
      remainingManualHoursMonthly: Math.max(0, hoursMonthlyCurrent - hoursMonthlySaved),
      monthlyData,
      automationScore: score,
      scoreLabel,
      scoreColor
    };
  }, [executionsPerMonth, effortHours, resourceCost, automationPercent, durationMonths, implementationCost, monthlyRunCost, runCostInflation, sreCostY1, sreCostY2, volumePeriod, workingDays, scenario]);

  const formatCurrency = (value) => {
    const config = currencyConfig[currency];
    return new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.code, maximumFractionDigits: 0 }).format(value);
  };

  const handleMinutesChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setEffortHours('');
    } else {
      const mins = Math.max(0, Number(val));
      setEffortHours(mins / 60);
    }
  };

  // --- External Exports ---
  const handleExportXLSX = async () => {
    if (!isReadyToExport) return;
    setIsExportingXLSX(true);
    try {
      const XLSX = await loadScript('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js', 'XLSX');
      const wb = XLSX.utils.book_new();
      const scenarioLabel = scenario.charAt(0).toUpperCase() + scenario.slice(1);

      const ws_data = [
        ["", "", "", "", `Quantitative Benefits (${scenarioLabel} Forecast)`, "", "", "", "", ""],
        [
          "Tool", 
          "Use Case Description", 
          "Challenges Addressed", 
          "Qualitative Benefits", 
          "# of executions per month", 
          "average effort per execution in hours", 
          "average resource cost per hour", 
          "% of task automated", 
          "remaining contract/project duration in months", 
          "Cost Benefit"
        ],
        [
          toolName || 'N/A',
          useCase || 'N/A',
          challenges || 'N/A',
          qualitativeBenefits || 'N/A',
          results.effectiveExecutions,
          Number(effortHours).toFixed(2),
          formatCurrency(resourceCost),
          `${automationPercent}%`,
          durationMonths,
          formatCurrency(results.netSavings)
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      ws['!merges'] = [{ s: { r: 0, c: 4 }, e: { r: 0, c: 9 } }];

      const headerStyle = {
        fill: { fgColor: { rgb: "1E40AF" } }, 
        font: { color: { rgb: "FFFFFF" }, bold: true },
        alignment: { wrapText: true, vertical: "center", horizontal: "center" }
      };

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
      XLSX.writeFile(wb, "Automation Savings.xlsx");
    } catch (e) {
      console.error(e);
      alert("Failed to generate Excel file.");
    }
    setIsExportingXLSX(false);
  };

  const handleExportPPTX = async () => {
    if (!isReadyToExport) return;
    setIsExportingPPTX(true);
    try {
      // Switched to stable npm CDNs instead of Github CDN for JSZip and PptxGenJS
      await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', 'JSZip');
      const pptxgen = window.pptxgen || await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js', 'PptxGenJS');
      
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE';
      const slide = pptx.addSlide();

      const brandColor = '1E3A8A';
      const scenarioLabel = scenario.charAt(0).toUpperCase() + scenario.slice(1);

      slide.addText(`${toolName || 'Proposed Automation'} Business Case`, { x: 0.5, y: 0.5, w: 12, h: 0.8, fontSize: 32, bold: true, color: brandColor });
      slide.addText(`Use Case: ${useCase || 'N/A'} | Scenario: ${scenarioLabel}`, { x: 0.5, y: 1.2, w: 12, h: 0.4, fontSize: 16, color: '64748B', italic: true });

      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.8, w: 5, h: 2.8, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
      slide.addText([{ text: "Strategic Value", options: { bold: true, fontSize: 18, color: brandColor, breakLine: true } },
                     { text: `\nKPIs:\n${kpis || 'None specified'}\n\nChallenges Solved:\n${challenges || 'None specified'}`, options: { fontSize: 12, color: '333333' } }], 
                     { x: 0.7, y: 2.0, w: 4.6, h: 2.4, align: 'left', valign: 'top' });

      slide.addShape(pptx.ShapeType.rect, { x: 5.8, y: 1.8, w: 6.8, h: 2.8, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } });
      slide.addText("Current vs. Future State", { x: 6.0, y: 2.0, w: 6.4, h: 0.4, bold: true, fontSize: 18, color: '1D4ED8' });
      
      slide.addText(`Current Monthly Cost: ${formatCurrency(results.currentMonthlyCost)}\nCurrent Manual Effort: ${Math.round(results.totalManualHoursMonthly)} hrs (${results.currentFte.toFixed(1)} FTEs)`, 
        { x: 6.0, y: 2.5, w: 3, h: 1.5, fontSize: 14, color: '333333' });
      
      slide.addText(`Future Monthly Cost: ${formatCurrency(results.futureMonthlyCostAvg)}\nResidual Effort: ${Math.round(results.remainingManualHoursMonthly)} hrs (${results.toBeFte.toFixed(1)} FTEs)`, 
        { x: 9.2, y: 2.5, w: 3, h: 1.5, fontSize: 14, color: '333333' });

      const metricY = 5.0;
      const cardW = 2.8;
      
      const addMetricCard = (xPos, title, value, bgColor, valueColor) => {
        slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: metricY, w: cardW, h: 1.5, fill: { color: bgColor }, rectRadius: 0.1 });
        slide.addText(title, { x: xPos, y: metricY + 0.2, w: cardW, h: 0.4, align: 'center', fontSize: 12, bold: true, color: '64748B' });
        slide.addText(value, { x: xPos, y: metricY + 0.6, w: cardW, h: 0.7, align: 'center', fontSize: 24, bold: true, color: valueColor });
      };

      addMetricCard(0.5, "LIFETIME NET SAVINGS", formatCurrency(results.netSavings), 'F1F5F9', '0F172A');
      addMetricCard(3.6, "ROI", results.roi === Infinity ? '∞' : `${Math.round(results.roi)}%`, 'F1F5F9', '059669');
      addMetricCard(6.7, "PAYBACK PERIOD", results.paybackPeriod === Infinity ? 'Never' : `${results.paybackPeriod.toFixed(1)} mo`, 'F1F5F9', '0F172A');
      addMetricCard(9.8, "FTE CAPACITY SAVED", `${results.fteSavings.toFixed(1)} FTEs/mo`, 'F1F5F9', '4338CA');

      await pptx.writeFile({ fileName: `${toolName || 'Automation'} 1 slider.pptx` });
    } catch (e) {
      console.error(e);
      alert("Failed to generate PPTX file.");
    }
    setIsExportingPPTX(false);
  };

  // --- API AI Caller ---
  const fetchWithRetry = async (url, options) => {
    // Basic exponential backoff implementation
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < delays.length; i++) {
      try {
        const response = await fetch(url, options);
        const responseText = await response.text();
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${responseText}`);
        return JSON.parse(responseText);
      } catch (error) {
        if (i === delays.length - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  // Safely truncate strings before interpolating to AI prompts
  const sanitizeStr = (str, limit = 400) => (str || '').substring(0, limit).replace(/[{}]/g, '');

  const callAI = async (prompt) => {
    if (providerOptions[aiProvider].needsKey && !aiApiKey.trim()) throw new Error(`Please provide an API key in AI Settings.`);
    
    if (aiProvider === 'pollinations') {
      const response = await fetch(`https://text.pollinations.ai/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: aiModel }) });
      if (!response.ok) throw new Error("API error");
      return await response.text();
    } else {
      let url = aiProvider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
      const data = await fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiApiKey}` }, body: JSON.stringify({ model: aiModel, messages: [{ role: 'user', content: prompt }] }) });
      return data?.choices?.[0]?.message?.content;
    }
  };

  const generateAIPitch = async () => {
    setIsGenerating(true);
    const prompt = `Act as a professional business analyst. Write a persuasive, general business case pitch for an automation project.
    Details: Tool Name: ${sanitizeStr(toolName) || 'Proposed Automation'} | Use Case: ${sanitizeStr(useCase) || 'N/A'} | Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Forecast
    Financials: Lifetime Net Savings: ${formatCurrency(results.netSavings)} over ${durationMonths} months | ROI: ${Math.round(results.roi)}% | Automation Viability Score: ${results.automationScore}/100 (${results.scoreLabel})
    Write a compelling executive summary (2-3 paragraphs). Do NOT include greetings. Use standard plain text formatting.`;
    try {
      const text = await callAI(prompt);
      if (text) setAiPitch(text.trim());
    } catch (error) { console.error(error); } 
    finally { setIsGenerating(false); }
  };

  const generateSuggestions = async () => {
    if (!toolName && !useCase) { alert("Please enter a Tool Name and Use Case to enable Auto-Fill."); return; }
    setIsGeneratingSuggestions(true);
    const prompt = `Based on Tool Name: ${sanitizeStr(toolName)} and Use Case: ${sanitizeStr(useCase)}, return ONLY a valid JSON object: {"kpis": ["..."], "challenges": ["..."], "benefits": ["..."]}`;
    try {
      const text = await callAI(prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.kpis) setKpis(parsed.kpis.map(k => '• ' + k).join('\n'));
        if (parsed.challenges) setChallenges(parsed.challenges.map(c => '• ' + c).join('\n'));
        if (parsed.benefits) setQualitativeBenefits(parsed.benefits.map(b => '• ' + b).join('\n'));
      }
    } catch (error) { console.error(error); } 
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

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopy = () => {
    if (!aiPitch) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(aiPitch)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
        .catch(() => fallbackCopyTextToClipboard(aiPitch)); // Safari/iFrame restriction fallback
    } else {
      fallbackCopyTextToClipboard(aiPitch);
    }
  };

  const inputStyle = "w-full px-4 py-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 outline-none hover:bg-slate-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const inputErrorStyle = "w-full px-4 py-3.5 bg-red-50/70 border border-red-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200 text-red-900 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const cardStyle = "bg-white rounded-[28px] shadow-sm border border-slate-200/60 relative";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-4 md:p-6 lg:p-8 selection:bg-blue-100">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <header className={`${cardStyle} p-4 pr-6 flex items-center justify-between z-20`}>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 rounded-[20px] text-white shadow-lg shadow-blue-500/20">
              <Calculator size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Automation Savings</h1>
              <p className="text-slate-500 text-sm font-medium hidden sm:block">Quantify ROI, time recaptured, and dynamic operational impact.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Currency */}
            <div className="hidden md:flex items-center mr-1">
              <Tooltip text={ratesStatus === 'live' ? 'Live Exchange Rates Active' : 'Offline Fallback Rates'}>
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/50 relative">
                  {ratesStatus === 'live' && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-100 rounded-full z-10"></div>
                  )}
                  {Object.keys(currencyConfig).map((curr) => (
                    <button key={curr} onClick={() => handleCurrencyChange(curr)} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${currency === curr ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      {curr}
                    </button>
                  ))}
                </div>
              </Tooltip>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center">
              <Tooltip text={isReadyToExport ? "Export Options" : "Please fill out basic Qualitative and Quantitative details (Tool Name, Use Case, Output/Duration variables) to enable exports."}>
                <div className={`flex bg-emerald-50 border border-emerald-200/60 rounded-2xl overflow-hidden shadow-sm transition-opacity ${isReadyToExport ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                  <button onClick={handleExportXLSX} disabled={isExportingXLSX || !isReadyToExport} className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 px-3 py-3 transition-all border-r border-emerald-200/60 disabled:cursor-not-allowed" title="Export Report to Excel">
                    {isExportingXLSX ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    <span className="hidden lg:inline">Excel</span>
                  </button>
                  <button onClick={handleExportPPTX} disabled={isExportingPPTX || !isReadyToExport} className="flex items-center space-x-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100 bg-orange-50 px-3 py-3 transition-all disabled:cursor-not-allowed" title="Export 1-Slide Summary to PowerPoint">
                    {isExportingPPTX ? <Loader2 size={16} className="animate-spin" /> : <Presentation size={16} />}
                    <span className="hidden lg:inline">PPTX</span>
                  </button>
                </div>
              </Tooltip>
            </div>

            <button onClick={() => setIsAiConfigOpen(true)} className="flex items-center space-x-1 text-sm font-bold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 p-3 rounded-2xl transition-all border border-transparent hover:border-blue-100">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* --- AI Config Modal --- */}
        {isAiConfigOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center space-x-3"><div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Sparkles size={18} /></div><h2 className="text-xl font-bold text-slate-800">AI Configuration</h2></div>
                <button onClick={() => setIsAiConfigOpen(false)} className="text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors shadow-sm"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">AI Provider</label>
                  <select value={aiProvider} onChange={handleProviderChange} className={inputStyle}>
                    {Object.entries(providerOptions).map(([key, opt]) => (<option key={key} value={key}>{opt.name}</option>))}
                  </select>
                </div>
                {providerOptions[aiProvider].needsKey && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">API Key</label>
                    <input type="password" value={aiApiKey} onChange={(e) => setAiApiKey(e.target.value)} placeholder="Paste your API key here..." className={`${inputStyle} font-mono`} />
                    {providerOptions[aiProvider].url && (<a href={providerOptions[aiProvider].url} target="_blank" rel="noreferrer" className="inline-flex items-center mt-2 text-xs font-bold text-blue-600 hover:text-blue-800">Get your free key <ExternalLink size={12} className="ml-1" /></a>)}
                  </div>
                )}
              </div>
              <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsAiConfigOpen(false)} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-md">Save & Close</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Qualitative Section */}
            <section className={cardStyle}>
              <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-50 p-2.5 rounded-[14px] text-purple-600"><FileText size={20} /></div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Qualitative Details</h2>
                </div>
                <button onClick={generateSuggestions} disabled={isGeneratingSuggestions || (!toolName && !useCase)} className="flex items-center justify-center space-x-2 text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200/50">
                  {isGeneratingSuggestions ? <Loader2 size={16} className="animate-spin text-amber-600" /> : <Sparkles size={16} className="text-amber-500" />}
                  <span>{isGeneratingSuggestions ? 'Auto-Filling...' : 'Auto-Fill Details'}</span>
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-5 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                      Automation Name 
                      <Tooltip text="Give your automation project a short, recognizable name."><Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/></Tooltip>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Cpu size={18} /></div>
                      <input type="text" value={toolName} onChange={(e) => setToolName(e.target.value)} placeholder="e.g., Ticket Auto-Triage Bot" className={`${inputStyle} pl-12 font-medium`} />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                      Use Case Description
                      <Tooltip text='What specific manual process is this bot replacing? (e.g., "Resetting user passwords")'><Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/></Tooltip>
                    </label>
                    <textarea value={useCase} onChange={(e) => setUseCase(e.target.value)} rows={2} placeholder="Briefly describe what the automation does..." className={`${inputStyle} resize-none font-medium`} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                      <BarChart3 size={16} className="mr-1.5 text-purple-500" /> Target KPIs
                      <Tooltip text='Which business metrics will this improve? (e.g., "Average Handle Time", "Error Rate")'><Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/></Tooltip>
                    </label>
                    <textarea value={kpis} onChange={(e) => setKpis(e.target.value)} rows={3} placeholder="e.g., MTTR, CSAT, Error Rate..." className={`${inputStyle} resize-none font-medium`} />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                      <Target size={16} className="mr-1.5 text-red-500" /> Challenges Addressed
                      <Tooltip text='What pain points are solved? (e.g., "Too many typos", "Slow response time")'><Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/></Tooltip>
                    </label>
                    <textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} rows={4} placeholder="What pain points are solved?" className={`${inputStyle} resize-none text-sm font-medium`} />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                      <Award size={16} className="mr-1.5 text-green-500" /> Qualitative Benefits
                      <Tooltip text='What are the soft benefits? (e.g., "Higher employee morale", "Better compliance")'><Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/></Tooltip>
                    </label>
                    <textarea value={qualitativeBenefits} onChange={(e) => setQualitativeBenefits(e.target.value)} rows={4} placeholder="e.g., Improved employee morale..." className={`${inputStyle} resize-none text-sm font-medium`} />
                  </div>
                </div>
              </div>
            </section>

            {/* Quantitative Section */}
            <section className={cardStyle}>
              <div className="px-6 md:px-8 py-5 flex items-center space-x-3 border-b border-slate-100">
                <div className="bg-blue-50 p-2.5 rounded-[14px] text-blue-600"><Activity size={20} /></div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Quantitative Metrics</h2>
              </div>
              
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7 bg-slate-50/30">
                
                {/* Number of Tasks */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center text-sm font-bold text-slate-700">
                      Number of Tasks
                      <Tooltip text={volumePeriod === 'daily' ? 'How many times per day? Multiplied by working days to get monthly volume.' : 'How many times does a human perform this specific task every month?'}>
                        <Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/>
                      </Tooltip>
                    </label>
                    <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                      <button onClick={() => setVolumePeriod('daily')} className={`px-3 py-1 text-xs rounded-lg transition-all font-bold ${volumePeriod === 'daily' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Daily</button>
                      <button onClick={() => setVolumePeriod('monthly')} className={`px-3 py-1 text-xs rounded-lg transition-all font-bold ${volumePeriod === 'monthly' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Monthly</button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <input type="number" value={executionsPerMonth} onChange={(e) => setExecutionsPerMonth(e.target.value)} placeholder="0" className={`${executionsPerMonth !== '' && executionsPerMonth < 0 ? inputErrorStyle : inputStyle} font-mono text-lg`} />
                    {volumePeriod === 'daily' && (
                      <div className="relative w-28 flex-shrink-0" title="Working days per month">
                        <input type="number" min="1" max="31" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} placeholder="0" className={`${workingDays !== '' && workingDays < 1 ? inputErrorStyle : inputStyle} pr-10 font-mono text-lg`} />
                        <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">days</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Effort per Task */}
                <div>
                  <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                    Time Spent per Task
                    <Tooltip text='AHT (Average Handle Time): How long does it take a human to complete this task just once?'>
                      <Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/>
                    </Tooltip>
                  </label>
                  <div className="flex space-x-3">
                    <div className="relative flex-1">
                      <input type="number" value={effortHours !== '' ? effortHours * 60 : ''} onChange={handleMinutesChange} placeholder="0" className={`${effortHours !== '' && effortHours < 0 ? inputErrorStyle : inputStyle} pr-12 font-mono text-lg`} />
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 font-bold text-xs pointer-events-none">MIN</span>
                    </div>
                    <div className="relative flex-1">
                      <input type="number" step="0.01" value={effortHours !== '' ? Number(effortHours).toFixed(2) : ''} onChange={(e) => setEffortHours(e.target.value)} placeholder="0.00" className={`${effortHours !== '' && effortHours < 0 ? inputErrorStyle : inputStyle} pr-12 font-mono text-lg bg-slate-100/50`} />
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 font-bold text-xs pointer-events-none">HR</span>
                    </div>
                  </div>
                </div>

                {/* Resource Cost */}
                <div>
                  <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                    Resource Cost (Hourly)
                    <Tooltip text={`The fully loaded hourly wage of the employee currently doing this task manually (in ${currency}).`}>
                      <Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/>
                    </Tooltip>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Coins size={18} /></div>
                    <input type="number" value={resourceCost} onChange={(e) => setResourceCost(e.target.value)} placeholder="0" className={`${resourceCost !== '' && resourceCost < 0 ? inputErrorStyle : inputStyle} pl-10 font-mono text-lg`} />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                    Remaining Duration
                    <Tooltip text='How many months will this automation run before the project ends or needs a rebuild?'>
                      <Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/>
                    </Tooltip>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Briefcase size={18} /></div>
                    <input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} placeholder="0" className={`${durationMonths !== '' && durationMonths < 0 ? inputErrorStyle : inputStyle} pl-10 pr-20 font-mono text-lg`} />
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 font-bold text-xs pointer-events-none">MONTHS</span>
                  </div>
                </div>

                {/* Percent Automated Slider */}
                <div className="md:col-span-2 pt-3 pb-3">
                  <div className="flex justify-between items-center mb-4">
                    <label className="flex items-center text-sm font-bold text-slate-700">
                      Percentage Automated
                      <Tooltip text='What percentage of the manual work is being completely eliminated by the bot?'>
                        <Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/>
                      </Tooltip>
                    </label>
                    <span className="font-extrabold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-xl text-sm shadow-sm">{automationPercent}%</span>
                  </div>
                  <input type="range" aria-label="Percentage Automated" min="0" max="100" value={automationPercent} onChange={(e) => setAutomationPercent(e.target.value)} className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30" />
                  <div className="flex justify-between text-xs font-bold text-slate-400 mt-3 px-1"><span>0%</span><span>50%</span><span>100%</span></div>
                </div>

                {/* --- Unified Investment & Ongoing Costs Section --- */}
                <div className="md:col-span-2 pt-5 border-t border-slate-200/60 mt-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <Wrench size={18} className="text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Investment & Ongoing Costs</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Implementation */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                          One-Time Build
                          <Tooltip text='Total upfront investment required (e.g., developer salaries, software licenses, vendor fees).'>
                            <Info size={12} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/>
                          </Tooltip>
                        </label>
                        <p className="text-[10px] text-slate-500 mb-3 leading-tight">Upfront investment cost.</p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Coins size={14} /></div>
                        <input type="number" min="0" value={implementationCost} onChange={(e) => setImplementationCost(e.target.value)} placeholder="0" className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8`} />
                      </div>
                    </div>

                    {/* Run Cost */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                          Base Monthly Run Cost
                          <Tooltip text='Base recurring costs (licenses, cloud) and their projected Annual Percentage Increase.'>
                            <Info size={12} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/>
                          </Tooltip>
                        </label>
                        <p className="text-[10px] text-slate-500 mb-2 leading-tight">Recurring licenses/infra.</p>
                      </div>
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Coins size={14} /></div>
                          <input type="number" min="0" value={monthlyRunCost} onChange={(e) => setMonthlyRunCost(e.target.value)} placeholder="0" className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8`} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">YOY Inflation</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><TrendingUp size={14} /></div>
                            <input type="number" min="0" value={runCostInflation} onChange={(e) => setRunCostInflation(e.target.value)} placeholder="0" className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8 pr-8`} />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-xs">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SRE Y1 */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex flex-col justify-between">
                      <div>
                        <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                          Y1 SRE / Mo
                          <Tooltip text='Monthly cost of SREs/Maintenance needed specifically for the first year (e.g., handling heavy onboarding).'>
                            <Info size={12} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/>
                          </Tooltip>
                        </label>
                        <p className="text-[10px] text-slate-500 mb-3 leading-tight">First 12 mo support cost.</p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Users size={14} /></div>
                        <input type="number" min="0" value={sreCostY1} onChange={(e) => setSreCostY1(e.target.value)} placeholder="0" className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8`} />
                      </div>
                    </div>

                    {/* SRE Y2+ */}
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 flex flex-col justify-between">
                      <div>
                        <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                          Y2+ SRE / Mo
                          <Tooltip text='Reduced monthly SRE cost for Year 2 and beyond, after the system stabilizes.'>
                            <Info size={12} className="text-slate-400 hover:text-blue-500 transition-colors cursor-help"/>
                          </Tooltip>
                        </label>
                        <p className="text-[10px] text-slate-500 mb-3 leading-tight">Ongoing tapered support.</p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Users size={14} /></div>
                        <input type="number" min="0" value={sreCostY2} onChange={(e) => setSreCostY2(e.target.value)} placeholder="0" className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8`} />
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </section>
          </div>

          {/* Right Column: Results & Output */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Scenario Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 pl-5 rounded-3xl border border-slate-200/60 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 flex items-center">
                <Activity size={16} className="mr-2 text-blue-600" /> Forecast Scenario
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] w-full sm:w-auto">
                <button onClick={() => setScenario('optimistic')} className={`flex-1 sm:flex-none px-4 py-2 text-xs rounded-xl transition-all font-bold ${scenario === 'optimistic' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Optimistic</button>
                <button onClick={() => setScenario('realistic')} className={`flex-1 sm:flex-none px-4 py-2 text-xs rounded-xl transition-all font-bold ${scenario === 'realistic' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Realistic</button>
                <button onClick={() => setScenario('conservative')} className={`flex-1 sm:flex-none px-4 py-2 text-xs rounded-xl transition-all font-bold ${scenario === 'conservative' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>Conservative</button>
              </div>
            </div>

            {/* Primary Result Card */}
            <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] rounded-[28px] shadow-xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-[0.08] rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-purple-500 opacity-[0.1] rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-6 right-6 opacity-5 pointer-events-none"><TrendingUp size={160} /></div>
              
              {/* Automation Score Header */}
              <div className="relative z-10 border-b border-white/10 pb-5 mb-5 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                   <button onClick={() => setShowScore(!showScore)} className="text-blue-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl" title={showScore ? "Hide Score" : "Show Score"}>
                      {showScore ? <Eye size={18} /> : <EyeOff size={18} />}
                   </button>
                   <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Viability Score</span>
                </div>
                {showScore ? (
                   <div className="flex items-center space-x-3">
                     <span className={`text-[11px] font-black uppercase tracking-widest ${results.scoreColor}`}>{results.scoreLabel}</span>
                     <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl text-lg font-black text-white border border-white/10 shadow-sm flex items-baseline space-x-1">
                       <span>{results.automationScore}</span>
                       <span className="text-[10px] text-blue-400 font-bold uppercase">/ 100</span>
                     </div>
                   </div>
                ) : (
                   <div className="text-[11px] font-bold uppercase tracking-widest text-blue-400/50">Score Hidden</div>
                )}
              </div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <Tooltip text="Net Savings = (Gross Monthly Save × Duration) - Total Dynamic Run/SRE Costs - Implementation Cost">
                    <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-100 border border-white/10 shadow-sm flex items-center cursor-help">
                      Est. Lifetime Net Savings <Info size={14} className="ml-1.5 opacity-70 cursor-help" />
                    </span>
                  </Tooltip>
                  <span className="text-blue-200 text-sm font-semibold flex items-center">
                    <Clock size={14} className="mr-1.5 opacity-70"/> {Number(durationMonths) || 0} Mo Project
                  </span>
                </div>
                
                <div className={`text-[3.5rem] leading-none xl:text-7xl font-extrabold tracking-tighter mt-6 mb-10 drop-shadow-2xl ${results.netSavings < 0 ? 'text-red-400' : 'text-white'}`}>
                  {formatCurrency(results.netSavings)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
                <div>
                  <Tooltip text="Average Monthly Net Savings (factors in strict month-by-month run cost inflation and variable SRE costs).">
                    <p className="text-blue-300 text-xs mb-1.5 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Avg Net Monthly <Info size={12} className="ml-1 opacity-70 cursor-help"/></p>
                  </Tooltip>
                  <p className="text-2xl font-bold tracking-tight text-white">{formatCurrency(results.avgNetMonthlySave)}</p>
                </div>
                <div>
                  <Tooltip text="Implementation Cost + Total Lifetime Run Costs + Total Lifetime SRE Costs">
                    <p className="text-blue-300 text-xs mb-1.5 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Total Investment <Info size={12} className="ml-1 opacity-70 cursor-help"/></p>
                  </Tooltip>
                  <p className="text-2xl font-bold tracking-tight text-white">{formatCurrency(results.totalInvestment)}</p>
                </div>
              </div>

              {/* ROI & Payback - Glass Cards */}
              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
                  <Tooltip text="(Net Savings / Total Investment) × 100">
                    <p className="text-blue-300/80 text-xs mb-1 uppercase tracking-wider font-bold flex items-center cursor-help w-max">ROI <Info size={12} className="ml-1 opacity-70 cursor-help"/></p>
                  </Tooltip>
                  <p className={`text-2xl font-extrabold tracking-tight ${results.roi < 0 ? 'text-red-400' : results.roi >= 100 ? 'text-[#34D399]' : 'text-white'}`}>
                    {results.roi === Infinity ? '∞' : `${Math.round(results.roi).toLocaleString()}%`}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
                  <Tooltip text="Exact month where cumulative savings exceeds cumulative implementation, run, and maintenance costs.">
                    <p className="text-blue-300/80 text-xs mb-1 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Payback Period <Info size={12} className="ml-1 opacity-70 cursor-help"/></p>
                  </Tooltip>
                  <p className="text-2xl font-extrabold tracking-tight text-white">
                    {results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod === 0 ? 'Immediate' : `${results.paybackPeriod.toFixed(1)} mo`}
                  </p>
                </div>
              </div>
            </div>

            {/* Current vs To-Be Panel */}
            <div className={`${cardStyle} flex flex-col`}>
              <div className="p-6 md:p-8 flex-1">
                <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center">
                  <ArrowRightLeft size={18} className="mr-2 text-blue-600"/> Current vs. Future State
                </h3>
                
                <div className="space-y-6">
                  {/* Current State */}
                  <div className="bg-slate-50 p-5 rounded-[20px] border border-slate-200/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">Current State (As-Is)</div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                         <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Monthly Labor Cost</div>
                         <div className="text-xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(results.currentMonthlyCost)}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Manual Effort</div>
                         <div className="text-xl font-extrabold text-slate-800 tracking-tight">
                           {new Intl.NumberFormat().format(Math.round(results.totalManualHoursMonthly))} <span className="text-sm font-medium text-slate-500">hrs/mo</span>
                         </div>
                         <div className="text-xs font-semibold text-slate-500 mt-1 bg-slate-200/50 inline-block px-2 py-0.5 rounded-md">({results.currentFte.toFixed(1)} FTEs)</div>
                      </div>
                    </div>
                    
                    {challenges && (
                      <div className="border-t border-slate-200 pt-3">
                        <div className="text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center"><Activity size={12} className="mr-1.5" /> Existing Challenges</div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{challenges}</p>
                      </div>
                    )}
                  </div>

                  {/* Future State */}
                  <div className="bg-blue-50/50 p-5 rounded-[20px] border border-blue-100/60 shadow-[inset_0_1px_3px_rgba(59,130,246,0.05)]">
                    <div className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest mb-4 flex items-center"><Sparkles size={14} className="mr-1.5"/> Future State (To-Be)</div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                         <Tooltip text="Average future monthly cost (Remaining manual labor + Average run cost + Average SRE cost).">
                           <div className="text-[11px] font-bold text-blue-400 uppercase mb-1 flex items-center cursor-help">Avg Total Cost/Mo <Info size={10} className="ml-1 opacity-80 cursor-help" /></div>
                         </Tooltip>
                         <div className="text-xl font-extrabold text-blue-900 tracking-tight">{formatCurrency(results.futureMonthlyCostAvg)}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[11px] font-bold text-blue-400 uppercase mb-1">Residual Effort</div>
                         <div className="text-xl font-extrabold text-blue-900 tracking-tight">
                           {new Intl.NumberFormat().format(Math.round(results.remainingManualHoursMonthly))} <span className="text-sm font-medium text-blue-600/70">hrs/mo</span>
                         </div>
                         <div className="text-xs font-semibold text-blue-600/80 mt-1 bg-blue-100/50 inline-block px-2 py-0.5 rounded-md">({results.toBeFte.toFixed(1)} FTEs)</div>
                      </div>
                    </div>

                    {(kpis || qualitativeBenefits) && (
                      <div className="border-t border-blue-100 pt-3 space-y-3">
                        {kpis && (<div><div className="text-[10px] font-bold text-purple-600 uppercase mb-1 flex items-center"><BarChart3 size={12} className="mr-1.5" /> Target KPIs</div><p className="text-xs text-blue-800 leading-relaxed whitespace-pre-wrap font-medium">{kpis}</p></div>)}
                        {qualitativeBenefits && (<div><div className="text-[10px] font-bold text-emerald-600 uppercase mb-1 flex items-center"><Award size={12} className="mr-1.5" /> Strategic Benefits</div><p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-wrap font-medium">{qualitativeBenefits}</p></div>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 pt-0 mt-auto">
                <div className="border-t border-slate-100 pt-5">
                  <button onClick={generateROIInsights} disabled={isGeneratingInsights} className="w-full flex items-center justify-center space-x-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm border border-blue-100">
                    {isGeneratingInsights ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-amber-500" />}
                    <span>{roiInsights ? 'Regenerate Strategy' : 'Get AI Strategy Insights'}</span>
                  </button>
                  
                  {roiInsights && (
                    <div className="mt-4 bg-indigo-50/80 p-5 rounded-2xl text-sm font-medium text-indigo-900 leading-relaxed border border-indigo-100/50 overflow-y-auto max-h-40 shadow-inner custom-scrollbar whitespace-pre-wrap">
                      {roiInsights}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Operational Impact */}
            <div className={`${cardStyle} p-6 md:p-8 grid grid-cols-2 gap-6`}>
              <div>
                <Tooltip text="Total manual hours saved over the project duration.">
                  <div className="flex items-center space-x-2 text-emerald-700 mb-3 bg-emerald-50 w-max px-3 py-1.5 rounded-xl font-bold text-sm cursor-help">
                    <Clock size={16} /><span>Time Recaptured</span><Info size={14} className="opacity-70 cursor-help" />
                  </div>
                </Tooltip>
                <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {new Intl.NumberFormat().format(Math.round(results.hoursSavedMonthly))} <span className="text-base text-slate-500 font-medium">hrs/mo</span>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                  {new Intl.NumberFormat().format(Math.round(results.hoursSavedTotal))} hrs over life
                </p>
              </div>

              <div className="border-l border-slate-100 pl-6">
                <Tooltip text="Full-Time Equivalents (Assumes 160 hours/month per employee).">
                  <div className="flex items-center space-x-2 text-indigo-700 mb-3 bg-indigo-50 w-max px-3 py-1.5 rounded-xl font-bold text-sm cursor-help">
                    <Users size={16} /><span>FTE Savings</span><Info size={14} className="opacity-70 cursor-help" />
                  </div>
                </Tooltip>
                <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {results.fteSavings.toFixed(1)} <span className="text-base text-slate-500 font-medium">FTEs</span>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Reallocated capacity</p>
              </div>
            </div>

            {/* Pitch */}
            <div className="bg-slate-900 rounded-[28px] shadow-xl text-slate-100 p-6 md:p-8 flex flex-col h-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 opacity-5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-800 rounded-[14px] text-slate-300 border border-slate-700/50"><FileText size={20} /></div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Business Case Pitch</h3>
                </div>
                {(toolName || useCase || aiPitch) && (
                  <button onClick={handleCopy} className="flex items-center space-x-2 text-sm font-bold bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-2xl transition-all shadow-sm">
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy Pitch'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl mb-6 gap-3 border border-slate-700/50 backdrop-blur-sm relative z-10">
                <div className="flex items-center space-x-2 pl-2"><Sparkles size={16} className="text-amber-400 flex-shrink-0" /><span className="text-sm font-semibold text-slate-200">General Business Case Pitch</span></div>
                <div className="flex items-center space-x-3">
                  <button onClick={generateAIPitch} disabled={isGenerating || (!toolName && !useCase)} className="flex items-center justify-center space-x-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-5 py-2 rounded-xl transition-all font-bold shadow-sm">
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    <span>{isGenerating ? 'Drafting...' : (aiPitch ? 'Regenerate AI' : 'Generate with AI')}</span>
                  </button>
                  {aiPitch && !isGenerating && (<button onClick={() => setAiPitch('')} className="text-xs font-bold text-slate-400 hover:text-white underline px-2">Reset</button>)}
                </div>
              </div>
              
              <div className="bg-slate-950/40 rounded-2xl p-6 border border-white/5 relative z-10 flex-1">
                <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {isGenerating ? (
                     <div className="flex flex-col items-center justify-center py-16 text-slate-400"><Loader2 size={36} className="animate-spin mb-4 text-blue-500" /><p className="animate-pulse font-medium">Crafting your perfect pitch...</p></div>
                  ) : aiPitch ? (
                     <div className="whitespace-pre-wrap text-[15px]">{aiPitch}</div>
                  ) : toolName || useCase ? (
                    <>
                      <p className="mb-4 text-[15px]">By implementing <strong className="text-white">{toolName || "the proposed automation"}</strong> {useCase && ` to ${useCase}`}, we anticipate automating <strong className="text-blue-400">{automationPercent}%</strong> of the targeted workload. Currently, this task requires {Number(results.effectiveExecutions).toLocaleString()} executions per month, taking approximately {Math.round(Number(effortHours) * 60)} minutes each.</p>
                      {(challenges || kpis || qualitativeBenefits) && (
                        <>
                          <p className="mb-2 text-[15px] font-bold text-white">Strategic Value & Pain Points Addressed:</p>
                          <div className="mb-4 text-[15px] pl-2 border-l-2 border-slate-700">
                            {challenges && <p className="mb-2"><strong className="text-blue-300">Challenges:</strong><br/><span className="whitespace-pre-wrap">{challenges}</span></p>}
                            {kpis && <p className="mb-2"><strong className="text-purple-300">Target KPIs:</strong><br/><span className="whitespace-pre-wrap">{kpis}</span></p>}
                            {qualitativeBenefits && <p className="mb-2"><strong className="text-emerald-300">Expected Benefits:</strong><br/><span className="whitespace-pre-wrap">{qualitativeBenefits}</span></p>}
                          </div>
                        </>
                      )}
                      <p className="mb-4 text-[15px]">Financially, this requires an initial investment of {formatCurrency(implementationCost)}. Over the {Number(durationMonths) || 0}-month lifecycle, total maintenance and inflated run costs are projected at {formatCurrency(results.totalRunCost + results.totalSreCost)}. The automation yields a gross labor cost avoidance of <strong className="text-emerald-400">{formatCurrency(results.grossMonthlySave)} per month</strong>. After factoring in these dynamic operational costs, this amounts to a <strong>Lifetime Net Savings of <span className="text-emerald-400">{formatCurrency(results.netSavings)}</span></strong>. The precise payback period is <strong>{results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod.toFixed(1) + ' months'}</strong>, delivering an ROI of <strong>{results.roi === Infinity ? 'Infinite' : `${Math.round(results.roi)}%`}</strong>.</p>
                      <p className="text-[15px]">Operationally, the automation recaptures {Math.round(results.hoursSavedTotal).toLocaleString()} resource hours over the project life. This represents an ongoing monthly savings of <strong className="text-indigo-300">{results.fteSavings.toFixed(1)} FTEs</strong> (Full-Time Equivalents) that can be redirected toward higher-value, strategic initiatives.</p>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12"><div className="bg-slate-800 p-4 rounded-full mb-4 opacity-50"><Cpu size={40} /></div><p className="font-medium text-lg text-slate-400">Ready to draft your business case.</p><p className="text-sm mt-1">Enter details above to begin.</p></div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className={`${cardStyle} mt-6 mb-12`}>
          <button onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)} aria-expanded={isHowItWorksOpen} aria-controls="how-it-works-content" className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors text-left outline-none">
            <div className="flex items-center space-x-4"><div className="bg-slate-100 p-3 rounded-2xl text-slate-600"><HelpCircle size={24} /></div><div><h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Methodology & AI Details</h2><p className="text-sm text-slate-500 font-medium">How these numbers are calculated</p></div></div>
            <div className={`transform transition-transform duration-300 bg-slate-100 p-2 rounded-full ${isHowItWorksOpen ? 'rotate-180' : ''}`}><ChevronDown size={20} className="text-slate-500" /></div>
          </button>
          <div id="how-it-works-content" aria-hidden={!isHowItWorksOpen} className={`transition-all duration-300 ease-in-out ${isHowItWorksOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-6 md:p-8 pt-0 border-t border-slate-100" tabIndex={isHowItWorksOpen ? 0 : -1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div className="space-y-6">
                  <div><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Month-By-Month Engine</h3><p className="text-sm text-slate-600 leading-relaxed font-medium">This calculator doesn't just multiply static numbers. It loops through every month of the project's duration to accurately compound <strong>Run Cost Inflation</strong> and dynamically switch between <strong>Y1 vs Y2+ SRE/Maintenance costs</strong>. This guarantees a mathematically precise Payback Period and ROI.</p></div>
                  <div><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Net Savings</h3><p className="text-sm text-slate-600 leading-relaxed font-medium">The actual financial gain. Projects the gross savings over the lifetime of the project and subtracts the initial implementation cost, the inflating monthly run costs, and the variable monthly maintenance costs.</p></div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Automation Score Algorithm</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">A quick heuristic score out of 100 to determine investment viability. It evaluates three key pillars:</p>
                    <ul className="list-disc pl-5 mt-2 text-sm text-slate-600 leading-relaxed font-medium space-y-1">
                      <li><strong>ROI (40 pts):</strong> &ge;200% (40), &ge;100% (30), &ge;50% (20), &gt;0% (10)</li>
                      <li><strong>Payback Period (40 pts):</strong> &le;6 mo (40), &le;12 mo (30), &le;24 mo (20), &le;36 mo (10)</li>
                      <li><strong>FTE Savings (20 pts):</strong> &ge;2 FTEs (20), &ge;1 FTE (15), &ge;0.5 FTE (10), &gt;0 FTE (5)</li>
                    </ul>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium mt-2">Scores over 80 are considered strong investments. You can toggle visibility using the eye icon in the results panel.</p>
                  </div>
                  <div><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Scenario Modeling</h3><p className="text-sm text-slate-600 leading-relaxed font-medium">The <strong>Forecast Scenario</strong> toggle stress-tests your business case. <em>Realistic</em> uses your exact inputs. <em>Conservative</em> inflates all implementation and run costs by 25% while shrinking the expected automation yield by 25% (simulating delays/complexity). <em>Optimistic</em> reduces costs by 10% and boosts automation yield by 10%.</p></div>
                  <div><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">SRE / Maintenance Ramp-Down</h3><p className="text-sm text-slate-600 leading-relaxed font-medium">Complex automations usually require heavier support when they are first launched, which tapers off as the system stabilizes. The advanced cost settings allow you to accurately forecast this ramp-down.</p></div>
                </div>
                <div className="space-y-6">
                  <div><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">FTE Savings</h3><p className="text-sm text-slate-600 leading-relaxed font-medium">FTE stands for "Full-Time Equivalent". In this tool, we assume a standard work month has roughly 160 hours. If your automation saves 160 hours, it is effectively doing the work of 1 full-time employee.</p></div>
                  <div><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Return on Investment (ROI)</h3><p className="text-sm text-slate-600 leading-relaxed font-medium">Measures profitability. An ROI of 100% means the automation paid for its total investment and generated that same amount in pure savings.</p></div>
                  <div><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Live Currency Conversion</h3><p className="text-sm text-slate-600 leading-relaxed font-medium">Currency switching automatically recalculates all monetary inputs and results using real-time exchange rates fetched securely from <strong>open.er-api.com</strong>. A small green dot on the currency selector indicates live rates are active. If you are offline, it seamlessly falls back to standard default rates.</p></div>
                  <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6 mt-4">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center"><Settings size={16} className="mr-2 text-blue-600" /> What AI powers these insights?</h3>
                    <p className="text-sm text-blue-800 leading-relaxed font-medium">By default, this calculator securely integrates <strong>Pollinations.ai</strong> for free, seamless text generation. You can click the <strong className="inline-flex items-center text-blue-900 bg-white px-2 py-0.5 rounded shadow-sm mx-1 hover:bg-slate-50 transition-colors"><Settings size={12} className="mr-1"/> AI Config</strong> button at the top to optionally switch to other high-quality models using your own API keys.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}} />
    </div>
  );
}
