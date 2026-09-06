import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4"
             style={{ backgroundColor: 'var(--color-abyss)' }}>
          <div className="glass rounded-2xl p-8 max-w-lg text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-bright)' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-soft)' }}>
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-left text-xs font-mono text-red-300 max-h-40 overflow-y-auto">
                <p className="font-semibold">{this.state.error.name}: {this.state.error.message}</p>
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button
                className="btn-primary"
                onClick={this.handleReset}
              >
                Refresh Page
              </button>
              <button
                className="btn-ghost"
                onClick={() => { window.location.href = '/dashboard'; }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
