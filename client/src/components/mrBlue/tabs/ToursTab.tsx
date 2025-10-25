import { Suspense, lazy } from 'react';
import { Loader2, Compass } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const InteractiveTour = lazy(() => import('@/lib/mrBlue/tours/InteractiveTourWrapper'));

export default function ToursTab() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-cyan-50/30 dark:from-gray-900 dark:to-cyan-900/10 p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Compass className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          Interactive Tours
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Guided tours through platform features and capabilities
        </p>
      </div>

      <Suspense 
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading tour system...</span>
            </CardContent>
          </Card>
        }
      >
        <InteractiveTour />
      </Suspense>
    </div>
  );
}
