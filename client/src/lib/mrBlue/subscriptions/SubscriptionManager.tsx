import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

/**
 * ESA Agent #75: Subscription Manager
 * 4-tier subscription system with Stripe integration
 */

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  icon: any;
  popular?: boolean;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Community',
    price: 0,
    interval: 'month',
    icon: Sparkles,
    features: [
      'Join communities',
      'Attend public events',
      'Basic profile',
      'Message other members',
      'View recommendations',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Traveler',
    price: 9.99,
    interval: 'month',
    icon: Zap,
    popular: true,
    features: [
      'Everything in Community',
      'Trip planner with AI',
      'Priority event registration',
      'Verified badge',
      'Advanced search filters',
      'Save unlimited favorites',
    ],
  },
  {
    id: 'host',
    name: 'Host & Teacher',
    price: 19.99,
    interval: 'month',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Create unlimited events',
      'List private lessons',
      'Event analytics dashboard',
      'Email marketing tools',
      'Custom branding',
      '5% platform fee (vs 10%)',
    ],
  },
  {
    id: 'enterprise',
    name: 'Dance Studio',
    price: 49.99,
    interval: 'month',
    icon: Crown,
    features: [
      'Everything in Host',
      'Multi-user accounts',
      'White-label option',
      'API access',
      'Dedicated support',
      'Custom integrations',
      '0% platform fee',
    ],
  },
];

interface SubscriptionManagerProps {
  currentTier?: string;
  onUpgrade?: (tier: string) => void;
}

export function SubscriptionManager({ currentTier = 'free', onUpgrade }: SubscriptionManagerProps) {
  const { toast } = useToast();
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('month');

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscriptions/current'],
  });

  const upgradeMutation = useMutation({
    mutationFn: async (tierId: string) => {
      return await apiRequest(`/api/subscriptions/create-checkout`, {
        method: 'POST',
        body: JSON.stringify({ tierId, interval: selectedInterval }),
      });
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: () => {
      toast({
        title: "Upgrade Failed",
        description: "Could not start checkout process",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (tierId: string) => {
    if (tierId === 'free') {
      toast({
        title: "Already Free",
        description: "You're on the free community tier",
      });
      return;
    }

    upgradeMutation.mutate(tierId);
    onUpgrade?.(tierId);
  };

  return (
    <div className="space-y-8" data-testid="subscription-manager">
      {/* Billing Interval Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={selectedInterval === 'month' ? 'default' : 'outline'}
          onClick={() => setSelectedInterval('month')}
          data-testid="button-monthly"
        >
          Monthly
        </Button>
        <Button
          variant={selectedInterval === 'year' ? 'default' : 'outline'}
          onClick={() => setSelectedInterval('year')}
          data-testid="button-yearly"
        >
          Yearly
          <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
            Save 20%
          </span>
        </Button>
      </div>

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const Icon = tier.icon;
          const price = selectedInterval === 'year' ? tier.price * 12 * 0.8 : tier.price;
          const isCurrentTier = currentTier === tier.id;

          return (
            <Card
              key={tier.id}
              className={`relative ${tier.popular ? 'border-blue-500 shadow-lg' : ''}`}
              data-testid={`tier-card-${tier.id}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className={`h-8 w-8 ${tier.popular ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  {isCurrentTier && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    /{selectedInterval}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isCurrentTier || upgradeMutation.isPending}
                  data-testid={`button-upgrade-${tier.id}`}
                >
                  {isCurrentTier ? 'Current Plan' : tier.price === 0 ? 'Current' : 'Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Feature Flags Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          💡 All features are controlled by your subscription tier. Upgrade anytime to unlock more capabilities!
        </p>
      </div>
    </div>
  );
}

// Feature flag checker
export function useFeatureAccess() {
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscriptions/current'],
  });

  const hasFeature = (feature: string): boolean => {
    const tier = subscription?.tier || 'free';
    
    const tierLevels: Record<string, number> = {
      free: 0,
      pro: 1,
      host: 2,
      enterprise: 3,
    };

    const featureRequirements: Record<string, number> = {
      'trip-planner-ai': 1,
      'create-events': 2,
      'teach-lessons': 2,
      'api-access': 3,
      'white-label': 3,
    };

    const required = featureRequirements[feature] || 0;
    const current = tierLevels[tier] || 0;

    return current >= required;
  };

  return { hasFeature, tier: subscription?.tier || 'free' };
}
