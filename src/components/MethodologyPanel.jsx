import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MethodologyPanel() {
  const { cardStyle, isHowItWorksOpen, setIsHowItWorksOpen, isDarkMode, textSub, textHeading, borderMuted, results } = useApp();

  return (
    <div className={`${cardStyle} mb-12`}>
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
            <h2 id="methodology-heading" className={`text-lg font-extrabold ${textHeading} tracking-tight`}>Methodology & Calculation Details</h2>
            <p className={`text-sm ${textSub} font-medium`}>How these numbers are calculated</p>
          </div>
        </div>
        <div className={`transform transition-transform duration-300 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100'} p-2 rounded-full ${isHowItWorksOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} className={textSub} />
        </div>
      </button>

      <div
        role="region"
        aria-labelledby="methodology-heading"
        hidden={!isHowItWorksOpen}
        className={`transition-all duration-300 ease-in-out ${isHowItWorksOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
        style={!isHowItWorksOpen ? { display: 'none' } : undefined}
      >
        <div className={`p-6 md:p-8 pt-0 border-t ${borderMuted}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">

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
                <p className={`text-sm ${textSub} leading-relaxed font-medium`}>
                  The <strong>Forecast Scenario</strong> toggle stress-tests your business case by applying two independent modifiers simultaneously:
                </p>
                <ul className={`list-disc pl-5 mt-2 text-sm ${textSub} leading-relaxed font-medium space-y-2`}>
                  <li>
                    <strong>Realistic</strong> — uses your exact inputs with no adjustments. This is your baseline.
                  </li>
                  <li>
                    <strong>Conservative</strong> — inflates implementation and run costs by <strong>25%</strong> and
                    simultaneously reduces the automation yield (% automated) by <strong>25%</strong>, simulating
                    project delays, scope creep, and lower-than-expected bot performance. Because both the cost
                    and benefit sides are adjusted at the same time, the <strong>compound effect on Net Savings
                    will be greater than 25%</strong> — this is intentional and reflects a realistic worst-case.
                  </li>
                  <li>
                    <strong>Optimistic</strong> — reduces all costs by <strong>10%</strong> and boosts automation
                    yield by <strong>10%</strong>, simulating smooth delivery and higher-than-expected performance.
                    Similarly, the <strong>compound upside on Net Savings will exceed 10%</strong> as both levers
                    work in your favor simultaneously.
                  </li>
                </ul>
                <p className={`text-sm ${textSub} leading-relaxed font-medium mt-2`}>
                  To isolate the effect of a single lever, use the Realistic scenario as your baseline and
                  manually adjust either the automation percentage or the cost inputs independently.
                </p>
              </div>
            </div>

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
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
