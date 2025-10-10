import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertTriangle,
  Trash2,
  ShieldAlert,
  XCircle,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';

const AccountDelete = () => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [confirmations, setConfirmations] = useState({
    dataLoss: false,
    noRecovery: false,
    activeSubscription: false,
    finalDecision: false,
  });
  const [showFinalDialog, setShowFinalDialog] = useState(false);

  const allConfirmed = 
    confirmations.dataLoss &&
    confirmations.noRecovery &&
    confirmations.activeSubscription &&
    confirmations.finalDecision &&
    confirmText === 'DELETE' &&
    password.length > 0;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/user/delete-account', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted. You will be logged out.',
        variant: 'default',
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Unable to delete account. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    setShowFinalDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setShowFinalDialog(false);
  };

  const consequencesData = [
    {
      icon: XCircle,
      title: 'All Posts Deleted',
      description: 'All your memories, posts, and comments will be permanently removed',
    },
    {
      icon: XCircle,
      title: 'Events Canceled',
      description: 'If you\'re an organizer, your events will be canceled',
    },
    {
      icon: XCircle,
      title: 'Listings Removed',
      description: 'All housing listings and bookings will be canceled',
    },
    {
      icon: XCircle,
      title: 'Groups & Friendships',
      description: 'You\'ll be removed from all groups and friendships',
    },
    {
      icon: XCircle,
      title: 'Data Export Lost',
      description: 'Any saved data or exports will be inaccessible',
    },
    {
      icon: XCircle,
      title: 'Subscription Canceled',
      description: 'Active subscriptions will be canceled (no refunds)',
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="mb-6"
            data-testid="button-back-settings"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>

          {/* Warning Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-red-100 dark:bg-red-950 rounded-full">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-red-600 dark:text-red-400">
              Delete Account
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This action is permanent and cannot be undone
            </p>
          </div>

          {/* Critical Warning */}
          <Alert className="mb-8 border-red-600 bg-red-50 dark:bg-red-950/30">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-900 dark:text-red-300">
              <strong>Warning:</strong> Deleting your account will permanently remove all your data.
              This includes posts, events, bookings, and connections. This action cannot be reversed.
            </AlertDescription>
          </Alert>

          {/* Consequences Grid */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                What will be deleted
              </CardTitle>
              <CardDescription>
                Here's everything that will be permanently removed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consequencesData.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                    >
                      <Icon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Form */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle>Confirm Account Deletion</CardTitle>
              <CardDescription>
                Please confirm all checkboxes and enter the required information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="dataLoss"
                    checked={confirmations.dataLoss}
                    onCheckedChange={(checked) =>
                      setConfirmations({ ...confirmations, dataLoss: !!checked })
                    }
                    data-testid="checkbox-data-loss"
                  />
                  <Label htmlFor="dataLoss" className="text-sm font-normal cursor-pointer">
                    I understand that all my data will be permanently deleted
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="noRecovery"
                    checked={confirmations.noRecovery}
                    onCheckedChange={(checked) =>
                      setConfirmations({ ...confirmations, noRecovery: !!checked })
                    }
                    data-testid="checkbox-no-recovery"
                  />
                  <Label htmlFor="noRecovery" className="text-sm font-normal cursor-pointer">
                    I understand this action cannot be undone or recovered
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="activeSubscription"
                    checked={confirmations.activeSubscription}
                    onCheckedChange={(checked) =>
                      setConfirmations({ ...confirmations, activeSubscription: !!checked })
                    }
                    data-testid="checkbox-subscription"
                  />
                  <Label htmlFor="activeSubscription" className="text-sm font-normal cursor-pointer">
                    I understand my subscription will be canceled with no refund
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="finalDecision"
                    checked={confirmations.finalDecision}
                    onCheckedChange={(checked) =>
                      setConfirmations({ ...confirmations, finalDecision: !!checked })
                    }
                    data-testid="checkbox-final"
                  />
                  <Label htmlFor="finalDecision" className="text-sm font-normal cursor-pointer">
                    This is my final decision and I want to delete my account
                  </Label>
                </div>
              </div>

              {/* Confirmation Text */}
              <div className="space-y-2">
                <Label htmlFor="confirmText">
                  Type <strong>DELETE</strong> to confirm
                </Label>
                <Input
                  id="confirmText"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="font-mono"
                  data-testid="input-confirm-delete"
                />
              </div>

              {/* Password Verification */}
              <div className="space-y-2">
                <Label htmlFor="password">Enter your password to confirm</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your current password"
                  data-testid="input-password"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/settings')}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!allConfirmed || deleteMutation.isPending}
                  className="flex-1"
                  data-testid="button-delete-account"
                >
                  {deleteMutation.isPending ? (
                    <>Deleting...</>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete My Account
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Options */}
          <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Looking for alternatives?
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Deactivate temporarily:</strong> Go to Settings → Privacy to hide your account</p>
                <p>• <strong>Download your data:</strong> Go to Settings → Privacy → Export Data</p>
                <p>• <strong>Pause subscription:</strong> Go to Settings → Billing to cancel subscription only</p>
                <p>• <strong>Contact support:</strong> We're here to help if something isn't working</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final Confirmation Dialog */}
      <AlertDialog open={showFinalDialog} onOpenChange={setShowFinalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure? This will permanently delete your account and all
              associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-dialog-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-dialog-confirm"
            >
              Yes, Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AccountDelete;
