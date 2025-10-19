import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function Discover() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        theme={theme}
        onThemeToggle={toggleTheme}
        showMenuButton={true}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 rounded-3xl blur-2xl opacity-30" />
              <div className="relative p-8 rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-turquoise-200/50 dark:border-cyan-500/30">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Discover Tango
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  Explore events, communities, and dancers around the world
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-center">
                    Find milongas and workshops near you
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-center">
                    Join tango groups in your city
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">Places</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-center">
                    Discover tango venues worldwide
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
