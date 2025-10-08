/**
 * Error Boundary Component for graceful error handling
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorHub } from '@shared/resilience/errorHub';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassComponents';


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName: string;
  showError?: boolean;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
  errorInfo?: ErrorInfo;
}

export class ResilientBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to ErrorHub
    ErrorHub.handle(error, {
      component: this.props.componentName,
      action: 'render',
      metadata: {
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount
      }
    });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Store error info for display
    this.setState({ errorInfo });
  }

  retry = () => {
    const maxRetries = this.props.maxRetries ?? 3;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prev => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prev.retryCount + 1
      }));
    }
  };

  reset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      const maxRetries = this.props.maxRetries ?? 3;
      const canRetry = this.state.retryCount < maxRetries;
      
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <GlassCard depth={1} className="border border-red-200 rounded-lg p-6 shadow-lg"
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Something went wrong
                  </h3>
                  
                  {this.props.showError !== false && this.state.error && (
                    <p className="text-sm text-red-600 mb-4">
                      {this.state.error.message || 'An unexpected error occurred'}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {canRetry 
                      ? `We encountered an issue loading this component. You can try again${maxRetries - this.state.retryCount > 1 ? ` (${maxRetries - this.state.retryCount} attempts remaining)` : ''}.`
                      : 'We were unable to load this component after multiple attempts.'}
                  </p>
                  
                  <div className="flex gap-3">
                    {canRetry && (
                      <button
                        onClick={this.retry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                      </button>
                    )}
                    
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reload Page
                    </button>
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <details className="mt-4">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        Error Details (Development Only)
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-40">
                        {this.state.error?.stack}
                        {'\n\nComponent Stack:'}
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withResilience<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
  options?: {
    fallback?: ReactNode;
    showError?: boolean;
    maxRetries?: number;
  }
) {
  return (props: P) => (
    <ResilientBoundary 
      componentName={componentName}
      fallback={options?.fallback}
      showError={options?.showError}
      maxRetries={options?.maxRetries}
    >
      <WrappedComponent {...props} />
    </ResilientBoundary>
  );
}