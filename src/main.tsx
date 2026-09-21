import React, {StrictMode, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Unregister service workers to ensure fresh cache
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 text-center font-sans">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🛺
            </div>
            
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                ई-राही इंडिया (E-Rahi India)
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                स्मार्ट ई-रिक्शा, शहर सेवाएं व सुरक्षा पोर्टल
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-3 text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-40">
                <p className="font-bold text-rose-400 mb-1">Error: {this.state.error.name}</p>
                <p className="break-all">{this.state.error.message}</p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleResetAndReload}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
              >
                🔄 रीसेट कर ऐप शुरू करें (Reset & Start)
              </button>
              <button
                onClick={() => window.location.reload()}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition-all border border-slate-700 cursor-pointer active:scale-95"
              >
                रीलोड (Reload)
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register Service Worker for PWA Mobile App Support
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('Service Worker registration skipped:', err);
      });
    });
  } else {
    // In dev mode, register to allow PWA install prompt testing
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

