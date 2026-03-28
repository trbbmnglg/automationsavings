import React, { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import QualitativeSection from './components/QualitativeSection';
import QuantitativeSection from './components/QuantitativeSection';
import ResultsPanel from './components/ResultsPanel';
import CurrentVsFuturePanel from './components/CurrentVsFuturePanel';
import OperationalImpactPanel from './components/OperationalImpactPanel';
import PitchPanel from './components/PitchPanel';
import PrivacyPanel from './components/PrivacyPanel';
import MethodologyPanel from './components/MethodologyPanel';

const ClearConfirmModal = lazy(() => import('./components/modals/ClearConfirmModal'));
const SettingsModal = lazy(() => import('./components/modals/SettingsModal'));
const SreConfigurationModal = lazy(() => import('./components/modals/SreConfigurationModal'));
const AdvancedRunCostModal = lazy(() => import('./components/modals/AdvancedRunCostModal'));
const MonthlyBreakdownModal = lazy(() => import('./components/modals/MonthlyBreakdownModal'));

function AppLayout() {
  const { bgMain, textMain, showClearConfirm, isSettingsOpen, isSreModalOpen, isRunCostModalOpen, isMonthlyBreakdownOpen } = useApp();

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans p-4 md:p-6 lg:p-8 selection:bg-blue-100 transition-colors duration-300`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm">Skip to main content</a>
      <main id="main-content" className="max-w-[1400px] mx-auto space-y-6 relative">
        <Header />
        <Suspense fallback={null}>
          {showClearConfirm && <ClearConfirmModal />}
          {isSettingsOpen && <SettingsModal />}
          {isSreModalOpen && <SreConfigurationModal />}
          {isRunCostModalOpen && <AdvancedRunCostModal />}
          {isMonthlyBreakdownOpen && <MonthlyBreakdownModal />}
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
          <div className="lg:col-span-7 space-y-6">
            <QualitativeSection />
            <QuantitativeSection />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <ResultsPanel />
            <CurrentVsFuturePanel />
            <OperationalImpactPanel />
            <PitchPanel />
          </div>
        </div>

        <PrivacyPanel />
        <MethodologyPanel />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <UIProvider>
      <ToastProvider>
        <AppProvider>
          <ErrorBoundary>
            <AppLayout />
          </ErrorBoundary>
        </AppProvider>
      </ToastProvider>
    </UIProvider>
  );
}
