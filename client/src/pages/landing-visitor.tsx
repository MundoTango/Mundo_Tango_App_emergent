import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MapPin, Heart, Sparkles, TrendingUp } from "lucide-react";
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

export default function LandingVisitor() {
  useEffect(() => {
    document.title = "Mundo Tango - Connect with Tangueros Worldwide";
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery<PublicStats>({
    queryKey: ['/api/stats/public'],
  });

  const { data: featuredEvents, isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ['/api/events', { public: true, limit: 5 }],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <VisitorNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 dark:from-turquoise-900 dark:to-cyan-900 opacity-20 blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-8">
            {/* Headline */}
            <h1 
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent leading-tight"
              data-testid="text-headline"
            >
              Connect with Tangueros
              <br />
              Worldwide
            </h1>

            {/* Subtitle */}
            <p 
              className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
              data-testid="text-subtitle"
            >
              Join the global tango community. Find milongas, share memories, and connect with dancers in over {stats?.cities || 150}+ cities.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/join">
                <a data-testid="link-cta-join">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    data-testid="button-cta-join"
                  >
                    Join Now - It's Free
                  </Button>
                </a>
              </Link>
              <Link href="/discover">
                <a data-testid="link-cta-discover">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-turquoise-500 text-turquoise-600 dark:text-turquoise-400 hover:bg-turquoise-50 dark:hover:bg-turquoise-900/20 font-semibold text-lg px-8 py-6"
                    data-testid="button-cta-discover"
                  >
                    Discover Events
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="section-value-props">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Connect */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div 
                className="w-16 h-16 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                data-testid="icon-connect"
              >
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-center text-base">
                Find and connect with dancers worldwide. Build your tango network across cities and countries.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Discover */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div 
                className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                data-testid="icon-discover"
              >
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Discover</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-center text-base">
                Explore milongas, workshops, and festivals happening in your city and around the world.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Grow */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div 
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                data-testid="icon-grow"
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Grow</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-center text-base">
                Share your journey, document memories, and grow as a dancer with a supportive global community.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="section-stats">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 dark:from-turquoise-900 dark:to-cyan-900 rounded-3xl blur-2xl opacity-20" />
          <div className="relative p-8 md:p-12 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-turquoise-200/50 dark:border-turquoise-800/50">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Join Thousands of Tangueros
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-turquoise-600 dark:text-turquoise-400 mb-2" data-testid="stat-users">
                  {statsLoading ? '...' : (stats?.users?.toLocaleString() || '2,500+')}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Dancers</div>
              </div>

              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-cyan-600 dark:text-cyan-400 mb-2" data-testid="stat-events">
                  {statsLoading ? '...' : (stats?.events?.toLocaleString() || '5,000+')}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Events</div>
              </div>

              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2" data-testid="stat-cities">
                  {statsLoading ? '...' : (stats?.cities?.toLocaleString() || '150+')}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Cities</div>
              </div>

              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-teal-600 dark:text-teal-400 mb-2" data-testid="stat-countries">
                  {statsLoading ? '...' : (stats?.countries?.toLocaleString() || '45+')}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="section-featured-events">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover milongas and workshops happening worldwide
          </p>
        </div>

        {eventsLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : featuredEvents && featuredEvents.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredEvents.slice(0, 3).map((event: any, idx: number) => (
              <Card 
                key={event.id || idx} 
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                data-testid={`card-event-${idx}`}
              >
                <CardHeader>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-white line-clamp-2">
                        {event.title || 'Milonga'}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.venue?.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.venue.location}</span>
                    </div>
                  )}
                  {event.dateTime && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(event.dateTime).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/discover">
            <a data-testid="link-view-all-events">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold"
                data-testid="button-view-all-events"
              >
                View All Events
              </Button>
            </a>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="section-final-cta">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 dark:from-turquoise-900 dark:to-cyan-900 rounded-3xl blur-2xl opacity-30" />
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 text-center border-2 border-turquoise-200/50 dark:border-turquoise-800/50">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-turquoise-600 dark:text-turquoise-400" />
              <Sparkles className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Ready to Join?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Create your free account and start connecting with tangueros worldwide. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join">
                <a data-testid="link-final-cta-join">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold text-lg px-8 py-6 shadow-lg"
                    data-testid="button-final-cta-join"
                  >
                    Create Free Account
                  </Button>
                </a>
              </Link>
              <Link href="/about">
                <a data-testid="link-final-cta-about">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-turquoise-500 text-turquoise-600 dark:text-turquoise-400 hover:bg-turquoise-50 dark:hover:bg-turquoise-900/20 font-semibold text-lg px-8 py-6"
                    data-testid="button-final-cta-about"
                  >
                    Learn More
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <VisitorFooter />
    </div>
  );
}
