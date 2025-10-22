/**
 * Inline Text Editor
 * MB.MD: Double-click selected element to edit text content directly
 */

import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface InlineTextEditorProps {
  element: HTMLElement | null;
  onSave: (newText: string) => void;
  onCancel: () => void;
}

export function InlineTextEditor({ element, onSave, onCancel }: InlineTextEditorProps) {
  const [text, setText] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (element) {
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
      setText(element.textContent || '');
      
      // Auto-focus after render
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [element]);

  if (!element) return null;

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
      toast({
        title: "Text Updated",
        description: "Changes saved to element",
        duration: 2000
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="fixed z-[60] bg-white dark:bg-gray-900 border-2 border-purple-500 rounded-lg shadow-2xl p-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: `${position.width}px`
      }}
      data-testid="inline-text-editor"
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full min-h-[60px] p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        placeholder="Edit text content..."
        data-testid="input-inline-text"
      />
      
      <div className="flex items-center gap-2 mt-2">
        <Button
          size="sm"
          onClick={handleSave}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          data-testid="button-save-inline"
        >
          <Check className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          data-testid="button-cancel-inline"
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Press Enter to save • Shift+Enter for new line • Esc to cancel
      </p>
    </div>
  );
}
