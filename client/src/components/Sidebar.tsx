import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/config';
import TenantSwitcher from './TenantSwitcher';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';
import { 
  Heart, 
  UsersRound, 
  UserCheck, 
  Calendar, 
  Network,
  X,
  Mail,
  BookOpen,
  BarChart3,
  Sparkles,
  MapPin,
  Shield,
  Crown,
  Settings,
  MessageCircle,
  Brain
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();

  // ESA Framework Navigation Routes - Cleaned per user requirements
  const sidebarRoutes = [
    {
      icon: <Heart className="w-5 h-5" />,
      title: t('navigation.memories'),
      link: "/memories",
    },
    {
      icon: <UsersRound className="w-5 h-5" />,
      title: t('navigation.tangoCommunity'), 
      link: "/community-world-map",  // ESA LIFE CEO 56x21 - Direct to world map
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: t('navigation.friends'),
      link: "/friends",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: t('navigation.messages'),
      link: "/messages",
    },
    {
      icon: <Network className="w-5 h-5" />,
      title: t('navigation.groups'),
      link: "/groups",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: t('navigation.events'),
      link: "/events",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: t('navigation.roleInvitations'),
      link: "/invitations",
    },
  ];

  // Use standard sidebar routes
  const allRoutes = [...sidebarRoutes];

  // Fetch real statistics from API
  const { data: statsData } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Mundo Tango Global Statistics with real data
  const stats = statsData as any;
  
  // Function to format numbers with locale-specific formatting
  const formatStatNumber = (value: number | undefined, defaultValue: string) => {
    if (!value && value !== 0) return defaultValue;
    
    // Get current language from i18n
    const locale = i18n.language || 'en';
    
    // Use Intl.NumberFormat for locale-specific formatting
    if (value >= 1000) {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
      }).format(value);
    }
    
    return new Intl.NumberFormat(locale).format(value);
  };
  
  const globalStats = [
    {
      title: t('community.globalDancers'),
      count: formatStatNumber(stats?.totalUsers, "3.2K"),
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      title: t('community.activeEvents'), 
      count: formatStatNumber(stats?.activeEvents, "945"),
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      title: t('community.communities'),
      count: formatStatNumber(stats?.totalGroups, "6.8K"),
      icon: <UsersRound className="w-4 h-4" />,
    },
    {
      title: t('community.yourCity'),
      count: formatStatNumber(stats?.userCityMembers, "184"),
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  const isActive = (path: string) => {
    return path === location;
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

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out bg-ocean-gradient w-64 text-ocean z-40 overflow-y-auto shadow-ocean-lg`}
      >
        {/* Ocean Header - Simplified */}
        <div className="h-16 flex justify-between items-center px-4 border-b border-ocean-divider">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-lg bg-brand-icon">
              MT
            </div>
            <div className="text-lg font-bold tracking-wide text-ocean">
              Mundo Tango
            </div>
          </div>
          <X
            onClick={() => setIsOpen(false)}
            className="cursor-pointer w-5 h-5 lg:hidden text-ocean-secondary hover:opacity-70 transition-opacity"
          />
        </div>

        <nav className="mt-6 px-4">
          {/* Mini Profile Section - Clickable Link to Profile */}
          <Link 
            href={user ? `/profile/${user.id}` : '/profile'}
            className="block mb-6 p-3 rounded-xl bg-profile-card cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:bg-opacity-90 group"
            data-testid="link-user-profile"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md bg-brand-gradient transition-transform group-hover:scale-110">
                {user?.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ocean group-hover:text-seafoam transition-colors">
                  {user?.name || 'Pierre Dubois'}
                </div>
                <div className="text-xs text-ocean-muted group-hover:text-ocean-secondary transition-colors">
                  @{user?.username || 'pierre_dancer'}
                </div>
              </div>
            </div>
            {/* Dance Emojis with Role Display */}
            <div className="flex gap-2 mt-2 pl-1 text-lg opacity-90 group-hover:opacity-100 transition-opacity">
              {user?.tangoRoles && user.tangoRoles.length > 0 ? (
                <RoleEmojiDisplay 
                  tangoRoles={user.tangoRoles} 
                  leaderLevel={user.leaderLevel}
                  followerLevel={user.followerLevel}
                  size="lg" 
                />
              ) : (
                <>
                  <span>💃</span>
                  <span>🎵</span>
                </>
              )}
            </div>
          </Link>

          {/* Navigation Menu - Ocean Styled */}
          <div className="mb-6">
            <div className="text-xs uppercase font-semibold tracking-wider mb-3 px-2 text-ocean-muted">
              Menu
            </div>
            <div className="space-y-1">
              {allRoutes.map(({ icon, title, link }, index) => (
                <Link
                  key={index}
                  href={link}
                  onClick={(e) => {
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className={`group flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-all block text-ocean-secondary hover-ocean-light ${
                    isActive(link) ? 'active-ocean' : ''
                  }`}
                >
                  <div className="transition-transform group-hover:scale-110">
                    {icon}
                  </div>
                  <div className="text-sm font-medium tracking-wide">
                    {title}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Global Statistics - All 4 Stats */}
          <div className="mb-6">
            <div className="text-xs uppercase font-semibold tracking-wider mb-3 px-2 text-brand-gradient">
              {t('community.globalStatistics')}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {globalStats.map((item, index) => (
                <button
                  key={index}
                  className="p-3 rounded-lg cursor-pointer transition-all hover:scale-105 bg-stat-card focus:outline-none focus:ring-2 focus:ring-ocean-focus focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label={`${item.title}: ${item.count}`}
                  tabIndex={0}
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg mb-2 mx-auto bg-stat-icon">
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <div className="text-xs mb-1 text-ocean-muted">
                      {item.title}
                    </div>
                    <div className="text-lg font-bold text-seafoam">
                      {item.count}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer - MT Ocean Branding */}
          <div className="mb-4 p-4 rounded-xl text-center bg-footer-brand">
            <div className="text-xs font-semibold tracking-wide mb-1 text-ocean">
              Mundo Tango
            </div>
            <div className="text-xs text-ocean-muted">
              Global Tango Community
            </div>
          </div>
        </nav>
      </div>
      {isOpen && <div className="lg:w-64" />}
    </>
  );
};

export default Sidebar;
