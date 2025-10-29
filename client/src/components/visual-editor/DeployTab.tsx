/**
 * DEPLOY TAB - Replit-Style Deployment
 * MB.MD Track 6: Staging & Production deployment
 * 
 * Features: Preview URL generation, one-click deploy
 */

import { useState } from 'react';
import { Rocket, ExternalLink, GitBranch, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function DeployTab() {
  const [branchName, setBranchName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const handlePreviewDeploy = async () => {
    try {
      setIsDeploying(true);
      const branch = branchName || `visual-edit-${Date.now()}`;
      
      const response = await apiRequest('/api/visual-editor/preview', {
        method: 'POST',
        body: JSON.stringify({ branch })
      });

      setPreviewUrl(response.previewUrl);
      toast({
        title: "Preview Deployed",
        description: `Staging URL is ready: ${response.previewUrl}`,
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Deploy Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleProductionDeploy = async () => {
    try {
      setIsDeploying(true);
      const branch = branchName || 'visual-edit';
      
      const response = await apiRequest('/api/visual-editor/deploy', {
        method: 'POST',
        body: JSON.stringify({ branch, runTests: true })
      });

      toast({
        title: "Production Deployed",
        description: response.prUrl ? `PR created: ${response.prUrl}` : "Deployment complete",
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Deploy Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Deploy Changes</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Deploy your visual edits to staging or production
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Branch Name (optional)
        </label>
        <Input
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          placeholder="feature/visual-edit"
          data-testid="input-branch-name"
        />
      </div>

      <div className="space-y-2">
        <Button
          onClick={handlePreviewDeploy}
          disabled={isDeploying}
          variant="outline"
          className="w-full"
          data-testid="button-deploy-preview"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Deploy to Staging
        </Button>

        {previewUrl && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Preview URL:</span>
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 text-sm underline mt-1 block"
            >
              {previewUrl}
            </a>
          </div>
        )}

        <Button
          onClick={handleProductionDeploy}
          disabled={isDeploying}
          className="w-full bg-green-600 hover:bg-green-700"
          data-testid="button-deploy-production"
        >
          <Rocket className="w-4 h-4 mr-2" />
          {isDeploying ? 'Deploying...' : 'Deploy to Production'}
        </Button>
      </div>

      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-1">Deployment Workflow:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Creates feature branch with changes</li>
          <li>Commits visual edits</li>
          <li>Pushes to remote (staging/production)</li>
          <li>Generates preview URL or creates PR</li>
        </ol>
      </div>
    </div>
  );
}
