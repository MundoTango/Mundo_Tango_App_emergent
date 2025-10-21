/**
 * Style Editor - Visual CSS editing panel
 * MB.MD Track A3 - Visual Editor Sidebar Module
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ElementSelection, StyleMutation } from '@/lib/visual-editor/iframeMessaging';

interface StyleEditorProps {
  selectedElement: ElementSelection | null;
  onApplyStyle: (mutation: StyleMutation) => void;
  pendingStyles: StyleMutation[];
}

export function StyleEditor({ selectedElement, onApplyStyle, pendingStyles }: StyleEditorProps) {
  const [color, setColor] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [padding, setPadding] = useState('');
  const [margin, setMargin] = useState('');

  if (!selectedElement) {
    return (
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="text-center text-gray-400">
          <p className="text-sm">Select an element to edit styles</p>
        </div>
      </Card>
    );
  }

  const applyStyle = (property: string, value: string) => {
    if (!value) return;
    onApplyStyle({
      xpath: selectedElement.xpath,
      property,
      value
    });
  };

  return (
    <Card className="p-4 bg-gray-800 border-gray-700">
      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900">
          <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
          <TabsTrigger value="colors" className="text-xs">Colors</TabsTrigger>
          <TabsTrigger value="custom" className="text-xs">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-3 mt-4">
          <div>
            <Label className="text-xs text-gray-400">Width</Label>
            <div className="flex gap-2">
              <Input
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="e.g. 200px, 50%, auto"
                className="bg-gray-900 border-gray-700 text-white text-sm"
                data-testid="input-width"
              />
              <Button
                size="sm"
                onClick={() => applyStyle('width', width)}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-apply-width"
              >
                Apply
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-400">Height</Label>
            <div className="flex gap-2">
              <Input
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 100px, auto"
                className="bg-gray-900 border-gray-700 text-white text-sm"
                data-testid="input-height"
              />
              <Button
                size="sm"
                onClick={() => applyStyle('height', height)}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-apply-height"
              >
                Apply
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-400">Padding</Label>
            <div className="flex gap-2">
              <Input
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
                placeholder="e.g. 10px, 1rem"
                className="bg-gray-900 border-gray-700 text-white text-sm"
                data-testid="input-padding"
              />
              <Button
                size="sm"
                onClick={() => applyStyle('padding', padding)}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-apply-padding"
              >
                Apply
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-400">Margin</Label>
            <div className="flex gap-2">
              <Input
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="e.g. 10px, 1rem"
                className="bg-gray-900 border-gray-700 text-white text-sm"
                data-testid="input-margin"
              />
              <Button
                size="sm"
                onClick={() => applyStyle('margin', margin)}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-apply-margin"
              >
                Apply
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-3 mt-4">
          <div>
            <Label className="text-xs text-gray-400">Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. #3b82f6, blue"
                className="bg-gray-900 border-gray-700 text-white text-sm"
                data-testid="input-color"
              />
              <Button
                size="sm"
                onClick={() => applyStyle('color', color)}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-apply-color"
              >
                Apply
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-400">Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                placeholder="e.g. #ef4444, red"
                className="bg-gray-900 border-gray-700 text-white text-sm"
                data-testid="input-bgcolor"
              />
              <Button
                size="sm"
                onClick={() => applyStyle('backgroundColor', bgColor)}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-apply-bgcolor"
              >
                Apply
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-3 mt-4">
          <div className="text-xs text-gray-400 mb-2">
            {pendingStyles.length} style{pendingStyles.length !== 1 ? 's' : ''} pending save
          </div>
          <div className="bg-gray-900 p-3 rounded text-xs text-gray-400">
            <p>Custom CSS properties coming soon:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Border styles</li>
              <li>Typography</li>
              <li>Flexbox/Grid</li>
              <li>Transforms</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
