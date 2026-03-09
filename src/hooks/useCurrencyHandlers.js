export function useCurrencyHandlers({
  currency, setCurrency, exchangeRates, implementationCost, setImplementationCost,
  monthlyRunCost, setMonthlyRunCost, setRunCostBreakdown, currencyConfig
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
    
    const newIc = implementationCost === '' ? '' : Number((implementationCost * multiplier).toFixed(0));
    const newMc = monthlyRunCost === '' ? '' : Number((monthlyRunCost * multiplier).toFixed(2));
    
    setRunCostBreakdown(prev => {
       const updated = { ...prev };
       Object.keys(updated).forEach(key => {
         if (updated[key].cost !== '') {
           updated[key].cost = Number((updated[key].cost * multiplier).toFixed(2));
         }
       });
       return updated;
    });
    
    setImplementationCost(newIc); 
    setMonthlyRunCost(newMc); 
    setCurrency(newCurrency);
  };

  return { formatCurrency, handleCurrencyChange };
}
