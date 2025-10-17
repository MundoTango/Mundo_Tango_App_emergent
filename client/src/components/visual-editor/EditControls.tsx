/**
 * EDIT CONTROLS
 * Inline editing UI for selected components
 * Supports: Move, Resize, Style, Text editing
 * Part of Phase 12 Autonomous Learning System
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Save, RotateCcw } from 'lucide-react';
import type { SelectedComponent } from './ComponentSelector';
import { getVisualEditorTracker } from '@/lib/autonomy/VisualEditorTracker';

interface EditControlsProps {
  component: SelectedComponent;
  onSave: (changes: ComponentChanges) => void;
  onCancel: () => void;
}

export interface ComponentChanges {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  style?: Record<string, string>;
  text?: string;
}

export function EditControls({ component, onSave, onCancel }: EditControlsProps) {
  const tracker = getVisualEditorTracker();
  const [changes, setChanges] = useState<ComponentChanges>({});

  const currentStyles = window.getComputedStyle(component.element);

  const handleSave = async () => {
    // Track the edit
    if (changes.position) {
      tracker.trackMove(
        component.testId,
        changes.position.x - component.bounds.left,
        changes.position.y - component.bounds.top
      );
    }

    if (changes.size) {
      tracker.trackResize(
        component.testId,
        changes.size.width,
        changes.size.height
      );
    }

    if (changes.style) {
      Object.entries(changes.style).forEach(([property, value]) => {
        tracker.trackStyleChange(component.testId, property, value);
      });
    }

    if (changes.text) {
      tracker.trackTextChange(component.testId, changes.text);
    }

    onSave(changes);
  };

  return (
    <Card className="p-4 max-w-md" data-testid="edit-controls-panel">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Edit Component</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        <Tabs defaultValue="position">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="position">Position</TabsTrigger>
            <TabsTrigger value="size">Size</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>

          {/* Position Tab */}
          <TabsContent value="position" className="space-y-3">
            <div>
              <Label>X Position</Label>
              <Input
                type="number"
                value={changes.position?.x || component.bounds.left}
                onChange={(e) => setChanges({
                  ...changes,
                  position: { 
                    x: parseInt(e.target.value), 
                    y: changes.position?.y || component.bounds.top 
                  }
                })}
                data-testid="input-position-x"
              />
            </div>
            <div>
              <Label>Y Position</Label>
              <Input
                type="number"
                value={changes.position?.y || component.bounds.top}
                onChange={(e) => setChanges({
                  ...changes,
                  position: { 
                    x: changes.position?.x || component.bounds.left, 
                    y: parseInt(e.target.value) 
                  }
                })}
                data-testid="input-position-y"
              />
            </div>
          </TabsContent>

          {/* Size Tab */}
          <TabsContent value="size" className="space-y-3">
            <div>
              <Label>Width</Label>
              <Input
                type="number"
                value={changes.size?.width || component.bounds.width}
                onChange={(e) => setChanges({
                  ...changes,
                  size: { 
                    width: parseInt(e.target.value), 
                    height: changes.size?.height || component.bounds.height 
                  }
                })}
                data-testid="input-size-width"
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input
                type="number"
                value={changes.size?.height || component.bounds.height}
                onChange={(e) => setChanges({
                  ...changes,
                  size: { 
                    width: changes.size?.width || component.bounds.width, 
                    height: parseInt(e.target.value) 
                  }
                })}
                data-testid="input-size-height"
              />
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-3">
            <div>
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={changes.style?.backgroundColor || currentStyles.backgroundColor}
                  onChange={(e) => setChanges({
                    ...changes,
                    style: { ...changes.style, backgroundColor: e.target.value }
                  })}
                  className="w-20"
                  data-testid="input-bg-color"
                />
                <Input
                  type="text"
                  value={changes.style?.backgroundColor || currentStyles.backgroundColor}
                  onChange={(e) => setChanges({
                    ...changes,
                    style: { ...changes.style, backgroundColor: e.target.value }
                  })}
                  className="flex-1"
                  data-testid="input-bg-color-text"
                />
              </div>
            </div>

            <div>
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={changes.style?.color || currentStyles.color}
                  onChange={(e) => setChanges({
                    ...changes,
                    style: { ...changes.style, color: e.target.value }
                  })}
                  className="w-20"
                  data-testid="input-text-color"
                />
                <Input
                  type="text"
                  value={changes.style?.color || currentStyles.color}
                  onChange={(e) => setChanges({
                    ...changes,
                    style: { ...changes.style, color: e.target.value }
                  })}
                  className="flex-1"
                  data-testid="input-text-color-text"
                />
              </div>
            </div>

            <div>
              <Label>Padding</Label>
              <Slider
                value={[parseInt(changes.style?.padding || currentStyles.padding || '0')]}
                onValueChange={([value]) => setChanges({
                  ...changes,
                  style: { ...changes.style, padding: `${value}px` }
                })}
                max={50}
                step={1}
                data-testid="slider-padding"
              />
              <span className="text-xs text-gray-500">
                {changes.style?.padding || currentStyles.padding || '0'}
              </span>
            </div>

            <div>
              <Label>Border Radius</Label>
              <Slider
                value={[parseInt(changes.style?.borderRadius || currentStyles.borderRadius || '0')]}
                onValueChange={([value]) => setChanges({
                  ...changes,
                  style: { ...changes.style, borderRadius: `${value}px` }
                })}
                max={50}
                step={1}
                data-testid="slider-border-radius"
              />
              <span className="text-xs text-gray-500">
                {changes.style?.borderRadius || currentStyles.borderRadius || '0'}
              </span>
            </div>
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="space-y-3">
            <div>
              <Label>Text Content</Label>
              <Input
                type="text"
                value={changes.text || component.element.textContent || ''}
                onChange={(e) => setChanges({ ...changes, text: e.target.value })}
                data-testid="input-text-content"
              />
            </div>

            <div>
              <Label>Font Size</Label>
              <Slider
                value={[parseInt(changes.style?.fontSize || currentStyles.fontSize || '16')]}
                onValueChange={([value]) => setChanges({
                  ...changes,
                  style: { ...changes.style, fontSize: `${value}px` }
                })}
                min={8}
                max={72}
                step={1}
                data-testid="slider-font-size"
              />
              <span className="text-xs text-gray-500">
                {changes.style?.fontSize || currentStyles.fontSize}
              </span>
            </div>

            <div>
              <Label>Font Weight</Label>
              <Slider
                value={[parseInt(changes.style?.fontWeight || currentStyles.fontWeight || '400')]}
                onValueChange={([value]) => setChanges({
                  ...changes,
                  style: { ...changes.style, fontWeight: value.toString() }
                })}
                min={100}
                max={900}
                step={100}
                data-testid="slider-font-weight"
              />
              <span className="text-xs text-gray-500">
                {changes.style?.fontWeight || currentStyles.fontWeight}
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
