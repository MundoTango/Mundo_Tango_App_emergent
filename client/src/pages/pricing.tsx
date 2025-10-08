import { useState } from 'react';
import { useNavigate } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Sparkles, Building2, Crown, ArrowRight, X } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// ESA LIFE CEO 61x21 - Phase 18: Pricing Page

export default function PricingPage() {
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Fetch subscription tiers
  const { data: tiersData, isLoading } = useQuery({
    queryKey: ['/api/payments/subscription-tiers'],
    enabled: true
  });

  // Get current subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ['/api/payments/subscription'],
    enabled: !!user
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async ({ tier }: { tier: string }) => {
      return apiRequest('/api/payments/create-subscription', {
        method: 'POST',
        body: { tier, billingCycle }
      });
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        // Navigate to checkout with client secret
        navigate(`/checkout?tier=${data.tier}&secret=${data.clientSecret}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start subscription',
        variant: 'destructive'
      });
    }
  });

  const handleSubscribe = (tierId: string) => {
    if (!user) {
      navigate('/auth/login?redirect=/pricing');
      return;
    }

    if (tierId === 'enterprise') {
      // Contact sales for enterprise
      window.location.href = 'mailto:sales@mundotango.life?subject=Enterprise Plan Inquiry';
      return;
    }

    subscribeMutation.mutate({ tier: tierId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5EEAD4]/10 to-[#155E75]/10 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-96 bg-gray-200 rounded mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tiers = tiersData?.tiers || {};
  const annualDiscount = 0.20; // 20% off annual

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5EEAD4]/10 to-[#155E75]/10">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Unlock the full potential of ESA LIFE CEO 61x21
            </p>
            
            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <Label htmlFor="billing-toggle" className={billingCycle === 'monthly' ? 'font-semibold' : ''}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={billingCycle === 'annual'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annual' : 'monthly')}
                data-testid="switch-billing-cycle"
              />
              <Label htmlFor="billing-toggle" className={billingCycle === 'annual' ? 'font-semibold' : ''}>
                Annual
                <Badge className="ml-2 bg-green-100 text-green-800">Save 20%</Badge>
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Free Tier */}
          <Card className="relative border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Free
              </CardTitle>
              <CardDescription>Get started with basic features</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tiers.free?.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentSubscription?.tier === 'free' ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleSubscribe('free')}
                  data-testid="button-subscribe-free"
                >
                  Get Started
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Pro Tier */}
          <Card className="relative border-[#5EEAD4] shadow-lg scale-105">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5EEAD4] text-white">
              Most Popular
            </Badge>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#5EEAD4]" />
                Pro
              </CardTitle>
              <CardDescription>Perfect for professionals</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${billingCycle === 'annual' 
                    ? Math.round(9.99 * (1 - annualDiscount) * 100) / 100
                    : 9.99}
                </span>
                <span className="text-gray-500">/month</span>
                {billingCycle === 'annual' && (
                  <div className="text-sm text-green-600 mt-1">
                    Save ${(9.99 * 12 * annualDiscount).toFixed(2)}/year
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tiers.pro?.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentSubscription?.tier === 'pro' ? (
                <Button className="w-full bg-[#5EEAD4] hover:bg-[#5EEAD4]/90" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="w-full bg-[#5EEAD4] hover:bg-[#5EEAD4]/90 text-white"
                  onClick={() => handleSubscribe('pro')}
                  disabled={subscribeMutation.isPending}
                  data-testid="button-subscribe-pro"
                >
                  {subscribeMutation.isPending ? 'Processing...' : 'Subscribe Now'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Business Tier */}
          <Card className="relative border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Business
              </CardTitle>
              <CardDescription>For teams and organizations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${billingCycle === 'annual' 
                    ? Math.round(29.99 * (1 - annualDiscount) * 100) / 100
                    : 29.99}
                </span>
                <span className="text-gray-500">/month</span>
                {billingCycle === 'annual' && (
                  <div className="text-sm text-green-600 mt-1">
                    Save ${(29.99 * 12 * annualDiscount).toFixed(2)}/year
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tiers.business?.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentSubscription?.tier === 'business' ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleSubscribe('business')}
                  disabled={subscribeMutation.isPending}
                  data-testid="button-subscribe-business"
                >
                  {subscribeMutation.isPending ? 'Processing...' : 'Subscribe Now'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Enterprise Tier */}
          <Card className="relative border-gray-900 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Enterprise
              </CardTitle>
              <CardDescription>Custom solutions at scale</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
                <span className="text-gray-500 block text-sm mt-1">Contact sales</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tiers.enterprise?.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => handleSubscribe('enterprise')}
                data-testid="button-contact-sales"
              >
                Contact Sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Compare Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Feature</th>
                  <th className="text-center p-4">Free</th>
                  <th className="text-center p-4 bg-[#5EEAD4]/10">Pro</th>
                  <th className="text-center p-4">Business</th>
                  <th className="text-center p-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">AI Agents</td>
                  <td className="text-center p-4">3/month</td>
                  <td className="text-center p-4 bg-[#5EEAD4]/10">Unlimited</td>
                  <td className="text-center p-4">Unlimited</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Storage</td>
                  <td className="text-center p-4">1GB</td>
                  <td className="text-center p-4 bg-[#5EEAD4]/10">10GB</td>
                  <td className="text-center p-4">100GB</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">API Calls</td>
                  <td className="text-center p-4">100/month</td>
                  <td className="text-center p-4 bg-[#5EEAD4]/10">10,000/month</td>
                  <td className="text-center p-4">100,000/month</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Support</td>
                  <td className="text-center p-4">Community</td>
                  <td className="text-center p-4 bg-[#5EEAD4]/10">Priority</td>
                  <td className="text-center p-4">Dedicated</td>
                  <td className="text-center p-4">24/7 + SLA</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Team Members</td>
                  <td className="text-center p-4">-</td>
                  <td className="text-center p-4 bg-[#5EEAD4]/10">-</td>
                  <td className="text-center p-4">10</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Yes, all paid plans come with a 14-day free trial. No credit card required to start.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  We accept all major credit cards, debit cards, and support multiple currencies (USD, EUR, GBP).
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}