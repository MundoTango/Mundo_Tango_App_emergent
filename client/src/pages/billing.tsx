import { useState } from 'react';
import { useNavigate } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

// ESA LIFE CEO 61x21 - Phase 18: Billing Dashboard

export default function BillingDashboard() {
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch subscription data
  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['/api/payments/subscription'],
    enabled: !!user
  });

  // Fetch payment history
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/payments/history'],
    enabled: !!user
  });

  // Fetch payment methods
  const { data: paymentMethods, isLoading: methodsLoading } = useQuery({
    queryKey: ['/api/payments/methods'],
    enabled: !!user
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/payments/cancel-subscription', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription will remain active until the end of the billing period',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription',
        variant: 'destructive'
      });
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
      toast({
        title: 'Subscription Resumed',
        description: 'Your subscription has been reactivated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resume subscription',
        variant: 'destructive'
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  if (subLoading || paymentsLoading || methodsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#5EEAD4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5EEAD4]/10 to-[#155E75]/10">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2 dark:text-neutral-400">Manage your subscription and payment methods</p>
        </div>

        {/* Subscription Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </div>
              {subscription?.subscription && (
                <div className="text-right">
                  {getStatusBadge(subscription.subscription.status)}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Plan</p>
                <p className="text-2xl font-bold capitalize">{subscription?.tier || 'Free'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Next Billing Date</p>
                <p className="text-lg">
                  {subscription?.subscription?.currentPeriodEnd 
                    ? format(new Date(subscription.subscription.currentPeriodEnd), 'MMM dd, yyyy')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Monthly Cost</p>
                <p className="text-2xl font-bold">
                  {subscription?.tier === 'free' ? '$0' : 
                   subscription?.tier === 'pro' ? '$9.99' :
                   subscription?.tier === 'business' ? '$29.99' : 'Custom'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              {subscription?.tier === 'free' ? (
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-[#5EEAD4] hover:bg-[#5EEAD4]/90"
                  data-testid="button-upgrade-plan"
                >
                  Upgrade Plan
                </Button>
              ) : subscription?.subscription?.status === 'canceled' ? (
                <Button 
                  onClick={() => resumeMutation.mutate()}
                  disabled={resumeMutation.isPending}
                  data-testid="button-resume-subscription"
                >
                  Resume Subscription
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/pricing')}
                    data-testid="button-change-plan"
                  >
                    Change Plan
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel your subscription?')) {
                        cancelMutation.mutate();
                      }
                    }}
                    disabled={cancelMutation.isPending}
                    data-testid="button-cancel-subscription"
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
            </div>

            {subscription?.subscription?.cancelAtPeriodEnd && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your subscription will end on {format(new Date(subscription.subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {subscription?.features?.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Usage Limits */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>AI Agents</span>
                        <span>{subscription?.limits?.agents === -1 ? 'Unlimited' : `${subscription?.limits?.agents || 0} per month`}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#5EEAD4] h-2 rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage</span>
                        <span>{subscription?.limits?.storage === -1 ? 'Unlimited' : `${subscription?.limits?.storage || 0} MB`}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#5EEAD4] h-2 rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>API Calls</span>
                        <span>{subscription?.limits?.apiCalls === -1 ? 'Unlimited' : `${subscription?.limits?.apiCalls || 0} per month`}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#5EEAD4] h-2 rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-gray-500">
                            No payment history
                          </td>
                        </tr>
                      ) : (
                        payments?.map((payment: any) => (
                          <tr key={payment.id} className="border-b">
                            <td className="p-2">
                              {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                            </td>
                            <td className="p-2">{payment.description || 'Subscription payment'}</td>
                            <td className="p-2">{formatCurrency(payment.amount)}</td>
                            <td className="p-2">
                              {payment.status === 'succeeded' ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Paid
                                </Badge>
                              ) : payment.status === 'failed' ? (
                                <Badge className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Failed
                                </Badge>
                              ) : (
                                <Badge>{payment.status}</Badge>
                              )}
                            </td>
                            <td className="p-2">
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods</CardDescription>
                  </div>
                  <Button 
                    onClick={() => navigate('/billing/add-payment-method')}
                    data-testid="button-add-payment-method"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods?.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No payment methods on file</p>
                      <Button 
                        className="mt-4"
                        onClick={() => navigate('/billing/add-payment-method')}
                      >
                        Add Payment Method
                      </Button>
                    </div>
                  ) : (
                    paymentMethods?.map((method: any) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-semibold">
                              {method.brand} •••• {method.lastFour}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-neutral-400">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                          {method.isDefault && (
                            <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Download your invoices for accounting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {payments?.filter((p: any) => p.status === 'succeeded').map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:bg-neutral-800">
                      <div>
                        <p className="font-semibold">
                          Invoice #{payment.id.toString().slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-neutral-400">
                          {format(new Date(payment.createdAt), 'MMMM dd, yyyy')} • {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-download-invoice-${payment.id}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  ))}
                  {(!payments || payments.filter((p: any) => p.status === 'succeeded').length === 0) && (
                    <div className="text-center p-8 text-gray-500">
                      No invoices available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security Notice */}
        <Card className="mt-6">
          <CardContent className="flex items-center gap-4 p-6">
            <Shield className="h-8 w-8 text-[#5EEAD4]" />
            <div>
              <p className="font-semibold">Your payment information is secure</p>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                We use industry-standard encryption and never store your card details on our servers.
                All payments are processed securely through Stripe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}