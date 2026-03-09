export function useCurrencyHandlers({
  currency, setCurrency, exchangeRates, implementationCost, setImplementationCost,
  monthlyRunCost, setMonthlyRunCost, setRunCostBreakdown, currencyConfig,
  sreCostY1, setSreCostY1, sreCostY2, setSreCostY2
}) {
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat(currencyConfig[currency].locale, { 
      style: 'currency', 
      currency: currencyConfig[currency].code, 
      maximumFractionDigits: 0 
    }).format(value);
  };

  const handleCurrencyChange = (newCurrency) => {
    if (newCurrency === currency) return;
    
    const multiplier = exchangeRates[newCurrency] / exchangeRates[currency];
    if (!isFinite(multiplier) || multiplier === 0) return;
    
    const convert = (val) => val === '' ? '' : Number((val * multiplier).toFixed(2));

    const newIc = convert(implementationCost);
    const newMc = convert(monthlyRunCost);
    
    setRunCostBreakdown(prev => {
       const updated = { ...prev };
       Object.keys(updated).forEach(key => {
         if (updated[key].cost !== '') {
           updated[key].cost = convert(updated[key].cost);
         }
       });
       return updated;
    });
    
    setImplementationCost(newIc); 
    setMonthlyRunCost(newMc); 
    setSreCostY1(convert(sreCostY1));
    setSreCostY2(convert(sreCostY2));
    setCurrency(newCurrency);
  };

  return { formatCurrency, handleCurrencyChange };
}
