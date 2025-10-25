import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, MapPin, Users, Clock, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  country: string;
  eventType: string;
  organizerId: number;
  maxAttendees: number | null;
  price: number | null;
  currency: string;
  imageUrl: string | null;
  attendeeCount?: number;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Fetch events (MB.MD SIMULTANEOUS: Use default fetcher)
  const { data: events, isLoading} = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Filter events
  const filteredEvents = events?.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || event.eventType === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section - Mobile Optimized */}
        <div className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Tango Events</h1>
                <p className="text-turquoise-100 text-sm sm:text-base">
                  Discover milongas, workshops, and festivals near you
                </p>
              </div>
              <Link href="/events/create">
                <Button
                  className="bg-white text-turquoise-600 hover:bg-turquoise-50 whitespace-nowrap w-full sm:w-auto"
                  data-testid="button-create-event"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters - Mobile First */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full min-h-[44px]"
                data-testid="input-search-events"
              />
            </div>

            {/* Filter Buttons - Horizontal Scroll on Mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {["all", "milonga", "workshop", "festival", "practice"].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  onClick={() => setFilterType(type)}
                  className="capitalize whitespace-nowrap min-w-[80px] min-h-[44px]"
                  data-testid={`filter-${type}`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Event Grid - Responsive */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No events found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6 text-sm sm:text-base px-4">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Be the first to create an event!"}
              </p>
              <Link href="/events/create">
                <Button
                  data-testid="button-create-first-event"
                  className="min-h-[44px]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredEvents.map((event) => (
                <Link href={`/events/${event.id}`} key={event.id}>
                  <Card
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    data-testid={`event-card-${event.id}`}
                  >
                  {/* Event Image */}
                  {event.imageUrl ? (
                    <div className="h-40 sm:h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-40 sm:h-48 bg-gradient-to-br from-turquoise-400 to-cyan-500 flex items-center justify-center">
                      <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-50" />
                    </div>
                  )}

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle 
                          className="text-base sm:text-lg line-clamp-2 flex-1"
                          data-testid={`event-title-${event.id}`}
                        >
                          {event.title}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="capitalize shrink-0 text-xs"
                          data-testid={`event-type-${event.id}`}
                        >
                          {event.eventType}
                        </Badge>
                      </div>
                      <CardDescription 
                        className="line-clamp-2 text-sm"
                        data-testid={`event-description-${event.id}`}
                      >
                        {event.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm">
                      {/* Date and Time */}
                      <div 
                        className="flex items-center text-gray-600 dark:text-gray-400"
                        data-testid={`event-datetime-${event.id}`}
                      >
                        <Clock className="w-4 h-4 mr-2 shrink-0" />
                        <span className="truncate">
                          {formatDate(event.startDate)} at {formatTime(event.startDate)}
                        </span>
                      </div>

                      {/* Location */}
                      <div 
                        className="flex items-center text-gray-600 dark:text-gray-400"
                        data-testid={`event-location-${event.id}`}
                      >
                        <MapPin className="w-4 h-4 mr-2 shrink-0" />
                        <span className="truncate">
                          {event.city}, {event.country}
                        </span>
                      </div>

                      {/* Attendees and Price */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div 
                          className="flex items-center text-gray-600 dark:text-gray-400"
                          data-testid={`event-attendees-${event.id}`}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          <span className="text-xs sm:text-sm">
                            {event.attendeeCount || 0}
                            {event.maxAttendees && ` / ${event.maxAttendees}`}
                          </span>
                        </div>
                        {event.price !== null && event.price > 0 ? (
                          <span 
                            className="font-semibold text-turquoise-600 dark:text-turquoise-400 text-sm sm:text-base"
                            data-testid={`event-price-${event.id}`}
                          >
                            {event.currency} {event.price}
                          </span>
                        ) : (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            data-testid={`event-free-badge-${event.id}`}
                          >
                            Free
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && filteredEvents.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredEvents.length} of {events?.length || 0} events
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
