import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = "Loading..." }: LoadingFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

export function LoadingSpinner() {
  return <Loader2 className="h-6 w-6 animate-spin" />;
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50">
      <LoadingFallback />
    </div>
  );
}