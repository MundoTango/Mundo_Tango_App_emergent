/**
 * Wrapper component for lazy loading InteractiveTour
 * Provides default export for React.lazy()
 */

import { useInteractiveTour, startTour, type TourType } from './InteractiveTour';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Users, GraduationCap, Plane, MapPin, PartyPopper } from 'lucide-react';

const TOUR_CONFIGS: Array<{ type: TourType; title: string; description: string; icon: React.ReactNode }> = [
  {
    type: 'welcome',
    title: 'Welcome Tour',
    description: 'First-time platform introduction (60 seconds)',
    icon: <PartyPopper className="h-5 w-5" />
  },
  {
    type: 'host',
    title: 'Event Host Tour',
    description: 'Learn to create and manage events',
    icon: <Users className="h-5 w-5" />
  },
  {
    type: 'teacher',
    title: 'Teacher Tour',
    description: 'Set up classes and manage bookings',
    icon: <GraduationCap className="h-5 w-5" />
  },
  {
    type: 'traveler',
    title: 'Traveler Tour',
    description: 'Plan trips and find local events',
    icon: <Plane className="h-5 w-5" />
  },
  {
    type: 'local',
    title: 'Local Guide Tour',
    description: 'Share recommendations and host visitors',
    icon: <MapPin className="h-5 w-5" />
  },
];

export default function InteractiveTourWrapper() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {TOUR_CONFIGS.map((tour) => (
        <Card key={tour.type} className="hover:border-cyan-500 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {tour.icon}
              {tour.title}
            </CardTitle>
            <CardDescription>{tour.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => startTour(tour.type)}
              className="w-full gap-2"
              data-testid={`button-start-tour-${tour.type}`}
            >
              <Play className="h-4 w-4" />
              Start Tour
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
