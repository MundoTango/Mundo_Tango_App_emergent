/**
 * J1 Journey: Visitor Landing Page
 * First-time visitor experience showcasing Mundo Tango value proposition
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Calendar, MapPin, Heart } from "lucide-react";
import { Link } from "wouter";

export default function LandingVisitor() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
          Welcome to Mundo Tango
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Connect with the global tango community. Find events, make friends, and dance around the world.
        </p>
        
        <div className="flex gap-4 justify-center mb-16">
          <Link href="/register">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button 
              size="lg" 
              variant="outline"
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          <Card className="p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
            <Users className="h-8 w-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">1,250+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Dancers</div>
          </Card>
          
          <Card className="p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
            <Calendar className="h-8 w-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">45+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Events</div>
          </Card>
          
          <Card className="p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
            <MapPin className="h-8 w-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">28+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cities</div>
          </Card>
          
          <Card className="p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
            <Heart className="h-8 w-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">320+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          </Card>
        </div>

        {/* Features */}
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Everything You Need to Dance
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-left">
            <Calendar className="h-12 w-12 text-teal-600 dark:text-teal-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Find Events</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover milongas, workshops, and festivals near you or around the world.
            </p>
          </Card>
          
          <Card className="p-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-left">
            <Users className="h-12 w-12 text-teal-600 dark:text-teal-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Connect</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Meet dancers, share memories, and build your tango network globally.
            </p>
          </Card>
          
          <Card className="p-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-left">
            <MapPin className="h-12 w-12 text-teal-600 dark:text-teal-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Travel</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Plan your tango travels with local recommendations and community insights.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-12 rounded-2xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Join?
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Create your free account and start connecting with the global tango community today.
          </p>
          <Link href="/register">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
              data-testid="button-join-now"
            >
              Join Mundo Tango Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
