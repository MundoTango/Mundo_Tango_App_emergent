import { Component, ReactNode } from 'react';
import { AlertTriangle, Home as HomeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class HomeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Home Page Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="p-6 text-center max-w-md">
            <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong on the home page
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an error while loading your feed.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                data-testid="button-try-again"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors flex items-center justify-center gap-2"
                data-testid="button-reload-page"
              >
                <HomeIcon className="w-4 h-4" />
                Reload Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
