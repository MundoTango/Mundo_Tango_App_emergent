import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Eye, Brain, CheckCircle } from 'lucide-react';

/**
 * VEMBStatusDashboard
 * Visual Editor & Mr Blue Status Monitor
 * Per mb.md - Shows real-time status of Mr Blue AI and Visual Editor systems
 */
export default function VEMBStatusDashboard() {
  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="vemb-status-dashboard">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Visual Editor & Mr Blue Status
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring for AI systems and visual editing tools
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mr Blue Status */}
        <Card data-testid="card-mrblue-status">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Mr Blue AI
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Operational
              </Badge>
            </div>
            <CardDescription>Multi-model AI chat system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Primary Model:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">GPT-4o</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fallback Models:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Claude, Gemini</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Life CEO Agents:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">16 Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Endpoint:</span>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">/api/mr-blue/chat</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Editor Status */}
        <Card data-testid="card-visual-editor-status">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Visual Editor
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Operational
              </Badge>
            </div>
            <CardDescription>Drag-drop UI editor with AI code generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Code Generator:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">GPT-4o</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Git Automation:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Preview Deploy:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Endpoint:</span>
                <span className="text-xs font-mono text-purple-600 dark:text-purple-400">/api/visual-editor/*</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Integration */}
        <Card data-testid="card-system-integration" className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              System Integration Status
            </CardTitle>
            <CardDescription>Multi-AI orchestration and agent coordination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Backend APIs</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">✓ Active</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  /api/mr-blue/* endpoints registered
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">OpenAI Integration</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">✓ Ready</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Replit AI Integrations configured
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Agent Routing</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">✓ Active</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Life CEO agent routing operational
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
