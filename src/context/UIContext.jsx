import React, { createContext, useContext, useState, useMemo } from 'react';
import { useStickyState } from '../hooks/useStickyState';
import { useTheme } from '../hooks/useTheme';

const UIContext = createContext(null);
export const useUI = () => useContext(UIContext);

export function UIProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useStickyState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches,
    'as_theme_dark'
  );
  const [themeColor, setThemeColor] = useStickyState('default', 'as_themeColor');
  const [showScore, setShowScore] = useStickyState(true, 'as_showScore');

  // Modal states — pure UI, no business data
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSreModalOpen, setIsSreModalOpen] = useState(false);
  const [isRunCostModalOpen, setIsRunCostModalOpen] = useState(false);
  const [isMonthlyBreakdownOpen, setIsMonthlyBreakdownOpen] = useState(false);

  const themeStyles = useTheme(isDarkMode, themeColor);

  const value = useMemo(() => ({
    isDarkMode, setIsDarkMode,
    themeColor, setThemeColor,
    showScore, setShowScore,
    isHowItWorksOpen, setIsHowItWorksOpen,
    showClearConfirm, setShowClearConfirm,
    isSettingsOpen, setIsSettingsOpen,
    isSreModalOpen, setIsSreModalOpen,
    isRunCostModalOpen, setIsRunCostModalOpen,
    isMonthlyBreakdownOpen, setIsMonthlyBreakdownOpen,
    ...themeStyles,
  }), [
    isDarkMode, themeColor, showScore,
    isHowItWorksOpen, showClearConfirm, isSettingsOpen,
    isSreModalOpen, isRunCostModalOpen, isMonthlyBreakdownOpen,
    themeStyles,
  ]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
