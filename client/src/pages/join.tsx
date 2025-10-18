import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Code, Check, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import VisitorNavbar from "@/components/visitor/VisitorNavbar";
import VisitorFooter from "@/components/visitor/VisitorFooter";
import { useToast } from "@/hooks/use-toast";

export default function Join() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPath, setSelectedPath] = useState<'user' | 'volunteer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    document.title = "Join Mundo Tango - Create Your Free Account";
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'email' && value) {
      setErrors(prev => ({ 
        ...prev, 
        email: validateEmail(value) ? '' : 'Invalid email format' 
      }));
    }
    
    if (field === 'password' && value) {
      setErrors(prev => ({ 
        ...prev, 
        password: validatePassword(value) ? '' : 'Password must be at least 8 characters' 
      }));
    }
    
    if (field === 'confirmPassword' && value) {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: value === formData.password ? '' : 'Passwords do not match' 
      }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: !validateEmail(formData.email) ? 'Invalid email format' : '',
      password: !validatePassword(formData.password) ? 'Password must be at least 8 characters' : '',
      confirmPassword: formData.password !== formData.confirmPassword ? 'Passwords do not match' : '',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        toast({
          title: "Account created!",
          description: "Welcome to Mundo Tango. Let's set up your profile.",
        });
        setLocation('/onboarding');
      } else {
        const data = await response.json();
        toast({
          title: "Signup failed",
          description: data.message || "Please try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplitOAuth = () => {
    window.location.href = '/api/auth/replit';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <VisitorNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent"
            data-testid="text-join-title"
          >
            Join Mundo Tango
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose how you'd like to be part of our community
          </p>
        </div>

        {/* Path Selection OR Signup Form */}
        {!selectedPath ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Join as User */}
            <Card 
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedPath('user')}
              data-testid="card-join-user"
            >
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Join as Dancer</CardTitle>
                <CardDescription className="text-base">
                  Connect with tangueros worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-turquoise-600 dark:text-turquoise-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Find events in your city</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-turquoise-600 dark:text-turquoise-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Share your tango memories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-turquoise-600 dark:text-turquoise-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Connect with dancers globally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-turquoise-600 dark:text-turquoise-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">100% free forever</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold"
                  data-testid="button-select-user"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Join as Volunteer */}
            <Card 
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setLocation('/volunteer')}
              data-testid="card-join-volunteer"
            >
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Join as Volunteer</CardTitle>
                <CardDescription className="text-base">
                  Help build the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Contribute to open source</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">AI-powered skill matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Work on real-world projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">Make an impact</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 text-white font-semibold"
                  data-testid="button-select-volunteer"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedPath(null)}
              className="mb-4"
              data-testid="button-back"
            >
              ← Back
            </Button>

            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-white text-center">
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-center">
                  Join thousands of tangueros worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                      data-testid="input-email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="At least 8 characters"
                      className={errors.password ? 'border-red-500' : ''}
                      data-testid="input-password"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter your password"
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                      data-testid="input-confirm-password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold"
                    disabled={isSubmitting}
                    data-testid="button-signup"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReplitOAuth}
                  className="w-full border-2"
                  data-testid="button-replit-oauth"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.84 1.279A1.2 1.2 0 0 0 4.8 0H1.2A1.2 1.2 0 0 0 0 1.2v3.6a1.2 1.2 0 0 0 1.2 1.2h3.6a1.2 1.2 0 0 0 1.2-1.2v-3.6a1.2 1.2 0 0 0-.16-.921zm0 9.6A1.2 1.2 0 0 0 4.8 9.6H1.2A1.2 1.2 0 0 0 0 10.8v3.6a1.2 1.2 0 0 0 1.2 1.2h3.6a1.2 1.2 0 0 0 1.2-1.2v-3.6a1.2 1.2 0 0 0-.16-.921zm0 9.6A1.2 1.2 0 0 0 4.8 19.2H1.2A1.2 1.2 0 0 0 0 20.4v3.6A1.2 1.2 0 0 0 1.2 24h3.6a1.2 1.2 0 0 0 1.2-1.2v-3.6a1.2 1.2 0 0 0-.16-.921zm9.6-19.2A1.2 1.2 0 0 0 14.4 0h-3.6a1.2 1.2 0 0 0-1.2 1.2v3.6a1.2 1.2 0 0 0 1.2 1.2h3.6a1.2 1.2 0 0 0 1.2-1.2V1.2a1.2 1.2 0 0 0-.16-.921zm0 9.6a1.2 1.2 0 0 0-1.04-1.279h-3.6a1.2 1.2 0 0 0-1.2 1.2v3.6a1.2 1.2 0 0 0 1.2 1.2h3.6a1.2 1.2 0 0 0 1.2-1.2v-3.6a1.2 1.2 0 0 0-.16-.921zm0 9.6a1.2 1.2 0 0 0-1.04-1.279h-3.6a1.2 1.2 0 0 0-1.2 1.2v3.6a1.2 1.2 0 0 0 1.2 1.2h3.6a1.2 1.2 0 0 0 1.2-1.2v-3.6a1.2 1.2 0 0 0-.16-.921zm9.6-19.2A1.2 1.2 0 0 0 24 1.2V.96A.96.96 0 0 0 23.04 0h-3.84a.96.96 0 0 0-.96.96v.24a1.2 1.2 0 0 0 1.2 1.2h3.6z"/>
                  </svg>
                  Sign in with Replit
                </Button>

                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link href="/auth/login">
                    <a className="text-turquoise-600 dark:text-turquoise-400 hover:underline" data-testid="link-login">
                      Log in
                    </a>
                  </Link>
                </div>

                <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms">
                    <a className="hover:underline" data-testid="link-terms">Terms of Service</a>
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy">
                    <a className="hover:underline" data-testid="link-privacy">Privacy Policy</a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <VisitorFooter />
    </div>
  );
}
