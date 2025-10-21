import { Suspense, lazy } from 'react';
import { Loader2, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const VisualPageEditor = lazy(() => import('@/lib/mrBlue/visualEditor/VisualPageEditor'));

export default function VisualEditorTab() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-pink-50/30 dark:from-gray-900 dark:to-pink-900/10 p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Palette className="h-6 w-6 text-pink-600 dark:text-pink-400" />
          Visual Page Editor
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Design and customize pages with our drag-and-drop visual editor
        </p>
      </div>

      <Suspense 
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading visual editor...</span>
            </CardContent>
          </Card>
        }
      >
        <VisualPageEditor />
      </Suspense>
    </div>
  );
}
