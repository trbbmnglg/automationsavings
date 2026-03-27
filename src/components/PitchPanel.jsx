import React from 'react';
import { FileText, Check, Copy, Sparkles, Loader2, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext';

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

export default React.memo(PitchPanel);
