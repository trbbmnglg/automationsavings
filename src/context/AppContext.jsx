import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStickyState } from '../hooks/useStickyState';
import { useCalculationEngine } from '../hooks/useCalculationEngine';
import { DEFAULT_LCR, providerOptions, currencyConfig } from '../constants/config';
import { fetchWithRetry, sanitizeStr } from '../utils/aiUtils';

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
        const response = await fetch('https://api.frankfurter.app/latest?from=USD', { signal: controller.signal });
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
        const response = await fetch('https://raw.githubusercontent.com/trbbmnglg/automationsavings/main/src/lcr.json', { signal: controller.signal });
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

  // --- Calculation Engine ---
  const calculationDeps = { laborBreakdown, automationPercent, durationMonths, implementationCost, monthlyRunCost, runCostInflation, isAdvancedRunCost, runCostBreakdown, lcrRates, hasSre, isAdvancedSre, sreCostY1, sreCostY2, sreBreakdown, workingDays, hoursPerDay, scenario, currency, exchangeRates };
  const results = useCalculationEngine(calculationDeps);

  // --- Utility Formatting & Basic Handlers ---
  const formatCurrency = (value) => new Intl.NumberFormat(currencyConfig[currency].locale, { style: 'currency', currency: currencyConfig[currency].code, maximumFractionDigits: 0 }).format(value);
  
  const handleCurrencyChange = (newCurrency) => {
    if (newCurrency === currency) return;
    const multiplier = exchangeRates[newCurrency] / exchangeRates[currency];
    if (!isFinite(multiplier) || multiplier === 0) return;
    const newIc = implementationCost === '' ? '' : Number((implementationCost * multiplier).toFixed(0));
    const newMc = monthlyRunCost === '' ? '' : Number((monthlyRunCost * multiplier).toFixed(2));
    setRunCostBreakdown(prev => {
       const updated = { ...prev };
       Object.keys(updated).forEach(key => {
         if (updated[key].cost !== '') updated[key].cost = Number((updated[key].cost * multiplier).toFixed(2));
       });
       return updated;
    });
    setImplementationCost(newIc); setMonthlyRunCost(newMc); setCurrency(newCurrency);
  };

  const handleProviderChange = (e) => {
    const newProv = e.target.value;
    setAiProvider(newProv);
    setAiModel(providerOptions[newProv].models[0]);
  };

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
    setLaborBreakdown([
      { id: crypto.randomUUID(), cl: 'CL12', executions: 5000, volumePeriod: 'monthly', effortMinutes: 10, effortHours: 0.1667 },
      { id: crypto.randomUUID(), cl: 'CL9', executions: 100, volumePeriod: 'monthly', effortMinutes: 30, effortHours: 0.5 },    
      { id: crypto.randomUUID(), cl: 'CL7', executions: 20, volumePeriod: 'daily', effortMinutes: 15, effortHours: 0.25 }       
    ]);
    setWorkingDays(22); setHoursPerDay(8); setAutomationPercent(90); setDurationMonths(36); setImplementationCost(5000);
    setIsAdvancedRunCost(true);
    setRunCostBreakdown({ productLicense: { cost: 100, inflation: 5 }, ai: { enabled: true, cost: 50, inflation: 3 }, splunk: { enabled: true, cost: 200, inflation: 8 }, infra: { enabled: true, cost: 150, inflation: 5 }, other: { enabled: false, cost: '', inflation: 5 } });
    setHasSre(true); setIsAdvancedSre(true);
    setSreBreakdown([ { id: crypto.randomUUID(), cl: 'CL9', tasksPerMonth: 20, effortMinutes: 45, effortHours: 0.75, y2Reduction: 50 }, { id: crypto.randomUUID(), cl: 'CL7', tasksPerMonth: 5, effortMinutes: 60, effortHours: 1.0, y2Reduction: 80 } ]);
    setSreUseCase('Ongoing API endpoint maintenance, error resolution, and bot ruleset optimization.');
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

  // --- AI Gen Handlers ---
  const callAIWrapper = async (prompt) => {
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

  const generateAIPitch = async () => {
    setIsGenerating(true);
    const prompt = `Act as a professional business analyst. Write a persuasive, general business case pitch for an automation project. Details: Tool Name: """${sanitizeStr(toolName)}""" | Use Case: """${sanitizeStr(useCase)}""" | Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Forecast. Financials: Lifetime Net Savings: ${formatCurrency(results.netSavings)} over ${durationMonths} months | ROI: ${Math.round(results.roi)}%. Write a compelling executive summary (2-3 paragraphs). Do NOT include greetings.`;
    try { const text = await callAIWrapper(prompt); if (text) setAiPitch(text.trim()); } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const generateSuggestions = async () => {
    if (!toolName && !useCase) return;
    setIsGeneratingSuggestions(true);
    const prompt = `Based on Tool Name: """${sanitizeStr(toolName)}""" and Use Case: """${sanitizeStr(useCase)}""", return ONLY a valid JSON object exactly matching this structure: {"kpis": ["..."], "challenges": ["..."], "benefits": ["..."]}. Do NOT include markdown backticks. Escape all internal quotes.`;
    try {
      const text = await callAIWrapper(prompt);
      let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const startIndex = cleanText.indexOf('{');
      const endIndex = cleanText.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        let jsonStr = cleanText.substring(startIndex, endIndex + 1);
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1').replace(/[\x00-\x1F\x7F-\x9F]/g, ""); 
        const parsed = JSON.parse(jsonStr);
        if (parsed.kpis && Array.isArray(parsed.kpis)) setKpis(parsed.kpis.map(k => '• ' + k).join('\n'));
        if (parsed.challenges && Array.isArray(parsed.challenges)) setChallenges(parsed.challenges.map(c => '• ' + c).join('\n'));
        if (parsed.benefits && Array.isArray(parsed.benefits)) setQualitativeBenefits(parsed.benefits.map(b => '• ' + b).join('\n'));
        setAiGeneratedFields({ kpis: true, challenges: true, benefits: true });
      }
    } catch (error) { console.warn("AI parsing failed:", error); } finally { setIsGeneratingSuggestions(false); }
  };

  const generateROIInsights = async () => {
    setIsGeneratingInsights(true);
    const prompt = `Act as a financial strategist. Analyze these metrics: Net Savings: ${formatCurrency(results.netSavings)}, ROI: ${Math.round(results.roi)}%, Payback: ${results.paybackPeriod.toFixed(1)} mo. Provide 2-3 brief, actionable bullet points to improve ROI. Use simple dashes for bullets, no bold markdown.`;
    try { const text = await callAIWrapper(prompt); if (text) setRoiInsights(text.trim()); } catch (error) { console.error(error); } finally { setIsGeneratingInsights(false); }
  };

  const generateSreUseCase = async () => {
    setIsGeneratingSreUseCase(true);
    const tName = toolName?.trim() ? sanitizeStr(toolName) : "this enterprise automation system";
    const uCase = useCase?.trim() ? sanitizeStr(useCase) : "standard automated workflows";
    const prompt = `Based on the automation tool named """${tName}""" and use case """${uCase}""", generate 2 very short, simple bullet points (maximum 5-8 words per point) justifying the need for ongoing SRE/maintenance. Keep it extremely brief. Start each point with '• '. Return ONLY the text without markdown formatting or quotes.`;
    try { const text = await callAIWrapper(prompt); if (text) setSreUseCase(text.replace(/["']/g, "").trim()); } catch (error) { console.warn("AI SRE Use Case generation failed:", error); } finally { setIsGeneratingSreUseCase(false); }
  };

  // --- Export Handlers (NATIVE IMPORTS) ---
  const isReadyToExport = !!(
    toolName.trim() && useCase.trim() && 
    laborBreakdown.some(l => Number(l.executions) > 0 && Number(l.effortHours) > 0) &&
    Number(durationMonths) > 0 && Number(implementationCost) >= 0 && 
    (isAdvancedRunCost ? Number(results.uiRunCostY1) >= 0 : Number(monthlyRunCost) >= 0)
  );

  const handleExportXLSX = async () => {
    if (!isReadyToExport) return;
    setIsExportingXLSX(true);
    try {
      // Dynamic import from node_modules
      const xlsxModule = await import('xlsx-js-style');
      const XLSX = xlsxModule.default || xlsxModule;
      
      const wb = XLSX.utils.book_new();
      const scenarioLabel = scenario.charAt(0).toUpperCase() + scenario.slice(1);

      const ws_data = [
        ["", "", "", "", `Quantitative Benefits (${scenarioLabel} Forecast)`, "", "", "", "", ""],
        [ "Tool", "Use Case Description", "Challenges Addressed", "Qualitative Benefits", "total executions per month", "blended effort per execution in hours", "blended resource cost per hour", "% of task automated", "remaining contract/project duration in months", "Cost Benefit" ],
        [ toolName || 'N/A', useCase || 'N/A', challenges || 'N/A', qualitativeBenefits || 'N/A', Math.round(results.totalEffectiveExecutions), Number(results.blendedEffortPerHour).toFixed(2), formatCurrency(results.blendedResourceCostPerHour), `${automationPercent}%`, durationMonths, formatCurrency(results.netSavings) ]
      ];
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      ws['!merges'] = [{ s: { r: 0, c: 4 }, e: { r: 0, c: 9 } }];
      const headerStyle = { fill: { fgColor: { rgb: "1E40AF" } }, font: { color: { rgb: "FFFFFF" }, bold: true }, alignment: { wrapText: true, vertical: "center", horizontal: "center" } };
      const dataStyle = { alignment: { wrapText: true, vertical: "top", horizontal: "left" } };
      if (ws['E1']) ws['E1'].s = headerStyle;
      const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      cols.forEach(col => { if (ws[`${col}2`]) ws[`${col}2`].s = headerStyle; if (ws[`${col}3`]) ws[`${col}3`].s = dataStyle; });
      ws['!cols'] = [ { wch: 25 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 } ];
      ws['!rows'] = [ { hpt: 30 }, { hpt: 60 }, { hpt: 80 } ];
      XLSX.utils.book_append_sheet(wb, ws, "Automation Savings");
      
      const monthlySheetData = results.monthlyData.map(row => ({
          Month: row.month, Year: row.year, "Implementation Cost": formatCurrency(row.implementationCost), "Run Cost": formatCurrency(row.runCost), "SRE Cost": formatCurrency(row.sreCost), "Gross Savings": formatCurrency(row.grossSavings), "Net Cash Flow": formatCurrency(row.netCashFlow), "Cumulative Net": formatCurrency(row.cumulativeNet)
      }));
      const monthlySheet = XLSX.utils.json_to_sheet(monthlySheetData);
      XLSX.utils.book_append_sheet(wb, monthlySheet, "Monthly Cash Flow");

      XLSX.writeFile(wb, "Automation Savings.xlsx");
    } catch (e) { console.error(e); alert(`Failed to generate Excel file. Error: ${e.message}`); }
    setIsExportingXLSX(false);
  };

  const handleExportPPTX = async () => {
    if (!isReadyToExport) return;
    setIsExportingPPTX(true);
    try {
      // Dynamic import from node_modules (pptxgenjs automatically handles JSZip)
      const pptxgenModule = await import('pptxgenjs');
      const PptxGenJS = pptxgenModule.default || pptxgenModule;
      
      const pptx = new PptxGenJS(); 
      pptx.layout = 'LAYOUT_WIDE'; 
      const slide = pptx.addSlide();
      
      let accentColor = '10B981';
      if (results.automationScore < 80 && results.automationScore >= 60) accentColor = '3B82F6';
      if (results.automationScore < 60 && results.automationScore >= 40) accentColor = 'F59E0B';
      if (results.automationScore < 40) accentColor = 'EF4444';
      const cBg = 'F8FAFC'; const cCardBg = 'FFFFFF'; const cTextDark = '0F172A'; const cTextMuted = '64748B'; const cBorder = 'E2E8F0';
      slide.background = { color: cBg };

      slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 0.1, fill: { color: accentColor } });
      slide.addText((toolName || 'Proposed Automation').toUpperCase(), { x: 0.5, y: 0.3, w: 8.5, h: 0.6, fontSize: 28, bold: true, color: cTextDark, fontFace: 'Arial Black' });
      slide.addText(`Business Case & ROI Strategy | Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}`, { x: 0.5, y: 0.9, w: 8.5, h: 0.3, fontSize: 12, color: cTextMuted, bold: true });
      slide.addText(useCase || 'N/A', { x: 0.5, y: 1.2, w: 8.5, h: 0.4, fontSize: 11, color: cTextMuted, italic: true, valign: 'top' });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 9.5, y: 0.4, w: 3.3, h: 0.9, fill: { color: accentColor }, rectRadius: 0.1 });
      slide.addText(`VIABILITY SCORE: ${results.automationScore}/100`, { x: 9.5, y: 0.5, w: 3.3, h: 0.3, fontSize: 10, bold: true, color: 'FFFFFF', align: 'center', opacity: 0.9 });
      slide.addText(results.scoreLabel.toUpperCase(), { x: 9.5, y: 0.8, w: 3.3, h: 0.4, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial Black' });

      const colY = 1.8; const colH = 5.2;
      const col1X = 0.5; const col1W = 3.9;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: col1X, y: colY, w: col1W, h: colH, fill: { color: cCardBg }, line: { color: cBorder, width: 1 }, rectRadius: 0.05 });
      slide.addText('01 / THE CONTEXT', { x: col1X + 0.2, y: colY + 0.2, w: col1W - 0.4, h: 0.3, fontSize: 12, bold: true, color: accentColor, fontFace: 'Arial Black' });
      slide.addText('Challenges Addressed', { x: col1X + 0.2, y: colY + 0.7, w: col1W - 0.4, h: 0.3, fontSize: 12, bold: true, color: cTextDark });
      const chalArr = challenges ? challenges.split('\n').filter(k=>k.trim()!=='').map(c => ({ text: c.replace('•','').trim(), options: { bullet: true, color: cTextMuted } })) : [{ text: "None specified", options: { bullet: true, color: cTextMuted } }];
      slide.addText(chalArr, { x: col1X + 0.3, y: colY + 1.0, w: col1W - 0.6, h: 1.8, fontSize: 11, valign: 'top' });
      slide.addShape(pptx.shapes.LINE, { x: col1X + 0.2, y: colY + 3.0, w: col1W - 0.4, h: 0, line: { color: cBorder, width: 1 } });
      slide.addText('Target KPIs', { x: col1X + 0.2, y: colY + 3.2, w: col1W - 0.4, h: 0.3, fontSize: 12, bold: true, color: cTextDark });
      const kpiArr = kpis ? kpis.split('\n').filter(k=>k.trim()!=='').map(k => ({ text: k.replace('•','').trim(), options: { bullet: true, color: cTextMuted } })) : [{ text: "None specified", options: { bullet: true, color: cTextMuted } }];
      slide.addText(kpiArr, { x: col1X + 0.3, y: colY + 3.5, w: col1W - 0.6, h: 1.5, fontSize: 11, valign: 'top' });

      const col2X = 4.6; const col2W = 4.2;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: col2X, y: colY, w: col2W, h: colH, fill: { color: cCardBg }, line: { color: cBorder, width: 1 }, rectRadius: 0.05 });
      slide.addText('02 / THE SOLUTION', { x: col2X + 0.2, y: colY + 0.2, w: col2W - 0.4, h: 0.3, fontSize: 12, bold: true, color: accentColor, fontFace: 'Arial Black' });
      slide.addText('Effort Automation Shift', { x: col2X, y: colY + 0.7, w: col2W, h: 0.3, fontSize: 12, bold: true, color: cTextDark, align: 'center' });
      slide.addChart(pptx.charts.DOUGHNUT, [{ name: "Effort", labels: ["Automated", "Manual"], values: [Number(automationPercent), 100 - Number(automationPercent)] }], { x: col2X + 0.85, y: colY + 1.1, w: 2.5, h: 2.0, holeSize: 65, showLegend: true, legendPos: 'b', legendFontSize: 10, showLabel: false, chartColors: [accentColor, 'CBD5E1'], dataBorder: { pt: 0 } });
      slide.addText(`${automationPercent}%`, { x: col2X + 0.85, y: colY + 1.1, w: 2.5, h: 1.7, align: 'center', valign: 'middle', fontSize: 24, bold: true, color: cTextDark, fontFace: 'Arial Black' });
      slide.addShape(pptx.shapes.LINE, { x: col2X + 0.2, y: colY + 3.3, w: col2W - 0.4, h: 0, line: { color: cBorder, width: 1 } });
      slide.addText('Monthly Cost Reduction', { x: col2X + 0.2, y: colY + 3.5, w: col2W - 0.4, h: 0.3, fontSize: 11, bold: true, color: cTextMuted });
      slide.addText(`${formatCurrency(results.currentMonthlyCost)}  →  ${formatCurrency(results.futureMonthlyCostAvg)}`, { x: col2X + 0.2, y: colY + 3.8, w: col2W - 0.4, h: 0.4, fontSize: 18, bold: true, color: cTextDark });
      slide.addText('Capacity Shift (FTEs)', { x: col2X + 0.2, y: colY + 4.3, w: col2W - 0.4, h: 0.3, fontSize: 11, bold: true, color: cTextMuted });
      const maxFteW = col2W - 0.6; const currentFte = results.currentFte || 1; const futureFteW = (results.toBeFte / currentFte) * maxFteW;
      slide.addShape(pptx.shapes.RECTANGLE, { x: col2X + 0.3, y: colY + 4.7, w: maxFteW, h: 0.3, fill: { color: 'E2E8F0' } });
      slide.addShape(pptx.shapes.RECTANGLE, { x: col2X + 0.3, y: colY + 4.7, w: Math.max(futureFteW, 0.05), h: 0.3, fill: { color: accentColor } });
      slide.addText(`${results.currentFte.toFixed(1)} FTEs As-Is`, { x: col2X + 0.3, y: colY + 4.7, w: maxFteW, h: 0.3, fontSize: 9, color: cTextMuted, align: 'right', valign: 'middle', pr: 0.1 });

      const col3X = 9.0; const col3W = 3.8;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: col3X, y: colY, w: col3W, h: colH, fill: { color: accentColor, transparency: 95 }, line: { color: accentColor, width: 2 }, rectRadius: 0.05 });
      slide.addText('03 / FINANCIAL IMPACT', { x: col3X + 0.2, y: colY + 0.2, w: col3W - 0.4, h: 0.3, fontSize: 12, bold: true, color: accentColor, fontFace: 'Arial Black' });
      const impactMetrics = [ { label: "LIFETIME NET SAVINGS", value: formatCurrency(results.netSavings) }, { label: "RETURN ON INVESTMENT (ROI)", value: results.roi === Infinity ? '>1000%' : `${Math.round(results.roi).toLocaleString()}%` }, { label: "PAYBACK PERIOD", value: results.paybackPeriod === Infinity ? 'Never' : `${results.paybackPeriod.toFixed(1)} months` }, { label: "CAPACITY RECAPTURED", value: `${results.fteSavings.toFixed(1)} FTEs/mo` } ];
      let currentY = colY + 0.8;
      impactMetrics.forEach((metric, i) => {
        slide.addText(metric.label, { x: col3X + 0.3, y: currentY, w: col3W - 0.6, h: 0.3, fontSize: 11, bold: true, color: cTextMuted });
        slide.addText(metric.value, { x: col3X + 0.3, y: currentY + 0.3, w: col3W - 0.6, h: 0.6, fontSize: 28, bold: true, color: cTextDark, fontFace: 'Arial Black' });
        if (i < 3) { slide.addShape(pptx.shapes.LINE, { x: col3X + 0.3, y: currentY + 1.0, w: col3W - 0.6, h: 0, line: { color: accentColor, width: 1, transparency: 80 } }); currentY += 1.15; }
      });

      await pptx.writeFile({ fileName: `${toolName || 'Automation'} Automation 1 Slider.pptx` });
    } catch (e) { console.error(e); alert(`Failed to generate PPTX file. Error: ${e.message}`); }
    setIsExportingPPTX(false);
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
    handleCurrencyChange, handleLaborMinutesChange, handleLaborHoursChange, handleSreMinutesChange, handleSreHoursChange, updateLabor, addLabor, removeLabor, updateSreRole, addSreRole, removeSreRole, updateRunCostBreakdown, handleGenerateMockData, handleClearAll, sanitizeStr, formatCurrency,
    generateAIPitch, generateSuggestions, generateROIInsights, generateSreUseCase, handleProviderChange, handleExportXLSX, handleExportPPTX, handleCopy,
    bgMain, textMain, textHeading, textSub, borderMuted, panelBg, cardStyle, inputStyle, inputErrorStyle
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
