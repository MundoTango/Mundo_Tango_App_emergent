import { Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassComponents';


interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = {t('states.loading', {t('states.loading', 'Loading...')})} }: LoadingFallbackProps) {
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
    <GlassCard depth={1} className="fixed inset-0 flex items-center justify-center dark:bg-gray-900/90 z-50"
      <LoadingFallback />
    </div>
  );
}