/**
 * J1 Journey: Landing Page for First-Time Visitors
 * MT Ocean theme with glassmorphic design
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Globe, Calendar, Users, Heart } from "lucide-react";

export default function LandingVisitor() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-cyan-600 dark:from-teal-900 dark:to-cyan-950">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white dark:text-teal-100 mb-4">
            Welcome to Mundo Tango
          </h1>
          <p className="text-xl text-white/90 dark:text-teal-200 max-w-2xl mx-auto">
            Join the global tango community. Discover events, connect with dancers, share your passion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 border-white/30" data-testid="card-feature-events">
            <CardHeader>
              <Calendar className="h-12 w-12 text-white dark:text-teal-300 mx-auto" />
              <CardTitle className="text-white dark:text-teal-100 text-center">Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 dark:text-teal-200 text-center">
                Discover milongas and tango events worldwide
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 border-white/30" data-testid="card-feature-community">
            <CardHeader>
              <Users className="h-12 w-12 text-white dark:text-teal-300 mx-auto" />
              <CardTitle className="text-white dark:text-teal-100 text-center">Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 dark:text-teal-200 text-center">
                Connect with dancers from around the globe
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 border-white/30" data-testid="card-feature-memories">
            <CardHeader>
              <Heart className="h-12 w-12 text-white dark:text-teal-300 mx-auto" />
              <CardTitle className="text-white dark:text-teal-100 text-center">Memories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 dark:text-teal-200 text-center">
                Share your tango moments and experiences
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 border-white/30" data-testid="card-feature-global">
            <CardHeader>
              <Globe className="h-12 w-12 text-white dark:text-teal-300 mx-auto" />
              <CardTitle className="text-white dark:text-teal-100 text-center">Global</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 dark:text-teal-200 text-center">
                Travel and dance across continents
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-x-4">
          <Link href="/register">
            <Button 
              size="lg" 
              className="bg-white text-cyan-600 hover:bg-white/90 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-600"
              data-testid="button-join"
            >
              Join Now
            </Button>
          </Link>
          <Link href="/discover">
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 dark:border-teal-300 dark:text-teal-300"
              data-testid="button-discover"
            >
              Discover Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
