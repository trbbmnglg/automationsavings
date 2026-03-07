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
  ChevronUp, 
  Settings, 
  X, 
  ExternalLink, 
  ArrowRightLeft
} from 'lucide-react';

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
  const [durationMonths, setDurationMonths] = useState(24);
  const [implementationCost, setImplementationCost] = useState(5000);
  const [monthlyRunCost, setMonthlyRunCost] = useState(250); 

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

  // --- Calculations ---
  const results = useMemo(() => {
    const exactEffort = Math.max(0, Number(effortHours));
    const rawExecutions = Math.max(0, Number(executionsPerMonth));
    const effectiveExecutions = volumePeriod === 'daily' ? rawExecutions * Math.max(1, Number(workingDays)) : rawExecutions;
    const cost = Math.max(0, Number(resourceCost));
    const autoRatio = Math.max(0, Math.min(100, Number(automationPercent))) / 100;
    const months = Math.max(0, Number(durationMonths));
    const implCost = Math.max(0, Number(implementationCost));
    const runCostMonthly = Math.max(0, Number(monthlyRunCost));

    const hoursMonthlyCurrent = effectiveExecutions * exactEffort;
    const hoursMonthlySaved = hoursMonthlyCurrent * autoRatio;
    const hoursSavedTotal = hoursMonthlySaved * months;
    
    const currentMonthlyCost = hoursMonthlyCurrent * cost;
    const grossMonthlySave = hoursMonthlySaved * cost;
    const netMonthlySave = grossMonthlySave - runCostMonthly;
    
    const futureMonthlyCost = Math.max(0, (currentMonthlyCost - grossMonthlySave) + runCostMonthly);
    
    const totalGrossSave = grossMonthlySave * months;
    const totalRunCost = runCostMonthly * months;
    const totalInvestment = implCost + totalRunCost;
    const netSave = totalGrossSave - totalInvestment;
    
    const roi = totalInvestment > 0 ? (netSave / totalInvestment) * 100 : (netSave > 0 ? Infinity : 0);
    const payback = netMonthlySave > 0 ? implCost / netMonthlySave : (implCost === 0 ? 0 : Infinity);
    const fte = hoursMonthlySaved / 160; 

    return {
      effectiveExecutions,
      currentMonthlyCost,
      futureMonthlyCost,
      grossMonthlySave,
      netMonthlySave,
      annualSavings: netMonthlySave * 12,
      totalGrossSavings: totalGrossSave,
      totalInvestment,
      netSavings: netSave,
      roi,
      paybackPeriod: payback,
      hoursSavedMonthly: hoursMonthlySaved,
      hoursSavedTotal: hoursSavedTotal,
      fteSavings: fte,
      totalManualHoursMonthly: hoursMonthlyCurrent,
      remainingManualHoursMonthly: Math.max(0, hoursMonthlyCurrent - hoursMonthlySaved)
    };
  }, [executionsPerMonth, effortHours, resourceCost, automationPercent, durationMonths, implementationCost, monthlyRunCost, volumePeriod, workingDays]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleMinutesChange = (e) => {
    const mins = Math.max(0, Number(e.target.value));
    setEffortHours(mins / 60);
  };

  const fetchWithRetry = async (url, options) => {
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

  const callAI = async (prompt) => {
    if (providerOptions[aiProvider].needsKey && !aiApiKey.trim()) {
      throw new Error(`Please provide an API key for ${providerOptions[aiProvider].name} in the AI Settings.`);
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
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: aiModel })
      });
      return await response.text();
    } else {
      let url = aiProvider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
      const data = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`
        },
        body: JSON.stringify({ model: aiModel, messages: [{ role: 'user', content: prompt }] })
      });
      return data?.choices?.[0]?.message?.content;
    }
  };

  const generateAIPitch = async () => {
    setIsGenerating(true);
    const prompt = `Act as a professional business analyst. Write a persuasive business case pitch for an automation project.

Details:
- Tool Name: ${toolName || 'Proposed Automation'}
- Use Case: ${useCase || 'N/A'}
- KPIs Addressed: ${kpis || 'N/A'}
- Challenges Addressed: ${challenges || 'N/A'}
- Qualitative Benefits: ${qualitativeBenefits || 'N/A'}
- Total Executions: ${Number(results.effectiveExecutions).toLocaleString()} per month

Financials:
- Net Monthly Savings: ${formatCurrency(results.netMonthlySave)}
- Net Savings (Lifetime): ${formatCurrency(results.netSavings)} over ${durationMonths} months
- ROI: ${results.roi === Infinity ? 'Infinite' : `${Math.round(results.roi)}%`}

Write a compelling executive summary (2-3 paragraphs). Avoid markdown formatting.`;

    try {
      const text = await callAI(prompt);
      setAiPitch(text?.trim() || "Error generating pitch.");
    } catch (error) {
      setAiPitch(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSuggestions = async () => {
    if (!toolName && !useCase) return alert("Enter Tool Name and Use Case first.");
    setIsGeneratingSuggestions(true);
    const prompt = `Brainstorm KPIs, challenges, and benefits for: ${toolName} / ${useCase}. Return ONLY JSON: {"kpis":[], "challenges":[], "benefits":[]}`;
    try {
      const text = await callAI(prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.kpis) setKpis(parsed.kpis.map(k => '• ' + k).join('\n'));
        if (parsed.challenges) setChallenges(parsed.challenges.map(c => '• ' + c).join('\n'));
        if (parsed.benefits) setQualitativeBenefits(parsed.benefits.map(b => '• ' + b).join('\n'));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const generateROIInsights = async () => {
    setIsGeneratingInsights(true);
    const prompt = `Provide 2-3 brief, actionable bullets on how to improve this automation's ROI: ROI ${Math.round(results.roi)}%, Payback ${results.paybackPeriod.toFixed(1)} months.`;
    try {
      const text = await callAI(prompt);
      setRoiInsights(text?.trim() || "No insights found.");
    } catch (error) {
      setRoiInsights(error.message);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = aiPitch || "No content generated.";
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Styles ---
  const inputStyle = "w-full px-4 py-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-800 outline-none hover:bg-slate-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const inputErrorStyle = "w-full px-4 py-3.5 bg-red-50/70 border border-red-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200 text-red-900 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const cardStyle = "bg-white rounded-[28px] shadow-sm border border-slate-200/60 overflow-hidden relative";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <header className={`${cardStyle} p-4 pr-6 flex items-center justify-between`}>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 rounded-[20px] text-white shadow-lg">
              <Calculator size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Automation Savings</h1>
              <p className="text-slate-500 text-sm font-medium hidden sm:block">Quantify ROI, time recaptured, and strategic impact.</p>
            </div>
          </div>
          <button onClick={() => setIsAiConfigOpen(true)} className="flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-4 py-3 rounded-2xl transition-all">
            <Settings size={18} />
            <span className="hidden sm:inline">AI Config</span>
          </button>
        </header>

        {/* AI Config Modal */}
        {isAiConfigOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Sparkles size={18} /></div>
                  <h2 className="text-xl font-bold text-slate-800">AI Configuration</h2>
                </div>
                <button onClick={() => setIsAiConfigOpen(false)} className="text-slate-400 hover:text-slate-800 bg-white p-2 rounded-full transition-colors shadow-sm"><X size={20} /></button>
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
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Model</label>
                  <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className={inputStyle}>
                    {providerOptions[aiProvider].models.map(model => (<option key={model} value={model}>{model}</option>))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsAiConfigOpen(false)} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold transition-colors">Save & Close</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            
            {/* Qualitative Details Section */}
            <section className={cardStyle}>
              <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-50 p-2.5 rounded-[14px] text-purple-600"><FileText size={20} /></div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Qualitative Details</h2>
                </div>
                <button onClick={generateSuggestions} disabled={isGeneratingSuggestions || (!toolName && !useCase)} className="flex items-center justify-center space-x-2 text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2.5 rounded-2xl border border-amber-200/50">
                  {isGeneratingSuggestions ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>{isGeneratingSuggestions ? 'Auto-Filling...' : 'Auto-Fill Details'}</span>
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-5 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Automation Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Cpu size={18} /></div>
                      <input type="text" value={toolName} onChange={(e) => setToolName(e.target.value)} onFocus={() => setActiveField('toolName')} onBlur={() => setActiveField(null)} placeholder="e.g., Ticket Auto-Triage Bot" className={`${inputStyle} pl-12 font-medium`} />
                    </div>
                    {renderHint('toolName', 'Give your automation project a short, recognizable name.')}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Use Case Description</label>
                    <textarea value={useCase} onChange={(e) => setUseCase(e.target.value)} onFocus={() => setActiveField('useCase')} onBlur={() => setActiveField(null)} rows={2} placeholder="Briefly describe the process..." className={`${inputStyle} resize-none font-medium`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><BarChart3 size={16} className="mr-1.5 text-purple-500" /> KPIs Addressed</label>
                    <textarea value={kpis} onChange={(e) => setKpis(e.target.value)} onFocus={() => setActiveField('kpis')} onBlur={() => setActiveField(null)} rows={3} placeholder="e.g., MTTR, CSAT..." className={`${inputStyle} resize-none font-medium`} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><Target size={16} className="mr-1.5 text-red-500" /> Challenges Addressed</label>
                    <textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} onFocus={() => setActiveField('challenges')} onBlur={() => setActiveField(null)} rows={4} placeholder="Current pain points..." className={`${inputStyle} resize-none text-sm font-medium`} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><Award size={16} className="mr-1.5 text-green-500" /> Strategic Benefits</label>
                    <textarea value={qualitativeBenefits} onChange={(e) => setQualitativeBenefits(e.target.value)} onFocus={() => setActiveField('qualitative')} onBlur={() => setActiveField(null)} rows={4} placeholder="Intangible value..." className={`${inputStyle} resize-none text-sm font-medium`} />
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
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Volume</label>
                    <div className="flex bg-slate-200/60 p-1 rounded-xl">
                      <button onClick={() => setVolumePeriod('daily')} className={`px-3 py-1 text-xs rounded-lg font-bold ${volumePeriod === 'daily' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Daily</button>
                      <button onClick={() => setVolumePeriod('monthly')} className={`px-3 py-1 text-xs rounded-lg font-bold ${volumePeriod === 'monthly' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Monthly</button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <input type="number" value={executionsPerMonth} onChange={(e) => setExecutionsPerMonth(e.target.value)} className={inputStyle} />
                    {volumePeriod === 'daily' && (
                      <div className="relative w-28 flex-shrink-0">
                        <input type="number" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} className={`${inputStyle} pr-10`} />
                        <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400">DAYS</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Effort per Task (Mins)</label>
                  <input type="number" value={Math.round(effortHours * 60)} onChange={handleMinutesChange} className={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Hourly Cost</label>
                  <input type="number" value={resourceCost} onChange={(e) => setResourceCost(e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Duration (Months)</label>
                  <input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} className={inputStyle} />
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between font-bold text-sm mb-4"><span>% Automated</span><span className="text-blue-600">{automationPercent}%</span></div>
                  <input type="range" min="0" max="100" value={automationPercent} onChange={(e) => setAutomationPercent(e.target.value)} className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-6 border-t border-slate-200/60 pt-4">
                  <div><label className="text-xs font-bold text-slate-500 uppercase">Implementation</label><input type="number" value={implementationCost} onChange={(e) => setImplementationCost(e.target.value)} className={inputStyle} /></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase">Monthly Run</label><input type="number" value={monthlyRunCost} onChange={(e) => setMonthlyRunCost(e.target.value)} className={inputStyle} /></div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-6">
            
            {/* Net Savings Scoreboard */}
            <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] rounded-[28px] shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-[0.08] rounded-full blur-[80px]"></div>
              <div className="relative z-10">
                <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-100 border border-white/10">Est. Net Savings</span>
                <div className={`text-6xl xl:text-7xl font-extrabold tracking-tighter mt-6 mb-10 ${results.netSavings < 0 ? 'text-red-400' : 'text-white'}`}>{formatCurrency(results.netSavings)}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10"><p className="text-blue-300 text-[10px] font-bold uppercase mb-1">ROI</p><p className="text-2xl font-extrabold">{results.roi === Infinity ? '∞' : `${Math.round(results.roi)}%`}</p></div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10"><p className="text-blue-300 text-[10px] font-bold uppercase mb-1">Payback</p><p className="text-2xl font-extrabold">{results.paybackPeriod === Infinity ? 'Never' : `${results.paybackPeriod.toFixed(1)} mo`}</p></div>
                </div>
              </div>
            </div>

            {/* Current vs Future Comparison Card */}
            <div className={`${cardStyle} flex flex-col`}>
              <div className="p-6 md:p-8 flex-1">
                <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center">
                  <ArrowRightLeft size={18} className="mr-2 text-blue-600"/> Current vs. Future State
                </h3>
                
                <div className="space-y-6">
                  {/* Current State Column */}
                  <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-5">Current State (As-Is)</div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Monthly Cost</div>
                        <div className="text-lg font-extrabold text-slate-800 tracking-tight">{formatCurrency(results.currentMonthlyCost)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Manual Effort</div>
                        <div className="text-lg font-extrabold text-slate-800 tracking-tight">{Math.round(results.totalManualHoursMonthly)} <span className="text-xs font-medium text-slate-400">hrs/mo</span></div>
                      </div>
                    </div>

                    {challenges && (
                      <div className="border-t border-slate-200 pt-4 mt-2">
                        <div className="text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center">
                          <Activity size={12} className="mr-1.5" /> Existing Challenges
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                          {challenges}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Future State Column */}
                  <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-100/60 shadow-[inset_0_1px_3px_rgba(59,130,246,0.05)]">
                    <div className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest mb-5 flex items-center"><Sparkles size={14} className="mr-1.5"/> Future State (To-Be)</div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Monthly Cost</div>
                        <div className="text-lg font-extrabold text-blue-900 tracking-tight">{formatCurrency(results.futureMonthlyCost)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Residual Effort</div>
                        <div className="text-lg font-extrabold text-blue-900 tracking-tight">{Math.round(results.remainingManualHoursMonthly)} <span className="text-xs font-medium text-blue-400">hrs/mo</span></div>
                      </div>
                    </div>

                    {(kpis || qualitativeBenefits) && (
                      <div className="border-t border-blue-100 pt-4 mt-2 space-y-3">
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

              {/* Strategy Insights Button */}
              <div className="p-6 md:p-8 pt-0 mt-auto">
                <div className="border-t border-slate-100 pt-5">
                  <button onClick={generateROIInsights} disabled={isGeneratingInsights} className="w-full flex items-center justify-center space-x-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold py-3.5 rounded-2xl border border-blue-100 transition-colors">
                    {isGeneratingInsights ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-amber-500" />}
                    <span>{roiInsights ? 'Regenerate Strategy' : 'Get AI Strategy Insights'}</span>
                  </button>
                  {roiInsights && (
                    <div className="mt-4 bg-indigo-50/80 p-5 rounded-2xl text-xs font-medium text-indigo-900 leading-relaxed border border-indigo-100/50 shadow-inner max-h-40 overflow-y-auto custom-scrollbar">
                      {roiInsights}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Case Summary Card */}
            <div className="bg-slate-900 rounded-[28px] shadow-xl text-slate-100 p-8 flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-800 rounded-[14px] border border-slate-700/50"><FileText size={20} /></div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Business Case Pitch</h3>
                </div>
                {(toolName || useCase) && (
                  <button onClick={handleCopy} className="bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center space-x-2 transition-all">
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy Pitch'}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl mb-6 border border-slate-700/50">
                <div className="flex items-center space-x-2 pl-2"><Sparkles size={16} className="text-amber-400" /><span className="text-sm font-semibold text-slate-200">General Business Case Pitch</span></div>
                <button onClick={generateAIPitch} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all">
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>{aiPitch ? 'Regenerate AI' : 'Generate with AI'}</span>
                </button>
              </div>
              <div className="bg-slate-950/40 rounded-2xl p-6 border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="whitespace-pre-wrap text-[15px] text-slate-300 leading-relaxed">
                  {aiPitch || "Drafting summary based on your metrics..."}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Methodology & FAQ Section */}
        <div className={`${cardStyle} mt-6 mb-12`}>
          <button onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)} className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="bg-slate-100 p-3 rounded-2xl text-slate-600"><HelpCircle size={24} /></div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Methodology & Calculations</h2>
                <p className="text-sm text-slate-500 font-medium">Detailed logic behind financial and time savings</p>
              </div>
            </div>
            <div className={`transform transition-transform ${isHowItWorksOpen ? 'rotate-180' : ''}`}><ChevronDown size={20} /></div>
          </button>
          {isHowItWorksOpen && (
            <div className="p-8 pt-0 border-t border-slate-100 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div><h3 className="text-sm font-bold uppercase mb-2">Net Savings</h3><p className="text-sm text-slate-600 leading-relaxed">(Gross Monthly Save × Duration) - (Monthly Run Cost × Duration) - Implementation Cost.</p></div>
                <div><h3 className="text-sm font-bold uppercase mb-2">FTE Recapture</h3><p className="text-sm text-slate-600 leading-relaxed">Total Hours Saved per month / 160 (Assumed standard working hours per month).</p></div>
              </div>
            </div>
          )}
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }`}} />
    </div>
  );
}
