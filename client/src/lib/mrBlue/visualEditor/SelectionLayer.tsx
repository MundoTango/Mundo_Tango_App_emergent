import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SelectionLayerProps {
  selectedElement: HTMLElement | null;
  onStyleChange: (property: string, value: string) => void;
}

export function SelectionLayer({ selectedElement, onStyleChange }: SelectionLayerProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [styles, setStyles] = useState<CSSStyleDeclaration | null>(null);

  useEffect(() => {
    if (selectedElement) {
      const updateRect = () => {
        setRect(selectedElement.getBoundingClientRect());
        setStyles(window.getComputedStyle(selectedElement));
      };

      updateRect();
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect);

      return () => {
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
      };
    } else {
      setRect(null);
      setStyles(null);
    }
  }, [selectedElement]);

  if (!rect || !styles) return null;

  return (
    <>
      {/* Selection Overlay */}
      <div
        className="fixed pointer-events-none z-[9998] border-2 border-blue-500 bg-blue-500/10"
        style={{
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          overflow: 'hidden',
          maxWidth: '100vw',
        }}
        data-testid="selection-overlay"
      />

      {/* Quick Edit Panel */}
      <div
        className="fixed z-[9998] bg-background border rounded-lg shadow-xl p-4 w-64 overflow-y-auto max-h-96"
        style={{
          top: `${Math.min(rect.bottom + 8, window.innerHeight - 400)}px`,
          left: `${Math.min(rect.left, window.innerWidth - 270)}px`,
          maxWidth: '100vw',
        }}
        data-testid="quick-edit-panel"
      >
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Element</Label>
            <p className="text-sm font-mono mt-1">{selectedElement?.tagName.toLowerCase()}</p>
          </div>

          <div>
            <Label className="text-xs">Background</Label>
            <Input
              type="color"
              value={rgbToHex(styles.backgroundColor)}
              onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
              className="h-8"
              data-testid="input-background-color"
            />
          </div>

          <div>
            <Label className="text-xs">Text Color</Label>
            <Input
              type="color"
              value={rgbToHex(styles.color)}
              onChange={(e) => onStyleChange('color', e.target.value)}
              className="h-8"
              data-testid="input-text-color"
            />
          </div>

          <div>
            <Label className="text-xs">Padding</Label>
            <Input
              type="text"
              value={styles.padding}
              onChange={(e) => onStyleChange('padding', e.target.value)}
              placeholder="16px"
              className="h-8"
              data-testid="input-padding"
            />
          </div>

          <div>
            <Label className="text-xs">Border Radius</Label>
            <Input
              type="text"
              value={styles.borderRadius}
              onChange={(e) => onStyleChange('borderRadius', e.target.value)}
              placeholder="8px"
              className="h-8"
              data-testid="input-border-radius"
            />
          </div>

          <div>
            <Label className="text-xs">Font Size</Label>
            <Input
              type="text"
              value={styles.fontSize}
              onChange={(e) => onStyleChange('fontSize', e.target.value)}
              placeholder="16px"
              className="h-8"
              data-testid="input-font-size"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
