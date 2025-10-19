import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, Calendar, MapPin, Heart, Globe } from "lucide-react";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function LandingVisitor() {
  const { t } = useTranslation();
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
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 rounded-3xl blur-3xl opacity-30" />
          <div className="relative p-12 rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-turquoise-200/50 dark:border-cyan-500/30 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-2xl shadow-lg">
                <Music className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Welcome to Mundo Tango
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with the global tango community. Share memories, find events, and dance with passion.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white shadow-lg"
                onClick={() => window.location.href = '/auth/login'}
                data-testid="button-login"
              >
                Sign In
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-turquoise-400 text-turquoise-600 hover:bg-turquoise-50 dark:border-cyan-500 dark:text-cyan-400 dark:hover:bg-cyan-900/20"
                onClick={() => window.location.href = '/auth/register'}
                data-testid="button-register"
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Share Memories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-center text-base">
                Document your tango journey. Share photos, videos, and stories with dancers worldwide.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Find Events</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-center text-base">
                Discover milongas, workshops, and festivals happening in your city and around the world.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Join Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-center text-base">
                Connect with fellow tangueros. Find dance partners, teachers, and lifelong friends.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-blue-300 rounded-2xl blur-2xl opacity-20" />
          <div className="relative p-8 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-turquoise-200/50 dark:border-cyan-500/30">
            <Globe className="h-12 w-12 mx-auto mb-4 text-turquoise-600 dark:text-cyan-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Dance?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-xl mx-auto">
              Join thousands of tango enthusiasts sharing their passion around the world.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white shadow-lg"
              onClick={() => window.location.href = '/auth/register'}
              data-testid="button-join-cta"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
