import { Suspense, lazy } from 'react';
import { Loader2, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const VisualPageEditor = lazy(() => import('@/lib/mrBlue/visualEditor/VisualPageEditor'));

export default function VisualEditorTab() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-full">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading visual editor...</span>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VisualPageEditor />
    </Suspense>
  );
}
