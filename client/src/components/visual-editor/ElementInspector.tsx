/**
 * Element Inspector - Properties panel for selected elements
 * MB.MD Track A2 - Visual Editor Sidebar Module
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ElementSelection } from '@/lib/visual-editor/iframeMessaging';
import { AISuggestionsPanel } from './AISuggestionsPanel';

interface ElementInspectorProps {
  selectedElement: ElementSelection | null;
}

export function ElementInspector({ selectedElement }: ElementInspectorProps) {
  if (!selectedElement) {
    return (
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="text-center text-gray-400">
          <p className="text-sm">No element selected</p>
          <p className="text-xs mt-2">Click any element in the preview to inspect it</p>
          <p className="text-xs mt-1 text-gray-500">Double-click to edit text • Delete key to remove</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gray-800 border-gray-700 space-y-4">
      {/* Element Identity */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500">
            {selectedElement.tagName}
          </Badge>
          {selectedElement.id && (
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500">
              #{selectedElement.id}
            </Badge>
          )}
        </div>
        {selectedElement.className && (
          <p className="text-xs text-gray-400 break-all">.{selectedElement.className}</p>
        )}
      </div>

      <Separator className="bg-gray-700" />

      {/* Dimensions */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Dimensions</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-900 p-2 rounded">
            <span className="text-gray-400">Width:</span>
            <span className="text-white ml-1">{Math.round(selectedElement.boundingBox.width)}px</span>
          </div>
          <div className="bg-gray-900 p-2 rounded">
            <span className="text-gray-400">Height:</span>
            <span className="text-white ml-1">{Math.round(selectedElement.boundingBox.height)}px</span>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Styles */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Computed Styles</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
          {Object.entries(selectedElement.computedStyles).map(([property, value]) => (
            <div key={property} className="flex justify-between py-1 px-2 bg-gray-900 rounded hover:bg-gray-700">
              <span className="text-gray-400 font-mono">{property}:</span>
              <span className="text-white font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* XPath */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">XPath</h3>
        <code className="text-xs text-gray-400 bg-gray-900 p-2 rounded block break-all">
          {selectedElement.xpath}
        </code>
      </div>

      {/* Attributes */}
      {Object.keys(selectedElement.attributes).length > 0 && (
        <>
          <Separator className="bg-gray-700" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Attributes</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
              {Object.entries(selectedElement.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 px-2 bg-gray-900 rounded">
                  <span className="text-gray-400 font-mono">{key}:</span>
                  <span className="text-white font-mono truncate ml-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator className="bg-gray-700" />

      {/* AI Suggestions */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">AI Suggestions</h3>
        <AISuggestionsPanel
          selectedElement={selectedElement}
          onApplySuggestion={(prompt) => {
            // Could trigger vibe coding here or pass up to parent
            console.log('AI Suggestion:', prompt);
          }}
        />
      </div>
    </Card>
  );
}
