import React from 'react';
import { FileText, Check, Copy, Sparkles, Loader2, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext';

function PitchPanel() {
  const { toolName, useCase, aiPitch, handleCopy, copied, isGenerating, generateAIPitch, setAiPitch, challenges, kpis, qualitativeBenefits, formatCurrency, implementationCost, durationMonths, results, automationPercent } = useApp();
  return (
    <div className="bg-black rounded-[28px] shadow-xl text-accenture-gray-off-white p-6 md:p-8 flex flex-col h-auto relative overflow-hidden border border-[#222]">
      <div className="absolute top-0 right-0 w-80 h-80 bg-accenture-purple opacity-5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 relative z-10">
        <div className="flex items-center space-x-3"><div className="p-2.5 bg-[#0a0a0a] rounded-[14px] text-accenture-gray-light border border-accenture-gray-dark/50"><FileText size={20} /></div><h3 className="text-lg font-bold text-white tracking-tight">Business Case Pitch</h3></div>
        {(toolName || useCase || aiPitch) && (<button onClick={handleCopy} className="flex items-center space-x-2 text-sm font-bold bg-white text-black hover:bg-accenture-gray-off-white px-5 py-2.5 transition-all shadow-sm">{copied ? <Check size={16} className="text-accenture-purple-dark" /> : <Copy size={16} />}<span>{copied ? 'Copied!' : 'Copy Pitch'}</span></button>)}
      </div>
      <div className="flex items-center justify-between bg-[#0a0a0a]/80 p-3 mb-6 gap-3 border border-accenture-gray-dark/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center space-x-2 pl-2"><Sparkles size={16} className="text-accenture-purple flex-shrink-0" /><span className="text-sm font-semibold text-accenture-gray-light">General Business Case Pitch</span></div>
        <div className="flex items-center space-x-3">
          <button onClick={generateAIPitch} disabled={isGenerating || (!toolName && !useCase)} className="flex items-center justify-center space-x-2 text-sm bg-accenture-purple hover:bg-accenture-purple disabled:bg-[#1a1a1a] disabled:text-accenture-gray-dark text-white px-5 py-2 transition-all font-bold shadow-sm">{isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}<span>{isGenerating ? 'Drafting...' : (aiPitch ? 'Regenerate AI' : 'Generate with AI')}</span></button>
          {aiPitch && !isGenerating && (<button onClick={() => setAiPitch('')} className="text-xs font-bold text-accenture-gray-dark hover:text-white underline px-2">Reset</button>)}
        </div>
      </div>
      <div className="bg-black/40 p-6 border border-white/5 relative z-10 flex-1">
        <div className="prose prose-sm prose-invert max-w-none text-accenture-gray-light leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          {isGenerating ? (<div className="flex flex-col items-center justify-center py-16 text-accenture-gray-dark"><Loader2 size={36} className="animate-spin mb-4 text-accenture-purple" /><p className="animate-pulse font-medium">Crafting your perfect pitch...</p></div>) 
          : aiPitch ? (<div className="whitespace-pre-wrap text-[15px]">{aiPitch}</div>) 
          : toolName || useCase ? (
            <>
              <p className="mb-4 text-[15px]">By implementing <strong className="text-white">{toolName || "the proposed automation"}</strong> {useCase && ` to ${useCase}`}, we anticipate automating <strong className="text-accenture-purple">{automationPercent}%</strong> of the targeted workload. Currently, this task involves {Math.round(results.totalEffectiveExecutions).toLocaleString()} blended executions per month.</p>
              {(challenges || kpis || qualitativeBenefits) && (
                <><p className="mb-2 text-[15px] font-bold text-white">Strategic Value & Pain Points Addressed:</p><div className="mb-4 text-[15px] pl-2 border-l-2 border-accenture-gray-dark">{challenges && <p className="mb-2"><strong className="text-accenture-purple-light">Challenges:</strong><br/><span className="whitespace-pre-wrap">{challenges}</span></p>}{kpis && <p className="mb-2"><strong className="text-accenture-purple-light">Target KPIs:</strong><br/><span className="whitespace-pre-wrap">{kpis}</span></p>}{qualitativeBenefits && <p className="mb-2"><strong className="text-accenture-purple-light">Expected Benefits:</strong><br/><span className="whitespace-pre-wrap">{qualitativeBenefits}</span></p>}</div></>
              )}
              <p className="mb-4 text-[15px]">Financially, this requires an initial investment of {formatCurrency(implementationCost)}. Over the {Number(durationMonths) || 0}-month lifecycle, total maintenance and inflated run costs are projected at {formatCurrency(results.totalRunCost + results.totalSreCost)}. The automation yields a gross labor cost avoidance of <strong className="text-accenture-purple">{formatCurrency(results.grossMonthlySave)} per month</strong>. After factoring in these dynamic operational costs, this amounts to a <strong>Lifetime Net Savings of <span className="text-accenture-purple">{formatCurrency(results.netSavings)}</span></strong>. The precise payback period is <strong>{results.paybackPeriod === Infinity ? 'Never' : results.paybackPeriod.toFixed(1) + ' months'}</strong>, delivering an ROI of <strong>{results.roi === Infinity ? 'Infinite' : `${Math.round(results.roi)}%`}</strong>.</p>
              <p className="text-[15px]">Operationally, the automation recaptures {Math.round(results.hoursSavedTotal).toLocaleString()} resource hours over the project life. This represents an ongoing monthly savings of <strong className="text-accenture-purple-light">{results.fteSavings.toFixed(1)} FTEs</strong> (Full-Time Equivalents) that can be redirected toward higher-value, strategic initiatives.</p>
            </>
          ) : (<div className="h-full flex flex-col items-center justify-center text-accenture-gray-dark text-center py-12"><div className="bg-[#0a0a0a] p-4 rounded-full mb-4 opacity-50"><Cpu size={40} /></div><p className="font-medium text-lg text-accenture-gray-dark">Ready to draft your business case.</p><p className="text-sm mt-1">Enter details above to begin.</p></div>)}
        </div>
      </div>
    </div>
  );
}

export default React.memo(PitchPanel);
