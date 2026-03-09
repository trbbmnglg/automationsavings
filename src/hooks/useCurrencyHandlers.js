import { useMemo, useCallback } from 'react';

export function useCurrencyHandlers({
  currency, setCurrency, exchangeRates, implementationCost, setImplementationCost,
  monthlyRunCost, setMonthlyRunCost, setRunCostBreakdown, currencyConfig,
  sreCostY1, setSreCostY1, sreCostY2, setSreCostY2
}) {

  // BUG 5 FIX: Memoize the Intl.NumberFormat instance.
  // Previously, a new formatter object was constructed on every single call to
  // formatCurrency(), which is expensive. Now it's only rebuilt when `currency`
  // changes (e.g., switching USD → PHP), which is rare.
  const formatter = useMemo(() =>
    new Intl.NumberFormat(currencyConfig[currency].locale, {
      style: 'currency',
      currency: currencyConfig[currency].code,
      maximumFractionDigits: 0
    }),
    [currency, currencyConfig]
  );

  // Stable function reference — only changes when the formatter changes (i.e., currency changes).
  const formatCurrency = useCallback(
    (value) => formatter.format(value),
    [formatter]
  );

  // Stable function reference — only changes when the monetary inputs or rates change.
  const handleCurrencyChange = useCallback((newCurrency) => {
    if (newCurrency === currency) return;

    const multiplier = exchangeRates[newCurrency] / exchangeRates[currency];
    if (!isFinite(multiplier) || multiplier === 0) return;

    // Helper: converts a monetary value to the new currency.
    // Returns empty string if the field is empty (user hasn't entered a value yet).
    const convert = (val) => val === '' ? '' : Number((val * multiplier).toFixed(2));

    setRunCostBreakdown(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (updated[key].cost !== '') {
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
