import { useMemo, useCallback } from 'react';

export function useCurrencyHandlers({
  currency, setCurrency, exchangeRates, implementationCost, setImplementationCost,
  monthlyRunCost, setMonthlyRunCost, setRunCostBreakdown, currencyConfig,
  sreCostY1, setSreCostY1, sreCostY2, setSreCostY2
}) {

  const formatter = useMemo(() =>
    new Intl.NumberFormat(currencyConfig[currency].locale, {
      style: 'currency',
      currency: currencyConfig[currency].code,
      maximumFractionDigits: 0
    }),
    [currency, currencyConfig]
  );

  const formatCurrency = useCallback(
    (value) => formatter.format(value),
    [formatter]
  );

  const handleCurrencyChange = useCallback((newCurrency) => {
    if (newCurrency === currency) return;

    const multiplier = exchangeRates[newCurrency] / exchangeRates[currency];
    if (!isFinite(multiplier) || multiplier === 0) return;

    const convert = (val) => val === '' ? '' : Number((val * multiplier).toFixed(2));

    setRunCostBreakdown(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (updated[key].cost !== '') {
          // Spread into a new object so we never mutate prev[key] directly.
          updated[key] = { ...updated[key], cost: convert(updated[key].cost) };
        }
      });
      return updated;
    });

    setImplementationCost(convert(implementationCost));
    setMonthlyRunCost(convert(monthlyRunCost));
    setSreCostY1(convert(sreCostY1));
    setSreCostY2(convert(sreCostY2));
    setCurrency(newCurrency);
  }, [
    currency, exchangeRates,
    implementationCost, monthlyRunCost, sreCostY1, sreCostY2,
    setCurrency, setImplementationCost, setMonthlyRunCost,
    setRunCostBreakdown, setSreCostY1, setSreCostY2
  ]);

  return { formatCurrency, handleCurrencyChange };
}
