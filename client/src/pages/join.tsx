import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Music } from "lucide-react";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import { useState } from "react";

export default function Join() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <UnifiedTopBar 
        theme={theme}
        onThemeToggle={toggleTheme}
        showMenuButton={false}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 rounded-3xl blur-3xl opacity-30" />
          <div className="relative p-12 rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-turquoise-200/50 dark:border-cyan-500/30">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-2xl">
                <Music className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Join Mundo Tango
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your tango journey
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-900 dark:text-white mb-2">Free</CardTitle>
              <div className="text-4xl font-bold text-turquoise-600 dark:text-cyan-400 mb-2">$0</div>
              <CardDescription className="text-gray-600 dark:text-gray-400">Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Join communities', 'View events', 'Basic profile', 'Connect with dancers'].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-turquoise-500" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                onClick={() => window.location.href = '/auth/register'}
                data-testid="button-join-free"
              >
                Join Free
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-turquoise-50 to-cyan-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-turquoise-300 dark:border-cyan-500 shadow-2xl transform scale-105">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white text-sm font-semibold py-1 px-3 rounded-full inline-block mb-2">
                Most Popular
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white mb-2">Pro</CardTitle>
              <div className="text-4xl font-bold text-turquoise-600 dark:text-cyan-400 mb-2">$9.99</div>
              <CardDescription className="text-gray-600 dark:text-gray-400">For serious dancers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Everything in Free', 'Create events', 'Advanced profile', 'Priority support', 'Ad-free experience'].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-turquoise-600" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white shadow-lg"
                onClick={() => window.location.href = '/auth/register?plan=pro'}
                data-testid="button-join-pro"
              >
                Get Pro
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-900 dark:text-white mb-2">Premium</CardTitle>
              <div className="text-4xl font-bold text-turquoise-600 dark:text-cyan-400 mb-2">$19.99</div>
              <CardDescription className="text-gray-600 dark:text-gray-400">For professionals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Everything in Pro', 'Teacher tools', 'Organizer dashboard', 'Analytics', 'Custom branding'].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-turquoise-500" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                onClick={() => window.location.href = '/auth/register?plan=premium'}
                data-testid="button-join-premium"
              >
                Get Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
