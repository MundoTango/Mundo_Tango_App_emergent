import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VisualEditorTab() {
  const [, navigate] = useLocation();

  // Auto-navigate to full-page Visual Editor
  useEffect(() => {
    navigate('/admin/visual-editor');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Opening Visual Editor
          </CardTitle>
          <CardDescription>
            Redirecting to full-screen Replit-style development environment...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/admin/visual-editor')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Visual Editor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
