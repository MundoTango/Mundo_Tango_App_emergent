/**
 * STREAM 2: Inspector Prompt Suggestions
 * Context-aware prompt suggestions based on selected element type
 * MB.MD SIMULTANEOUS Build - October 23, 2025
 */

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface SelectedElement {
  tagName: string;
  id?: string;
  className?: string;
}

interface InspectorPromptSuggestionsProps {
  element: SelectedElement;
  onPromptClick: (prompt: string) => void;
}

export function InspectorPromptSuggestions({ element, onPromptClick }: InspectorPromptSuggestionsProps) {
  const prompts = useMemo(() => {
    const type = element.tagName.toLowerCase();
    
    // Element-specific prompts
    const promptMap: Record<string, string[]> = {
      button: [
        'Make this button bigger',
        'Change button color to teal',
        'Add hover animation',
        'Center this button',
        'Add loading state'
      ],
      input: [
        'Add placeholder text',
        'Make this input full width',
        'Add validation styling',
        'Change input border color',
        'Add focus ring effect'
      ],
      div: [
        'Add background gradient',
        'Make this responsive',
        'Add shadow effect',
        'Change layout to grid',
        'Add glassmorphic effect'
      ],
      img: [
        'Make image responsive',
        'Add rounded corners',
        'Add hover zoom effect',
        'Center this image',
        'Add lazy loading'
      ],
      h1: [
        'Change heading color',
        'Add gradient text',
        'Increase font size',
        'Center this heading',
        'Add underline effect'
      ],
      h2: [
        'Change heading color',
        'Add gradient text',
        'Adjust spacing',
        'Center this heading'
      ],
      h3: [
        'Change heading color',
        'Adjust font weight',
        'Add accent color'
      ],
      p: [
        'Adjust line height',
        'Change text color',
        'Increase font size',
        'Add text shadow'
      ],
      a: [
        'Change link color',
        'Add hover underline',
        'Open in new tab',
        'Add icon to link'
      ],
      nav: [
        'Make navigation sticky',
        'Add dropdown menu',
        'Improve mobile menu',
        'Add active link styling'
      ],
      form: [
        'Add form validation',
        'Style form inputs',
        'Add submit button styling',
        'Improve form layout'
      ],
      card: [
        'Add hover effect',
        'Adjust card spacing',
        'Add shadow',
        'Make card clickable'
      ]
    };
    
    // Return element-specific prompts or generic ones
    return promptMap[type] || [
      'Tell me about this element',
      'How can I improve this?',
      'What CSS properties does this have?',
      'Make this stand out more',
      'Add MT Ocean styling'
    ];
  }, [element]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50" data-testid="inspector-prompts">
      <ScrollArea className="w-full">
        <div className="flex gap-2 px-4 py-3">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onPromptClick(prompt)}
              className="whitespace-nowrap text-xs hover:bg-[var(--mrblue-teal)] hover:text-white hover:border-[var(--mrblue-teal)] transition-colors"
              data-testid={`inspector-prompt-${index}`}
            >
              {prompt}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
