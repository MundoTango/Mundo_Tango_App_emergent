// ESA LIFE CEO 61x21 - Forgot Password Page with MT Ocean Forms
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/form-schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Mail, Key, CheckCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { 
  MTForm, 
  MTFormButton,
  MTFormField 
} from "@/components/ui-library";
import { z } from "zod";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // TODO: Implement actual forgot password API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSent(true);
      toast({
        title: t('auth.forgot_password.success_title', 'Email Sent! ✉️'),
        description: t('auth.forgot_password.success_message', 'Check your email for password reset instructions.'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.forgot_password.error_title', 'Request Failed'),
        description: error.message || t('auth.forgot_password.error_message', 'Unable to send reset email. Please try again.'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-teal-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-20 w-80 h-80 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -left-40 w-96 h-96 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 glassmorphic-card backdrop-blur-sm bg-white/90 relative z-10">
        <CardHeader className="text-center space-y-4 pb-8 relative">
          <MTFormButton
            variant="outline"
            onClick={() => navigate("/login")}
            className="absolute left-6 top-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 border-0 shadow-none px-2 py-1"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.forgot_password.back_button', 'Back to Login')}
          </MTFormButton>
          
          <div className="mx-auto relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
              {emailSent ? (
                <CheckCircle className="text-white w-10 h-10" />
              ) : (
                <Key className="text-white w-10 h-10" />
              )}
            </div>
            {!emailSent && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-400 rounded-full animate-bounce" />
            )}
          </div>
          
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {emailSent 
                ? t('auth.forgot_password.title_sent', 'Check Your Email')
                : t('auth.forgot_password.title', 'Forgot Password?')
              }
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              {emailSent
                ? t('auth.forgot_password.subtitle_sent', "We've sent you reset instructions")
                : t('auth.forgot_password.subtitle', "Enter your email to reset your password")
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {!emailSent ? (
            <>
              <MTForm 
                form={form} 
                onSubmit={onSubmit}
                className="space-y-6"
                data-testid="forgot-password-form"
              >
                <MTFormField
                  control={form.control}
                  name="email"
                  label={t('auth.forgot_password.email_label', 'Email Address')}
                  placeholder={t('auth.forgot_password.email_placeholder', 'Enter your registered email')}
                  type="email"
                  required
                  autoComplete="email"
                  description={t('auth.forgot_password.email_description', "We'll send password reset instructions to this email")}
                  data-testid="input-email"
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
                    ? t('auth.forgot_password.sending', 'Sending...') 
                    : t('auth.forgot_password.send_button', 'Send Reset Link')
                  }
                </MTFormButton>
              </MTForm>

              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-800 flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {t('auth.forgot_password.info_message', "Didn't receive the email? Check your spam folder or try again in a few minutes.")}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-800 font-medium mb-2">
                  {t('auth.forgot_password.email_sent_to', 'Email sent to:')}
                </p>
                <p className="text-green-900 font-semibold">
                  {form.getValues('email')}
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  {t('auth.forgot_password.check_inbox', 'Please check your inbox and click the reset link to set a new password.')}
                </p>
                <p>
                  {t('auth.forgot_password.link_expires', 'The reset link will expire in 1 hour for security reasons.')}
                </p>
              </div>

              <div className="flex gap-3">
                <MTFormButton
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                  className="flex-1"
                  data-testid="button-resend"
                >
                  {t('auth.forgot_password.resend_button', 'Resend Email')}
                </MTFormButton>
                <MTFormButton
                  variant="primary"
                  onClick={() => navigate('/login')}
                  className="flex-1"
                  data-testid="button-back-to-login"
                >
                  {t('auth.forgot_password.back_to_login_button', 'Back to Login')}
                </MTFormButton>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.forgot_password.remember_password', 'Remember your password?')}{" "}
              <Link 
                href="/login" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 transition-colors"
                data-testid="link-login"
              >
                {t('auth.forgot_password.sign_in_link', 'Sign in here')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
