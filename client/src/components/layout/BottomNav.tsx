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
      {/* Fixed Bottom Navigation - Mobile Only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom"
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
                    "flex flex-col items-center justify-center w-full h-full min-w-[56px] min-h-[56px] rounded-lg transition-colors",
                    "active:scale-95 touch-manipulation",
                    isActive
                      ? "text-red-600 bg-blue-50 dark:bg-gray-800"
                      : "text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800"
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
              "flex flex-col items-center justify-center w-full h-full min-w-[56px] min-h-[56px] rounded-lg transition-colors",
              "text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800",
              "active:scale-95 touch-manipulation"
            )}
            data-testid="nav-menu"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>

        {/* Safe Area Bottom Padding (for iOS notch) */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white dark:bg-gray-900" />
      </nav>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </>
  );
}
