// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - Top Navigation Bar Component
// Global navigation header with Mundo Tango branding

import { useState } from 'react';
import { 
  Search, Bell, MessageSquare, Globe, 
  ChevronDown, Sun, Moon, User, Settings,
  LogOut, Home, Heart, HelpCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface TopNavigationBarProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function TopNavigationBar({ theme, onThemeToggle }: TopNavigationBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3); // Mock notification count

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b backdrop-blur-xl",
      theme === 'light' 
        ? "bg-white/95 border-gray-200" 
        : "bg-slate-900/95 border-slate-800"
    )}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left Section - Mundo Tango Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow">
                MT
              </div>
              <span className={cn(
                "hidden sm:block text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              )}>
                Mundo Tango
              </span>
          </Link>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className={cn(
            "relative rounded-full overflow-hidden",
            theme === 'light' 
              ? "bg-gray-100" 
              : "bg-slate-800"
          )}>
            <Search className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
              theme === 'light' ? "text-gray-400" : "text-slate-400"
            )} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, people, memories..."
              className={cn(
                "w-full pl-12 pr-4 py-2.5 bg-transparent outline-none transition-colors",
                theme === 'light' 
                  ? "text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20" 
                  : "text-white placeholder-slate-400 focus:bg-slate-700/50 focus:ring-2 focus:ring-purple-500/20"
              )}
            />
          </div>
        </div>

        {/* Right Section - User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className={cn(
              "p-2 rounded-lg transition-all",
              theme === 'light'
                ? "hover:bg-gray-100 text-gray-600"
                : "hover:bg-slate-800 text-slate-400"
            )}
            title={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Language Selector */}
          <button className={cn(
            "hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg transition-all",
            theme === 'light'
              ? "hover:bg-gray-100 text-gray-600"
              : "hover:bg-slate-800 text-slate-400"
          )}>
            <span className="text-lg">🇬🇧</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Favorites - Heart Icon */}
          <Link href="/favorites">
              <button className={cn(
                "p-2 rounded-lg transition-all",
                theme === 'light'
                  ? "hover:bg-gray-100 text-gray-600"
                  : "hover:bg-slate-800 text-slate-400"
              )} title="Favorites">
                <Heart className="w-5 h-5" />
              </button>
          </Link>

          {/* Messages */}
          <button className={cn(
            "relative p-2 rounded-lg transition-all",
            theme === 'light'
              ? "hover:bg-gray-100 text-gray-600"
              : "hover:bg-slate-800 text-slate-400"
          )}>
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className={cn(
            "relative p-2 rounded-lg transition-all",
            theme === 'light'
              ? "hover:bg-gray-100 text-gray-600"
              : "hover:bg-slate-800 text-slate-400"
          )}>
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Settings Icon */}
          <Link href="/settings">
              <button className={cn(
                "p-2 rounded-lg transition-all",
                theme === 'light'
                  ? "hover:bg-gray-100 text-gray-600"
                  : "hover:bg-slate-800 text-slate-400"
              )} title="Settings">
                <Settings className="w-5 h-5" />
              </button>
          </Link>

          {/* Help Icon */}
          <Link href="/help">
              <button className={cn(
                "p-2 rounded-lg transition-all",
                theme === 'light'
                  ? "hover:bg-gray-100 text-gray-600"
                  : "hover:bg-slate-800 text-slate-400"
              )} title="Help">
                <HelpCircle className="w-5 h-5" />
              </button>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={cn(
                "flex items-center gap-2 p-1.5 rounded-lg transition-all",
                theme === 'light'
                  ? "hover:bg-gray-100"
                  : "hover:bg-slate-800"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                P
              </div>
              <ChevronDown className={cn(
                "w-3 h-3 hidden sm:block transition-transform",
                isProfileOpen && "rotate-180"
              )} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className={cn(
                  "absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-50",
                  theme === 'light'
                    ? "bg-white border-gray-200"
                    : "bg-slate-900 border-slate-800"
                )}>
                  {/* User Info */}
                  <div className={cn(
                    "p-4 border-b",
                    theme === 'light' ? "border-gray-200" : "border-slate-800"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        P
                      </div>
                      <div>
                        <p className={cn(
                          "font-semibold",
                          theme === 'light' ? "text-gray-900" : "text-white"
                        )}>Pierre Dubois</p>
                        <p className={cn(
                          "text-sm",
                          theme === 'light' ? "text-gray-500" : "text-slate-400"
                        )}>@pierre_dancer</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link href="/profile" className={cn(
                        "flex items-center gap-3 px-4 py-2 transition-colors",
                        theme === 'light'
                          ? "hover:bg-gray-100 text-gray-700"
                          : "hover:bg-slate-800 text-slate-300"
                      )}>
                        <User className="w-4 h-4" />
                        <span>Your Profile</span>
                    </Link>
                    <Link href="/settings" className={cn(
                        "flex items-center gap-3 px-4 py-2 transition-colors",
                        theme === 'light'
                          ? "hover:bg-gray-100 text-gray-700"
                          : "hover:bg-slate-800 text-slate-300"
                      )}>
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Link>
                    <div className={cn(
                      "my-2 border-t",
                      theme === 'light' ? "border-gray-200" : "border-slate-800"
                    )} />
                    <button className={cn(
                      "flex items-center gap-3 w-full px-4 py-2 transition-colors text-left",
                      theme === 'light'
                        ? "hover:bg-gray-100 text-gray-700"
                        : "hover:bg-slate-800 text-slate-300"
                    )}>
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}