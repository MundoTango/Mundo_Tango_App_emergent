import { Button } from "@/components/ui/button";
import { Music, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function VisitorNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav 
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
      data-testid="navbar-visitor"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              data-testid="link-logo"
            >
              <div className="p-2 bg-gradient-to-r from-turquoise-500 to-cyan-600 rounded-lg">
                <Music className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Mundo Tango
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/discover">
              <a 
                className="text-gray-700 dark:text-gray-300 hover:text-turquoise-600 dark:hover:text-turquoise-400 font-medium transition-colors"
                data-testid="link-discover"
              >
                Discover
              </a>
            </Link>
            <Link href="/about">
              <a 
                className="text-gray-700 dark:text-gray-300 hover:text-turquoise-600 dark:hover:text-turquoise-400 font-medium transition-colors"
                data-testid="link-about"
              >
                About
              </a>
            </Link>
            <Link href="/join">
              <a data-testid="link-join-desktop">
                <Button 
                  className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold px-6"
                  data-testid="button-join"
                >
                  Join Now
                </Button>
              </a>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden py-4 space-y-3 border-t border-gray-200 dark:border-gray-800"
            data-testid="menu-mobile"
          >
            <Link href="/discover">
              <a 
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-discover-mobile"
              >
                Discover
              </a>
            </Link>
            <Link href="/about">
              <a 
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-about-mobile"
              >
                About
              </a>
            </Link>
            <Link href="/join">
              <a 
                className="block"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-join-mobile"
              >
                <Button 
                  className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold"
                  data-testid="button-join-mobile"
                >
                  Join Now
                </Button>
              </a>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
