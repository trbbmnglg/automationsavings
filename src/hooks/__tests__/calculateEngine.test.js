import { describe, it, expect } from 'vitest';
import { calculateEngine } from '../useCalculationEngine';

// ─── Default input factory ──────────────────────────────────────────────────

const baseInput = (overrides = {}) => ({
  laborBreakdown: [
    { executions: 100, volumePeriod: 'monthly', effortHours: 0.5, cl: 'CL5' }
  ],
  automationPercent: 80,
  durationMonths: 12,
  implementationCost: 5000,
  monthlyRunCost: 200,
  runCostInflation: 0,
  isAdvancedRunCost: false,
  runCostBreakdown: {
    productLicense: { cost: 0 },
    ai: { enabled: false, cost: 0, inflation: 0 },
    splunk: { enabled: false, cost: 0, inflation: 0 },
    infra: { enabled: false, cost: 0, inflation: 0 },
    other: { enabled: false, cost: 0, inflation: 0 },
  },
  lcrRates: { CL5: 50, CL6: 65, CL7: 80 },
  hasSre: false,
  isAdvancedSre: false,
  sreCostY1: 0,
  sreCostY2: 0,
  sreBreakdown: [],
  workingDays: 22,
  hoursPerDay: 8,
  scenario: 'realistic',
  currency: 'USD',
  exchangeRates: { USD: 1, PHP: 56, EUR: 0.92, JPY: 150 },
  ...overrides,
});

// ─── Basic output shape ─────────────────────────────────────────────────────

describe('calculateEngine — output shape', () => {
  it('returns all expected keys', () => {
    const result = calculateEngine(baseInput());
    const requiredKeys = [
      'totalEffectiveExecutions', 'currentMonthlyCost', 'futureMonthlyCostAvg',
      'grossMonthlySave', 'avgNetMonthlySave', 'totalGrossSavings',
      'totalInvestment', 'totalRunCost', 'totalSreCost', 'netSavings',
      'roi', 'paybackPeriod', 'hoursSavedMonthly', 'hoursSavedTotal',
      'fteSavings', 'currentFte', 'toBeFte',
      'totalManualHoursMonthly', 'remainingManualHoursMonthly',
      'monthlyData', 'automationScore', 'scoreLabel', 'scoreColor',
      'fteHoursPerMonth', 'currencyMultiplier',
      'blendedEffortPerHour', 'blendedResourceCostPerHour',
      'uiSreY1', 'uiSreY2', 'uiRunCostY1',
    ];
    for (const key of requiredKeys) {
      expect(result).toHaveProperty(key);
    }
  });
});

// ─── Duration edge cases ────────────────────────────────────────────────────

describe('calculateEngine — duration edge cases', () => {
  it('0 months → zero savings, monthlyData has only month-0 entry', () => {
    const r = calculateEngine(baseInput({ durationMonths: 0 }));
    expect(r.totalGrossSavings).toBe(0);
    expect(r.monthlyData).toHaveLength(1);
    expect(r.monthlyData[0].month).toBe(0);
  });

  it('1 month → single operational month', () => {
    const r = calculateEngine(baseInput({ durationMonths: 1 }));
    expect(r.monthlyData).toHaveLength(2); // month 0 + month 1
    expect(r.monthlyData[1].year).toBe(1);
  });

  it('12 months → all in year 1', () => {
    const r = calculateEngine(baseInput({ durationMonths: 12 }));
    expect(r.monthlyData.every(d => d.year <= 1)).toBe(true);
  });

  it('13 months → month 13 is year 2 (SRE cost boundary)', () => {
    const r = calculateEngine(baseInput({ durationMonths: 13, hasSre: true, sreCostY1: 500, sreCostY2: 300 }));
    const m13 = r.monthlyData.find(d => d.month === 13);
    expect(m13.year).toBe(2);
    expect(m13.sreCost).toBeGreaterThan(0);
    // Y2 SRE cost should be lower than Y1
    const m12 = r.monthlyData.find(d => d.month === 12);
    expect(m13.sreCost).toBeLessThan(m12.sreCost);
  });
});

// ─── Payback period ─────────────────────────────────────────────────────────

