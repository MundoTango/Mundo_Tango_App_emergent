/**
 * DEPLOYMENT TYPE SELECTOR
 * Agent #127 - Deployment Safety Engineer
 * Choose deployment type with cost estimates
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Globe, Server, Zap } from 'lucide-react';

type DeploymentType = 'static' | 'autoscale' | 'vm';

interface DeploymentOption {
  type: DeploymentType;
  name: string;
  description: string;
  cost: string;
  icon: React.ReactNode;
  features: string[];
  recommended: boolean;
}

const deploymentOptions: DeploymentOption[] = [
  {
    type: 'static',
    name: 'Static Site',
    description: 'Best for HTML/CSS/JS sites and React SPAs',
    cost: '$3/month',
    icon: <Globe className="w-6 h-6" />,
    features: [
      'Ultra-fast CDN',
      'Automatic SSL',
      'Zero server config',
      'Perfect for SPAs'
    ],
    recommended: true
  },
  {
    type: 'autoscale',
    name: 'Autoscale',
    description: 'Best for APIs with variable traffic',
    cost: '$10/month',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Scales to zero',
      'Pay per request',
      'Automatic scaling',
      'Cold start < 1s'
    ],
    recommended: false
  },
  {
    type: 'vm',
    name: 'Reserved VM',
    description: 'Best for apps needing dedicated resources',
    cost: '$25/month',
    icon: <Server className="w-6 h-6" />,
    features: [
      'Always running',
      'Dedicated CPU/RAM',
      'WebSocket support',
      'Persistent state'
    ],
    recommended: false
  }
];

interface DeploymentTypeSelectorProps {
  onSelect: (type: DeploymentType) => void;
  suggestedType?: DeploymentType;
}

export function DeploymentTypeSelector({ onSelect, suggestedType }: DeploymentTypeSelectorProps) {
  const [selected, setSelected] = useState<DeploymentType | null>(suggestedType || null);

  const handleSelect = (type: DeploymentType) => {
    setSelected(type);
    onSelect(type);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Deployment Type</h3>
        {suggestedType && (
          <p className="text-sm text-gray-500">
            💡 Recommended: <span className="font-medium">{deploymentOptions.find(o => o.type === suggestedType)?.name}</span> based on your project structure
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {deploymentOptions.map((option) => (
          <Card
            key={option.type}
            className={`cursor-pointer transition-all ${
              selected === option.type
                ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                : 'hover:border-cyan-300'
            }`}
            onClick={() => handleSelect(option.type)}
            data-testid={`deploy-type-${option.type}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-cyan-600">{option.icon}</div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {option.name}
                      {option.type === suggestedType && (
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-600">{option.cost}</div>
                  {selected === option.type && (
                    <CheckCircle className="w-5 h-5 text-cyan-600 mt-1" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {option.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <div className="flex justify-end">
          <Button
            onClick={() => onSelect(selected)}
            className="bg-cyan-500 hover:bg-cyan-600"
            data-testid="button-confirm-deploy-type"
          >
            Continue with {deploymentOptions.find(o => o.type === selected)?.name}
          </Button>
        </div>
      )}
    </div>
  );
}
