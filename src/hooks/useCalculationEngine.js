import { useMemo } from 'react';
import { getScoreColor, getScoreLabel } from '../utils/helpers';

/**
 * Core calculation engine that computes ROI, net savings, payback period,
 * viability score, and month-by-month cash flow projections.
 * Applies scenario modifiers (optimistic/conservative) and compounds
 * run cost inflation and variable SRE costs over the project lifetime.
 * @param {Object} params - All input state from AppContext
 * @returns {Object} Derived financial metrics including netSavings, roi, paybackPeriod, automationScore, monthlyData, etc.
 */
export function useCalculationEngine({
  laborBreakdown, automationPercent, durationMonths, implementationCost, 
  monthlyRunCost, runCostInflation, isAdvancedRunCost, runCostBreakdown, 
  lcrRates, hasSre, isAdvancedSre, sreCostY1, sreCostY2, sreBreakdown, 
  workingDays, hoursPerDay, scenario, currency, exchangeRates
}) {
  return useMemo(() => {
    const fteHoursPerMonth = Math.max(1, Number(workingDays)) * Math.max(1, Number(hoursPerDay));
    const currencyMultiplier = exchangeRates[currency] / exchangeRates['USD'];

    const scenarioConfig = { optimistic: { benefit: 1.1, cost: 0.9 }, realistic: { benefit: 1.0, cost: 1.0 }, conservative: { benefit: 0.75, cost: 1.25 } };
    const sc = scenarioConfig[scenario] || scenarioConfig.realistic;

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
    
    let uiSreY1 = 0, uiSreY2 = 0;
    if (hasSre) {
       if (isAdvancedSre) {
           sreBreakdown.forEach(item => {
               const rawSreTasks = Math.max(0, Number(item.tasksPerMonth));
               const rawSreHours = Math.max(0, Number(item.effortHours));
               const sreHoursMo = rawSreTasks * rawSreHours;
               const sreRateLocal = (lcrRates[item.cl] || 0) * currencyMultiplier;
               const costY1 = (sreHoursMo * sreRateLocal);
               const costY2 = (costY1 * (1 - (Math.max(0, Math.min(100, Number(item.y2Reduction))) / 100)));
               uiSreY1 += costY1; uiSreY2 += costY2;
           });
       } else {
           uiSreY1 = Math.max(0, Number(sreCostY1));
           uiSreY2 = Math.max(0, Number(sreCostY2));
       }
    }
    
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
      let currentYear = Math.floor((m - 1) / 12) + 1;
      let currentRunCost = 0;
      if (isAdvancedRunCost) {
         let tempRunCost = 0;
         for (const [key, entry] of Object.entries(runCostBreakdown)) {
           if (key === 'productLicense' || entry.enabled) {
             tempRunCost += Number(entry.cost || 0) * Math.pow(1 + Number(entry.inflation || 0) / 100, currentYear - 1);
           }
         }
         currentRunCost = tempRunCost * sc.cost;
      } else {
         currentRunCost = baseRunCost * Math.pow(1 + inflationRate, currentYear - 1);
      }

      let currentSreCost = currentYear === 1 ? sreY1 : sreY2;
      
      totalRunCost += currentRunCost;
      totalSreCost += currentSreCost;
      totalGrossSave += grossMonthlySave;

      const monthlyNet = grossMonthlySave - currentRunCost - currentSreCost;
      const previousCumulativeNet = cumulativeNet;
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

      // FIX #1: Corrected payback period fraction logic.
      //
      // The original code computed: overshoot / monthlyNet, which measures how
      // much of the *current* month's cash flow was surplus — but that gives the
      // wrong fraction when the deficit carried into this month was large relative
      // to monthlyNet. The correct approach is:
      //
      //   fraction = |deficit at start of payback month| / monthlyNet
      //
      // This gives the exact proportion of the current month needed to cross zero,
      // so paybackMonth = (m - 1) + fraction.
      //
      // Edge case: if monthlyNet <= 0 the automation will never pay back even
      // within this month, so we leave paybackMonth as Infinity.
      if (paybackMonth === Infinity && cumulativeNet >= 0) {
        if (monthlyNet <= 0) {
          paybackMonth = Infinity;
        } else {
          // previousCumulativeNet is the shortfall at the *start* of this month.
          // It must be negative here (we just crossed zero), so we take its abs.
          const deficitAtMonthStart = Math.abs(Math.min(0, previousCumulativeNet));
          const fraction = Math.min(1, deficitAtMonthStart / monthlyNet);
          paybackMonth = (m - 1) + fraction;
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

    const scoreLabel = getScoreLabel(score);
    const scoreColor = getScoreColor(score, 'tailwind');

    return {
      totalEffectiveExecutions, currentMonthlyCost, futureMonthlyCostAvg, grossMonthlySave, avgNetMonthlySave, totalGrossSavings: totalGrossSave, 
      totalInvestment, totalRunCost, totalSreCost, netSavings: netSave, roi, paybackPeriod: paybackMonth, hoursSavedMonthly: hoursMonthlySaved, 
      hoursSavedTotal: hoursSavedTotal, fteSavings, currentFte: hoursMonthlyCurrent / fteHoursPerMonth, toBeFte: Math.max(0, hoursMonthlyCurrent - hoursMonthlySaved) / fteHoursPerMonth,
      totalManualHoursMonthly: hoursMonthlyCurrent, remainingManualHoursMonthly: Math.max(0, hoursMonthlyCurrent - hoursMonthlySaved),
      monthlyData, automationScore: score, scoreLabel, scoreColor, fteHoursPerMonth, currencyMultiplier, blendedEffortPerHour, blendedResourceCostPerHour,
      uiSreY1, uiSreY2, uiRunCostY1
    };
  }, [
    laborBreakdown, automationPercent, durationMonths, implementationCost, 
    monthlyRunCost, runCostInflation, isAdvancedRunCost, runCostBreakdown, 
    lcrRates, hasSre, isAdvancedSre, sreCostY1, sreCostY2, sreBreakdown, 
    workingDays, hoursPerDay, scenario, currency, exchangeRates
  ]);
}
