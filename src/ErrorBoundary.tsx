import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    if (this.isChunkLoadError(error)) {
      const sessionKey = 'chunk_reload_done';
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        window.location.reload();
        return;
      }
    }
  }

  private isChunkLoadError(error: Error): boolean {
    const message = error.message || '';
    return (
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('Loading CSS chunk') ||
      error.name === 'ChunkLoadError'
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--ui-surface)' }}>
          <div className="w-full max-w-md">
            <div className="rounded-xl p-8 text-center border" style={{ borderColor: 'var(--ui-error)', backgroundColor: 'var(--ui-surface)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--ui-error-soft)' }}>
                <svg
                  className="w-8 h-8"
                  style={{ color: 'var(--ui-error)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--ui-text)' }}>
                Something went wrong
              </h1>
              <p className="mb-2 text-sm" style={{ color: 'var(--ui-text-secondary)' }}>
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 font-medium py-2 px-6 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--ui-primary)', color: 'black' }}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
