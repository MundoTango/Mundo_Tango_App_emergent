/**
 * AI SUGGESTIONS PANEL - Auto-suggestions on element selection
 * MB.MD SIMULTANEOUS - Agent #5: Visual Editor Integration Specialist
 * 
 * Shows AI-powered suggestions when user selects an element
 * Suggests common modifications (styling, content, interactions)
 * 
 * Created: October 23, 2025
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, Zap } from 'lucide-react';
import type { ElementSelection } from '@/lib/visual-editor/iframeMessaging';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'style' | 'content' | 'interaction' | 'layout';
  prompt: string; // The vibe coding prompt to execute
}

interface AISuggestionsPanelProps {
  selectedElement: ElementSelection | null;
  onApplySuggestion: (prompt: string) => void;
}

export function AISuggestionsPanel({ selectedElement, onApplySuggestion }: AISuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      generateSuggestions(selectedElement);
    } else {
      setSuggestions([]);
    }
  }, [selectedElement]);

  /**
   * Generate AI suggestions based on selected element
   */
  const generateSuggestions = async (element: ElementSelection) => {
    setLoading(true);

    // 🚀 STREAM D: Call Claude for context-aware suggestions
    const contextualSuggestions: Suggestion[] = [];
    
    try {
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          messages: [{
            role: 'user',
            content: `Generate 3-5 practical UI/UX suggestions for this HTML element:

Element: <${element.tagName.toLowerCase()}${element.id ? ` id="${element.id}"` : ''}${element.className ? ` class="${element.className}"` : ''}>
${element.textContent ? `Text: ${element.textContent.substring(0, 100)}` : ''}

For each suggestion, provide:
1. title: Short action (e.g., "Add Hover Effect")
2. description: What it does
3. category: style, content, interaction, or layout
4. prompt: Vibe coding instruction (e.g., "Add hover animation to...")

Return JSON array: [{ title, description, category, prompt }]`
          }],
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiSuggestions = JSON.parse(data.response || '[]');
        contextualSuggestions.push(...aiSuggestions);
      }
    } catch (error) {
      console.error('AI suggestions failed, using fallback:', error);
    }

    // Style suggestions
    if (element.tagName.toLowerCase() === 'button') {
      contextualSuggestions.push({
        id: 'btn-hover-effect',
        title: 'Add Hover Effect',
        description: 'Add a smooth hover animation to this button',
        category: 'style',
        prompt: `Add a hover effect to the button "${element.textContent}" with a scale animation and color change`
      });

      contextualSuggestions.push({
        id: 'btn-loading-state',
        title: 'Add Loading State',
        description: 'Add a loading spinner when button is clicked',
        category: 'interaction',
        prompt: `Add a loading state to the button "${element.textContent}" with a spinner`
      });
    }

    // Layout suggestions for containers
    if (element.tagName.toLowerCase() === 'div') {
      const hasChildren = element.textContent && element.textContent.length > 0;
      
      if (hasChildren) {
        contextualSuggestions.push({
          id: 'div-flex-center',
          title: 'Center Content',
          description: 'Center content using flexbox',
          category: 'layout',
          prompt: `Center the content in this div using flexbox`
        });

        contextualSuggestions.push({
          id: 'div-grid-layout',
          title: 'Convert to Grid',
          description: 'Use CSS Grid for better layout control',
          category: 'layout',
          prompt: `Convert this div to use CSS Grid layout with responsive columns`
        });
      }
    }

    // Text element suggestions
    if (['h1', 'h2', 'h3', 'p', 'span'].includes(element.tagName.toLowerCase())) {
      contextualSuggestions.push({
        id: 'text-gradient',
        title: 'Add Text Gradient',
        description: 'Apply a beautiful gradient effect to text',
        category: 'style',
        prompt: `Add a teal-to-cyan gradient effect to this ${element.tagName.toLowerCase()} element`
      });

      contextualSuggestions.push({
        id: 'text-animation',
        title: 'Animate Text',
        description: 'Add a fade-in or typing animation',
        category: 'interaction',
        prompt: `Add a fade-in animation to this text element`
      });
    }

    // Image suggestions
    if (element.tagName.toLowerCase() === 'img') {
      contextualSuggestions.push({
        id: 'img-zoom-hover',
        title: 'Add Zoom on Hover',
        description: 'Scale image slightly when hovering',
        category: 'interaction',
        prompt: `Add a smooth zoom effect to this image on hover`
      });

      contextualSuggestions.push({
        id: 'img-lazy-load',
        title: 'Add Lazy Loading',
        description: 'Optimize image loading performance',
        category: 'interaction',
        prompt: `Add lazy loading to this image for better performance`
      });
    }

    // Generic suggestions for any element
    contextualSuggestions.push({
      id: 'generic-responsive',
      title: 'Make Responsive',
      description: 'Optimize for mobile and tablet screens',
      category: 'layout',
      prompt: `Make this ${element.tagName.toLowerCase()} element fully responsive for mobile, tablet, and desktop`
    });

    contextualSuggestions.push({
      id: 'generic-accessibility',
      title: 'Improve Accessibility',
      description: 'Add ARIA labels and semantic HTML',
      category: 'content',
      prompt: `Improve accessibility of this ${element.tagName.toLowerCase()} element with proper ARIA labels`
    });

    setSuggestions(contextualSuggestions);
    setLoading(false);
  };

  if (!selectedElement) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardContent className="pt-6 text-center text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Select an element to see AI suggestions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="ai-suggestions-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          AI Suggestions
        </CardTitle>
        <CardDescription>
          Smart suggestions for <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
            {selectedElement.tagName.toLowerCase()}
          </code>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No suggestions available for this element
          </p>
        ) : (
          suggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className="hover:border-teal-500 transition-colors cursor-pointer"
              data-testid={`suggestion-${suggestion.id}`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-teal-600" />
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                        {suggestion.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {suggestion.description}
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onApplySuggestion(suggestion.prompt)}
                    data-testid={`button-apply-${suggestion.id}`}
                    className="shrink-0"
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
