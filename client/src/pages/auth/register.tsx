// ESA LIFE CEO 61x21 - Register Page with MT Ocean Forms
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/form-schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Users, Sparkles } from "lucide-react";
import { 
  MTForm, 
  MTFormButton,
  MTFormField,
  MTFormCheckbox 
} from "@/components/ui-library";

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast({
        title: "Welcome to Mundo Tango! 🎉",
        description: "Your account has been created successfully. Let's set up your profile!",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-teal-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-rose-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 glassmorphic-card backdrop-blur-sm bg-[var(--color-surface)] dark:bg-gray-900/90 relative z-10">
        <CardHeader className="text-center space-y-4 pb-8 relative">
          <MTFormButton
            variant="outline"
            onClick={() => navigate("/")}
            className="absolute left-6 top-6 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[var(--color-text)] dark:text-white border-0 shadow-none px-2 py-1"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </MTFormButton>
          
          <div className="mx-auto relative">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-teal-600 rounded-full flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
              <Users className="text-white w-10 h-10" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-spin-slow" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-teal-600 bg-clip-text text-transparent">
              Join Mundo Tango
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
              Connect with the global tango community
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <MTForm 
            form={form} 
            onSubmit={onSubmit}
            className="space-y-5"
            data-testid="register-form"
          >
            <MTFormField
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="Maria González"
              type="text"
              required
              autoComplete="name"
              description="Your display name in the community"
              data-testid="input-name"
            />

            <MTFormField
              control={form.control}
              name="username"
              label="Username"
              placeholder="maria_tango"
              type="text"
              required
              autoComplete="username"
              description="Choose a unique username (3-20 characters)"
              data-testid="input-username"
            />

            <MTFormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="maria@example.com"
              type="email"
              required
              autoComplete="email"
              description="We'll use this for login and notifications"
              data-testid="input-email"
            />

            <MTFormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Create a strong password"
              type="password"
              required
              autoComplete="new-password"
              description="At least 8 characters with uppercase, lowercase, number and special character"
              data-testid="input-password"
            />

            <MTFormField
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter your password"
              type="password"
              required
              autoComplete="new-password"
              data-testid="input-confirm-password"
            />

            <div className="space-y-3 pt-2">
              <MTFormCheckbox
                control={form.control}
                name="acceptTerms"
                label="I accept the Terms and Conditions"
                required
                data-testid="checkbox-terms"
              />

              <MTFormCheckbox
                control={form.control}
                name="acceptPrivacy"
                label="I accept the Privacy Policy"
                required
                data-testid="checkbox-privacy"
              />
            </div>

            <MTFormButton
              type="submit"
              variant="primary"
              loading={form.formState.isSubmitting}
              disabled={form.formState.isSubmitting}
              className="w-full mt-6"
              data-testid="button-submit"
            >
              {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
            </MTFormButton>
          </MTForm>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--color-surface)] text-gray-500 dark:text-gray-400">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MTFormButton
              variant="outline"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Google sign-up will be available soon!",
                });
              }}
              className="flex items-center justify-center gap-2"
              data-testid="button-google"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </MTFormButton>

            <MTFormButton
              variant="outline"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Facebook sign-up will be available soon!",
                });
              }}
              className="flex items-center justify-center gap-2"
              data-testid="button-facebook"
            >
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </MTFormButton>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)] font-semibold underline underline-offset-2 transition-colors"
                data-testid="link-login"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}