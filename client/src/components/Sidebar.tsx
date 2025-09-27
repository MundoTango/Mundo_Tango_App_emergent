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
        } transition-transform duration-300 ease-in-out bg-white w-64 text-gray-800 z-40 border-r border-gray-200 overflow-y-auto shadow-lg`}
      >
        {/* Gradient Header Bar */}
        <div className="h-16 flex justify-between items-center px-4 bg-gradient-to-r from-turquoise-500 to-cyan-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-turquoise-500 font-bold text-sm">
              MT
            </div>
            <div className="text-xl font-bold text-white tracking-wide">
              Mundo Tango
            </div>
          </div>
          <X
            onClick={() => setIsOpen(false)}
            className="cursor-pointer w-5 h-5 lg:hidden text-white hover:text-gray-200 transition-colors"
          />
        </div>

        <nav className="mt-4">
          {/* Mini Profile Section - Simplified */}
          <div className="px-4 mb-6">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                P
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Pierre Dubois</div>
                <div className="text-xs text-gray-600">@pierre_dancer</div>
              </div>
            </div>
            {/* Dance Emojis */}
            <div className="flex gap-1 px-3">
              <span>💃</span>
              <span>🎵</span>
            </div>
          </div>


          {/* Navigation Menu */}
          <div className="px-4 mb-6">
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wide mb-3">Menu</div>
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
                  className={`group flex items-center gap-3 py-2 px-4 rounded-xl cursor-pointer transition-all hover:bg-gray-100 block ${
                    isActive(link)
                      ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-700"
                  }`}
                >
                  <div className={`${isActive(link) ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}>
                    {icon}
                  </div>
                  <div className={`text-sm font-semibold ${isActive(link) ? "text-white" : "group-hover:text-gray-900"} tracking-wide`}>
                    {title}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Global Statistics */}
          <div className="px-4 mb-6">
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wide mb-3">
              {t('community.globalStatistics')}
            </div>
            <div className="space-y-2">
              {globalStats.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    <div className="text-lg font-bold text-gray-700">{item.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Footer */}
          <div className="px-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 text-white text-center">
              <div className="text-xs font-semibold tracking-wide mb-1">Mundo Tango</div>
              <div className="text-xs opacity-90">Global Tango Community</div>
            </div>
          </div>
        </nav>
      </div>
      {isOpen && <div className="lg:w-64" />}
    </>
  );
};

export default Sidebar;