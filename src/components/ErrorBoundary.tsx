import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in SATA application:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-black text-cyan-400 p-6 text-center font-mono">
          <div className="max-w-md w-full border border-red-500/60 rounded-2xl bg-slate-950/90 p-8 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <div className="h-14 w-14 mx-auto mb-4 rounded-xl border border-red-500/50 bg-red-950/40 flex items-center justify-center text-red-400 text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold text-white mb-2 tracking-wider">
              CYBERNETIC CORE RECOVERY
            </h1>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              A temporary neural buffer anomaly occurred. Click below to reboot the system.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-red-300 bg-red-950/30 p-3 rounded-lg border border-red-900/40 text-left overflow-auto max-h-32 mb-6">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="w-full py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-widest transition shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              Reboot Cybercity Engine
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

