import {
  Home,
  Calendar,
  MessageCircle,
  User,
  Users,
  Settings,
  Menu,
  Heart,
  MapPin,
  Trophy,
  CalendarDays,
  Building,
  Globe,
  Search,
  CreditCard,
  Shield,
  BarChart3,
  Brain,
  HelpCircle,
  FileText,
  Briefcase,
  School,
  Camera,
  Map,
  DollarSign,
  BookOpen,
  Compass,
  TrendingUp,
  Bell,
  Key,
  Activity
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next';;

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClose?: () => void;
}

// TRACK A: Hamburger menu toggle for mobile
function MobileHamburgerToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      data-testid="button-mobile-menu"
      aria-label="Toggle navigation menu"
    >
      <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
    </button>
  );
}

// Organized navigation structure for Mundo Tango ESA LIFE CEO platform (72 pages)
const SIDEBAR_SECTIONS = [
  {
    title: "Main",
    routes: [
      { title: "Feed", icon: <Home className="w-5 h-5" />, link: "/memories" },
      { title: "Profile", icon: <User className="w-5 h-5" />, link: "/profile" },
      { title: "Search", icon: <Search className="w-5 h-5" />, link: "/search" },
      { title: "Settings", icon: <Settings className="w-5 h-5" />, link: "/settings" },
      { title: "Notifications", icon: <Bell className="w-5 h-5" />, link: "/notifications" },
    ]
  },
  {
    title: "Content & Timeline",
    routes: [
      { title: "Memories", icon: <Camera className="w-5 h-5" />, link: "/memories" },
      { title: "Timeline", icon: <Calendar className="w-5 h-5" />, link: "/enhanced-timeline" },
      { title: "Explore", icon: <Compass className="w-5 h-5" />, link: "/explore" },
      { title: "Trending", icon: <TrendingUp className="w-5 h-5" />, link: "/trending" },
    ]
  },
  {
    title: "Events",
    routes: [
      { title: "All Events", icon: <CalendarDays className="w-5 h-5" />, link: "/events" },
      { title: "Discover", icon: <Globe className="w-5 h-5" />, link: "/events/discover" },
      { title: "My Events", icon: <Calendar className="w-5 h-5" />, link: "/my-events" },
      { title: "Calendar", icon: <Calendar className="w-5 h-5" />, link: "/events/calendar" },
      { title: "Teacher", icon: <School className="w-5 h-5" />, link: "/teacher" },
      { title: "Organizer", icon: <Briefcase className="w-5 h-5" />, link: "/organizer" },
    ]
  },
  {
    title: "Social",
    routes: [
      { title: "Messages", icon: <MessageCircle className="w-5 h-5" />, link: "/messages" },
      { title: "Friends", icon: <Users className="w-5 h-5" />, link: "/friends" },
      { title: "Friend Requests", icon: <Heart className="w-5 h-5" />, link: "/friends/requests" },
      { title: "Groups", icon: <Users className="w-5 h-5" />, link: "/groups" },
      { title: "Invitations", icon: <Heart className="w-5 h-5" />, link: "/invitations" },
    ]
  },
  {
    title: "Community",
    routes: [
      { title: "Community Hub", icon: <Globe className="w-5 h-5" />, link: "/community" },
      { title: "World Map", icon: <Map className="w-5 h-5" />, link: "/community-world-map" },
      { title: "Cities", icon: <Building className="w-5 h-5" />, link: "/community/cities" },
      { title: "Statistics", icon: <BarChart3 className="w-5 h-5" />, link: "/community/statistics" },
      { title: "Leaderboard", icon: <Trophy className="w-5 h-5" />, link: "/community/leaderboard" },
      { title: "Ambassadors", icon: <Trophy className="w-5 h-5" />, link: "/community/ambassadors" },
      { title: "Tango Stories", icon: <FileText className="w-5 h-5" />, link: "/tango-stories" },
      { title: "Tango Communities", icon: <MapPin className="w-5 h-5" />, link: "/tango-communities" },
    ]
  },
  {
    title: "Housing",
    routes: [
      { title: "Marketplace", icon: <Building className="w-5 h-5" />, link: "/housing-marketplace" },
      { title: "Listings", icon: <Building className="w-5 h-5" />, link: "/housing/listings" },
      { title: "Bookings", icon: <Calendar className="w-5 h-5" />, link: "/housing/bookings" },
      { title: "Host Onboarding", icon: <Home className="w-5 h-5" />, link: "/host-onboarding" },
      { title: "Guest Onboarding", icon: <Users className="w-5 h-5" />, link: "/guest-onboarding" },
    ]
  },
  {
    title: "Professional",
    routes: [
      { title: "Professional", icon: <Briefcase className="w-5 h-5" />, link: "/professional" },
      { title: "Professional Groups", icon: <Users className="w-5 h-5" />, link: "/professional/groups" },
      { title: "Opportunities", icon: <TrendingUp className="w-5 h-5" />, link: "/professional/opportunities" },
    ]
  },
  {
    title: "Learning",
    routes: [
      { title: "Resources", icon: <BookOpen className="w-5 h-5" />, link: "/resources" },
      { title: "Tutorials", icon: <BookOpen className="w-5 h-5" />, link: "/tutorials" },
      { title: "Guides", icon: <FileText className="w-5 h-5" />, link: "/guides" },
      { title: "Academy", icon: <School className="w-5 h-5" />, link: "/academy" },
      { title: "Certification", icon: <Trophy className="w-5 h-5" />, link: "/certification" },
      { title: "FAQ", icon: <HelpCircle className="w-5 h-5" />, link: "/faq" },
      { title: "Help Center", icon: <HelpCircle className="w-5 h-5" />, link: "/help" },
    ]
  },
  {
    title: "Billing",
    routes: [
      { title: "Subscription", icon: <CreditCard className="w-5 h-5" />, link: "/subscribe" },
      { title: "Billing", icon: <DollarSign className="w-5 h-5" />, link: "/settings/billing" },
      { title: "Plans", icon: <FileText className="w-5 h-5" />, link: "/plans" },
      { title: "Payment Methods", icon: <CreditCard className="w-5 h-5" />, link: "/payment-methods" },
      { title: "Invoices", icon: <FileText className="w-5 h-5" />, link: "/invoices" },
      { title: "Usage", icon: <Activity className="w-5 h-5" />, link: "/usage" },
    ]
  },
  {
    title: "Platform",
    routes: [
      { title: "Life CEO", icon: <Brain className="w-5 h-5" />, link: "/life-ceo" },
      { title: "Life CEO Agents", icon: <Brain className="w-5 h-5" />, link: "/lifeceo/agents" },
      { title: "Life CEO Insights", icon: <Brain className="w-5 h-5" />, link: "/lifeceo/insights" },
      { title: "Analytics", icon: <BarChart3 className="w-5 h-5" />, link: "/analytics" },
      { title: "Statistics", icon: <BarChart3 className="w-5 h-5" />, link: "/stats" },
      { title: "Travel Planner", icon: <MapPin className="w-5 h-5" />, link: "/travel-planner" },
      { title: "Mobile App", icon: <Trophy className="w-5 h-5" />, link: "/mobile-dashboard" },
      { title: "Integrations", icon: <Key className="w-5 h-5" />, link: "/integrations" },
      { title: "API Settings", icon: <Key className="w-5 h-5" />, link: "/settings/api" },
    ]
  },
  {
    title: "User Settings",
    routes: [
      { title: "Preferences", icon: <Settings className="w-5 h-5" />, link: "/preferences" },
      { title: "Activity", icon: <Activity className="w-5 h-5" />, link: "/activity" },
      { title: "Privacy", icon: <Shield className="w-5 h-5" />, link: "/privacy" },
      { title: "Data Export", icon: <FileText className="w-5 h-5" />, link: "/data-export" },
    ]
  },
  {
    title: "Admin",
    adminOnly: true,
    routes: [
      { title: "Admin Center", icon: <Shield className="w-5 h-5" />, link: "/admin" },
      { title: "Users", icon: <Users className="w-5 h-5" />, link: "/admin/users" },
      { title: "Content", icon: <FileText className="w-5 h-5" />, link: "/admin/content" },
      { title: "Reports", icon: <BarChart3 className="w-5 h-5" />, link: "/admin/reports" },
      { title: "Admin Settings", icon: <Settings className="w-5 h-5" />, link: "/admin/settings" },
      { title: "Analytics", icon: <BarChart3 className="w-5 h-5" />, link: "/admin/analytics" },
      { title: "Moderation", icon: <Shield className="w-5 h-5" />, link: "/admin/moderation" },
      { title: "Audit", icon: <FileText className="w-5 h-5" />, link: "/admin/audit" },
      { title: "Features", icon: <Settings className="w-5 h-5" />, link: "/admin/features" },
      { title: "System", icon: <Settings className="w-5 h-5" />, link: "/admin/system" },
      { title: "Communications", icon: <MessageCircle className="w-5 h-5" />, link: "/admin/communications" },
      { title: "Hierarchy", icon: <Users className="w-5 h-5" />, link: "/hierarchy" },
      { title: "Project Tracker", icon: <Briefcase className="w-5 h-5" />, link: "/project-tracker" },
    ]
  },
  {
    title: "Legal",
    routes: [
      { title: "Terms", icon: <FileText className="w-5 h-5" />, link: "/terms" },
      { title: "Privacy Policy", icon: <Shield className="w-5 h-5" />, link: "/privacy-policy" },
      { title: "Code of Conduct", icon: <FileText className="w-5 h-5" />, link: "/code-of-conduct" },
    ]
  }
];

