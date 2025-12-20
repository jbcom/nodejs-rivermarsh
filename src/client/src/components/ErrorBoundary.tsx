import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('🚨 Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 flex items-center justify-center bg-red-900 text-white p-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">⚠️ Game Error</h1>
            <p className="text-xl mb-4">Something went wrong!</p>
            <pre className="bg-red-950 p-4 rounded overflow-auto text-sm">
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
