import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import EventCalendar from "@/components/calendar/EventCalendar";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

interface Event {
  id: number;
  title: string;
  startDate: string;
  endDate?: string;
  eventType: "milonga" | "workshop" | "festival" | "practice";
  city: string;
  venue: string;
  price?: number;
  currency?: string;
}

export default function CalendarPage() {
  const [, setLocation] = useLocation();

  // Fetch events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const res = await fetch('/api/events', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
  });

  const handleDateClick = (date: Date) => {
    console.log("Date clicked:", date);
    // Could open a modal to create event on this date
  };

  const handleEventClick = (event: any) => {
    setLocation(`/events/${event.id}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-turquoise-500 to-cyan-500 dark:from-turquoise-700 dark:to-cyan-700 text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-1">
              <CalendarIcon className="w-8 h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold">
                Event Calendar
              </h1>
            </div>
            <p className="text-turquoise-100 text-sm sm:text-base">
              View and plan your tango schedule
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {isLoading ? (
            <Card className="p-4 animate-pulse" data-testid="skeleton-calendar">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
            </Card>
          ) : (
            <EventCalendar
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          )}

          {/* Upcoming Events Sidebar */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events
                .filter(event => new Date(event.startDate) > new Date())
                .slice(0, 6)
                .map(event => (
                  <Card
                    key={event.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleEventClick(event)}
                    data-testid={`upcoming-event-${event.id}`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.venue}, {event.city}
                    </p>
                    {event.price && (
                      <p className="text-sm font-semibold text-turquoise-600 dark:text-turquoise-400 mt-2">
                        {event.price} {event.currency}
                      </p>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