export default function Sidebar({ isOpen, setIsOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [mundoTangoDetails, setMundoTangoDetails] = useState({
    dancer_count: 1250,
    events_count: 45,
    user_count: 2890,
    dancer_city_count: 89
  });

  const GROUPS = [
    {
      title: "Dancers around world",
      count: mundoTangoDetails.dancer_count,
    },
    {
      title: "Events around world",
      count: mundoTangoDetails.events_count,
    },
    {
      title: "Users around world",
      count: mundoTangoDetails.user_count,
    },
    {
      title: "Dancers in your city",
      count: mundoTangoDetails.dancer_city_count,
    },
  ];

  const isActive = (path: string) => {
    return path === location;
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
    onClose?.();
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(t => t !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsOpen]);

  // Check if user is admin (uses customerJourneyState J4 = Super Admin or tangoRoles)
  const isAdmin = user?.customerJourneyState === 'J4' || 
                  (user?.tangoRoles as string[])?.includes('admin') || 
                  (user?.tangoRoles as string[])?.includes('super_admin') || 
                  false;

  // Auto-expand sections with active routes
  useEffect(() => {
    SIDEBAR_SECTIONS.forEach(section => {
      if (section.routes.some(route => isActive(route.link))) {
        setExpandedSections(prev => 
          prev.includes(section.title) ? prev : [...prev, section.title]
        );
      }
    });
  }, [location]);

  return (
    <div onClick={onClose}>
      <div
        className={cn(
          "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out bg-gradient-to-br from-cyan-50/95 via-turquoise-50/95 to-cyan-100/95 dark:from-gray-900/95 dark:via-cyan-900/30 dark:to-gray-900/95 backdrop-blur-xl w-64 text-gray-800 dark:text-white z-20 border-r-2 border-cyan-200/50 dark:border-cyan-800/50 overflow-y-auto shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex justify-center items-center border-b-2 border-cyan-200/50 dark:border-cyan-800/50 bg-gradient-to-r from-cyan-400 to-turquoise-500 text-white font-bold text-xl gap-6 shadow-lg">
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 min-h-[44px] min-w-[44px]"
              data-testid="button-close-sidebar"
              aria-label="Close sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div>Mundo Tango</div>
        </div>

        <nav className="mt-4">
          {/* User Profile Section - Aurora Tide Design */}
          <div className="px-4 mb-6">
            <Link href="/profile?tab=memories">
              <div 
                className="text-gray-900 dark:text-white flex items-center gap-4 cursor-pointer hover:bg-white/40 dark:hover:bg-cyan-800/30 rounded-xl p-3 transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-cyan-300/50 hover:shadow-lg min-h-[44px]" 
                onClick={handleLinkClick}
                data-testid="link-user-profile"
              >
                <Avatar className="h-10 w-10 border-2 border-cyan-400 shadow-md">
                  <AvatarImage
                    src={user?.profileImage || "/images/default-avatar.svg"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-turquoise-600 text-white font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{user?.name || "User"}</div>
                  <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                    {user?.username ? `@${user.username}` : "@user"}
                  </div>
                  {/* User role emojis */}
                  {user && (
                    <div className="mt-1 flex gap-1">
                      <span title="Teacher">👩‍🏫</span>
                      <span title="Novice">🆕</span>
                      <span title="Leader">👑</span>
                      <span title="Follower">👥</span>
                      <span title="Organizer">🎭</span>
                      <span title="Enthusiast">🔥</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Sections */}
          {SIDEBAR_SECTIONS.map((section, sectionIndex) => {
            // Skip admin section if user is not admin
            if (section.adminOnly && !isAdmin) return null;

            const isExpanded = expandedSections.includes(section.title);
            const hasActiveRoute = section.routes.some(route => isActive(route.link));

            return (
              <div key={sectionIndex} className="mb-4">
                <div 
                  className="px-6 mb-2 text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider cursor-pointer flex items-center justify-between hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors min-h-[44px] items-center"
                  onClick={() => toggleSection(section.title)}
                  data-testid={`section-toggle-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className={cn(hasActiveRoute && "text-turquoise-600 dark:text-turquoise-400")}>{section.title}</span>
                  <span className="text-sm font-bold">{isExpanded ? '−' : '+'}</span>
                </div>
                {isExpanded && section.routes.map(({ icon, title, link }, index) => (
                  <Link href={link} key={index}>
                    <div className="py-1 cursor-pointer select-none">
                      <div
                        onClick={handleLinkClick}
                        className={cn(
                          "group flex gap-3 items-center py-2 px-6 transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-100/60 hover:to-turquoise-100/60 dark:hover:from-cyan-800/40 dark:hover:to-turquoise-800/40 hover:text-cyan-700 dark:hover:text-cyan-300 rounded-lg mx-2 backdrop-blur-sm min-h-[44px]",
                          isActive(link)
                            ? "text-white bg-gradient-to-r from-cyan-500 to-turquoise-600 font-bold shadow-lg border-r-4 border-turquoise-400"
                            : "text-gray-700 dark:text-gray-300"
                        )}
                        data-testid={`link-${link.replace(/\//g, '-')}`}
                      >
                        <div className="group-hover:scale-110 transition-transform w-6">{icon}</div>
                        <div className="text-sm font-medium">{title}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            );
          })}

          {/* Mundo Tango Statistics - Aurora Tide */}
          <div className="px-6 my-6 text-gray-900 dark:text-white space-y-4">
            <div className="uppercase text-cyan-700 dark:text-cyan-400 font-bold text-xs tracking-wider">
              Global Statistics
            </div>
            {GROUPS.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 cursor-pointer select-none hover:bg-white/30 dark:hover:bg-cyan-800/20 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm group"
                data-testid={`stat-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="bg-gradient-to-br from-cyan-500 to-turquoise-600 text-white rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                  <div className="w-14 h-11 flex items-center justify-center text-sm font-bold">
                    {item.count}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</div>
              </div>
            ))}
          </div>
        </nav>
      </div>
      
      {/* TRACK A: Hamburger menu toggle for mobile (shows when sidebar closed) */}
      {!isOpen && <MobileHamburgerToggle onClick={() => setIsOpen(true)} />}
      
      {isOpen && <div className="lg:w-64" />}
    </div>
  );
}