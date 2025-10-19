import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Heart, Globe, Users } from "lucide-react";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import { useState } from "react";

export default function About() {
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
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 rounded-3xl blur-3xl opacity-30" />
          <div className="relative p-12 rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-turquoise-200/50 dark:border-cyan-500/30 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-2xl">
                <Music className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              About Mundo Tango
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Connecting the global tango community
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-turquoise-500" />
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Mundo Tango is dedicated to bringing together tango enthusiasts from around the world. 
                We provide a platform for dancers to share their passion, discover events, and build lasting connections.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-cyan-500" />
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Global Community</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                With members in over 50 countries, Mundo Tango connects dancers across continents. 
                Find events, share memories, and connect with fellow tangueros wherever you are.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Join Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Whether you're a beginner or a professional, Mundo Tango welcomes all levels. 
                Create your profile, share your journey, and become part of our growing community.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
