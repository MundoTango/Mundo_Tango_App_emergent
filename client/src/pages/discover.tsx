import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Heart, User, Search, Filter } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import VisitorNavbar from "@/components/visitor/VisitorNavbar";
import VisitorFooter from "@/components/visitor/VisitorFooter";
import { useState, useEffect } from "react";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    document.title = "Discover Events & Memories - Mundo Tango";
  }, []);

  const { data: events, isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ['/api/events', { public: true, limit: 20 }],
  });

  const { data: memories, isLoading: memoriesLoading } = useQuery<any[]>({
    queryKey: ['/api/memories', { public: true, limit: 20 }],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <VisitorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent"
            data-testid="text-discover-title"
          >
            Discover the Tango World
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore public events and memories from the global tango community
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8" data-testid="section-search">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events, cities, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="select-city"
            >
              <option value="">All Cities</option>
              <option value="buenos-aires">Buenos Aires</option>
              <option value="berlin">Berlin</option>
              <option value="paris">Paris</option>
              <option value="new-york">New York</option>
              <option value="london">London</option>
            </select>
          </div>
        </div>

        {/* Join Prompt Banner */}
        <div 
          className="relative mb-8"
          data-testid="banner-join-prompt"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 dark:from-turquoise-900 dark:to-cyan-900 rounded-2xl blur-xl opacity-30" />
          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-2 border-turquoise-200/50 dark:border-turquoise-800/50 text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ✨ Want to see more?
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Join Mundo Tango to access all events, create memories, and connect with dancers worldwide
            </p>
            <Link href="/join">
              <a data-testid="link-banner-join">
                <Button 
                  className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white font-semibold"
                  data-testid="button-banner-join"
                >
                  Join for Free
                </Button>
              </a>
            </Link>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Events */}
          <div data-testid="section-events">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-turquoise-600 dark:text-turquoise-400" />
              Upcoming Events
            </h2>

            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-4">
                {events.slice(0, 10).map((event: any, idx: number) => (
                  <Card 
                    key={event.id || idx}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    data-testid={`card-event-${idx}`}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-lg flex-shrink-0">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg text-gray-900 dark:text-white line-clamp-2 mb-1">
                            {event.title || 'Milonga'}
                          </CardTitle>
                          {event.venue?.location && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{event.venue.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {event.dateTime ? new Date(event.dateTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Date TBA'}
                        </div>
                        <Link href="/join">
                          <a data-testid={`link-event-rsvp-${idx}`}>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="border-turquoise-500 text-turquoise-600 dark:text-turquoise-400 hover:bg-turquoise-50 dark:hover:bg-turquoise-900/20"
                              data-testid={`button-event-rsvp-${idx}`}
                            >
                              RSVP
                            </Button>
                          </a>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No public events available</p>
                </CardContent>
              </Card>
            )}

            {events && events.length >= 10 && (
              <div className="text-center mt-6">
                <Link href="/join">
                  <a data-testid="link-see-more-events">
                    <Button 
                      variant="outline"
                      className="border-2 border-turquoise-500 text-turquoise-600 dark:text-turquoise-400 hover:bg-turquoise-50 dark:hover:bg-turquoise-900/20 font-semibold"
                      data-testid="button-see-more-events"
                    >
                      Join to See More Events
                    </Button>
                  </a>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Memories */}
          <div data-testid="section-memories">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              Recent Memories
            </h2>

            {memoriesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : memories && memories.length > 0 ? (
              <div className="space-y-4">
                {memories.slice(0, 10).map((memory: any, idx: number) => (
                  <Card 
                    key={memory.id || idx}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    data-testid={`card-memory-${idx}`}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex-shrink-0">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardDescription className="text-gray-900 dark:text-white line-clamp-3 text-base">
                            {memory.content || 'A beautiful tango memory'}
                          </CardDescription>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">Anonymous Dancer</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {memory.mediaFiles && memory.mediaFiles.length > 0 && (
                      <CardContent>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-48 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400">📸 Photo</span>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No public memories available</p>
                </CardContent>
              </Card>
            )}

            {memories && memories.length >= 10 && (
              <div className="text-center mt-6">
                <Link href="/join">
                  <a data-testid="link-see-more-memories">
                    <Button 
                      variant="outline"
                      className="border-2 border-turquoise-500 text-turquoise-600 dark:text-turquoise-400 hover:bg-turquoise-50 dark:hover:bg-turquoise-900/20 font-semibold"
                      data-testid="button-see-more-memories"
                    >
                      Join to See More Memories
                    </Button>
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <VisitorFooter />
    </div>
  );
}
