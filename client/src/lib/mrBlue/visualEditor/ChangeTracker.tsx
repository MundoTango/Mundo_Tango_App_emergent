import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';

interface Change {
  element: HTMLElement;
  property: string;
  oldValue: string;
  newValue: string;
  timestamp: number;
}

interface ChangeTrackerProps {
  changes: Change[];
  onUndo: (index: number) => void;
}

export function ChangeTracker({ changes, onUndo }: ChangeTrackerProps) {
  if (changes.length === 0) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-[9998] bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 max-w-sm"
      data-testid="change-tracker"
    >
      <h3 className="text-sm font-semibold mb-2">Recent Changes</h3>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {changes.slice(-5).reverse().map((change, index) => {
          const actualIndex = changes.length - 1 - index;
          return (
            <div 
              key={change.timestamp}
              className="flex items-center justify-between text-xs bg-muted/50 rounded p-2"
              data-testid={`change-item-${actualIndex}`}
            >
              <div className="flex-1">
                <span className="font-mono">{change.property}</span>
                <span className="text-muted-foreground mx-1">→</span>
                <span className="font-mono">{change.newValue}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUndo(actualIndex)}
                className="h-6 w-6 p-0"
                data-testid={`button-undo-${actualIndex}`}
              >
                <Undo className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
