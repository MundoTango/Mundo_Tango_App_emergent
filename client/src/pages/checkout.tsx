import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

// ESA LIFE CEO 61x21 - Phase 18: Checkout Flow

// Initialize Stripe (will be loaded with public key from env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

// Checkout form component
function CheckoutForm({ tier, clientSecret }: { tier: string; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingDetails, setBillingDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            address: billingDetails.address
          }
        }
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Payment successful
        toast({
          title: 'Success!',
          description: 'Your subscription has been activated',
        });
        
        // Redirect to success page or dashboard
        navigate('/billing?success=true');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  // Get tier pricing
  const getTierPrice = () => {
    switch (tier) {
      case 'pro':
        return '$9.99/month';
      case 'business':
        return '$29.99/month';
      default:
        return 'Custom pricing';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold capitalize">{tier} Plan</p>
              <p className="text-sm text-gray-600">Billed monthly</p>
            </div>
            <p className="text-2xl font-bold">{getTierPrice()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={billingDetails.name}
                onChange={(e) => setBillingDetails({
                  ...billingDetails,
                  name: e.target.value
                })}
                required
                data-testid="input-billing-name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={billingDetails.email}
                onChange={(e) => setBillingDetails({
                  ...billingDetails,
                  email: e.target.value
                })}
                required
                data-testid="input-billing-email"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main St"
              value={billingDetails.address.line1}
              onChange={(e) => setBillingDetails({
                ...billingDetails,
                address: { ...billingDetails.address, line1: e.target.value }
              })}
              required
              data-testid="input-billing-address"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value={billingDetails.address.city}
                onChange={(e) => setBillingDetails({
                  ...billingDetails,
                  address: { ...billingDetails.address, city: e.target.value }
                })}
                required
                data-testid="input-billing-city"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                value={billingDetails.address.state}
                onChange={(e) => setBillingDetails({
                  ...billingDetails,
                  address: { ...billingDetails.address, state: e.target.value }
                })}
                required
                data-testid="input-billing-state"
              />
            </div>
            <div>
              <Label htmlFor="postal">ZIP Code</Label>
              <Input
                id="postal"
                type="text"
                value={billingDetails.address.postal_code}
                onChange={(e) => setBillingDetails({
                  ...billingDetails,
                  address: { ...billingDetails.address, postal_code: e.target.value }
                })}
                required
                data-testid="input-billing-zip"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 border rounded-md">
            <CardElement options={cardElementOptions} />
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-lg bg-[#5EEAD4] hover:bg-[#5EEAD4]/90"
        disabled={!stripe || isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Complete Payment
          </>
        )}
      </Button>

      {/* Terms */}
      <p className="text-xs text-center text-gray-500">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
        You can cancel your subscription at any time.
      </p>
    </form>
  );
}

// Main checkout page component
export default function CheckoutPage() {
  const searchParams = useSearch();
  const [, navigate] = useNavigate();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse URL params
  const tier = new URLSearchParams(searchParams).get('tier') || 'pro';
  const secret = new URLSearchParams(searchParams).get('secret');

  useEffect(() => {
    if (!user) {
      navigate('/auth/login?redirect=/checkout');
      return;
    }

    if (secret) {
      // Use provided secret from pricing page
      setClientSecret(secret);
      setLoading(false);
    } else {
      // Create new subscription if no secret provided
      createSubscription();
    }
  }, [user, secret]);

  const createSubscription = async () => {
    try {
      const response = await apiRequest('/api/payments/create-subscription', {
        method: 'POST',
        body: JSON.stringify({ tier, billingCycle: 'monthly' })
      });

      if (response.clientSecret) {
        setClientSecret(response.clientSecret);
      } else {
        setError('Failed to initialize payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#5EEAD4]" />
          <p className="mt-4 text-gray-600">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/pricing')}>
              Return to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Payment system is not configured. Please contact support or configure Stripe API keys.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/pricing')}
            >
              Return to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5EEAD4]/10 to-[#155E75]/10">
      <div className="max-w-2xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
          <p className="text-gray-600 mt-2">Secure checkout powered by Stripe</p>
        </div>

        {/* Stripe Elements Provider */}
        <Elements stripe={stripePromise}>
          <CheckoutForm tier={tier} clientSecret={clientSecret} />
        </Elements>
      </div>
    </div>
  );
}