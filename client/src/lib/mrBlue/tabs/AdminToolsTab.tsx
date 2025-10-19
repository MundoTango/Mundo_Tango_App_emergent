/**
 * Admin Tools Tab - Super Admin Only
 * mb.md lines 1005-1007
 * 
 * Includes:
 * - Visual Page Editor (#78)
 * - AI Site Builder (#77)
 * - ESA MindMap (#35)
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  Code, 
  Map, 
  Eye,
  Sparkles,
  GitBranch,
  Play,
  Save
} from 'lucide-react';
import { useLocation } from 'wouter';

export function AdminToolsTab() {
  const [, navigate] = useLocation();

  const tools = [
    {
      id: 'visual-editor',
      name: 'Visual Page Editor',
      description: 'Click-to-edit any page element with AI code generation',
      icon: Eye,
      color: 'from-purple-500 to-pink-500',
      agent: '#78',
      action: () => navigate('/visual-editor'),
    },
    {
      id: 'site-builder',
      name: 'AI Site Builder',
      description: 'Generate entire pages from text descriptions',
      icon: Wand2,
      color: 'from-blue-500 to-cyan-500',
      agent: '#77',
      action: () => navigate('/admin/site-builder'),
    },
    {
      id: 'esa-mindmap',
      name: 'ESA MindMap',
      description: 'Visualize and manage all 276 agents in the system',
      icon: Map,
      color: 'from-green-500 to-emerald-500',
      agent: '#35',
      action: () => navigate('/admin/esa-mind'),
    },
    {
      id: 'code-generator',
      name: 'Quick Code Generation',
      description: 'Generate code snippets and components instantly',
      icon: Code,
      color: 'from-orange-500 to-red-500',
      agent: 'AI',
      action: () => {}, // Handled inline
    },
  ];

  const [quickCodePrompt, setQuickCodePrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuickCodeGeneration = async () => {
    if (!quickCodePrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/visual-editor/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: [{ type: 'custom', prompt: quickCodePrompt }],
        }),
      });

      const data = await response.json();
      setGeneratedCode(data.generatedCode || '// Generation failed');
    } catch (error) {
      console.error('Code generation error:', error);
      setGeneratedCode('// Error generating code');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-lg">Super Admin Tools</h3>
          <Badge variant="destructive" className="text-xs">SA Only</Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Advanced AI-powered tools for platform management
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={tool.action}
                data-testid={`admin-tool-${tool.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-gradient-to-br ${tool.color} rounded-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        Agent {tool.agent}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    {tool.description}
                  </CardDescription>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    variant="outline"
                  >
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Code Generation */}
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-base">Quick Code Generation</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Generate code snippets instantly with AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Describe what code you need..."
                value={quickCodePrompt}
                onChange={(e) => setQuickCodePrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickCodeGeneration()}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                data-testid="input-quick-code-prompt"
              />
              <Button
                onClick={handleQuickCodeGeneration}
                disabled={isGenerating || !quickCodePrompt.trim()}
                data-testid="button-generate-code"
              >
                {isGenerating ? <Sparkles className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            {generatedCode && (
              <div className="relative">
                <pre className="bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                  <code>{generatedCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate('/admin/multi-ai-dashboard')}>
              <GitBranch className="h-4 w-4 mr-2" />
              Multi-AI Dashboard
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/admin/component-health')}>
              <Eye className="h-4 w-4 mr-2" />
              Component Health
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/admin/performance')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Performance Monitor
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/admin/agent-intelligence')}>
              <Map className="h-4 w-4 mr-2" />
              Agent Intelligence
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
