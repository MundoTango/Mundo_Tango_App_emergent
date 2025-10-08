// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - DashboardLayout Component
// Canonical layout wrapper for all dashboard pages with theme support

import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, Users, UserPlus, MessageSquare, 
  Users2, Calendar, Mail, Briefcase, Building2,
  TrendingUp, Heart, MapPin, Globe, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import UnifiedTopBar from '@/components/navigation/UnifiedTopBar';
import { useTheme } from '@/contexts/theme-context';
import { useQuery } from '@tanstack/react-query';

interface DashboardLayoutProps {
  children: ReactNode;
  headerSection?: ReactNode;
  sidebarContent?: ReactNode;
  showStats?: boolean;
}

export default function DashboardLayout({ 
  children, 
  headerSection,
  sidebarContent,
  showStats = true
}: DashboardLayoutProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const navigationItems = [
    { path: '/', label: 'Memories', icon: Home },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/tango-communities', label: 'Tango Community', icon: Users },
    { path: '/friends', label: 'Friends', icon: UserPlus },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/groups', label: 'Groups', icon: Users2 },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/role-invitations', label: 'Role Invitations', icon: Mail }
  ];

  // Fetch real global statistics from API
  const { data: globalStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['community', 'global-stats'],
    queryFn: async () => {
      const response = await fetch('/api/community/global-stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch global statistics');
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  });

  // Format numbers with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatValue = (stat: number | undefined) => {
    if (statsLoading) return '...';
    if (statsError) return '—';
    return formatNumber(stat || 0);
  };

  const communityStats = [
    { icon: Globe, label: 'Global People', value: getStatValue(globalStats?.globalPeople), color: 'text-ocean-500' },
    { icon: Calendar, label: 'Active Events', value: getStatValue(globalStats?.activeEvents), color: 'text-emerald-500' },
    { icon: Building2, label: 'Communities', value: getStatValue(globalStats?.communities), color: 'text-ocean-500' },
    { icon: MapPin, label: 'Your City', value: getStatValue(globalStats?.yourCity), color: 'text-emerald-500' }
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'light'
        ? "bg-gradient-to-br from-gray-50 to-white"
        : "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    )}>
      {/* Unified Top Navigation Bar */}
      <UnifiedTopBar 
        theme={theme} 
        onThemeToggle={toggleTheme}
        showMenuButton={false}
      />
      
      {/* MT Ocean Theme Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#5EEAD4]/5 via-transparent to-[#155E75]/5 pointer-events-none" />
      
      {/* Glassmorphic Background Elements */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-20 left-10 w-72 h-72 bg-[#5EEAD4]/10 rounded-full blur-3xl animate-pulse" />
          <div className="fixed bottom-20 right-10 w-96 h-96 bg-[#155E75]/10 rounded-full blur-3xl animate-pulse delay-700" />
        </>
      )}
      
      <div className="relative flex">
        {/* Left Sidebar - Navigation & Stats */}
        <aside className={cn(
          "w-72 h-[calc(100vh-var(--spacing-16))] sticky top-16 backdrop-blur-xl border-r flex flex-col",
          theme === 'light'
            ? "bg-white/80 border-gray-200"
            : "bg-slate-900/50 border-slate-800/50"
        )}>
          {/* Pierre Dubois Profile */}
          <div className={cn(
            "p-6 border-b",
            theme === 'light' ? "border-gray-200" : "border-slate-800/50"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5EEAD4] to-[#155E75] flex items-center justify-center text-white font-bold text-lg">
                P
              </div>
              <div>
                <div className={cn(
                  "font-semibold",
                  theme === 'light' ? "text-gray-900" : "text-white"
                )}>Pierre Dubois</div>
                <div className={cn(
                  "text-sm",
                  theme === 'light' ? "text-gray-500" : "text-slate-400"
                )}>@pierre_dancer</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 text-xs rounded-full">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <a className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      "hover:translate-x-1",
                      theme === 'light'
                        ? "hover:bg-gray-100"
                        : "hover:bg-slate-800/50",
                      isActive 
                        ? theme === 'light'
                          ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border-l-4 border-purple-500"
                          : "bg-gradient-to-r from-[#5EEAD4]/20 to-[#155E75]/20 text-cyan-400 border-l-4 border-cyan-400"
                        : theme === 'light'
                          ? "text-gray-600 hover:text-gray-900"
                          : "text-slate-300 hover:text-white"
                    )}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <Sparkles className="w-4 h-4 ml-auto animate-pulse" />
                      )}
                    </a>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Community Stats */}
          {showStats && (
            <div className={cn(
              "p-6 border-t",
              theme === 'light' ? "border-gray-200" : "border-slate-800/50"
            )}>
              <h3 className={cn(
                "text-sm font-semibold uppercase tracking-wider mb-4",
                theme === 'light' ? "text-gray-500" : "text-slate-400"
              )}>
                GLOBAL STATISTICS
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {communityStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={cn(
                      "rounded-lg p-3 backdrop-blur-sm",
                      theme === 'light'
                        ? "bg-gray-100"
                        : "bg-slate-800/30"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn("w-4 h-4", stat.color)} />
                        <span className={cn(
                          "text-2xl font-bold",
                          theme === 'light' ? "text-gray-900" : "text-white"
                        )}>{stat.value}</span>
                      </div>
                      <div className={cn(
                        "text-xs",
                        theme === 'light' ? "text-gray-500" : "text-slate-400"
                      )}>{stat.label}</div>
                    </div>
                  );
                })}
              </div>
              
              {/* Mundo Tango Button */}
              <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Mundo Tango
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex">
          <div className="flex-1 max-w-4xl mx-auto">
            {headerSection && (
              <div className="mb-6">
                {headerSection}
              </div>
            )}
            {children}
          </div>
          
          {/* Right Sidebar */}
          {sidebarContent && (
            <aside className={cn(
              "w-80 h-[calc(100vh-var(--spacing-16))] sticky top-16 backdrop-blur-xl border-l p-6",
              theme === 'light'
                ? "bg-white/80 border-gray-200"
                : "bg-slate-900/30 border-slate-800/50"
            )}>
              {sidebarContent}
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}