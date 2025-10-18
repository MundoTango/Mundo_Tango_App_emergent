/**
 * Landing Page for Visitors (J1: New User Journey)
 * Public landing page for non-authenticated users
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Music, Users, MapPin, Calendar } from "lucide-react";

export default function LandingVisitor() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent" data-testid="text-hero-title">
            Welcome to Mundo Tango
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8" data-testid="text-hero-subtitle">
            Connect with the global tango community
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12" data-testid="text-hero-description">
            Discover events, share memories, and connect with dancers worldwide
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8" data-testid="button-join">
                Join Now
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-login">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90" data-testid="card-feature-events">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Events</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover tango events happening near you
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90" data-testid="card-feature-community">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with 1,250+ dancers worldwide
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90" data-testid="card-feature-memories">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Memories</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share your tango journey and moments
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90" data-testid="card-feature-global">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global</h3>
            <p className="text-gray-600 dark:text-gray-400">
              145 cities across 68 countries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
