import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Download, Eye, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * ESA Agent #77: AI Site Builder
 * Generate complete websites with GrapesJS + AI in <30 seconds
 */

interface SiteBuilderProps {
  onSiteGenerated?: (siteData: any) => void;
}

const TEMPLATES = [
  { id: 'landing', name: 'Landing Page', description: 'Convert visitors into customers' },
  { id: 'portfolio', name: 'Portfolio', description: 'Showcase your work beautifully' },
  { id: 'blog', name: 'Blog', description: 'Share your thoughts and ideas' },
  { id: 'ecommerce', name: 'E-Commerce', description: 'Sell products online' },
  { id: 'saas', name: 'SaaS Product', description: 'Software as a Service site' },
];

export function AISiteBuilder({ onSiteGenerated }: SiteBuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [template, setTemplate] = useState('landing');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [generatedSite, setGeneratedSite] = useState<any>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/site-builder/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedSite(data);
      onSiteGenerated?.(data);
      toast({
        title: "Site Generated! 🎉",
        description: "Your website is ready to customize and deploy",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate website",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!businessName || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name and description",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      template,
      businessName,
      description,
      prompt: prompt || `Create a ${template} website for ${businessName}`,
    });
  };

  const handlePreview = () => {
    if (!generatedSite) return;
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(generatedSite.html);
      previewWindow.document.close();
    }
  };

  const handleDownload = () => {
    if (!generatedSite) return;

    const zip = generateZipFile(generatedSite);
    const blob = new Blob([zip], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-website.zip`;
    a.click();
  };

  return (
    <div className="space-y-6" data-testid="ai-site-builder">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Website Generator
          </CardTitle>
          <CardDescription>
            Generate a complete website in under 30 seconds using AI
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Template Selection */}
          <div>
            <Label>Template Type</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger data-testid="select-template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Name */}
          <div>
            <Label>Business Name</Label>
            <Input
              placeholder="Acme Inc"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              data-testid="input-business-name"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Business Description</Label>
            <Textarea
              placeholder="We help businesses grow with innovative solutions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-testid="input-business-description"
            />
          </div>

          {/* Custom Prompt (Optional) */}
          <div>
            <Label>Custom Instructions (Optional)</Label>
            <Textarea
              placeholder="Include a pricing section, customer testimonials, blue color scheme..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              data-testid="input-custom-prompt"
            />
          </div>

          {/* Generate Button */}
          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            data-testid="button-generate-site"
          >
            {generateMutation.isPending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Website
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Site Preview */}
      {generatedSite && (
        <Card>
          <CardHeader>
            <CardTitle>Your Generated Website</CardTitle>
            <CardDescription>
              Preview, customize, or download your site
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <iframe
                srcDoc={generatedSite.html}
                className="w-full h-96"
                title="Site Preview"
                data-testid="site-preview-iframe"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                data-testid="button-preview-site"
              >
                <Eye className="h-4 w-4 mr-2" />
                Full Preview
              </Button>

              <Button
                variant="outline"
                onClick={() => setGeneratedSite({ ...generatedSite, showCode: !generatedSite.showCode })}
                data-testid="button-view-code"
              >
                <Code className="h-4 w-4 mr-2" />
                View Code
              </Button>

              <Button
                onClick={handleDownload}
                data-testid="button-download-site"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Code View */}
            {generatedSite.showCode && (
              <div className="border rounded-lg p-4 bg-muted">
                <pre className="text-xs overflow-auto max-h-64">
                  <code>{generatedSite.html}</code>
                </pre>
              </div>
            )}

            {/* Deployment Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm">
                <strong>Next Steps:</strong>
                <br />
                1. Download your site
                <br />
                2. Deploy to subdomain: <code className="bg-muted px-1 rounded">{businessName.toLowerCase().replace(/\s+/g, '-')}.yourdomain.com</code>
                <br />
                3. Customize with visual editor or GrapesJS
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function generateZipFile(siteData: any): string {
  // Simplified zip generation (in production: use JSZip)
  return `
HTML:
${siteData.html}

CSS:
${siteData.css || ''}

JS:
${siteData.js || ''}
  `.trim();
}
