import React from 'react';
import { HelpCircle, ChevronDown, Settings, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MethodologyPanel() {
  const { cardStyle, isHowItWorksOpen, setIsHowItWorksOpen, isDarkMode, textSub, textHeading, borderMuted, results } = useApp();

  return (
    <div className={`${cardStyle} mt-6 mb-12`}>
      <button
        onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
        aria-expanded={isHowItWorksOpen}
        className={`w-full p-6 md:p-8 flex items-center justify-between ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-colors text-left outline-none rounded-[28px]`}
      >
        <div className="flex items-center space-x-4">
          <div className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} p-3 rounded-2xl ${textSub}`}>
            <HelpCircle size={24} />
          </div>
          <div>
            <h2 className={`text-lg font-extrabold ${textHeading} tracking-tight`}>Methodology & AI Details</h2>
            <p className={`text-sm ${textSub} font-medium`}>How these numbers are calculated</p>
          </div>
        </div>
        <div className={`transform transition-transform duration-300 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} p-2 rounded-full ${isHowItWorksOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} className={textSub} />
        </div>
      </button>

      <div
        aria-hidden={!isHowItWorksOpen}
        className={`transition-all duration-300 ease-in-out ${isHowItWorksOpen ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className={`p-6 md:p-8 pt-0 border-t ${borderMuted}`} tabIndex={isHowItWorksOpen ? 0 : -1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">

            {/* Left column */}
            <div className="space-y-6">
              <div>
                <h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Month-By-Month Engine</h3>
                <p className={`text-sm ${textSub} leading-relaxed font-medium`}>This calculator doesn't just multiply static numbers. It loops through every month of the project's duration to accurately compound <strong>Run Cost Inflation</strong> and dynamically switch between <strong>Y1 vs Y2+ SRE/Maintenance costs</strong>. This guarantees a mathematically precise Payback Period and ROI.</p>
              </div>
              <div>
                <h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Net Savings</h3>
                <p className={`text-sm ${textSub} leading-relaxed font-medium`}>The actual financial gain. Projects the gross savings over the lifetime of the project and subtracts the initial implementation cost, the inflating monthly run costs, and the variable monthly maintenance costs.</p>
              </div>
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
              <div>
                <h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Scenario Modeling</h3>
                <p className={`text-sm ${textSub} leading-relaxed font-medium`}>The <strong>Forecast Scenario</strong> toggle stress-tests your business case. <em>Realistic</em> uses your exact inputs. <em>Conservative</em> inflates all implementation and run costs by 25% while shrinking the expected automation yield by 25% (simulating delays/complexity). <em>Optimistic</em> reduces costs by 10% and boosts automation yield by 10%.</p>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>SRE / Maintenance Ramp-Down</h3>
                <p className={`text-sm ${textSub} leading-relaxed font-medium`}>Complex automations usually require heavier support when they are first launched, which tapers off as the system stabilizes. The advanced cost settings allow you to accurately forecast this ramp-down.</p>
              </div>
              <div>
                <h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>FTE Savings</h3>
                <p className={`text-sm ${textSub} leading-relaxed font-medium`}>FTE stands for "Full-Time Equivalent". In this tool, an FTE is calculated based on your configured Working Days per Month and Hours per Day (currently <strong>{results.fteHoursPerMonth} hours/month</strong>). If your automation saves this amount of hours, it is effectively doing the work of 1 full-time employee.</p>
              </div>
              <div>
                <h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Return on Investment (ROI)</h3>
                <p className={`text-sm ${textSub} leading-relaxed font-medium`}>Measures profitability. An ROI of 100% means the automation paid for its total investment and generated that same amount in pure savings.</p>
              </div>
              <div>
                <h3 className={`text-sm font-bold ${textHeading} uppercase tracking-wider mb-2`}>Live Currency Conversion</h3>
                <p className={`text-sm ${textSub} leading-relaxed font-medium`}>Currency switching automatically recalculates all monetary inputs and results using real-time exchange rates fetched securely from <strong>api.frankfurter.app</strong> (updated every working day). A small green dot on the currency selector indicates live rates are active. If you are offline, it seamlessly falls back to standard default rates.</p>
              </div>

              {/* AI Details */}
              <div className={`${isDarkMode ? 'bg-blue-950/20 border-blue-900/30' : 'bg-blue-50/80 border-blue-100'} border rounded-2xl p-5`}>
                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-900'} uppercase tracking-wider mb-2 flex items-center gap-2`}>
                  <Settings size={16} className={isDarkMode ? 'text-blue-500' : 'text-blue-600'} />
                  What AI powers these insights?
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} leading-relaxed font-medium`}>
                  By default, this calculator integrates <strong>Pollinations.ai</strong> for free, seamless text generation.
                  Switch to <strong>Groq</strong> or <strong>OpenRouter</strong> via{' '}
                  <strong className={`inline-flex items-center ${isDarkMode ? 'text-blue-300 bg-blue-950/50 border border-blue-900' : 'text-blue-900 bg-white shadow-sm'} px-2 py-0.5 rounded mx-0.5`}>
                    <Settings size={12} className="mr-1" /> Settings
                  </strong>{' '}
                  using your own API keys. AI-generated fields are always labeled with an <strong className="text-amber-500">AI</strong> badge
                  and require your review before use. This tool is classified as <strong>low-risk AI</strong> under the EU AI Act.
                </p>
              </div>

              {/* Privacy summary — reference only, full disclosure was shown at ConsentGate */}
              <div className={`${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50/80 border-emerald-100'} border rounded-2xl p-5`}>
                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-900'} uppercase tracking-wider mb-2 flex items-center gap-2`}>
                  <Shield size={16} className={isDarkMode ? 'text-emerald-500' : 'text-emerald-600'} />
                  Privacy Summary
                </h3>
                <ul className={`text-sm ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'} font-medium space-y-1.5`}>
                  <li>✓ No server-side storage — project data is session-only</li>
                  <li>✓ AI transmission limited to Automation Name + Use Case only</li>
                  <li>✓ PII scanner redacts sensitive data before any AI call</li>
                  <li>✓ API keys are memory-only, never persisted</li>
                  <li>✓ Compliant with GDPR, PDPA RA 10173, EU AI Act, CCPA</li>
                </ul>
                <p className={`text-xs ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-700/70'} mt-3 font-medium`}>
                  Full disclosure and consent was provided on first access. Use the <strong>Clear Data</strong> button in the header to erase all locally stored preferences at any time.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
