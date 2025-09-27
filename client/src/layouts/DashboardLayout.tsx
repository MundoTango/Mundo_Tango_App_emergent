import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import TrangoTechSidebar from '@/components/TrangoTechSidebar';
import UnifiedTopBar from '@/components/navigation/UnifiedTopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Get initial theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Update document class for Tailwind dark mode
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Unified Top Navigation Bar */}
      <UnifiedTopBar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        theme={theme}
        onThemeToggle={toggleTheme}
        showMenuButton={true}
      />

      <div className="relative flex min-h-screen">
        {/* Fixed Sidebar - No layout impact */}
        <TrangoTechSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content Area - Full width with sidebar offset */}
        <main className="flex-1 bg-gray-50 transition-all duration-300">
          <div className={cn(
            "transition-all duration-300",
            sidebarOpen ? "lg:pl-64" : "lg:pl-0"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}