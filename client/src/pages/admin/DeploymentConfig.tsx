import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rocket, Server, Database, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface DeploymentStatus {
  ready: boolean;
  healthScore: number;
  issues: string[];
  gates: {
    name: string;
    passed: boolean;
    details: string;
  }[];
}

export default function DeploymentConfig() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [config, setConfig] = useState({
    environment: 'production',
    domain: '',
    databaseUrl: '',
    apiKeys: '',
    features: '',
  });

  // Check deployment readiness
  const { data: status, refetch } = useMutation<DeploymentStatus>({
    mutationFn: async () => {
      return await apiRequest('/api/deployment/status', {
        method: 'GET'
      });
    }
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async (deployConfig: typeof config) => {
      return await apiRequest('/api/deployment/deploy', {
        method: 'POST',
        body: JSON.stringify(deployConfig)
      });
    },
    onSuccess: () => {
      toast({
        title: "Deployment Initiated",
        description: "Platform is being deployed to production",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const mockStatus: DeploymentStatus = {
    ready: false,
    healthScore: 40,
    issues: [
      '1,397 missing translation keys',
      '2,576 dark mode issues',
      '1,892 accessibility violations'
    ],
    gates: [
      { name: 'TypeScript', passed: true, details: 'Zero type errors' },
      { name: 'ESLint', passed: true, details: 'All rules passing' },
      { name: 'Tests', passed: true, details: '100% pass rate' },
      { name: 'Health Score', passed: false, details: '40% (target: 90%)' },
      { name: 'Security', passed: true, details: 'Zero vulnerabilities' }
    ]
  };

  const currentStatus = status?.data || mockStatus;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <MetaTags
        title="Deployment Configuration"
        description="Configure and manage production deployment settings for the platform"
        keywords="deployment, production, configuration, devops"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">
            Deployment Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure and manage production deployment
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          data-testid="button-check-status"
        >
          Check Status
        </Button>
      </div>

      {/* Deployment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Deployment Readiness
          </CardTitle>
          <CardDescription>
            Current platform health and quality gate status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Score */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Health Score
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white" data-testid="text-health-score">
                {currentStatus.healthScore}%
              </p>
            </div>
            <Badge variant={currentStatus.ready ? "default" : "destructive"} className="text-lg px-4 py-2">
              {currentStatus.ready ? "Ready" : "Not Ready"}
            </Badge>
          </div>

          {/* Quality Gates */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">
              Quality Gates
            </p>
            {currentStatus.gates.map((gate, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg"
                data-testid={`gate-${gate.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-3">
                  {gate.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white dark:text-white">
                      {gate.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {gate.details}
                    </p>
                  </div>
                </div>
                <Badge variant={gate.passed ? "default" : "destructive"}>
                  {gate.passed ? "PASS" : "FAIL"}
                </Badge>
              </div>
            ))}
          </div>

          {/* Issues */}
          {currentStatus.issues.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Blocking Issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  {currentStatus.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Deployment Settings
          </CardTitle>
          <CardDescription>
            Configure production environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Production Domain</Label>
            <Input
              id="domain"
              data-testid="input-domain"
              value={config.domain}
              onChange={(e) => setConfig({ ...config, domain: e.target.value })}
              placeholder="app.mundotango.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="database">Database URL</Label>
            <Input
              id="database"
              data-testid="input-database"
              type="password"
              value={config.databaseUrl}
              onChange={(e) => setConfig({ ...config, databaseUrl: e.target.value })}
              placeholder="postgresql://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-keys">API Keys (JSON)</Label>
            <Textarea
              id="api-keys"
              data-testid="input-api-keys"
              value={config.apiKeys}
              onChange={(e) => setConfig({ ...config, apiKeys: e.target.value })}
              placeholder='{"OPENAI_API_KEY": "...", "STRIPE_KEY": "..."}'
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Feature Flags</Label>
            <Textarea
              id="features"
              data-testid="input-features"
              value={config.features}
              onChange={(e) => setConfig({ ...config, features: e.target.value })}
              placeholder='{"mrBlue": true, "multiTenant": true}'
              rows={3}
            />
          </div>

          <Button
            onClick={() => deployMutation.mutate(config)}
            disabled={!currentStatus.ready || deployMutation.isPending}
            className="w-full"
            data-testid="button-deploy"
          >
            {deployMutation.isPending ? (
              "Deploying..."
            ) : currentStatus.ready ? (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Deploy to Production
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Fix Issues First
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
