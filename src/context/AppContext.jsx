import React, { createContext, useContext } from 'react';
import { useStickyState } from '../hooks/useStickyState';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useStickyState(false, 'savings-calc-dark-mode');
  const [themeColor, setThemeColor] = useStickyState('default', 'savings-calc-theme-color');
  const [currency, setCurrency] = useStickyState('USD', 'savings-calc-currency');
  const [showAdvancedRunCost, setShowAdvancedRunCost] = useStickyState(false, 'savings-calc-advanced-run-cost');
  
  const [currentMetrics, setCurrentMetrics] = useStickyState({
    workflowsPerMonth: 500,
    avgRunTimeMinutes: 45,
    sreHourlyRate: 75,
    toolingCostPerMonth: 2500,
    maintenanceHoursPerMonth: 40,
    incidentsPerMonth: 15,
    mttrHours: 4
  }, 'savings-calc-current-metrics');

  const [futureMetrics, setFutureMetrics] = useStickyState({
    avgRunTimeMinutes: 5,
    toolingCostPerMonth: 1000,
    maintenanceHoursPerMonth: 10,
    incidentsPerMonth: 5,
    mttrHours: 1
  }, 'savings-calc-future-metrics');

  const [sreConfig, setSreConfig] = useStickyState({
    hourlyRate: 75,
    hoursPerYear: 2080,
    benefitsMultiplier: 1.3
  }, 'savings-calc-sre-config');

  const value = {
    isDarkMode,
    setIsDarkMode,
    themeColor,
    setThemeColor,
    currency,
    setCurrency,
    showAdvancedRunCost,
    setShowAdvancedRunCost,
    currentMetrics,
    setCurrentMetrics,
    futureMetrics,
    setFutureMetrics,
    sreConfig,
    setSreConfig
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
