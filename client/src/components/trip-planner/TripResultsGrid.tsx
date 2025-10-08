import { Calendar, DollarSign, Home, MapPin, Star, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: number;
  title: string;
  startDate: string;
  location: string;
  attendeeCount?: number;
}

interface Housing {
  id: number;
  title: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  photos?: string[];
}

interface Recommendation {
  id: number;
  title: string;
  type: string;
  address?: string;
  city: string;
  mtRating?: number;
}

interface TripResultsGridProps {
  events?: Event[];
  housing?: Housing[];
  recommendations?: Recommendation[];
  onAddToItinerary?: (item: { id: number; type: 'event' | 'housing' | 'recommendation' }) => void;
}

export default function TripResultsGrid({
  events = [],
  housing = [],
  recommendations = [],
  onAddToItinerary
}: TripResultsGridProps) {
  const hasResults = events.length > 0 || housing.length > 0 || recommendations.length > 0;

  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No results found for your trip dates. Try adjusting your dates or preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Events Section */}
      {events.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-600" />
            <h3 className="text-xl font-semibold">Events During Your Trip</h3>
            <Badge variant="secondary">{events.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="p-4 glass-card-depth-1 hover:glass-card-depth-2 transition" data-testid={`card-event-${event.id}`}>
                <div className="space-y-3">
                  <h4 className="font-semibold line-clamp-2">{event.title}</h4>
                  
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    {event.attendeeCount !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attendeeCount} attending</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = `/events/${event.id}`}
                      data-testid={`button-view-event-${event.id}`}
                    >
                      View Details
                    </Button>
                    {onAddToItinerary && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500"
                        onClick={() => onAddToItinerary({ id: event.id, type: 'event' })}
                        data-testid={`button-add-event-${event.id}`}
                      >
                        Add to Trip
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Housing Section */}
      {housing.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-turquoise-600" />
            <h3 className="text-xl font-semibold">Available Housing</h3>
            <Badge variant="secondary">{housing.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {housing.map((home) => (
              <Card key={home.id} className="p-4 glass-card-depth-1 hover:glass-card-depth-2 transition" data-testid={`card-housing-${home.id}`}>
                <div className="space-y-3">
                  {home.photos && home.photos.length > 0 && (
                    <img
                      src={home.photos[0]}
                      alt={home.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                  
                  <h4 className="font-semibold line-clamp-2">{home.title}</h4>
                  
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{home.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>${home.pricePerNight}/night</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Up to {home.maxGuests} guests</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = `/housing/${home.id}`}
                      data-testid={`button-view-housing-${home.id}`}
                    >
                      View Details
                    </Button>
                    {onAddToItinerary && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-turquoise-500 to-cyan-500"
                        onClick={() => onAddToItinerary({ id: home.id, type: 'housing' })}
                        data-testid={`button-add-housing-${home.id}`}
                      >
                        Add to Trip
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-pink-600" />
            <h3 className="text-xl font-semibold">Local Recommendations</h3>
            <Badge variant="secondary">{recommendations.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="p-4 glass-card-depth-1 hover:glass-card-depth-2 transition" data-testid={`card-recommendation-${rec.id}`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold line-clamp-2 flex-1">{rec.title}</h4>
                    {rec.mtRating && (
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{rec.mtRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                    {rec.type}
                  </Badge>
                  
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{rec.address || rec.city}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = `/recommendations/${rec.id}`}
                      data-testid={`button-view-recommendation-${rec.id}`}
                    >
                      View Details
                    </Button>
                    {onAddToItinerary && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                        onClick={() => onAddToItinerary({ id: rec.id, type: 'recommendation' })}
                        data-testid={`button-add-recommendation-${rec.id}`}
                      >
                        Add to Trip
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
