/**
 * AGENT #147 (Visual Editor): Inspector Panel (Tab 1)
 * 
 * Figma-style element inspector with property editing
 * Features: Element tree, color picker, size controls, text editing
 * Research: docs/research/VISUAL_EDITOR_RESEARCH.md
 */

import { useState, useEffect } from 'react';
import { Code2, Type, Palette, Layout, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ElementSelection } from '@/lib/visual-editor/iframeMessaging';
import { normalizeColor } from '@/lib/styleNormalization';
import { useToast } from '@/hooks/use-toast';

interface InspectorPanelProps {
  selectedElement: ElementSelection | null;
  onStyleChange?: (property: string, value: string) => void;
  onTextChange?: (newText: string) => void;
}

export function InspectorPanel({ 
  selectedElement, 
  onStyleChange,
  onTextChange 
}: InspectorPanelProps) {
  const [editedText, setEditedText] = useState('');
  const { toast } = useToast();

  // ARCHITECT FIX: Reset edited text when selection changes
  useEffect(() => {
    setEditedText('');
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <Box className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">No element selected</p>
        <p className="text-xs mt-1 text-center">Click an element in the preview to inspect it</p>
      </div>
    );
  }

  const styles = selectedElement.computedStyles;

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="inspector-panel">
      {/* Element Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <Code2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {selectedElement.tagName}
            </h3>
            {selectedElement.id && (
              <p className="text-xs text-gray-500 dark:text-gray-400">#{selectedElement.id}</p>
            )}
          </div>
        </div>
        
        {/* Element Path */}
        <div className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded truncate">
          {selectedElement.xpath}
        </div>
        
        {/* 🚀 PHASE 4: Generate Code Button (ARCHITECT FIX: Pass element context) */}
        <Button 
          className="w-full mt-3" 
          variant="default"
          size="sm"
          data-testid="button-generate-code"
          onClick={() => {
            if (!selectedElement) {
              toast({
                title: 'No Element Selected',
                description: 'Please select an element first',
                variant: 'destructive'
              });
              return;
            }

            // Build context-aware prompt
            const prompt = `Modify the selected element: <${selectedElement.tagName}>${selectedElement.id ? ` #${selectedElement.id}` : ''}${selectedElement.className ? ` .${selectedElement.className.split(' ').join('.')}` : ''}\nXPath: ${selectedElement.xpath}\n\nWhat changes would you like to make?`;
            
            // Store prompt in sessionStorage so AI Tab can read it
            sessionStorage.setItem('visualEditor:pendingAIPrompt', prompt);
            sessionStorage.setItem('visualEditor:selectedElementContext', JSON.stringify({
              tag: selectedElement.tagName,
              id: selectedElement.id,
              className: selectedElement.className,
              xpath: selectedElement.xpath,
              computedStyles: selectedElement.computedStyles
            }));

            // Switch to AI Tab
            const aiTabButton = document.querySelector('[data-value="chat"]') as HTMLElement;
            if (aiTabButton) {
              aiTabButton.click();
              console.log('🤖 [Inspector] Switched to AI tab with element context:', selectedElement);
              
              toast({
                title: 'Switched to AI Tab',
                description: 'Element context loaded - ready for code generation',
              });
            }
          }}
        >
          <Code2 className="h-4 w-4 mr-2" />
          Generate Code for This Element
        </Button>
      </div>

      {/* Properties Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-gray-200 dark:border-gray-700 h-10">
            <TabsTrigger value="style" className="gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              <span className="text-xs">Style</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5">
              <Type className="h-3.5 w-3.5" />
              <span className="text-xs">Content</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="gap-1.5">
              <Layout className="h-3.5 w-3.5" />
              <span className="text-xs">Layout</span>
            </TabsTrigger>
          </TabsList>

          {/* STYLE TAB */}
          <TabsContent value="style" className="p-4 space-y-4 m-0">
            {/* Color Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Color</h4>
              
              <div className="space-y-2">
                <Label htmlFor="text-color" className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={normalizeColor(styles.color || '#000000')}
                    onChange={(e) => onStyleChange?.('color', e.target.value)}
                    className="w-16 h-9 p-1 cursor-pointer"
                    data-testid="input-color-text"
                  />
                  <Input
                    type="text"
                    value={styles.color || '#000000'}
                    onChange={(e) => onStyleChange?.('color', e.target.value)}
                    className="flex-1 text-xs font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bg-color" className="text-xs">Background</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={normalizeColor(styles.backgroundColor || '#ffffff')}
                    onChange={(e) => onStyleChange?.('backgroundColor', e.target.value)}
                    className="w-16 h-9 p-1 cursor-pointer"
                    data-testid="input-color-background"
                  />
                  <Input
                    type="text"
                    value={styles.backgroundColor || '#ffffff'}
                    onChange={(e) => onStyleChange?.('backgroundColor', e.target.value)}
                    className="flex-1 text-xs font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Typography Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Typography</h4>
              
              <div className="space-y-2">
                <Label htmlFor="font-size" className="text-xs">Font Size</Label>
                <Input
                  id="font-size"
                  type="text"
                  value={styles.fontSize || '16px'}
                  onChange={(e) => onStyleChange?.('fontSize', e.target.value)}
                  className="text-xs font-mono"
                  placeholder="16px"
                  data-testid="input-font-size"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-weight" className="text-xs">Font Weight</Label>
                <Input
                  id="font-weight"
                  type="text"
                  value={styles.fontWeight || '400'}
                  onChange={(e) => onStyleChange?.('fontWeight', e.target.value)}
                  className="text-xs font-mono"
                  placeholder="400"
                  data-testid="input-font-weight"
                />
              </div>
            </div>
          </TabsContent>

          {/* CONTENT TAB */}
          <TabsContent value="content" className="p-4 space-y-4 m-0">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Text Content</h4>
              
              <div className="space-y-2">
                <Label htmlFor="element-text" className="text-xs">Text</Label>
                <textarea
                  id="element-text"
                  value={editedText || selectedElement.textContent || ''}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md resize-y font-mono bg-white dark:bg-gray-800"
                  placeholder="Element text content"
                  data-testid="input-text-content"
                />
                {editedText && editedText !== selectedElement.textContent && (
                  <Button
                    onClick={() => {
                      onTextChange?.(editedText);
                      setEditedText('');
                    }}
                    size="sm"
                    className="w-full"
                    data-testid="button-apply-text"
                  >
                    Apply Changes
                  </Button>
                )}
              </div>

              {/* Attributes */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Attributes</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {Object.entries(selectedElement.attributes).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <code className="text-purple-600 dark:text-purple-400 font-semibold min-w-[80px]">{key}:</code>
                      <code className="text-gray-600 dark:text-gray-400 truncate flex-1">{value}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* LAYOUT TAB */}
          <TabsContent value="layout" className="p-4 space-y-4 m-0">
            {/* Size */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Size</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-xs">Width</Label>
                  <Input
                    id="width"
                    type="text"
                    value={styles.width || 'auto'}
                    onChange={(e) => onStyleChange?.('width', e.target.value)}
                    className="text-xs font-mono"
                    placeholder="auto"
                    data-testid="input-width"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs">Height</Label>
                  <Input
                    id="height"
                    type="text"
                    value={styles.height || 'auto'}
                    onChange={(e) => onStyleChange?.('height', e.target.value)}
                    className="text-xs font-mono"
                    placeholder="auto"
                    data-testid="input-height"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Spacing */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Spacing</h4>
              
              <div className="space-y-2">
                <Label htmlFor="padding" className="text-xs">Padding</Label>
                <Input
                  id="padding"
                  type="text"
                  value={styles.padding || '0'}
                  onChange={(e) => onStyleChange?.('padding', e.target.value)}
                  className="text-xs font-mono"
                  placeholder="0px"
                  data-testid="input-padding"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin" className="text-xs">Margin</Label>
                <Input
                  id="margin"
                  type="text"
                  value={styles.margin || '0'}
                  onChange={(e) => onStyleChange?.('margin', e.target.value)}
                  className="text-xs font-mono"
                  placeholder="0px"
                  data-testid="input-margin"
                />
              </div>
            </div>

            <Separator />

            {/* Position */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Position</h4>
              
              <div className="space-y-2">
                <Label htmlFor="position" className="text-xs">Position</Label>
                <Input
                  id="position"
                  type="text"
                  value={styles.position || 'static'}
                  onChange={(e) => onStyleChange?.('position', e.target.value)}
                  className="text-xs font-mono"
                  placeholder="static"
                  data-testid="input-position"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display" className="text-xs">Display</Label>
                <Input
                  id="display"
                  type="text"
                  value={styles.display || 'block'}
                  onChange={(e) => onStyleChange?.('display', e.target.value)}
                  className="text-xs font-mono"
                  placeholder="block"
                  data-testid="input-display"
                />
              </div>
            </div>

            {/* Bounding Box Info */}
            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Position (Read-Only)</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Top:</span>
                  <span className="ml-2 font-mono">{Math.round(selectedElement.boundingBox.top)}px</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Left:</span>
                  <span className="ml-2 font-mono">{Math.round(selectedElement.boundingBox.left)}px</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Width:</span>
                  <span className="ml-2 font-mono">{Math.round(selectedElement.boundingBox.width)}px</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Height:</span>
                  <span className="ml-2 font-mono">{Math.round(selectedElement.boundingBox.height)}px</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
