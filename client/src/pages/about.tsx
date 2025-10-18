/**
 * J1 Journey: About Page
 * Information about Mundo Tango platform
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, Globe, Users, Sparkles } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-teal-100 mb-6 text-center">
            About Mundo Tango
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="backdrop-blur-md bg-white/90 dark:bg-black/40" data-testid="card-mission">
              <CardHeader>
                <Heart className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect tango dancers worldwide, share the passion, and grow the community
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/90 dark:bg-black/40" data-testid="card-community">
              <CardHeader>
                <Users className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
                <CardTitle>Global Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Join dancers from every continent sharing events, memories, and friendships
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/90 dark:bg-black/40" data-testid="card-technology">
              <CardHeader>
                <Sparkles className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
                <CardTitle>AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  200+ AI agents enhance your experience with smart recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/90 dark:bg-black/40" data-testid="card-global">
              <CardHeader>
                <Globe className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
                <CardTitle>Worldwide Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Discover milongas, festivals, and workshops in every major city
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/register">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-join-about">
                Join the Community
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
