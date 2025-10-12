import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Eye, Wand2, Shield, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * ESA Agent #76: Admin Superpowers
 * Natural language commands + safe preview sandbox
 */

interface AdminSuperpowersProps {
  userRole: 'super_admin' | 'admin' | 'user';
}

export function AdminSuperpowers({ userRole }: AdminSuperpowersProps) {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const isSuperAdmin = userRole === 'super_admin';

  const executeMutation = useMutation({
    mutationFn: async (cmd: string) => {
      return await apiRequest('/api/admin/execute-command', {
        method: 'POST',
        body: JSON.stringify({ command: cmd, preview: previewMode }),
      });
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: previewMode ? "Preview Generated" : "Command Executed",
        description: data.message || "Success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Command Failed",
        description: error.message || "Could not execute command",
        variant: "destructive",
      });
    },
  });

  const handleExecute = () => {
    if (!command.trim()) {
      toast({
        title: "No Command",
        description: "Enter a command to execute",
        variant: "destructive",
      });
      return;
    }

    executeMutation.mutate(command);
  };

  const EXAMPLE_COMMANDS = [
    {
      category: 'Content',
      commands: [
        'Add a new hero section with blue gradient background',
        'Change all buttons to rounded corners',
        'Update footer text to include copyright 2025',
      ],
    },
    {
      category: 'Users',
      commands: [
        'Make user@example.com an admin',
        'Send welcome email to all new users from last week',
        'Export user list as CSV',
      ],
    },
    {
      category: 'Data',
      commands: [
        'Show all events happening this weekend',
        'Delete spam posts from last 24 hours',
        'Archive old conversations older than 90 days',
      ],
    },
  ];

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Super Admin Access Required
          </CardTitle>
          <CardDescription>
            Admin Superpowers are only available to Super Admins
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-superpowers">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Admin Superpowers
          </CardTitle>
          <CardDescription>
            Control your platform with natural language commands
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Command Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type a command in plain English..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                className="pl-10"
                data-testid="input-admin-command"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className={previewMode ? 'bg-blue-500/10 border-blue-500' : ''}
              data-testid="button-toggle-preview"
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Preview ON' : 'Preview OFF'}
            </Button>

            <Button
              onClick={handleExecute}
              disabled={executeMutation.isPending}
              data-testid="button-execute-command"
            >
              {executeMutation.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </div>

          {/* Preview Mode Info */}
          {previewMode && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>Preview Mode Active:</strong> Commands will be simulated safely without affecting production data
              </p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm">Result:</h4>
                {result.preview && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                    Preview
                  </span>
                )}
              </div>
              <pre className="text-sm overflow-auto max-h-64" data-testid="command-result">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>

              {result.preview && result.changes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Changes that would be made:</p>
                  <ul className="text-xs space-y-1">
                    {result.changes.map((change: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.preview && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setPreviewMode(false);
                    setTimeout(() => handleExecute(), 100);
                  }}
                  className="mt-3"
                  data-testid="button-confirm-execute"
                >
                  Looks Good - Execute for Real
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Example Commands</CardTitle>
          <CardDescription>
            Click any example to try it out
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {EXAMPLE_COMMANDS.map((category) => (
            <div key={category.category}>
              <h4 className="text-sm font-semibold mb-2">{category.category}</h4>
              <div className="space-y-1">
                {category.commands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => setCommand(cmd)}
                    className="block w-full text-left text-sm px-3 py-2 rounded hover:bg-muted transition-colors"
                    data-testid={`example-command-${category.category}-${i}`}
                  >
                    <code className="text-xs">{cmd}</code>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Command Parser Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-semibold min-w-20">Step 1:</span>
            <span>AI parses your natural language command</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold min-w-20">Step 2:</span>
            <span>Generates safe, validated operations</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold min-w-20">Step 3:</span>
            <span>Preview mode shows changes before applying</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold min-w-20">Step 4:</span>
            <span>Executes with full audit logging</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
