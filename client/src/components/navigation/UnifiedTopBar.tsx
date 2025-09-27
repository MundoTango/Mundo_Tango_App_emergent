// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - Unified Top Navigation Bar
// Single responsibility navigation component for entire platform

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Search, Bell, MessageSquare, Globe, 
  ChevronDown, Sun, Moon, User, Settings,
  LogOut, Home, Heart, HelpCircle, Menu,
  CreditCard, Shield, FileText, Trash2, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface UnifiedTopBarProps {
  onMenuToggle?: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  showMenuButton?: boolean;
}

export default function UnifiedTopBar({ 
  onMenuToggle,
  theme = 'light',
  onThemeToggle,
  showMenuButton = true
}: UnifiedTopBarProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  // Initialize language from localStorage or default to 'EN'
  const [currentLang, setCurrentLang] = useState(() => {
    const savedLang = localStorage.getItem('userLanguage');
    return savedLang || 'EN';
  });

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications count
  const { data: notificationCount } = useQuery({
    queryKey: ['/api/notifications/count'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/count', {
        credentials: 'include'
      });
      const data = await response.json();
      return data.count || 0;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Fetch messages count
  const { data: messageCount } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/messages/unread-count', {
        credentials: 'include'
      });
      const data = await response.json();
      return data.count || 0;
    },
    refetchInterval: 30000
  });

  // Global search
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/search/global', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;
      const response = await fetch(`/api/user/global-search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data;
    },
    enabled: !!searchQuery.trim()
  });

  const handleLogout = async () => {
    try {
      localStorage.clear();
      window.location.href = '/api/auth/logout';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(!!value.trim());
  };

  const handleSearchResultClick = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const cycleLang = () => {
    const langs = ['EN', 'ES', 'FR'];
    const currentIndex = langs.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % langs.length;
    const nextLang = langs[nextIndex];
    
    // Update state
    setCurrentLang(nextLang);
    
    // Persist to localStorage
    localStorage.setItem('userLanguage', nextLang);
    
    // TODO: Save to user preferences API if logged in
    // if (user) {
    //   fetch('/api/user/preferences', {
    //     method: 'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ language: nextLang }),
    //     credentials: 'include'
    //   });
    // }
    
    toast({
      title: "Language Changed",
      description: `Interface language set to ${nextLang === 'EN' ? 'English' : nextLang === 'ES' ? 'Español' : 'Français'}`,
    });
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b backdrop-blur-xl",
      theme === 'light' 
        ? "bg-white/95 border-gray-200" 
        : "bg-slate-900/95 border-slate-800"
    )}>
      {/* MT Ocean Theme Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#5EEAD4]/5 via-transparent to-[#155E75]/5 pointer-events-none" />
      
      <div className="relative flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left Section - Menu & Brand */}
        <div className="flex items-center gap-4">
          {showMenuButton && onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className={cn(
                "hover:bg-gray-100 dark:hover:bg-slate-800",
                theme === 'light' ? "text-gray-600" : "text-slate-400"
              )}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
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
        <div className="flex-1 max-w-2xl mx-4 hidden md:block" ref={searchRef}>
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
              onChange={handleSearchChange}
              placeholder="Search events, people, memories..."
              className={cn(
                "w-full pl-12 pr-4 py-2.5 bg-transparent outline-none transition-colors",
                theme === 'light' 
                  ? "text-gray-900 placeholder-gray-500" 
                  : "text-white placeholder-slate-400"
              )}
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery && (
            <div className={cn(
              "absolute w-full max-w-2xl mt-2 rounded-xl shadow-2xl border overflow-hidden",
              theme === 'light' 
                ? "bg-white border-gray-200" 
                : "bg-slate-900 border-slate-700"
            )}>
              {searchLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className={cn(
                    "mt-2 text-sm",
                    theme === 'light' ? "text-gray-500" : "text-slate-400"
                  )}>Searching...</p>
                </div>
              ) : searchResults ? (
                <div className="grid grid-cols-4 gap-4 p-4">
                  {/* Posts Section */}
                  {searchResults.posts?.length > 0 && (
                    <div>
                      <h3 className={cn(
                        "font-semibold text-sm mb-2",
                        theme === 'light' ? "text-gray-700" : "text-slate-300"
                      )}>Posts</h3>
                      <div className="space-y-1">
                        {searchResults.posts.slice(0, 3).map((post: any) => (
                          <div
                            key={post.id}
                            onClick={handleSearchResultClick}
                            className={cn(
                              "p-2 rounded-lg cursor-pointer transition-colors",
                              theme === 'light' 
                                ? "hover:bg-gray-50" 
                                : "hover:bg-slate-800"
                            )}
                          >
                            <p className="text-sm truncate">{post.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events Section */}
                  {searchResults.events?.length > 0 && (
                    <div>
                      <h3 className={cn(
                        "font-semibold text-sm mb-2",
                        theme === 'light' ? "text-gray-700" : "text-slate-300"
                      )}>Events</h3>
                      <div className="space-y-1">
                        {searchResults.events.slice(0, 3).map((event: any) => (
                          <Link key={event.id} href={`/events/${event.id}`}>
                            <a onClick={handleSearchResultClick} className={cn(
                              "block p-2 rounded-lg cursor-pointer transition-colors",
                              theme === 'light' 
                                ? "hover:bg-gray-50" 
                                : "hover:bg-slate-800"
                            )}>
                              <p className="text-sm font-medium">{event.title}</p>
                            </a>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* People Section */}
                  {searchResults.users?.length > 0 && (
                    <div>
                      <h3 className={cn(
                        "font-semibold text-sm mb-2",
                        theme === 'light' ? "text-gray-700" : "text-slate-300"
                      )}>People</h3>
                      <div className="space-y-1">
                        {searchResults.users.slice(0, 3).map((person: any) => (
                          <Link key={person.id} href={`/profile/${person.id}`}>
                            <a onClick={handleSearchResultClick} className={cn(
                              "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                              theme === 'light' 
                                ? "hover:bg-gray-50" 
                                : "hover:bg-slate-800"
                            )}>
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={person.profileImage} />
                                <AvatarFallback className="text-xs">
                                  {person.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{person.name}</span>
                            </a>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Groups Section */}
                  {searchResults.groups?.length > 0 && (
                    <div>
                      <h3 className={cn(
                        "font-semibold text-sm mb-2",
                        theme === 'light' ? "text-gray-700" : "text-slate-300"
                      )}>Groups</h3>
                      <div className="space-y-1">
                        {searchResults.groups.slice(0, 3).map((group: any) => (
                          <Link key={group.id} href={`/groups/${group.id}`}>
                            <a onClick={handleSearchResultClick} className={cn(
                              "block p-2 rounded-lg cursor-pointer transition-colors",
                              theme === 'light' 
                                ? "hover:bg-gray-50" 
                                : "hover:bg-slate-800"
                            )}>
                              <p className="text-sm font-medium">{group.name}</p>
                            </a>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className={cn(
                    "text-sm",
                    theme === 'light' ? "text-gray-500" : "text-slate-400"
                  )}>No results found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className={cn(
                "h-5 w-5",
                theme === 'light' ? "text-gray-600" : "text-slate-400"
              )} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Messages */}
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className={cn(
                "h-5 w-5",
                theme === 'light' ? "text-gray-600" : "text-slate-400"
              )} />
              {messageCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {messageCount > 9 ? '9+' : messageCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Favorites */}
          <Link href="/favorites">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-favorites"
              className={cn(
                "transition-all",
                theme === 'light'
                  ? "hover:bg-gray-100 text-gray-600"
                  : "hover:bg-slate-800 text-slate-400"
              )}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Theme Toggle */}
          {onThemeToggle && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onThemeToggle}
              className={cn(
                "transition-all",
                theme === 'light'
                  ? "hover:bg-gray-100 text-gray-600"
                  : "hover:bg-slate-800 text-slate-400"
              )}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
          )}

          {/* Language Selector */}
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleLang}
            className={cn(
              "hidden sm:flex items-center gap-1 px-3",
              theme === 'light'
                ? "hover:bg-gray-100 text-gray-600"
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{currentLang}</span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "flex items-center gap-2 px-2",
                  theme === 'light'
                    ? "hover:bg-gray-100"
                    : "hover:bg-slate-800"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage} className="object-cover" />
                  <AvatarFallback className={cn(
                    "font-medium",
                    theme === 'light' 
                      ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                      : "bg-gradient-to-br from-[#5EEAD4] to-[#155E75] text-white"
                  )}>
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className={cn(
                  "h-4 w-4",
                  theme === 'light' ? "text-gray-600" : "text-slate-400"
                )} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              align="end" 
              className={cn(
                "w-64",
                theme === 'light' 
                  ? "bg-white border-gray-200" 
                  : "bg-slate-900 border-slate-700"
              )}
            >
              {/* User Info */}
              <div className={cn(
                "px-4 py-3 border-b",
                theme === 'light' ? "border-gray-200" : "border-slate-700"
              )}>
                <p className={cn(
                  "font-semibold",
                  theme === 'light' ? "text-gray-900" : "text-white"
                )}>
                  {user?.name || 'Guest User'}
                </p>
                <p className={cn(
                  "text-sm",
                  theme === 'light' ? "text-gray-500" : "text-slate-400"
                )}>
                  @{user?.username || 'guest'}
                </p>
                {user?.roles?.includes('admin') && (
                  <Badge className="mt-1 bg-emerald-500/20 text-emerald-600">
                    Admin
                  </Badge>
                )}
              </div>

              {/* Profile Actions */}
              <div className="py-2">
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <User className="mr-3 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setLocation('/settings')}>
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setLocation('/settings/billing')}>
                  <CreditCard className="mr-3 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>

                {user?.roles?.includes('admin') && (
                  <DropdownMenuItem onClick={() => setLocation('/admin')}>
                    <Shield className="mr-3 h-4 w-4" />
                    <span>Admin Center</span>
                  </DropdownMenuItem>
                )}
              </div>

              <DropdownMenuSeparator className={cn(
                theme === 'light' ? "bg-gray-200" : "bg-slate-700"
              )} />

              {/* Help & Legal */}
              <div className="py-2">
                <DropdownMenuItem onClick={() => setLocation('/help')}>
                  <HelpCircle className="mr-3 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setLocation('/privacy')}>
                  <FileText className="mr-3 h-4 w-4" />
                  <span>Privacy Policy</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setLocation('/terms')}>
                  <FileText className="mr-3 h-4 w-4" />
                  <span>Terms & Conditions</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className={cn(
                theme === 'light' ? "bg-gray-200" : "bg-slate-700"
              )} />

              {/* Danger Zone */}
              <div className="py-2">
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      setLocation('/account/delete');
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  <span>Delete Account</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}