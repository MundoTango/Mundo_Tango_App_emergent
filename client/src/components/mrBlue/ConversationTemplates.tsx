/**
 * TRACK F: Conversation Templates UI
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #126 (UI)
 * 
 * Template marketplace for quick-start conversations
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code2,
  Lightbulb,
  Bug,
  GraduationCap,
  Clipboard,
  Plane,
  ChefHat,
  BookOpen,
  Languages,
  Briefcase,
  Search,
  Star,
  Sparkles,
} from 'lucide-react';
import {
  CONVERSATION_TEMPLATES,
  getFeaturedTemplates,
  getTemplatesByCategory,
  searchTemplates,
  type ConversationTemplate,
} from '@shared/conversation-templates';

const ICON_MAP: Record<string, any> = {
  Code2,
  Lightbulb,
  Bug,
  GraduationCap,
  Clipboard,
  Plane,
  ChefHat,
  BookOpen,
  Languages,
  Briefcase,
};

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  green: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
  orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  pink: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
};

interface ConversationTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ConversationTemplate) => void;
}

export function ConversationTemplates({ isOpen, onClose, onSelectTemplate }: ConversationTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ConversationTemplate['category']>('all');

  // Get templates based on filters
  const getFilteredTemplates = (): ConversationTemplate[] => {
    let templates = CONVERSATION_TEMPLATES;

    // Apply category filter
    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    return templates.sort((a, b) => b.popularityScore - a.popularityScore);
  };

  const filteredTemplates = getFilteredTemplates();
  const featuredTemplates = getFeaturedTemplates();

  const handleSelectTemplate = (template: ConversationTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <DialogTitle>Conversation Templates</DialogTitle>
          </div>
          <DialogDescription>
            Start with a pre-configured assistant for common tasks
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="all" className="flex flex-col h-full">
            {/* Search bar */}
            <div className="px-6 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-templates"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="px-6 py-2 border-b">
              <TabsList className="w-full justify-start h-auto flex-wrap">
                <TabsTrigger
                  value="all"
                  onClick={() => setSelectedCategory('all')}
                  data-testid="tab-category-all"
                >
                  All Templates
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  onClick={() => setSelectedCategory('all')}
                  data-testid="tab-category-featured"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </TabsTrigger>
                <TabsTrigger
                  value="technical"
                  onClick={() => setSelectedCategory('technical')}
                  data-testid="tab-category-technical"
                >
                  Technical
                </TabsTrigger>
                <TabsTrigger
                  value="creative"
                  onClick={() => setSelectedCategory('creative')}
                  data-testid="tab-category-creative"
                >
                  Creative
                </TabsTrigger>
                <TabsTrigger
                  value="productivity"
                  onClick={() => setSelectedCategory('productivity')}
                  data-testid="tab-category-productivity"
                >
                  Productivity
                </TabsTrigger>
                <TabsTrigger
                  value="business"
                  onClick={() => setSelectedCategory('business')}
                  data-testid="tab-category-business"
                >
                  Business
                </TabsTrigger>
                <TabsTrigger
                  value="learning"
                  onClick={() => setSelectedCategory('learning')}
                  data-testid="tab-category-learning"
                >
                  Learning
                </TabsTrigger>
                <TabsTrigger
                  value="lifestyle"
                  onClick={() => setSelectedCategory('lifestyle')}
                  data-testid="tab-category-lifestyle"
                >
                  Lifestyle
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Template grid */}
            <TabsContent value="all" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleSelectTemplate}
                    />
                  ))}

                  {filteredTemplates.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No templates found</p>
                      <p className="text-sm mt-1">Try a different search or category</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="featured" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleSelectTemplate}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateCardProps {
  template: ConversationTemplate;
  onSelect: (template: ConversationTemplate) => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const Icon = ICON_MAP[template.icon] || Code2;
  const colorClass = COLOR_MAP[template.color] || COLOR_MAP.blue;

  return (
    <div
      className="group relative border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-gray-900"
      onClick={() => onSelect(template)}
      data-testid={`template-card-${template.id}`}
    >
      {/* Featured badge */}
      {template.featured && (
        <div className="absolute top-2 right-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        </div>
      )}

      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg border ${colorClass} mb-3`}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
        {template.name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {template.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="capitalize">{template.category}</span>
        {template.suggestedModel && (
          <span className="truncate max-w-[120px]">{template.suggestedModel}</span>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/20 rounded-lg pointer-events-none transition-all" />
    </div>
  );
}
