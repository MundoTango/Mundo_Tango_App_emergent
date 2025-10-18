/**
 * Landing Visitor Page
 * J1 - First-Time Visitor Journey (Public)
 * 
 * This is the public-facing landing page for first-time visitors
 * Different from landing.tsx which is for authenticated users
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, Calendar, MapPin, Heart, Globe, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function LandingVisitor() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 opacity-20 blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            {/* Logo/Icon */}
            <div className="flex justify-center">
              <div className="p-6 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-3xl shadow-2xl animate-float">
                <Music className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Welcome to Mundo Tango
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Connect with the global tango community. Share memories, discover events, and dance with passion.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/join">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  data-testid="button-join-now"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Join Mundo Tango
                </Button>
              </Link>

              <Link href="/discover">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-turquoise-500 text-turquoise-700 dark:text-turquoise-400 hover:bg-turquoise-50 dark:hover:bg-turquoise-900/20 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="button-discover"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Discover Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for Tango
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your complete platform for the tango community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Share Memories */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Share Memories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center text-lg">
                Document and share your beautiful tango moments with dancers worldwide.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 2: Find Events */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Find Events</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center text-lg">
                Discover milongas, workshops, and festivals happening near you.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 3: Connect Globally */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Connect Globally</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center text-lg">
                Join a vibrant global community of tango dancers and enthusiasts.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 4: Local Communities */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-turquoise-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Local Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center text-lg">
                Find and join tango communities in your city and around the world.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 5: AI Assistance */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">AI Assistance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center text-lg">
                Get personalized recommendations and insights powered by 276 AI agents.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 6: Your Journey */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Your Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center text-lg">
                From beginner to expert, we support your tango journey every step of the way.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-turquoise-500 via-cyan-500 to-blue-500 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Tango Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of dancers already part of the Mundo Tango community
          </p>
          <Link href="/join">
            <Button 
              size="lg" 
              className="bg-white text-turquoise-600 hover:bg-gray-100 px-12 py-6 text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
              data-testid="button-join-footer"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-6">
            <Link href="/about">
              <a className="text-gray-400 hover:text-white transition-colors">About</a>
            </Link>
            <Link href="/discover">
              <a className="text-gray-400 hover:text-white transition-colors">Discover</a>
            </Link>
            <Link href="/code-of-conduct">
              <a className="text-gray-400 hover:text-white transition-colors">Code of Conduct</a>
            </Link>
          </div>
          <p className="text-gray-400">
            © 2025 Mundo Tango. Connecting dancers worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