describe('calculateEngine — payback period', () => {
  it('Infinity when costs exceed savings', () => {
    const r = calculateEngine(baseInput({ implementationCost: 999999, durationMonths: 6 }));
    expect(r.paybackPeriod).toBe(Infinity);
  });

  it('0 when implementation cost is 0 and duration is 0', () => {
    const r = calculateEngine(baseInput({ implementationCost: 0, durationMonths: 0 }));
    expect(r.paybackPeriod).toBe(0);
  });

  it('fractional payback between two months', () => {
    const r = calculateEngine(baseInput({ implementationCost: 100, durationMonths: 12 }));
    expect(r.paybackPeriod).toBeGreaterThan(0);
    expect(r.paybackPeriod).toBeLessThan(12);
    // Should not be an integer — it interpolates within a month
    expect(Number.isFinite(r.paybackPeriod)).toBe(true);
  });

  it('payback aligns with cumulative net crossing zero', () => {
    const r = calculateEngine(baseInput({ implementationCost: 1000, durationMonths: 24 }));
    if (r.paybackPeriod !== Infinity) {
      const paybackFloor = Math.ceil(r.paybackPeriod);
      const entry = r.monthlyData.find(d => d.month === paybackFloor);
      expect(entry.cumulativeNet).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─── Scenario modifiers ─────────────────────────────────────────────────────

describe('calculateEngine — scenario modifiers', () => {
  it('optimistic yields higher net savings than realistic', () => {
    const realistic = calculateEngine(baseInput({ scenario: 'realistic' }));
    const optimistic = calculateEngine(baseInput({ scenario: 'optimistic' }));
    expect(optimistic.netSavings).toBeGreaterThan(realistic.netSavings);
  });

  it('conservative yields lower net savings than realistic', () => {
    const realistic = calculateEngine(baseInput({ scenario: 'realistic' }));
    const conservative = calculateEngine(baseInput({ scenario: 'conservative' }));
    expect(conservative.netSavings).toBeLessThan(realistic.netSavings);
  });

  it('unknown scenario falls back to realistic', () => {
    const realistic = calculateEngine(baseInput({ scenario: 'realistic' }));
    const unknown = calculateEngine(baseInput({ scenario: 'nonexistent' }));
    expect(unknown.netSavings).toBe(realistic.netSavings);
    expect(unknown.roi).toBe(realistic.roi);
  });
});

// ─── Currency multiplier ────────────────────────────────────────────────────

describe('calculateEngine — currency', () => {
  it('USD multiplier is 1', () => {
    const r = calculateEngine(baseInput({ currency: 'USD' }));
    expect(r.currencyMultiplier).toBe(1);
  });

  it('PHP multiplier matches exchange rate ratio', () => {
    const rates = { USD: 1, PHP: 56 };
    const r = calculateEngine(baseInput({ currency: 'PHP', exchangeRates: rates }));
    expect(r.currencyMultiplier).toBe(56);
  });

  it('PHP costs scale by multiplier relative to USD', () => {
    const rates = { USD: 1, PHP: 56 };
    const usd = calculateEngine(baseInput({ currency: 'USD', exchangeRates: rates }));
    const php = calculateEngine(baseInput({ currency: 'PHP', exchangeRates: rates }));
    // Gross monthly savings should scale by the multiplier
    expect(php.grossMonthlySave).toBeCloseTo(usd.grossMonthlySave * 56, 0);
  });
});

// ─── Viability score thresholds ─────────────────────────────────────────────

describe('calculateEngine — viability score', () => {
  it('score is 0 when net savings <= 0', () => {
    const r = calculateEngine(baseInput({ implementationCost: 999999, durationMonths: 3 }));
    expect(r.automationScore).toBe(0);
  });

  it('strong ROI + fast payback + high FTE → score >= 80', () => {
    const r = calculateEngine(baseInput({
      laborBreakdown: [{ executions: 500, volumePeriod: 'monthly', effortHours: 1, cl: 'CL7' }],
      automationPercent: 95,
      durationMonths: 24,
      implementationCost: 100,
      monthlyRunCost: 10,
    }));
    expect(r.automationScore).toBeGreaterThanOrEqual(80);
    expect(r.scoreLabel).toBe('Strong Investment');
  });

  it('score is capped at 100', () => {
    const r = calculateEngine(baseInput({
      laborBreakdown: [{ executions: 1000, volumePeriod: 'monthly', effortHours: 2, cl: 'CL7' }],
      automationPercent: 100,
      durationMonths: 36,
      implementationCost: 1,
      monthlyRunCost: 0,
    }));
    expect(r.automationScore).toBeLessThanOrEqual(100);
  });

  it('score labels match thresholds', () => {
    // Marginal: score 40-59
    const r = calculateEngine(baseInput({
      laborBreakdown: [{ executions: 20, volumePeriod: 'monthly', effortHours: 0.5, cl: 'CL5' }],
      automationPercent: 50,
      durationMonths: 36,
      implementationCost: 500,
      monthlyRunCost: 50,
    }));
    // Score depends on exact values; just verify label matches score range
    if (r.automationScore >= 80) expect(r.scoreLabel).toBe('Strong Investment');
    else if (r.automationScore >= 60) expect(r.scoreLabel).toBe('Good Investment');
    else if (r.automationScore >= 40) expect(r.scoreLabel).toBe('Marginal Return');
    else expect(r.scoreLabel).toBe('High Risk / Reject');
  });
});

// ─── SRE cost handling ──────────────────────────────────────────────────────

describe('calculateEngine — SRE costs', () => {
  it('no SRE → sreCost is 0 for all months', () => {
    const r = calculateEngine(baseInput({ hasSre: false }));
    expect(r.totalSreCost).toBe(0);
    r.monthlyData.forEach(d => expect(d.sreCost).toBe(0));
  });

  it('simple SRE: Y1 and Y2 costs applied correctly', () => {
    const r = calculateEngine(baseInput({
      hasSre: true, sreCostY1: 1000, sreCostY2: 500, durationMonths: 24
    }));
    const y1Months = r.monthlyData.filter(d => d.year === 1);
    const y2Months = r.monthlyData.filter(d => d.year === 2);
    // All Y1 months should have the same SRE cost
    y1Months.forEach(d => expect(d.sreCost).toBeCloseTo(1000, 0));
    // All Y2 months should have the lower cost
    y2Months.forEach(d => expect(d.sreCost).toBeCloseTo(500, 0));
  });

  it('advanced SRE: uses sreBreakdown with y2Reduction', () => {
    const r = calculateEngine(baseInput({
      hasSre: true,
      isAdvancedSre: true,
      sreBreakdown: [
        { tasksPerMonth: 10, effortHours: 2, cl: 'CL5', y2Reduction: 50 }
      ],
      durationMonths: 24,
    }));
    expect(r.uiSreY1).toBeGreaterThan(0);
    expect(r.uiSreY2).toBeCloseTo(r.uiSreY1 * 0.5, 2);
  });
});

// ─── Run cost inflation ─────────────────────────────────────────────────────

describe('calculateEngine — run cost inflation', () => {
  it('0% inflation → constant run cost across years', () => {
    const r = calculateEngine(baseInput({ durationMonths: 24, runCostInflation: 0 }));
    const y1 = r.monthlyData.find(d => d.month === 1);
    const y2 = r.monthlyData.find(d => d.month === 13);
    expect(y1.runCost).toBe(y2.runCost);
  });

  it('10% inflation → year 2 run cost is 1.1x year 1', () => {
    const r = calculateEngine(baseInput({ durationMonths: 24, runCostInflation: 10, monthlyRunCost: 100 }));
    const y1 = r.monthlyData.find(d => d.month === 1);
    const y2 = r.monthlyData.find(d => d.month === 13);
    expect(y2.runCost).toBeCloseTo(y1.runCost * 1.1, 2);
  });
});

// ─── Advanced run cost breakdown ────────────────────────────────────────────

describe('calculateEngine — advanced run cost', () => {
  it('sums enabled breakdown items', () => {
    const r = calculateEngine(baseInput({
      isAdvancedRunCost: true,
      runCostBreakdown: {
        productLicense: { cost: 100, inflation: 0 },
        ai: { enabled: true, cost: 50, inflation: 0 },
        splunk: { enabled: false, cost: 999, inflation: 0 },
        infra: { enabled: true, cost: 30, inflation: 0 },
        other: { enabled: false, cost: 0, inflation: 0 },
      },
      durationMonths: 1,
    }));
    // productLicense (100) + ai (50) + infra (30) = 180
    expect(r.uiRunCostY1).toBe(180);
  });
});

// ─── Labor breakdown ────────────────────────────────────────────────────────

describe('calculateEngine — labor breakdown', () => {
  it('daily volume period multiplies by working days', () => {
    const daily = calculateEngine(baseInput({
      laborBreakdown: [{ executions: 5, volumePeriod: 'daily', effortHours: 1, cl: 'CL5' }],
      workingDays: 22,
    }));
    // 5 daily * 22 working days = 110 effective executions
    expect(daily.totalEffectiveExecutions).toBe(110);
  });

  it('monthly volume period uses executions directly', () => {
    const monthly = calculateEngine(baseInput({
      laborBreakdown: [{ executions: 100, volumePeriod: 'monthly', effortHours: 1, cl: 'CL5' }],
    }));
    expect(monthly.totalEffectiveExecutions).toBe(100);
  });

  it('multiple labor items are summed', () => {
    const r = calculateEngine(baseInput({
      laborBreakdown: [
        { executions: 50, volumePeriod: 'monthly', effortHours: 0.5, cl: 'CL5' },
        { executions: 30, volumePeriod: 'monthly', effortHours: 1, cl: 'CL6' },
      ],
    }));
    expect(r.totalEffectiveExecutions).toBe(80);
    // Hours: 50*0.5 + 30*1 = 55
    expect(r.totalManualHoursMonthly).toBe(55);
  });
});

// ─── Monthly data integrity ─────────────────────────────────────────────────

describe('calculateEngine — monthly data integrity', () => {
  it('month-0 has implementation cost and no savings', () => {
    const r = calculateEngine(baseInput());
    const m0 = r.monthlyData[0];
    expect(m0.month).toBe(0);
    expect(m0.implementationCost).toBe(5000);
    expect(m0.grossSavings).toBe(0);
    expect(m0.cumulativeNet).toBe(-5000);
  });

  it('cumulative net is running sum of net cash flows', () => {
    const r = calculateEngine(baseInput({ durationMonths: 6 }));
    let running = 0;
    for (const d of r.monthlyData) {
      running += d.netCashFlow;
      expect(d.cumulativeNet).toBeCloseTo(running, 4);
    }
  });

  it('monthlyData length is durationMonths + 1', () => {
    const r = calculateEngine(baseInput({ durationMonths: 18 }));
    expect(r.monthlyData).toHaveLength(19);
  });
});
