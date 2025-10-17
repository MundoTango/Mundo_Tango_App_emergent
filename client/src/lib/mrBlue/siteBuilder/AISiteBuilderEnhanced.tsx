import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wand2, Code, Eye, Download } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

/**
 * TRACK 5: Agent #77 AI Site Builder Enhancement
 * Generate entire pages from text descriptions
 */

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
}

interface GeneratedPage {
  code: string;
  preview: string;
  components: string[];
  explanation: string;
}

const TEMPLATES: PageTemplate[] = [
  {
    id: 'dashboard',
    name: 'User Dashboard',
    description: 'Stats cards, charts, recent activity',
    category: 'app',
    preview: '📊'
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Hero section, features, CTA, testimonials',
    category: 'marketing',
    preview: '🚀'
  },
  {
    id: 'admin',
    name: 'Admin Panel',
    description: 'Data tables, filters, actions',
    category: 'app',
    preview: '⚙️'
  },
  {
    id: 'profile',
    name: 'User Profile',
    description: 'Avatar, bio, activity feed, stats',
    category: 'social',
    preview: '👤'
  },
  {
    id: 'settings',
    name: 'Settings Page',
    description: 'Tabs, forms, preferences',
    category: 'app',
    preview: '🔧'
  },
  {
    id: 'pricing',
    name: 'Pricing Page',
    description: 'Tier cards, comparison table',
    category: 'marketing',
    preview: '💳'
  }
];

const COMPONENT_LIBRARY = [
  { name: 'Button', import: '@/components/ui/button' },
  { name: 'Card', import: '@/components/ui/card' },
  { name: 'Input', import: '@/components/ui/input' },
  { name: 'Badge', import: '@/components/ui/badge' },
  { name: 'Tabs', import: '@/components/ui/tabs' },
  { name: 'Table', import: '@/components/ui/table' },
  { name: 'Dialog', import: '@/components/ui/dialog' },
  { name: 'Select', import: '@/components/ui/select' },
  { name: 'Chart (Recharts)', import: 'recharts' }
];

export default function AISiteBuilderEnhanced() {
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedPage, setGeneratedPage] = useState<GeneratedPage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/site-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          template: selectedTemplate,
          componentLibrary: COMPONENT_LIBRARY
        })
      });
      const result = await response.json();
      setGeneratedPage(result as GeneratedPage);
    } catch (error) {
      console.error('Page generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCode = () => {
    if (!generatedPage) return;
    
    const blob = new Blob([generatedPage.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-page.tsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Wand2 className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">AI Site Builder</h2>
          <p className="text-sm text-muted-foreground">
            Agent #77 - Generate pages from descriptions
          </p>
        </div>
      </div>

      <Tabs defaultValue="describe" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="describe">Describe Page</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
        </TabsList>

        {/* Tab 1: Describe Page */}
        <TabsContent value="describe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Page</CardTitle>
              <CardDescription>
                Tell AI what you want to build, and it will generate the code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Description:</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Create a user dashboard with stats cards showing total users, revenue, and growth. Include a chart for monthly analytics and a table of recent activities."
                  className="min-h-[120px]"
                  data-testid="textarea-page-description"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Available Components:</label>
                <div className="flex flex-wrap gap-2">
                  {COMPONENT_LIBRARY.map((comp) => (
                    <Badge key={comp.name} variant="secondary">
                      {comp.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={generatePage}
                disabled={!description || isGenerating}
                className="w-full"
                data-testid="button-generate-page"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Page
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generation Tips */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Pro Tips:</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <li>• Be specific about layout (grid, sidebar, etc.)</li>
              <li>• Mention desired components (cards, charts, tables)</li>
              <li>• Include data structure expectations</li>
              <li>• Specify responsiveness needs</li>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Templates</CardTitle>
              <CardDescription>
                Start from a template and customize with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-primary'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                    data-testid={`template-${template.id}`}
                  >
                    <div className="text-4xl mb-2">{template.preview}</div>
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {template.category}
                    </Badge>
                  </Card>
                ))}
              </div>

              {selectedTemplate && (
                <Button
                  onClick={() => {
                    const template = TEMPLATES.find(t => t.id === selectedTemplate);
                    if (template) {
                      setDescription(`Create a ${template.name}: ${template.description}`);
                      generatePage();
                    }
                  }}
                  className="w-full mt-4"
                >
                  Generate from Template
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Preview & Export */}
        <TabsContent value="preview" className="space-y-4">
          {generatedPage ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Code</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadCode}
                        data-testid="button-download-code"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{generatedPage.explanation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>{generatedPage.code}</code>
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-background min-h-[400px]">
                    <iframe
                      srcDoc={generatedPage.preview}
                      className="w-full h-[400px] border-0"
                      title="Page Preview"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Components Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {generatedPage.components.map((comp) => (
                      <Badge key={comp} variant="secondary">
                        <Code className="w-3 h-3 mr-1" />
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Wand2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No page generated yet. Describe your page or choose a template to start.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
