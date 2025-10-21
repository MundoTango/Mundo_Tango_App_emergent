import { CreditCard, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionsTab() {
  const { toast } = useToast();

  // REAL API: Fetch subscription status and usage
  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['/api/subscriptions/status']
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['/api/subscriptions/usage']
  });

  // REAL API: Create Stripe checkout session
  const upgradeMutation = useMutation({
    mutationFn: async (tier: string) => {
      const response = await apiRequest('/api/subscriptions/create-checkout', {
        method: 'POST',
        body: { tier }
      });
      return response;
    },
    onSuccess: (data: any) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Upgrade failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const currentTier = subscription?.tier || 'free';
  const isLoading = subLoading || usageLoading;
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10 p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Subscription Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your Mundo Tango subscription and billing
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription className="mt-2">Active Subscription</CardDescription>
              </div>
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">Free Tier</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Basic platform access</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Events</span>
                  <span className="font-medium text-gray-900 dark:text-white">10/month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Storage</span>
                  <span className="font-medium text-gray-900 dark:text-white">1GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">AI Credits</span>
                  <span className="font-medium text-gray-900 dark:text-white">100/month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Pro Plan
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardTitle>
                <CardDescription className="mt-2">Unlock premium features</CardDescription>
              </div>
              <Badge variant="outline" className="border-purple-400 text-purple-600 dark:text-purple-400">Upgrade</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">$9.99<span className="text-lg text-gray-600 dark:text-gray-400">/mo</span></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Full platform access</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Events</span>
                  <span className="font-medium text-gray-900 dark:text-white">Unlimited</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Storage</span>
                  <span className="font-medium text-gray-900 dark:text-white">100GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">AI Credits</span>
                  <span className="font-medium text-gray-900 dark:text-white">10,000/month</span>
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                onClick={() => upgradeMutation.mutate('basic')}
                disabled={upgradeMutation.isPending || currentTier !== 'free'}
                data-testid="button-upgrade-pro"
              >
                {upgradeMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : currentTier !== 'free' ? (
                  'Current Plan'
                ) : (
                  'Upgrade to Pro'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-cyan-200 dark:border-cyan-800">
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
          <CardDescription>Your payment history and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No billing history yet</p>
            <p className="text-sm mt-1">Upgrade to Pro to see your invoices here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
