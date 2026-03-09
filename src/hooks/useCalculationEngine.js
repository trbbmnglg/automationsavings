import { useMemo } from 'react';

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
      let currentYear = Math.ceil(m / 12);
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

      // FIX 4: Corrected Payback Logic
      if (paybackMonth === Infinity && cumulativeNet >= 0) {
        if (grossMonthlySave <= 0 || monthlyNet <= 0) { 
          paybackMonth = Infinity; 
        } else {
          const overshoot = Math.max(0, cumulativeNet);
          const fraction = Math.max(0, Math.min(1, 1 - overshoot / monthlyNet));
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
  }, [
    laborBreakdown, automationPercent, durationMonths, implementationCost, 
    monthlyRunCost, runCostInflation, isAdvancedRunCost, runCostBreakdown, 
    lcrRates, hasSre, isAdvancedSre, sreCostY1, sreCostY2, sreBreakdown, 
    workingDays, hoursPerDay, scenario, currency, exchangeRates
  ]); // FIX 1: Stable dependencies array
}
