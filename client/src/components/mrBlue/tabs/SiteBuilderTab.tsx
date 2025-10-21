import { Suspense, lazy } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AISiteBuilderEnhanced = lazy(() => import('@/lib/mrBlue/siteBuilder/AISiteBuilderEnhanced'));

export default function SiteBuilderTab() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-violet-50/30 dark:from-gray-900 dark:to-violet-900/10 p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Wand2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          AI Site Builder
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Build beautiful pages with AI-powered design assistance
        </p>
      </div>

      <Suspense 
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading site builder...</span>
            </CardContent>
          </Card>
        }
      >
        <AISiteBuilderEnhanced />
      </Suspense>
    </div>
  );
}
