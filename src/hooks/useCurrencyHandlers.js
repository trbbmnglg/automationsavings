import { useMemo, useCallback } from 'react';

/**
 * Manages currency formatting and live conversion between USD, PHP, EUR, JPY.
 * When the user switches currency, all monetary inputs are recalculated
 * using exchange rates from Frankfurter API (or fallback defaults).
 * @param {Object} params - Currency state, exchange rates, monetary inputs and their setters
 * @returns {{ formatCurrency: (value: number) => string, handleCurrencyChange: (newCurrency: string) => void }}
 */
export function useCurrencyHandlers({
  currency, setCurrency, exchangeRates, implementationCost, setImplementationCost,
  monthlyRunCost, setMonthlyRunCost, setRunCostBreakdown, currencyConfig,
  sreCostY1, setSreCostY1, sreCostY2, setSreCostY2, addToast
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
    if (!isFinite(multiplier) || multiplier === 0) {
      if (addToast) {
        addToast(`Exchange rate unavailable for ${newCurrency}. Currency not changed.`, 'error');
      }
      return;
    }

    // Round to 6 decimals (not 2) to avoid sub-cent drift when the user
    // round-trips between currencies. The formatter uses
    // maximumFractionDigits: 0 for display, but the underlying state keeps
    // precision so e.g. USD → JPY → USD preserves the original value.
    const convert = (val) => val === '' ? '' : Math.round(val * multiplier * 1e6) / 1e6;

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
    setRunCostBreakdown, setSreCostY1, setSreCostY2, addToast
  ]);

  return { formatCurrency, handleCurrencyChange };
}
