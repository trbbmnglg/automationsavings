import React, { useState, useMemo } from 'react';
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
  Download
} from 'lucide-react';

// --- Custom Tooltip Component ---
const Tooltip = ({ text, children }) => (
  <div className="relative group inline-flex items-center cursor-help">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] sm:max-w-xs p-2.5 bg-slate-800 text-white text-[11px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-center shadow-xl leading-relaxed">
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
  const [executionsPerMonth, setExecutionsPerMonth] = useState(1200);
  const [volumePeriod, setVolumePeriod] = useState('monthly'); // 'daily' | 'monthly'
  const [workingDays, setWorkingDays] = useState(22);
  const [effortHours, setEffortHours] = useState(0.333333); // 20 mins default
  const [resourceCost, setResourceCost] = useState(30);
  const [automationPercent, setAutomationPercent] = useState(80);
  const [durationMonths, setDurationMonths] = useState(36);
  
  // Base Costs
  const [implementationCost, setImplementationCost] = useState(5000);
  const [monthlyRunCost, setMonthlyRunCost] = useState(250); 
  
  // Advanced Ongoing Costs
  const [runCostInflation, setRunCostInflation] = useState(5); // 5% YOY increase default
  const [sreCostY1, setSreCostY1] = useState(1500); // Higher cost year 1
  const [sreCostY2, setSreCostY2] = useState(500); // Tapered cost year 2+

  const [currency, setCurrency] = useState('USD');

  // Approximate exchange rates relative to USD
  const exchangeRates = {
    USD: 1,
    PHP: 56.5,
    EUR: 0.92,
    JPY: 150.5
  };

  const currencyConfig = {
    USD: { locale: 'en-US', code: 'USD' },
    PHP: { locale: 'en-PH', code: 'PHP' },
    EUR: { locale: 'de-DE', code: 'EUR' },
    JPY: { locale: 'ja-JP', code: 'JPY' }
  };

  // --- UI State ---
  const [copied, setCopied] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [aiPitch, setAiPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [roiInsights, setRoiInsights] = useState('');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // --- AI Config State ---
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState('builtin');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash-preview-09-2025');

  const providerOptions = {
    'builtin': { 
      name: 'Built-in Gemini (Free, No Key Needed)', 
      models: ['gemini-2.5-flash-preview-09-2025'],
      url: null,
      needsKey: false
    },
    'pollinations': {
      name: 'Pollinations.ai (Free, Keyless)',
      models: ['openai', 'mistral', 'llama'],
      url: null,
      needsKey: false
    },
    'groq': { 
      name: 'Groq (Requires Free Key)', 
      models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'],
      url: 'https://console.groq.com/keys',
      needsKey: true
    },
    'openrouter': { 
      name: 'OpenRouter Free Models (Requires Key)', 
      models: ['meta-llama/llama-3-8b-instruct:free', 'google/gemini-2.5-flash:free', 'mistralai/mistral-7b-instruct:free'],
      url: 'https://openrouter.ai/keys',
      needsKey: true
    }
  };

  const handleProviderChange = (e) => {
    const newProv = e.target.value;
    setAiProvider(newProv);
    setAiModel(providerOptions[newProv].models[0]);
  };

  // --- Helper for Focus Hints (Material Styled) ---
  const renderHint = (field, text) => (
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeField === field ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
      <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-100/50 flex items-start shadow-sm backdrop-blur-sm">
        <Info size={16} className="mr-2 inline flex-shrink-0 mt-0.5 text-blue-600" />
        <p className="text-sm text-blue-800 leading-relaxed font-medium">{text}</p>
      </div>
    </div>
  );

  const handleCurrencyChange = (newCurrency) => {
    if (newCurrency === currency) return;
    
    // Calculate the conversion multiplier between the old and new currency
    const multiplier = exchangeRates[newCurrency] / exchangeRates[currency];
    
    // Convert and update the quantitative inputs so they reflect the new currency value
    setResourceCost(prev => Number((prev * multiplier).toFixed(2)));
    setImplementationCost(prev => Number((prev * multiplier).toFixed(0)));
    setMonthlyRunCost(prev => Number((prev * multiplier).toFixed(2)));
    setSreCostY1(prev => Number((prev * multiplier).toFixed(2)));
    setSreCostY2(prev => Number((prev * multiplier).toFixed(2)));
    
    setCurrency(newCurrency);
  };

  // --- Complex Month-by-Month Calculations ---
  const results = useMemo(() => {
    const exactEffort = Math.max(0, Number(effortHours));
    const rawExecutions = Math.max(0, Number(executionsPerMonth));
    const effectiveExecutions = volumePeriod === 'daily' ? rawExecutions * Math.max(1, Number(workingDays)) : rawExecutions;
    const cost = Math.max(0, Number(resourceCost));
    const autoRatio = Math.max(0, Math.min(100, Number(automationPercent))) / 100;
    const months = Math.max(0, Number(durationMonths));
    const implCost = Math.max(0, Number(implementationCost));
    
    const baseRunCost = Math.max(0, Number(monthlyRunCost));
    const inflationRate = Math.max(0, Number(runCostInflation)) / 100;
    const sreY1 = Math.max(0, Number(sreCostY1));
    const sreY2 = Math.max(0, Number(sreCostY2));

    const hoursMonthlyCurrent = effectiveExecutions * exactEffort;
    const hoursMonthlySaved = hoursMonthlyCurrent * autoRatio;
    const hoursSavedTotal = hoursMonthlySaved * months;
    
    const currentMonthlyCost = hoursMonthlyCurrent * cost;
    const grossMonthlySave = hoursMonthlySaved * cost;
    
    // Month-by-month forecasting engine
    let totalRunCost = 0;
    let totalSreCost = 0;
    let totalGrossSave = 0;
    
    let cumulativeNet = -implCost;
    let paybackMonth = Infinity;
    
    const monthlyData = [];

    // Month 0 (Initial Investment)
    monthlyData.push({
      month: 0,
      year: 0,
      implementationCost: implCost,
      runCost: 0,
      sreCost: 0,
      grossSavings: 0,
      netCashFlow: -implCost,
      cumulativeNet: cumulativeNet
    });

    for (let m = 1; m <= months; m++) {
      let currentYear = Math.ceil(m / 12);
      
      // Calculate this month's dynamic costs
      let currentRunCost = baseRunCost * Math.pow(1 + inflationRate, currentYear - 1);
      let currentSreCost = currentYear === 1 ? sreY1 : sreY2;
      
      totalRunCost += currentRunCost;
      totalSreCost += currentSreCost;
      totalGrossSave += grossMonthlySave;

      let monthlyNet = grossMonthlySave - currentRunCost - currentSreCost;
      cumulativeNet += monthlyNet;

      monthlyData.push({
        month: m,
        year: currentYear,
        implementationCost: 0,
        runCost: currentRunCost,
        sreCost: currentSreCost,
        grossSavings: grossMonthlySave,
        netCashFlow: monthlyNet,
        cumulativeNet: cumulativeNet
      });

      // Track payback period precision
      if (paybackMonth === Infinity && cumulativeNet >= 0) {
        let remainder = cumulativeNet; // Overshoot amount
        let fraction = 1 - (remainder / monthlyNet); // Reverse calculate fraction of the month
        paybackMonth = m - 1 + fraction;
      }
    }

    // Safety fallback for immediate ROI
    if (paybackMonth === Infinity && months === 0 && implCost === 0) paybackMonth = 0;

    const totalInvestment = implCost + totalRunCost + totalSreCost;
    const netSave = totalGrossSave - totalInvestment;
    const roi = totalInvestment > 0 ? (netSave / totalInvestment) * 100 : (netSave > 0 ? Infinity : 0);
    
    // Average Monthly Net (For high-level display)
    const avgNetMonthlySave = months > 0 ? (totalGrossSave - totalRunCost - totalSreCost) / months : 0;
    const futureMonthlyCostAvg = months > 0 ? ((currentMonthlyCost * months) - totalGrossSave + totalRunCost + totalSreCost) / months : currentMonthlyCost;

    const fte = hoursMonthlySaved / 160; 

    return {
      effectiveExecutions,
      currentMonthlyCost,
      futureMonthlyCostAvg,
      grossMonthlySave,
      avgNetMonthlySave,
      annualSavings: avgNetMonthlySave * 12,
      totalGrossSavings: totalGrossSave,
      totalInvestment,
      totalRunCost,
      totalSreCost,
      netSavings: netSave,
      roi,
      paybackPeriod: paybackMonth,
      hoursSavedMonthly: hoursMonthlySaved,
      hoursSavedTotal: hoursSavedTotal,
      fteSavings: fte,
      totalManualHoursMonthly: hoursMonthlyCurrent,
      remainingManualHoursMonthly: Math.max(0, hoursMonthlyCurrent - hoursMonthlySaved),
      monthlyData
    };
  }, [executionsPerMonth, effortHours, resourceCost, automationPercent, durationMonths, implementationCost, monthlyRunCost, runCostInflation, sreCostY1, sreCostY2, volumePeriod, workingDays]);

  const formatCurrency = (value) => {
    const config = currencyConfig[currency];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleMinutesChange = (e) => {
    const mins = Math.max(0, Number(e.target.value));
    setEffortHours(mins / 60);
  };

  // --- Export to CSV Logic (Pivoted Table Format) ---
  const handleExport = () => {
    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '""';
      const stringified = String(str);
      // Escape double quotes by doubling them, wrap field in quotes
      return `"${stringified.replace(/"/g, '""')}"`;
    };

    let csv = '';
    const addRow = (rowArr) => { csv += rowArr.map(escapeCSV).join(',') + '\r\n'; };

    // 1. Report Header
    addRow(['AUTOMATION SAVINGS & ROI REPORT']);
    addRow(['Generated on', new Date().toLocaleDateString()]);
    addRow([]);

    // 2. Qualitative Info
    addRow(['PROJECT DETAILS', '']);
    addRow(['Automation Name', toolName || 'N/A']);
    addRow(['Use Case', useCase || 'N/A']);
    addRow(['Target KPIs', kpis || 'N/A']);
    addRow(['Challenges Addressed', challenges || 'N/A']);
    addRow(['Strategic Benefits', qualitativeBenefits || 'N/A']);
    addRow([]);

    // 3. Quantitative Inputs
    addRow(['QUANTITATIVE INPUTS', '']);
    addRow(['Currency', currency]);
    addRow(['Executions', `${executionsPerMonth} per ${volumePeriod}`]);
    if (volumePeriod === 'daily') addRow(['Working Days/Mo', workingDays]);
    addRow(['Time per Task (Mins)', (effortHours * 60).toFixed(2)]);
    addRow(['Resource Cost / Hour', formatCurrency(resourceCost)]);
    addRow(['Percentage Automated', `${automationPercent}%`]);
    addRow(['Project Duration (Months)', durationMonths]);
    addRow(['Implementation Cost', formatCurrency(implementationCost)]);
    addRow(['Base Monthly Run Cost', formatCurrency(monthlyRunCost)]);
    addRow(['Run Cost YOY Inflation (%)', `${runCostInflation}%`]);
    addRow(['SRE Cost (Year 1 / Monthly)', formatCurrency(sreCostY1)]);
    addRow(['SRE Cost (Year 2+ / Monthly)', formatCurrency(sreCostY2)]);
    addRow([]);

    // 4. Financial Summary
    addRow(['EXECUTIVE SUMMARY', '']);
    addRow(['Total Lifetime Net Savings', formatCurrency(results.netSavings)]);
    addRow(['Return on Investment (ROI)', results.roi === Infinity ? 'Infinite' : `${Math.round(results.roi)}%`]);
    addRow(['Payback Period (Months)', results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod.toFixed(1)]);
    addRow(['Total Investment', formatCurrency(results.totalInvestment)]);
    addRow(['FTEs Reallocated / Month', results.fteSavings.toFixed(1)]);
    addRow(['Total Hours Saved', Math.round(results.hoursSavedTotal)]);
    addRow([]);

    // ---------------------------------------------------------
    // 5. YEARLY PROJECTION TABLE (Pivoted horizontally)
    // ---------------------------------------------------------
    addRow(['YEARLY PROJECTION TABLE']);
    
    // Group monthly data into Yearly Buckets
    const yearlyData = {};
    // Seed Year 0
    yearlyData[0] = { impl: implementationCost, run: 0, sre: 0, gross: 0, net: -implementationCost, cum: -implementationCost };
    
    results.monthlyData.forEach(d => {
      if (d.month === 0) return; // Skip month 0, already seeded
      if (!yearlyData[d.year]) {
        yearlyData[d.year] = { impl: 0, run: 0, sre: 0, gross: 0, net: 0, cum: 0 };
      }
      yearlyData[d.year].impl += d.implementationCost;
      yearlyData[d.year].run += d.runCost;
      yearlyData[d.year].sre += d.sreCost;
      yearlyData[d.year].gross += d.grossSavings;
      yearlyData[d.year].net += d.netCashFlow;
      yearlyData[d.year].cum = d.cumulativeNet; // End of year cumulative
    });

    const maxYear = Math.max(...Object.keys(yearlyData).map(Number));
    
    // Header Row: Metric | Year 0 | Year 1 ...
    const yearHeaderRow = ['Metric', 'Year 0 (Initial)'];
    for(let y=1; y<=maxYear; y++) yearHeaderRow.push(`Year ${y}`);
    addRow(yearHeaderRow);

    const yrImplRow = ['Implementation Cost'];
    const yrRunRow = ['Run Cost (Licenses/Infra)'];
    const yrSreRow = ['SRE & Maintenance'];
    const yrGrossRow = ['Gross Labor Savings'];
    const yrNetRow = ['Net Cash Flow'];
    const yrCumRow = ['Cumulative Cash Flow'];

    for(let y=0; y<=maxYear; y++) {
      const yd = yearlyData[y] || { impl: 0, run: 0, sre: 0, gross: 0, net: 0, cum: 0 };
      // Make costs negative for standard accounting formats
      yrImplRow.push(formatCurrency(-yd.impl));
      yrRunRow.push(formatCurrency(-yd.run));
      yrSreRow.push(formatCurrency(-yd.sre));
      yrGrossRow.push(formatCurrency(yd.gross));
      yrNetRow.push(formatCurrency(yd.net));
      yrCumRow.push(formatCurrency(yd.cum));
    }

    addRow(yrGrossRow);
    addRow(yrImplRow);
    addRow(yrRunRow);
    addRow(yrSreRow);
    addRow(yrNetRow);
    addRow(yrCumRow);
    addRow([]);

    // ---------------------------------------------------------
    // 6. MONTH-BY-MONTH PROJECTION TABLE (Pivoted horizontally)
    // ---------------------------------------------------------
    addRow(['MONTH-BY-MONTH PROJECTION TABLE']);
    
    // Header Row: Metric | Month 0 | Month 1 ...
    const monthHeaderRow = ['Metric'];
    for(let m=0; m<=durationMonths; m++) monthHeaderRow.push(m === 0 ? 'Month 0' : `Month ${m}`);
    addRow(monthHeaderRow);

    const moImplRow = ['Implementation Cost'];
    const moRunRow = ['Run Cost (Licenses/Infra)'];
    const moSreRow = ['SRE & Maintenance'];
    const moGrossRow = ['Gross Labor Savings'];
    const moNetRow = ['Net Cash Flow'];
    const moCumRow = ['Cumulative Cash Flow'];

    results.monthlyData.forEach(d => {
      // Make costs negative for standard accounting formats
      moImplRow.push(formatCurrency(-d.implementationCost));
      moRunRow.push(formatCurrency(-d.runCost));
      moSreRow.push(formatCurrency(-d.sreCost));
      moGrossRow.push(formatCurrency(d.grossSavings));
      moNetRow.push(formatCurrency(d.netCashFlow));
      moCumRow.push(formatCurrency(d.cumulativeNet));
    });

    addRow(moGrossRow);
    addRow(moImplRow);
    addRow(moRunRow);
    addRow(moSreRow);
    addRow(moNetRow);
    addRow(moCumRow);
    addRow([]);

    // 7. Methodology Appended Below Tables
    addRow(['METHODOLOGY & CALCULATIONS']);
    addRow(['Month-By-Month Engine', 'This calculator loops through every month of the project\'s duration to accurately compound Run Cost Inflation and dynamically switch between Y1 vs Y2+ SRE/Maintenance costs. This guarantees a mathematically precise Payback Period and ROI.']);
    addRow(['Net Savings', 'The actual financial gain. Projects the gross savings over the lifetime of the project and subtracts the initial implementation cost, the inflating monthly run costs, and the variable monthly maintenance costs.']);
    addRow(['SRE / Maintenance Ramp-Down', 'Complex automations usually require heavier support when they are first launched, which tapers off as the system stabilizes. The advanced cost settings allow you to accurately forecast this ramp-down.']);
    addRow(['FTE Savings', 'FTE stands for "Full-Time Equivalent". In this tool, we assume a standard work month has roughly 160 hours (40 hours/week × 4 weeks). If your automation saves 160 hours, it is effectively doing the work of 1 full-time employee.']);
    addRow(['Return on Investment (ROI)', 'Measures profitability. An ROI of 100% means the automation paid for its total investment (Implementation + Run Costs + Maintenance) and generated that same amount in pure savings.']);

    // Trigger download
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for Excel UTF-8 BOM
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(toolName || 'Automation').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roi_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchWithRetry = async (url, options) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < delays.length; i++) {
      try {
        const response = await fetch(url, options);
        const responseText = await response.text();
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${responseText}`);
        if (!responseText) throw new Error("Empty response body received from API.");
        return JSON.parse(responseText);
      } catch (error) {
        if (i === delays.length - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  const callAI = async (prompt) => {
    if (providerOptions[aiProvider].needsKey && !aiApiKey.trim()) {
      throw new Error(`Please provide an API key for ${providerOptions[aiProvider].name} in the AI Settings (Gear icon).`);
    }

    if (aiProvider === 'builtin') {
      const apiKey = ""; 
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`;
      const data = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      return data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (aiProvider === 'pollinations') {
      const url = `https://text.pollinations.ai/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: aiModel
        })
      });
      if (!response.ok) throw new Error("Pollinations API error");
      return await response.text();
    } else {
      let url = aiProvider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';

      const data = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`,
          ...(aiProvider === 'openrouter' && {
            'HTTP-Referer': window.location.href,
            'X-Title': 'Automation Calculator'
          })
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      return data?.choices?.[0]?.message?.content;
    }
  };

  const generateAIPitch = async () => {
    setIsGenerating(true);
    const prompt = `Act as a professional business analyst. Write a persuasive, general business case pitch for an automation project.

Details:
- Tool Name: ${toolName || 'Proposed Automation'}
- Use Case: ${useCase || 'N/A'}
- KPIs Addressed: ${kpis || 'N/A'}
- Challenges Addressed: ${challenges || 'N/A'}
- Qualitative Benefits: ${qualitativeBenefits || 'N/A'}
- Total Executions: ${Number(results.effectiveExecutions).toLocaleString()} per month

Financials (Currency: ${currency}):
- Implementation Cost: ${formatCurrency(implementationCost)}
- Base Monthly Run Cost: ${formatCurrency(monthlyRunCost)} (Inflating ${runCostInflation}% Yearly)
- SRE/Maintenance Cost Year 1: ${formatCurrency(sreCostY1)}/month
- SRE/Maintenance Cost Year 2+: ${formatCurrency(sreCostY2)}/month
- Gross Monthly Labor Savings: ${formatCurrency(results.grossMonthlySave)}
- Avg Net Monthly Savings (after run & SRE costs): ${formatCurrency(results.avgNetMonthlySave)}
- Net Savings (Lifetime): ${formatCurrency(results.netSavings)} over ${durationMonths} months
- Payback Period: ${results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod.toFixed(1) + ' months'}
- ROI: ${results.roi === Infinity ? 'Infinite' : `${Math.round(results.roi)}%`}
- FTE Savings: ${results.fteSavings.toFixed(1)} FTEs/month

Tone: Professional and general business case.

Write a compelling executive summary (2-3 paragraphs). This is a formal business document section, NOT an email or letter. Do NOT include any greetings (e.g., "Dear X") or sign-offs (e.g., "Best regards", "Sincerely"). Avoid markdown formatting like asterisks (**), use plain text with clear paragraph breaks. Highlight strategic value, financial return (factoring in maintenance and inflation), and operational impact.`;

    try {
      const text = await callAI(prompt);
      if (text) setAiPitch(text.trim());
      else setAiPitch("Received an unexpected response format. Please try again.");
    } catch (error) {
      console.error(error);
      setAiPitch(error.message || "A connection error occurred while generating the pitch. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSuggestions = async () => {
    if (!toolName && !useCase) {
      alert("Please enter a Tool Name and Use Case to enable Auto-Fill.");
      return;
    }
    setIsGeneratingSuggestions(true);
    
    const prompt = `Based on the following automation project, brainstorm details.
Tool Name: ${toolName || "N/A"}
Use Case: ${useCase || "N/A"}

Return ONLY a valid JSON object matching this exact schema, with no additional text, markdown formatting, or code fences:
{
  "kpis": ["kpi metric 1", "kpi metric 2", "kpi metric 3"],
  "challenges": ["challenge 1", "challenge 2", "challenge 3"],
  "benefits": ["benefit 1", "benefit 2", "benefit 3"]
}`;

    try {
      const text = await callAI(prompt);
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.kpis && Array.isArray(parsed.kpis)) setKpis(parsed.kpis.map(k => '• ' + k).join('\n'));
          if (parsed.challenges && Array.isArray(parsed.challenges)) setChallenges(parsed.challenges.map(c => '• ' + c).join('\n'));
          if (parsed.benefits && Array.isArray(parsed.benefits)) setQualitativeBenefits(parsed.benefits.map(b => '• ' + b).join('\n'));
        } else {
           throw new Error("Could not parse JSON structure from response.");
        }
      }
    } catch (error) {
      console.error("Failed to generate suggestions", error);
      alert(error.message || "Failed to auto-fill details. Please try again."); 
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const generateROIInsights = async () => {
    setIsGeneratingInsights(true);
    
    const prompt = `Act as an expert financial strategist. Analyze the following automation project metrics and provide 2-3 brief, actionable bullet points on how to improve the ROI or reduce the payback period.

- Implementation Cost: ${formatCurrency(implementationCost)}
- Monthly Run Cost: ${formatCurrency(monthlyRunCost)} (Inflating ${runCostInflation}% YOY)
- Maintenance Cost (Y1 vs Y2+): ${formatCurrency(sreCostY1)} vs ${formatCurrency(sreCostY2)}
- Average Net Monthly Savings: ${formatCurrency(results.avgNetMonthlySave)}
- Expected Lifetime Net Savings: ${formatCurrency(results.netSavings)}
- Automation Percentage: ${automationPercent}%
- Current ROI: ${results.roi === Infinity ? 'Infinite' : `${Math.round(results.roi)}%`}
- Payback Period: ${results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod.toFixed(1) + ' months'}

Keep the advice specific to these numbers (focusing on license inflation and maintenance ramp-down), practical, and highly concise. Do not use markdown asterisks (*), use standard dashes for bullets.`;

    try {
      const text = await callAI(prompt);
      if (text) setRoiInsights(text.trim());
      else setRoiInsights("Received an empty response. Please try again.");
    } catch (error) {
      console.error("Failed to generate insights", error);
      setRoiInsights(error.message || "A connection error occurred while generating insights. Please try again later.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = aiPitch;
    if (!textToCopy) return;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try { document.execCommand('copy'); } catch (err) { console.error('Copy failed'); }
      textArea.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Common Styles for Material Feel ---
  const inputStyle = "w-full px-4 py-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 outline-none hover:bg-slate-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const inputErrorStyle = "w-full px-4 py-3.5 bg-red-50/70 border border-red-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200 text-red-900 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const cardStyle = "bg-white rounded-[28px] shadow-sm border border-slate-200/60 overflow-hidden relative";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-4 md:p-6 lg:p-8 selection:bg-blue-100">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <header className={`${cardStyle} p-4 pr-6 flex items-center justify-between`}>
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
            {/* Currency Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/50 mr-2">
              {Object.keys(currencyConfig).map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    currency === curr 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Mobile Currency Dropdown */}
            <div className="md:hidden relative mr-2">
              <select 
                value={currency} 
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="appearance-none bg-slate-100 border border-slate-200/50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl outline-none"
              >
                {Object.keys(currencyConfig).map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-4 py-3 rounded-2xl transition-all"
              title="Export Report to Excel (CSV)"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Settings Button */}
            <button 
              onClick={() => setIsAiConfigOpen(true)}
              className="flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-4 py-3 rounded-2xl transition-all border border-transparent hover:border-blue-100"
              title="Configure AI Settings"
            >
              <Settings size={18} />
              <span className="hidden lg:inline">AI Config</span>
            </button>
          </div>
        </header>

        {/* --- AI Config Modal --- */}
        {isAiConfigOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Sparkles size={18} /></div>
                  <h2 className="text-xl font-bold text-slate-800">AI Configuration</h2>
                </div>
                <button onClick={() => setIsAiConfigOpen(false)} className="text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">AI Provider</label>
                  <select 
                    value={aiProvider} onChange={handleProviderChange}
                    className={inputStyle}
                  >
                    {Object.entries(providerOptions).map(([key, opt]) => (
                      <option key={key} value={key}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                {providerOptions[aiProvider].needsKey && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">API Key</label>
                    <input 
                      type="password" value={aiApiKey} onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="Paste your API key here..."
                      className={`${inputStyle} font-mono`}
                    />
                    {providerOptions[aiProvider].url && (
                      <a href={providerOptions[aiProvider].url} target="_blank" rel="noreferrer" className="inline-flex items-center mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        Get your free {aiProvider} key here <ExternalLink size={12} className="ml-1" />
                      </a>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Model</label>
                  <select 
                    value={aiModel} onChange={(e) => setAiModel(e.target.value)}
                    className={inputStyle}
                  >
                    {providerOptions[aiProvider].models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setIsAiConfigOpen(false)}
                  className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-md"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Qualitative Section */}
            <section className={cardStyle}>
              <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-50 p-2.5 rounded-[14px] text-purple-600"><FileText size={20} /></div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Qualitative Details</h2>
                </div>
                <button
                  onClick={generateSuggestions} disabled={isGeneratingSuggestions || (!toolName && !useCase)}
                  className="flex items-center justify-center space-x-2 text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200/50"
                  title={(!toolName && !useCase) ? "Enter Tool Name and Use Case first" : "Generate multiple bullet points"}
                >
                  {isGeneratingSuggestions ? <Loader2 size={16} className="animate-spin text-amber-600" /> : <Sparkles size={16} className="text-amber-500" />}
                  <span>{isGeneratingSuggestions ? 'Auto-Filling...' : 'Auto-Fill Details'}</span>
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-5 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Automation Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Cpu size={18} />
                      </div>
                      <input 
                        type="text" value={toolName} onChange={(e) => setToolName(e.target.value)}
                        onFocus={() => setActiveField('toolName')} onBlur={() => setActiveField(null)}
                        placeholder="e.g., Ticket Auto-Triage Bot"
                        className={`${inputStyle} pl-12 font-medium`}
                      />
                    </div>
                    {renderHint('toolName', 'Give your automation project a short, recognizable name.')}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Use Case Description</label>
                    <textarea 
                      value={useCase} onChange={(e) => setUseCase(e.target.value)}
                      onFocus={() => setActiveField('useCase')} onBlur={() => setActiveField(null)}
                      rows={2} placeholder="Briefly describe what the automation does..."
                      className={`${inputStyle} resize-none font-medium`}
                    />
                    {renderHint('useCase', 'What specific manual process is this bot replacing? (e.g., "Resetting user passwords")')}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                      <BarChart3 size={16} className="mr-1.5 text-purple-500" /> KPIs Addressed
                    </label>
                    <textarea 
                      value={kpis} onChange={(e) => setKpis(e.target.value)}
                      onFocus={() => setActiveField('kpis')} onBlur={() => setActiveField(null)}
                      rows={3}
                      placeholder="e.g., MTTR, CSAT, Error Rate..."
                      className={`${inputStyle} resize-none font-medium`}
                    />
                    {renderHint('kpis', 'Which business metrics will this improve? (e.g., "Average Handle Time", "Error Rate")')}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                      <Target size={16} className="mr-1.5 text-red-500" /> Challenges Addressed
                    </label>
                    <textarea 
                      value={challenges} onChange={(e) => setChallenges(e.target.value)}
                      onFocus={() => setActiveField('challenges')} onBlur={() => setActiveField(null)}
                      rows={4} placeholder="What pain points are solved?"
                      className={`${inputStyle} resize-none text-sm font-medium`}
                    />
                    {renderHint('challenges', 'What pain points are solved? (e.g., "Too many typos", "Slow response time")')}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                      <Award size={16} className="mr-1.5 text-green-500" /> Qualitative Benefits
                    </label>
                    <textarea 
                      value={qualitativeBenefits} onChange={(e) => setQualitativeBenefits(e.target.value)}
                      onFocus={() => setActiveField('qualitative')} onBlur={() => setActiveField(null)}
                      rows={4} placeholder="e.g., Improved employee morale..."
                      className={`${inputStyle} resize-none text-sm font-medium`}
                    />
                    {renderHint('qualitative', 'What are the soft benefits? (e.g., "Higher employee morale", "Better compliance")')}
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
                    <label className="block text-sm font-bold text-slate-700">Number of Tasks</label>
                    <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                      <button onClick={() => setVolumePeriod('daily')} className={`px-3 py-1 text-xs rounded-lg transition-all font-bold ${volumePeriod === 'daily' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Daily</button>
                      <button onClick={() => setVolumePeriod('monthly')} className={`px-3 py-1 text-xs rounded-lg transition-all font-bold ${volumePeriod === 'monthly' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Monthly</button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <input 
                      type="number" value={executionsPerMonth} onChange={(e) => setExecutionsPerMonth(e.target.value)}
                      onFocus={() => setActiveField('tasks')} onBlur={() => setActiveField(null)}
                      className={`${executionsPerMonth < 0 ? inputErrorStyle : inputStyle} font-mono text-lg`}
                    />
                    {volumePeriod === 'daily' && (
                      <div className="relative w-28 flex-shrink-0" title="Working days per month">
                        <input 
                          type="number" min="1" max="31" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} 
                          className={`${workingDays < 1 ? inputErrorStyle : inputStyle} pr-10 font-mono text-lg`}
                        />
                        <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">days</span>
                      </div>
                    )}
                  </div>
                  {renderHint('tasks', volumePeriod === 'daily' ? 'Daily Volume: How many times per day? Multiplied by working days to get monthly volume.' : 'Monthly Volume: How many times does a human perform this specific task every month?')}
                </div>

                {/* Effort per Task */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Time Spent per Task</label>
                  <div className="flex space-x-3">
                    <div className="relative flex-1">
                      <input 
                        type="number" value={Math.round(effortHours * 60)} onChange={handleMinutesChange}
                        onFocus={() => setActiveField('time')} onBlur={() => setActiveField(null)}
                        className={`${effortHours < 0 ? inputErrorStyle : inputStyle} pr-12 font-mono text-lg`}
                      />
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 font-bold text-xs pointer-events-none">MIN</span>
                    </div>
                    <div className="relative flex-1">
                      <input 
                        type="number" step="0.01" value={Number(effortHours).toFixed(2)} onChange={(e) => setEffortHours(e.target.value)}
                        onFocus={() => setActiveField('time')} onBlur={() => setActiveField(null)}
                        className={`${effortHours < 0 ? inputErrorStyle : inputStyle} pr-12 font-mono text-lg bg-slate-100/50`}
                      />
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 font-bold text-xs pointer-events-none">HR</span>
                    </div>
                  </div>
                  {renderHint('time', 'AHT (Average Handle Time): How long does it take a human to complete this task just once?')}
                </div>

                {/* Resource Cost */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Resource Cost (Hourly)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Coins size={18} />
                    </div>
                    <input 
                      type="number" value={resourceCost} onChange={(e) => setResourceCost(e.target.value)}
                      onFocus={() => setActiveField('cost')} onBlur={() => setActiveField(null)}
                      className={`${resourceCost < 0 ? inputErrorStyle : inputStyle} pl-10 font-mono text-lg`}
                    />
                  </div>
                  {renderHint('cost', `The fully loaded hourly wage of the employee currently doing this task manually (in ${currency}).`)}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Remaining Duration</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Briefcase size={18} />
                    </div>
                    <input 
                      type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)}
                      onFocus={() => setActiveField('duration')} onBlur={() => setActiveField(null)}
                      className={`${durationMonths < 0 ? inputErrorStyle : inputStyle} pl-10 pr-20 font-mono text-lg`}
                    />
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 font-bold text-xs pointer-events-none">MONTHS</span>
                  </div>
                  {renderHint('duration', 'How many months will this automation run before the project ends or needs a rebuild?')}
                </div>

                {/* Percent Automated Slider */}
                <div className="md:col-span-2 pt-3 pb-3">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-slate-700">Percentage Automated</label>
                    <span className="font-extrabold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-xl text-sm shadow-sm">
                      {automationPercent}%
                    </span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={automationPercent} onChange={(e) => setAutomationPercent(e.target.value)}
                    onFocus={() => setActiveField('automation')} onBlur={() => setActiveField(null)}
                    onMouseEnter={() => setActiveField('automation')} onMouseLeave={() => setActiveField(null)}
                    className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-400 mt-3 px-1">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                  {renderHint('automation', 'What percentage of the manual work is being completely eliminated by the bot?')}
                </div>

                {/* --- Unified Investment & Ongoing Costs Section --- */}
                <div className="md:col-span-2 pt-5 border-t border-slate-200/60 mt-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <Wrench size={18} className="text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Investment & Ongoing Costs</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Implementation (One-Time) */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">One-Time Implementation</label>
                        <p className="text-[10px] text-slate-500 mb-3 leading-tight">Upfront investment cost to build or procure.</p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Coins size={14} /></div>
                        <input 
                          type="number" min="0" value={implementationCost} onChange={(e) => setImplementationCost(e.target.value)}
                          onFocus={() => setActiveField('implementation')} onBlur={() => setActiveField(null)}
                          className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8`}
                        />
                      </div>
                      {renderHint('implementation', 'Total upfront investment required (e.g., developer salaries, software licenses, vendor fees).')}
                    </div>

                    {/* Run Cost / Licenses */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Base Monthly Run Cost</label>
                        <p className="text-[10px] text-slate-500 mb-2 leading-tight">Ongoing recurring licenses/infra.</p>
                      </div>
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Coins size={14} /></div>
                          <input 
                            type="number" min="0" value={monthlyRunCost} onChange={(e) => setMonthlyRunCost(e.target.value)}
                            onFocus={() => setActiveField('runCost')} onBlur={() => setActiveField(null)}
                            className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">YOY Inflation Increase</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><TrendingUp size={14} /></div>
                            <input 
                              type="number" min="0" value={runCostInflation} onChange={(e) => setRunCostInflation(e.target.value)}
                              onFocus={() => setActiveField('runCost')} onBlur={() => setActiveField(null)}
                              className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8 pr-8`}
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-xs">%</span>
                          </div>
                        </div>
                      </div>
                      {renderHint('runCost', 'Base recurring costs (licenses, cloud) and their projected Annual Percentage Increase.')}
                    </div>

                    {/* SRE Y1 */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Y1 SRE Maint. (Monthly)</label>
                        <p className="text-[10px] text-slate-500 mb-3 leading-tight">First 12 months heavier support cost.</p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Users size={14} /></div>
                        <input 
                          type="number" min="0" value={sreCostY1} onChange={(e) => setSreCostY1(e.target.value)}
                          onFocus={() => setActiveField('sreY1')} onBlur={() => setActiveField(null)}
                          className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8`}
                        />
                      </div>
                      {renderHint('sreY1', 'Monthly cost of SREs/Maintenance needed specifically for the first year (e.g., handling heavy onboarding).')}
                    </div>

                    {/* SRE Y2+ */}
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Y2+ SRE Maint. (Monthly)</label>
                        <p className="text-[10px] text-slate-500 mb-3 leading-tight">Ongoing tapered support cost for remaining years.</p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Users size={14} /></div>
                        <input 
                          type="number" min="0" value={sreCostY2} onChange={(e) => setSreCostY2(e.target.value)}
                          onFocus={() => setActiveField('sreY2')} onBlur={() => setActiveField(null)}
                          className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono pl-8`}
                        />
                      </div>
                      {renderHint('sreY2', 'Reduced monthly SRE cost for Year 2 and beyond, after the system stabilizes.')}
                    </div>

                  </div>
                </div>

              </div>
            </section>
          </div>

          {/* Right Column: Results & Output */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Result Card */}
            <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] rounded-[28px] shadow-xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-[0.08] rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-purple-500 opacity-[0.1] rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="absolute bottom-6 right-6 opacity-5 pointer-events-none">
                <TrendingUp size={160} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <Tooltip text="Net Savings = (Gross Monthly Save × Duration) - Total Dynamic Run/SRE Costs - Implementation Cost">
                    <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-100 border border-white/10 shadow-sm flex items-center cursor-help">
                      Est. Lifetime Net Savings <Info size={14} className="ml-1.5 opacity-70" />
                    </span>
                  </Tooltip>
                  <span className="text-blue-200 text-sm font-semibold flex items-center">
                    <Clock size={14} className="mr-1.5 opacity-70"/> {durationMonths} Mo Project
                  </span>
                </div>
                
                <div className={`text-[3.5rem] leading-none xl:text-7xl font-extrabold tracking-tighter mt-6 mb-10 drop-shadow-2xl ${results.netSavings < 0 ? 'text-red-400' : 'text-white'}`}>
                  {formatCurrency(results.netSavings)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
                <div>
                  <Tooltip text="Average Monthly Net Savings (factors in strict month-by-month run cost inflation and variable SRE costs).">
                    <p className="text-blue-300 text-xs mb-1.5 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Avg Net Monthly <Info size={12} className="ml-1 opacity-70"/></p>
                  </Tooltip>
                  <p className="text-2xl font-bold tracking-tight text-white">{formatCurrency(results.avgNetMonthlySave)}</p>
                </div>
                <div>
                  <Tooltip text="Implementation Cost + Total Lifetime Run Costs + Total Lifetime SRE Costs">
                    <p className="text-blue-300 text-xs mb-1.5 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Total Investment <Info size={12} className="ml-1 opacity-70"/></p>
                  </Tooltip>
                  <p className="text-2xl font-bold tracking-tight text-white">{formatCurrency(results.totalInvestment)}</p>
                </div>
              </div>

              {/* ROI & Payback - Glass Cards */}
              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
                  <Tooltip text="(Net Savings / Total Investment) × 100">
                    <p className="text-blue-300/80 text-xs mb-1 uppercase tracking-wider font-bold flex items-center cursor-help w-max">ROI <Info size={12} className="ml-1 opacity-70"/></p>
                  </Tooltip>
                  <p className={`text-2xl font-extrabold tracking-tight ${results.roi < 0 ? 'text-red-400' : results.roi >= 100 ? 'text-[#34D399]' : 'text-white'}`}>
                    {results.roi === Infinity ? '∞' : `${Math.round(results.roi).toLocaleString()}%`}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
                  <Tooltip text="Exact month where cumulative savings exceeds cumulative implementation, run, and maintenance costs.">
                    <p className="text-blue-300/80 text-xs mb-1 uppercase tracking-wider font-bold flex items-center cursor-help w-max">Payback Period <Info size={12} className="ml-1 opacity-70"/></p>
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
                  <ArrowRightLeft size={18} className="mr-2 text-blue-600"/> 
                  Current vs. Future State
                </h3>
                
                <div className="space-y-6">
                  {/* Current State (As-Is) Column */}
                  <div className="bg-slate-50 p-5 rounded-[20px] border border-slate-200/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">Current State (As-Is)</div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                         <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Monthly Labor Cost</div>
                         <div className="text-xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(results.currentMonthlyCost)}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Manual Effort</div>
                         <div className="text-xl font-extrabold text-slate-800 tracking-tight">{new Intl.NumberFormat().format(Math.round(results.totalManualHoursMonthly))} <span className="text-sm font-medium text-slate-500">hrs/mo</span></div>
                      </div>
                    </div>
                    
                    {challenges && (
                      <div className="border-t border-slate-200 pt-3">
                        <div className="text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center">
                          <Activity size={12} className="mr-1.5" /> Existing Challenges
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                          {challenges}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Future State (To-Be) Column */}
                  <div className="bg-blue-50/50 p-5 rounded-[20px] border border-blue-100/60 shadow-[inset_0_1px_3px_rgba(59,130,246,0.05)]">
                    <div className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest mb-4 flex items-center"><Sparkles size={14} className="mr-1.5"/> Future State (To-Be)</div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                         <Tooltip text="Average future monthly cost (Remaining manual labor + Average monthly run cost + Average monthly SRE cost).">
                           <div className="text-[11px] font-bold text-blue-400 uppercase mb-1 flex items-center cursor-help">Avg Total Cost/Mo <Info size={10} className="ml-1 opacity-80" /></div>
                         </Tooltip>
                         <div className="text-xl font-extrabold text-blue-900 tracking-tight">{formatCurrency(results.futureMonthlyCostAvg)}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[11px] font-bold text-blue-400 uppercase mb-1">Residual Effort</div>
                         <div className="text-xl font-extrabold text-blue-900 tracking-tight">{new Intl.NumberFormat().format(Math.round(results.remainingManualHoursMonthly))} <span className="text-sm font-medium text-blue-600/70">hrs/mo</span></div>
                      </div>
                    </div>

                    {(kpis || qualitativeBenefits) && (
                      <div className="border-t border-blue-100 pt-3 space-y-3">
                        {kpis && (
                          <div>
                            <div className="text-[10px] font-bold text-purple-600 uppercase mb-1 flex items-center">
                              <BarChart3 size={12} className="mr-1.5" /> Target KPIs
                            </div>
                            <p className="text-xs text-blue-800 leading-relaxed whitespace-pre-wrap font-medium">
                              {kpis}
                            </p>
                          </div>
                        )}
                        {qualitativeBenefits && (
                          <div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1 flex items-center">
                              <Award size={12} className="mr-1.5" /> Strategic Benefits
                            </div>
                            <p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-wrap font-medium">
                              {qualitativeBenefits}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 pt-0 mt-auto">
                <div className="border-t border-slate-100 pt-5">
                  <button 
                    onClick={generateROIInsights} disabled={isGeneratingInsights}
                    className="w-full flex items-center justify-center space-x-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm border border-blue-100"
                  >
                    {isGeneratingInsights ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-amber-500" />}
                    <span>{roiInsights ? 'Regenerate Strategy' : 'Get AI Strategy Insights'}</span>
                  </button>
                  
                  {roiInsights && (
                    <div className="mt-4 bg-indigo-50/80 p-5 rounded-2xl text-sm font-medium text-indigo-900 leading-relaxed border border-indigo-100/50 overflow-y-auto max-h-40 shadow-inner custom-scrollbar">
                      {roiInsights}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Operational Impact (Hours & FTEs) */}
            <div className={`${cardStyle} p-6 md:p-8 grid grid-cols-2 gap-6`}>
              <div>
                <Tooltip text="Total manual hours saved over the project duration.">
                  <div className="flex items-center space-x-2 text-emerald-700 mb-3 bg-emerald-50 w-max px-3 py-1.5 rounded-xl font-bold text-sm cursor-help">
                    <Clock size={16} /><span>Time Recaptured</span><Info size={14} className="opacity-70" />
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
                    <Users size={16} /><span>FTE Savings</span><Info size={14} className="opacity-70" />
                  </div>
                </Tooltip>
                <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {results.fteSavings.toFixed(1)} <span className="text-base text-slate-500 font-medium">FTEs</span>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                  Reallocated capacity
                </p>
              </div>
            </div>

            {/* Business Case Summary */}
            <div className="bg-slate-900 rounded-[28px] shadow-xl text-slate-100 p-6 md:p-8 flex flex-col h-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 opacity-5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-800 rounded-[14px] text-slate-300 border border-slate-700/50"><FileText size={20} /></div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Business Case Pitch</h3>
                </div>
                
                {(toolName || useCase || aiPitch) && (
                  <button 
                    onClick={handleCopy}
                    className="flex items-center space-x-2 text-sm font-bold bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-2xl transition-all shadow-sm"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy Pitch'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl mb-6 gap-3 border border-slate-700/50 backdrop-blur-sm relative z-10">
                <div className="flex items-center space-x-2 pl-2">
                  <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-200">General Business Case Pitch</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={generateAIPitch}
                    disabled={isGenerating || (!toolName && !useCase)}
                    className="flex items-center justify-center space-x-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-5 py-2 rounded-xl transition-all font-bold shadow-sm"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    <span>{isGenerating ? 'Drafting...' : (aiPitch ? 'Regenerate AI' : 'Generate with AI')}</span>
                  </button>
                  {aiPitch && !isGenerating && (
                    <button onClick={() => setAiPitch('')} className="text-xs font-bold text-slate-400 hover:text-white underline px-2">
                      Reset
                    </button>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-950/40 rounded-2xl p-6 border border-white/5 relative z-10 flex-1">
                <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {isGenerating ? (
                     <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                       <Loader2 size={36} className="animate-spin mb-4 text-blue-500" />
                       <p className="animate-pulse font-medium">Crafting your perfect pitch...</p>
                     </div>
                  ) : aiPitch ? (
                     <div className="whitespace-pre-wrap text-[15px]">{aiPitch}</div>
                  ) : toolName || useCase ? (
                    <>
                      <p className="mb-4 text-[15px]">
                        By implementing <strong className="text-white">{toolName || "the proposed automation"}</strong> 
                        {useCase && ` to ${useCase}`}, we anticipate automating <strong className="text-blue-400">{automationPercent}%</strong> of the targeted workload. 
                        Currently, this task requires {Number(results.effectiveExecutions).toLocaleString()} executions per month, taking approximately {Math.round(effortHours * 60)} minutes each.
                      </p>
                      
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
                      
                      <p className="mb-4 text-[15px]">
                        Financially, this requires an initial investment of {formatCurrency(implementationCost)}. Over the {durationMonths}-month lifecycle, total maintenance and inflated run costs are projected at {formatCurrency(results.totalRunCost + results.totalSreCost)}. The automation yields a gross labor cost avoidance of <strong className="text-emerald-400">{formatCurrency(results.grossMonthlySave)} per month</strong>. 
                        After factoring in these dynamic operational costs, this amounts to a <strong>Lifetime Net Savings of <span className="text-emerald-400">{formatCurrency(results.netSavings)}</span></strong>. 
                        The precise payback period is <strong>{results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod.toFixed(1) + ' months'}</strong>, delivering an ROI of <strong>{results.roi === Infinity ? 'Infinite' : `${Math.round(results.roi)}%`}</strong>.
                      </p>

                      <p className="text-[15px]">
                        Operationally, the automation recaptures {Math.round(results.hoursSavedTotal).toLocaleString()} resource hours over the project life. 
                        This represents an ongoing monthly savings of <strong className="text-indigo-300">{results.fteSavings.toFixed(1)} FTEs</strong> (Full-Time Equivalents) that can be redirected toward higher-value, strategic initiatives.
                      </p>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                      <div className="bg-slate-800 p-4 rounded-full mb-4 opacity-50"><Cpu size={40} /></div>
                      <p className="font-medium text-lg text-slate-400">Ready to draft your business case.</p>
                      <p className="text-sm mt-1">Enter a tool name and use case above to begin.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className={`${cardStyle} mt-6 mb-12`}>
          <button 
            onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
            className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors text-left outline-none"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-slate-100 p-3 rounded-2xl text-slate-600">
                <HelpCircle size={24} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Methodology & AI Details</h2>
                <p className="text-sm text-slate-500 font-medium">How these numbers are calculated</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-300 bg-slate-100 p-2 rounded-full ${isHowItWorksOpen ? 'rotate-180' : ''}`}>
              <ChevronDown size={20} className="text-slate-500" />
            </div>
          </button>
          
          <div className={`transition-all duration-300 ease-in-out ${isHowItWorksOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-6 md:p-8 pt-0 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Month-By-Month Engine</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      This calculator doesn't just multiply static numbers. It loops through every month of the project's duration to accurately compound <strong>Run Cost Inflation</strong> and dynamically switch between <strong>Y1 vs Y2+ SRE/Maintenance costs</strong>. This guarantees a mathematically precise Payback Period and ROI.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Net Savings</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      The actual financial gain. Projects the gross savings over the lifetime of the project and subtracts the initial implementation cost, the inflating monthly run costs, and the variable monthly maintenance costs.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">SRE / Maintenance Ramp-Down</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Complex automations usually require heavier support when they are first launched (e.g., 5 SREs), which tapers off as the system stabilizes (e.g., 2 SREs). The advanced cost settings allow you to accurately forecast this ramp-down.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">FTE Savings</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      FTE stands for "Full-Time Equivalent". In this tool, we assume a standard work month has roughly 160 hours (40 hours/week × 4 weeks). 
                      If your automation saves 160 hours, it is effectively doing the work of 1 full-time employee.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Return on Investment (ROI)</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Measures profitability. An ROI of 100% means the automation paid for its total investment (Implementation + Run Costs + Maintenance) and generated that same amount in pure savings. 
                    </p>
                  </div>
                  <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6 mt-4">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center">
                      <Settings size={16} className="mr-2 text-blue-600" />
                      What AI powers these insights?
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed font-medium">
                      By default, this calculator integrates Google's advanced <strong>Gemini 2.5 Flash</strong> model. 
                      However, you can click the <strong className="inline-flex items-center text-blue-900 bg-white px-2 py-0.5 rounded shadow-sm mx-1 hover:bg-slate-50 transition-colors"><Settings size={12} className="mr-1"/> AI Config</strong> button at the top of the screen to switch to other high-quality free models.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Scrollbar Styles for the Pitch Box */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}} />
    </div>
  );
}
