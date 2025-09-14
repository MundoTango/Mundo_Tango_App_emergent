import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from './useAuth';

// ESA LIFE CEO 61x21 - Phase 18: Subscription Hook

export interface SubscriptionData {
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive';
  features: string[];
  limits: {
    agents: number;
    storage: number;
    apiCalls: number;
    projects: number;
    teamMembers?: number;
  };
  subscription?: {
    id: number;
    userId: number;
    planId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    paymentProvider: string;
    providerSubscriptionId: string;
    metadata: any;
  };
}

/**
 * Hook to manage user subscription state and operations
 */
export function useSubscription() {
  const { user, isAuthenticated } = useAuth();

  // Fetch current subscription
  const {
    data: subscription,
    isLoading,
    error,
    refetch
  } = useQuery<SubscriptionData>({
    queryKey: ['/api/payments/subscription'],
    enabled: !!user && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Check if user has access to a specific feature
  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    return subscription.features.includes(feature);
  };

  // Check if user has reached a limit
  const isWithinLimit = (limitType: keyof SubscriptionData['limits'], currentUsage: number): boolean => {
    if (!subscription) return false;
    const limit = subscription.limits[limitType];
    if (limit === -1) return true; // Unlimited
    return currentUsage < limit;
  };

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: async (tier: string) => {
      return apiRequest('/api/payments/create-subscription', {
        method: 'POST',
        body: JSON.stringify({ tier, billingCycle: 'monthly' })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/subscription'] });
    }
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/payments/cancel-subscription', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/subscription'] });
    }
  });

  // Resume subscription mutation
  const resumeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/payments/resume-subscription', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/subscription'] });
    }
  });

  // Check feature availability
  const checkFeatureAccess = async (featureName: string): Promise<{
    hasAccess: boolean;
    tier: string;
    requiresTier?: string;
  }> => {
    try {
      const response = await apiRequest(`/api/payments/check-feature?feature=${featureName}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return { hasAccess: false, tier: 'free' };
    }
  };

  // Helper functions for common checks
  const isPro = subscription?.tier === 'pro';
  const isBusiness = subscription?.tier === 'business';
  const isEnterprise = subscription?.tier === 'enterprise';
  const isPaid = isPro || isBusiness || isEnterprise;
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isCanceled = subscription?.status === 'canceled';
  const willCancelAtPeriodEnd = subscription?.subscription?.cancelAtPeriodEnd === true;

  // Get days remaining in trial
  const getTrialDaysRemaining = (): number | null => {
    if (subscription?.status !== 'trialing') return null;
    if (!subscription?.subscription?.currentPeriodEnd) return null;
    
    const endDate = new Date(subscription.subscription.currentPeriodEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Get next billing date
  const getNextBillingDate = (): Date | null => {
    if (!subscription?.subscription?.currentPeriodEnd) return null;
    return new Date(subscription.subscription.currentPeriodEnd);
  };

  // Format price for display
  const formatPrice = (tier: string): string => {
    switch (tier) {
      case 'pro':
        return '$9.99/mo';
      case 'business':
        return '$29.99/mo';
      case 'enterprise':
        return 'Custom';
      default:
        return 'Free';
    }
  };

  return {
    // Subscription data
    subscription,
    isLoading,
    error,
    refetch,

    // Tier checks
    tier: subscription?.tier || 'free',
    isPro,
    isBusiness,
    isEnterprise,
    isPaid,
    isActive,
    isCanceled,
    willCancelAtPeriodEnd,

    // Feature checks
    hasFeature,
    isWithinLimit,
    checkFeatureAccess,

    // Subscription info
    getTrialDaysRemaining,
    getNextBillingDate,
    formatPrice,

    // Mutations
    upgrade: upgradeMutation.mutate,
    cancel: cancelMutation.mutate,
    resume: resumeMutation.mutate,
    isUpgrading: upgradeMutation.isPending,
    isCanceling: cancelMutation.isPending,
    isResuming: resumeMutation.isPending,

    // Limits
    limits: subscription?.limits || {
      agents: 3,
      storage: 1024,
      apiCalls: 100,
      projects: 5
    },

    // Features
    features: subscription?.features || []
  };
}

// Export subscription tiers for reference
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic access to platform',
      '3 AI agents per month',
      '1GB storage',
      'Community support',
      'Basic analytics'
    ]
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    features: [
      'Everything in Free',
      'Unlimited AI agents',
      '10GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom workflows',
      'API access'
    ]
  },
  business: {
    name: 'Business',
    price: 29.99,
    features: [
      'Everything in Pro',
      'Team collaboration',
      '100GB storage',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'Audit logs',
      'White-label options'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    features: [
      'Everything in Business',
      'Unlimited everything',
      'Custom AI models',
      'SLA guarantee',
      'Dedicated account manager',
      'On-premise deployment',
      'Custom features',
      'Priority feature requests'
    ]
  }
};