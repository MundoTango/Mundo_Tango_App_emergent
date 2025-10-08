// ESA LIFE CEO 61x21 - Phase 19: Admin Layout Component
import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Shield,
  BarChart3,
  Settings,
  MessageSquare,
  FileText,
  Monitor,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  UserCog,
  Flag,
  TrendingUp,
  Mail,
  Headphones,
  Activity,
  Database,
  Brain,
  Layers,
  Lock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GlassCard } from '@/components/glass/GlassComponents';


interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, badge: null },
      { name: 'Real-time Activity', href: '/admin/activity', icon: Activity, badge: 'Live' },
    ]
  },
  {
    title: 'User Management',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users, badge: null },
      { name: 'Roles & Permissions', href: '/admin/roles', icon: UserCog, badge: null },
      { name: 'Verification Queue', href: '/admin/verification', icon: Shield, badge: '12' },
    ]
  },
  {
    title: 'Content Moderation',
    items: [
      { name: 'Moderation Queue', href: '/admin/moderation', icon: Flag, badge: '8' },
      { name: 'Reports', href: '/admin/reports', icon: AlertTriangle, badge: '3' },
      { name: 'Content Filters', href: '/admin/filters', icon: Shield, badge: null },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { name: 'Analytics Dashboard', href: '/admin/analytics', icon: BarChart3, badge: null },
      { name: 'User Insights', href: '/admin/insights', icon: TrendingUp, badge: null },
      { name: 'Revenue', href: '/admin/revenue', icon: TrendingUp, badge: null },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Configuration', href: '/admin/config', icon: Settings, badge: null },
      { name: 'Agent Management', href: '/admin/agents', icon: Brain, badge: '61' },
      { name: 'Database', href: '/admin/database', icon: Database, badge: null },
      { name: 'Logs', href: '/admin/logs', icon: FileText, badge: null },
      { name: 'Security', href: '/admin/security', icon: Lock, badge: '2' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { name: 'Announcements', href: '/admin/announcements', icon: Mail, badge: null },
      { name: 'Support Tickets', href: '/admin/tickets', icon: Headphones, badge: '5' },
      { name: 'Email Templates', href: '/admin/emails', icon: MessageSquare, badge: null },
    ]
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check admin access
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('super_admin');
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this area.</p>
          <Button onClick={() => setLocation('/')} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30">
      {/* Top Navigation Bar */}
      <GlassCard depth={1} className="fixed top-0 left-0 right-0 h-16 border-b border-teal-100 z-40">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-600 hover:text-teal-600"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-teal-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text">
                ESA Admin Center
              </span>
              <Badge variant="outline" className="ml-2 border-teal-200 text-teal-700">
                61×21
              </Badge>
            </div>
          </div>

          {/* Center Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, content, or settings..."
                className="pl-10 bg-gray-50 border-gray-200 focus:border-teal-300"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImage} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge className="mt-1 w-fit" variant="outline">
                      {user?.roles?.[0] || 'Admin'}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/admin/audit')}>
                  Audit Logs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-16 bottom-0 bg-white/95 backdrop-blur-sm border-r border-teal-100 transition-all duration-300 z-30",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <ScrollArea className="h-full py-4">
          {navigation.map((section) => (
            <div key={section.title} className="mb-6">
              {!sidebarCollapsed && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <a
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors",
                          "hover:bg-teal-50 hover:text-teal-700",
                          isActive
                            ? "bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border-r-2 border-teal-500"
                            : "text-gray-600"
                        )}
                        data-testid={`admin-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Icon className={cn("w-5 h-5", sidebarCollapsed && "mx-auto")} />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <Badge
                                variant={item.badge === 'Live' ? 'default' : 'secondary'}
                                className={cn(
                                  "ml-auto",
                                  item.badge === 'Live' && "bg-green-500"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className={cn(
        "pt-16 transition-all duration-300",
        sidebarCollapsed ? "pl-16" : "pl-64"
      )}>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}