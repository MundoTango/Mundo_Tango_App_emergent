import { Bell, Menu, Search, MessageCircle, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useState } from "react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    // Clear any local storage data
    localStorage.clear();

    // Redirect to auth logout endpoint which will clear the session and redirect to home
    window.location.href = '/api/auth/logout';
  };
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-[var(--color-surface)] dark:bg-gray-900 h-16 border-b-2 border-[var(--color-border)] transition-all flex items-center gap-3 p-3 md:p-5 select-none">
      <div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="p-2" data-testid="button-p-2">

          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts, events, people..."
            className="pl-10 bg-[var(--color-surface-elevated)] border-gray-300 dark:border-gray-600 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-pl-10" />

          {searchQuery &&
          <div className="absolute w-full max-h-96 overflow-y-auto left-0 top-full mt-1 bg-[var(--color-surface)] dark:bg-gray-900 rounded-lg border border-[var(--color-border)] shadow-lg z-50">
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-2">Posts</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--color-surface-elevated)] rounded cursor-pointer">
                      <img src="/api/placeholder/32/32" className="w-8 h-8 rounded-full object-cover" / alt="Image">
                      <span className="text-sm">Sample post content...</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-2">Groups</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--color-surface-elevated)] rounded cursor-pointer">
                      <img src="/api/placeholder/32/32" className="w-8 h-8 rounded-full object-cover" / alt="Image">
                      <span className="text-sm">Tango Buenos Aires</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-2">Friends</h3>
                  <div className="space-y-2">
                    <div
                    className="flex items-center gap-2 p-2 hover:bg-[var(--color-surface-elevated)] rounded cursor-pointer"
                    onClick={() => window.location.href = '/profile/1'}>

                      <img src="/api/placeholder/32/32" className="w-8 h-8 rounded-full object-cover" / alt="Image">
                      <span className="text-sm">Maria Rodriguez</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-2">Events</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--color-surface-elevated)] rounded cursor-pointer">
                      <img src="/api/placeholder/32/32" className="w-8 h-8 rounded-full object-cover" / alt="Image">
                      <span className="text-sm">Milonga Night</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <div className="mr-1 md:mr-4 flex items-center md:space-x-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-relative">
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
          
          <div>
            <Button variant="ghost" size="icon" asChild data-testid="button-element">
              <Link href="/messages" data-testid="link-element">
                <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Link>
            </Button>
          </div>
          
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-relative">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer pl-2 md:pl-0 flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.profileImage || "/images/user-placeholder.jpeg"}
                  className="object-cover" />

                <AvatarFallback className="bg-red-600 text-white">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="p-2">
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem className="font-semibold text-[var(--color-text-secondary)] px-3 py-3">
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem className="font-semibold text-[var(--color-text-secondary)] px-3 py-3">
              FAQs
            </DropdownMenuItem>
            <DropdownMenuItem className="font-semibold text-[var(--color-text-secondary)] px-3 py-3">
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuItem className="font-semibold text-[var(--color-text-secondary)] px-3 py-3">
              Privacy Policy
            </DropdownMenuItem>
            <DropdownMenuItem className="font-semibold text-[var(--color-text-secondary)] px-3 py-3">
              Terms & Conditions
            </DropdownMenuItem>
            <DropdownMenuItem
              className="font-semibold text-red-600 px-3 py-3"
              onClick={handleLogout}>

              Logout
            </DropdownMenuItem>
            <DropdownMenuItem className="font-semibold text-red-600 px-3 py-3">
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>);

}