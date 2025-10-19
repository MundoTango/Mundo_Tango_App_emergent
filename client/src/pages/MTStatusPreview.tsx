import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import UnifiedTopBar from "@/components/navigation/UnifiedTopBar";
import { useState } from "react";

export default function MTStatusPreview() {
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
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 rounded-3xl blur-2xl opacity-30" />
          <div className="relative p-8 rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-turquoise-200/50 dark:border-cyan-500/30">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Mundo Tango Status
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Platform health and system status
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <CardTitle className="text-gray-900 dark:text-white">All Systems Operational</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All core services are running smoothly
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-turquoise-500" />
                <CardTitle className="text-gray-900 dark:text-white">Response Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-turquoise-600 dark:text-cyan-400">
                &lt;50ms
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average API response</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <CardTitle className="text-gray-900 dark:text-white">Scheduled Maintenance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No maintenance planned
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
