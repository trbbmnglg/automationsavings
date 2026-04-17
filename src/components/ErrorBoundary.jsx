import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-accenture-pink/20 flex items-center justify-center mb-6">
            <AlertTriangle size={40} className="text-accenture-pink" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-accenture-gray-dark text-sm leading-relaxed mb-6">
            An unexpected error occurred while rendering the application.
            Your data is safe — session data is preserved until you close the tab.
          </p>
          <div className="bg-[#0a0a0a]/60 border border-accenture-gray-dark p-4 mb-6 text-left">
            <p className="text-xs font-mono text-accenture-pink break-all leading-relaxed">
              {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-accenture-purple hover:bg-accenture-purple-dark text-white py-3.5 font-bold transition-colors shadow-lg"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reload Application
          </button>
        </div>
      </div>
    );
  }
}
