// ESA Agent #4 (Authentication) - Password Reset Confirmation Page
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Key, CheckCircle, Lock } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { 
  MTForm, 
  MTFormButton,
  MTFormField 
} from "@/components/ui-library";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (!urlToken) {
      toast({
        title: 'Invalid Reset Link',
        description: 'The password reset link is invalid or has expired.',
        variant: 'destructive',
      });
      navigate('/login');
    } else {
      setToken(urlToken);
    }
  }, []);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          password: data.password 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }
      
      setResetSuccess(true);
      toast({
        title: 'Password Reset Successful! 🎉',
        description: 'Your password has been updated. You can now log in with your new password.',
      });

      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.message || 'Unable to reset password. Please try again.',
        variant: "destructive",
      });
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 dark:from-purple-900/20 via-indigo-50 to-teal-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-20 w-80 h-80 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -left-40 w-96 h-96 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 glassmorphic-card backdrop-blur-sm bg-white dark:bg-gray-900/90 dark:bg-gray-900/90 relative z-10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
              {resetSuccess ? (
                <CheckCircle className="text-white dark:text-gray-900 dark:text-white dark:text-gray-900 w-10 h-10" />
              ) : (
                <Lock className="text-white w-10 h-10" />
              )}
            </div>
            {!resetSuccess && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-400 rounded-full animate-bounce" />
            )}
          </div>
          
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 dark:from-purple-500 to-indigo-600 bg-clip-text text-transparent">
              {resetSuccess 
                ? 'Password Reset Complete!'
                : 'Set New Password'
              }
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2 flex items-center justify-center gap-2">
              <Key className="h-4 w-4" />
              {resetSuccess
                ? "You'll be redirected to login shortly"
                : "Create a strong password for your account"
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {!resetSuccess ? (
            <>
              <MTForm 
                form={form} 
                onSubmit={onSubmit}
                className="space-y-6"
                data-testid="reset-password-form"
              >
                <MTFormField
                  control={form.control}
                  name="password"
                  label="New Password"
                  placeholder={t('common.inputs.enter_your_new_password')}
                  type="password"
                  required
                  description="Must be at least 8 characters long"
                  data-testid="input-password"
                />

                <MTFormField
                  control={form.control}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder={t('common.inputs.reenter_your_new_password')}
                  type="password"
                  required
                  description="Must match your new password"
                  data-testid="input-confirm-password"
                />

                <MTFormButton
                  type="submit"
                  variant="primary"
                  loading={form.formState.isSubmitting}
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                  data-testid="button-submit"
                >
                  {form.formState.isSubmitting 
                    ? 'Resetting Password...' 
                    : 'Reset Password'
                  }
                </MTFormButton>
              </MTForm>

              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-800 flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Choose a strong password with a mix of letters, numbers, and special characters.
                  </span>
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg text-center">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-300 mx-auto mb-3" />
                <p className="text-green-800 font-medium mb-2">
                  Password Successfully Reset!
                </p>
                <p className="text-green-900">
                  Redirecting to login...
                </p>
              </div>

              <MTFormButton
                variant="primary"
                onClick={() => navigate('/login')}
                className="w-full"
                data-testid="button-login-now"
              >
                Go to Login
              </MTFormButton>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
