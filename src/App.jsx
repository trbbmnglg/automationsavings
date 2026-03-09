import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import QualitativeSection from './components/QualitativeSection';
import QuantitativeSection from './components/QuantitativeSection';
import ResultsPanel from './components/ResultsPanel';
import CurrentVsFuturePanel from './components/CurrentVsFuturePanel';
import OperationalImpactPanel from './components/OperationalImpactPanel';
import PitchPanel from './components/PitchPanel';
import MethodologyPanel from './components/MethodologyPanel';
import ClearConfirmModal from './components/modals/ClearConfirmModal';
import SettingsModal from './components/modals/SettingsModal';
import SreConfigurationModal from './components/modals/SreConfigurationModal';
import AdvancedRunCostModal from './components/modals/AdvancedRunCostModal';

// NOTE: The .custom-scrollbar CSS rules have been moved to src/index.css
// so they are parsed once at load time rather than re-injected on every render.

function AppLayout() {
  const { bgMain, textMain, showClearConfirm, isSettingsOpen, isSreModalOpen, isRunCostModalOpen } = useApp();
  
  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans p-4 md:p-6 lg:p-8 selection:bg-blue-100 transition-colors duration-300`}>
      <div className="max-w-[1400px] mx-auto space-y-6 relative">
        <Header />
        {showClearConfirm && <ClearConfirmModal />}
        {isSettingsOpen && <SettingsModal />}
        {isSreModalOpen && <SreConfigurationModal />}
        {isRunCostModalOpen && <AdvancedRunCostModal />}

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
        <MethodologyPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
