/**
 * Mundo Tango - Bottom Navigation Bar (Mobile)
 * MB.MD TRACK A (S2): Week 1 - Mobile Navigation
 * 
 * Features:
 * - Fixed bottom navigation for mobile only (< 768px)
 * - 5 most-used menu items
 * - Active state highlighting
 * - Icon + label for accessibility
 */

import { Home, Calendar, MessageCircle, User, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onMenuClick?: () => void;
}

const NAV_ITEMS = [
  {
    icon: Home,
    label: "Home",
    path: "/",
  },
  {
    icon: Calendar,
    label: "Events",
    path: "/events",
  },
  {
    icon: MessageCircle,
    label: "Messages",
    path: "/messages",
  },
  {
    icon: User,
    label: "Profile",
    path: "/profile",
  },
] as const;

export default function BottomNav({ onMenuClick }: BottomNavProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Fixed Bottom Navigation - Mobile Only - Aurora Tide Design */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gradient-to-r from-cyan-50/95 via-turquoise-50/95 to-cyan-100/95 dark:from-gray-900/95 dark:via-cyan-900/30 dark:to-gray-900/95 backdrop-blur-xl border-t border-cyan-200/50 dark:border-cyan-800/50 shadow-2xl safe-area-inset-bottom"
        data-testid="bottom-nav"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link href={item.path} key={item.path}>
                <a
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full min-w-[56px] min-h-[56px] rounded-xl transition-all duration-200",
                    "active:scale-95 touch-manipulation backdrop-blur-sm",
                    isActive
                      ? "text-white bg-gradient-to-br from-cyan-500 to-turquoise-600 shadow-lg font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-100/40 dark:hover:bg-cyan-800/30"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}

          {/* Menu Button - Opens Sidebar */}
          <button
            onClick={onMenuClick}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full min-w-[56px] min-h-[56px] rounded-xl transition-all duration-200 backdrop-blur-sm",
              "text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-100/40 dark:hover:bg-cyan-800/30",
              "active:scale-95 touch-manipulation"
            )}
            data-testid="nav-menu"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>

        {/* Safe Area Bottom Padding (for iOS notch) - Aurora Tide */}
        <div className="h-[env(safe-area-inset-bottom)] bg-gradient-to-r from-cyan-50/95 via-turquoise-50/95 to-cyan-100/95 dark:from-gray-900/95 dark:via-cyan-900/30 dark:to-gray-900/95" />
      </nav>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </>
  );
}
