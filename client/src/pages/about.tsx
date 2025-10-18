import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, Heart, Github, Code, Globe, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import VisitorNavbar from "@/components/visitor/VisitorNavbar";
import VisitorFooter from "@/components/visitor/VisitorFooter";
import { useEffect } from "react";

interface PublicStats {
  users: number;
  events: number;
  cities: number;
  countries: number;
}

export default function About() {
  useEffect(() => {
    document.title = "About Us - Mundo Tango";
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery<PublicStats>({
    queryKey: ['/api/stats/public'],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <VisitorNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Statement */}
        <section className="text-center mb-16" data-testid="section-mission">
          <h1 
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent"
            data-testid="text-mission-title"
          >
            Our Mission
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Building the world's largest and most connected tango community. 
            We believe tango transcends borders, and every dancer deserves 
            a platform to connect, discover, and grow.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-16" data-testid="section-how-it-works">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Sign Up</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your free account in seconds. No credit card required.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Find dancers in your city and around the world. Build your tango network.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Dance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Discover events, share memories, and immerse yourself in the tango lifestyle.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="mb-16" data-testid="section-stats">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 dark:from-turquoise-900 dark:to-cyan-900 rounded-3xl blur-2xl opacity-20" />
            <div className="relative p-8 md:p-12 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-turquoise-200/50 dark:border-turquoise-800/50">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                Our Impact
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-turquoise-600 dark:text-turquoise-400 mb-2" data-testid="stat-users">
                    {statsLoading ? '...' : (stats?.users?.toLocaleString() || '2,500+')}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Dancers</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-cyan-600 dark:text-cyan-400 mb-2" data-testid="stat-events">
                    {statsLoading ? '...' : (stats?.events?.toLocaleString() || '5,000+')}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2" data-testid="stat-cities">
                    {statsLoading ? '...' : (stats?.cities?.toLocaleString() || '150+')}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Cities</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-teal-600 dark:text-teal-400 mb-2" data-testid="stat-countries">
                    {statsLoading ? '...' : (stats?.countries?.toLocaleString() || '45+')}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16" data-testid="section-team">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Our Team
          </h2>
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Built by Dancers, for Dancers</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                Mundo Tango was founded by passionate tango dancers who saw the need 
                for a truly global platform that brings our community together.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                We're a distributed team of volunteers from across the world, united 
                by our love for tango and commitment to open-source development.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Open Source Section */}
        <section className="mb-16" data-testid="section-open-source">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 dark:from-turquoise-900 dark:to-cyan-900 rounded-3xl blur-2xl opacity-20" />
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-2 border-turquoise-200/50 dark:border-turquoise-800/50 text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Github className="h-10 w-10 text-turquoise-600 dark:text-turquoise-400" />
                <Code className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Open Source & Community-Driven
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Mundo Tango is 100% open source. Our code is public, our roadmap is transparent, 
                and our community has a voice in every decision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://github.com/mundotango/platform" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="link-github"
                >
                  <Button 
                    className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold"
                    data-testid="button-github"
                  >
                    <Github className="mr-2 h-5 w-5" />
                    View on GitHub
                  </Button>
                </a>
                <Link href="/volunteer">
                  <a data-testid="link-volunteer">
                    <Button 
                      className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold"
                      data-testid="button-volunteer"
                    >
                      Become a Contributor
                    </Button>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section data-testid="section-support">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Support Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Mundo Tango is free and always will be. Help us keep the lights on and 
                continue building features that serve our community.
              </p>
              <a 
                href="https://gofundme.com/mundotango" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-donate"
              >
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-semibold"
                  data-testid="button-donate"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Support on GoFundMe
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="mt-16 text-center" data-testid="section-final-cta">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Become part of the global tango movement today
          </p>
          <Link href="/join">
            <a data-testid="link-final-cta">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold text-lg px-8 py-6 shadow-lg"
                data-testid="button-final-cta"
              >
                Join Mundo Tango
              </Button>
            </a>
          </Link>
        </section>
      </div>

      <VisitorFooter />
    </div>
  );
}
