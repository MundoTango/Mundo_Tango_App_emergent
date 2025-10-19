/**
 * Admin Tools Tab - Super Admin Only
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Code, Map } from 'lucide-react';
import { useLocation } from 'wouter';

export function AdminToolsTab() {
  const [, navigate] = useLocation();

  const tools = [
    {
      id: 'visual-editor',
      name: 'Visual Page Editor',
      description: 'Click-to-edit any page element with AI',
      icon: Wand2,
      action: () => navigate('/visual-editor'),
    },
    {
      id: 'site-builder',
      name: 'AI Site Builder',
      description: 'Generate pages from text descriptions',
      icon: Code,
      action: () => navigate('/admin/site-builder'),
    },
    {
      id: 'esa-mindmap',
      name: 'ESA MindMap',
      description: 'Visualize all 276 agents',
      icon: Map,
      action: () => navigate('/admin/esa-mind'),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={tool.action}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-turquoise-600" />
                  <CardTitle className="text-base">{tool.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">{tool.description}</CardDescription>
                <Button size="sm" className="mt-3 w-full" variant="outline">
                  Open Tool
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
