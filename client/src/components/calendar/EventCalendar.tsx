import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface CalendarEvent {
  id: number;
  title: string;
  startDate: string;
  eventType: "milonga" | "workshop" | "festival" | "practice";
  color?: string;
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export default function EventCalendar({ events, onDateClick, onEventClick }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get calendar data for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "milonga": return "bg-purple-500";
      case "workshop": return "bg-blue-500";
      case "festival": return "bg-pink-500";
      case "practice": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  // Check if date is today
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
  };

  // Generate calendar grid
  const calendarDays = [];
  
  // Empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="aspect-square p-1 sm:p-2" />
    );
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const isCurrentDay = isToday(day);

    calendarDays.push(
      <div
        key={day}
        className={`aspect-square p-1 sm:p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          isCurrentDay
            ? "bg-turquoise-100 dark:bg-turquoise-900/30 border-turquoise-500"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-turquoise-300"
        }`}
        onClick={() => onDateClick?.(new Date(year, month, day))}
        data-testid={`calendar-day-${day}`}
      >
        <div className="h-full flex flex-col">
          {/* Day number */}
          <div
            className={`text-xs sm:text-sm font-semibold mb-1 ${
              isCurrentDay
                ? "text-turquoise-700 dark:text-turquoise-300"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {day}
          </div>

          {/* Event dots/pills */}
          <div className="flex-1 overflow-hidden">
            {dayEvents.length > 0 && (
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div
                    key={event.id}
                    className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate text-white cursor-pointer ${getEventTypeColor(event.eventType)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    data-testid={`calendar-event-${event.id}`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 px-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-turquoise-600 dark:text-turquoise-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="min-h-[44px] min-w-[44px]"
            data-testid="button-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            onClick={goToToday}
            className="min-h-[44px] flex-1 sm:flex-none"
            data-testid="button-today"
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="min-h-[44px] min-w-[44px]"
            data-testid="button-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Link href="/events/create">
            <Button
              className="min-h-[44px] min-w-[44px] bg-turquoise-600 hover:bg-turquoise-700"
              size="icon"
              data-testid="button-create-event"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="bg-purple-500 text-white hover:bg-purple-600">
          Milonga
        </Badge>
        <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
          Workshop
        </Badge>
        <Badge variant="secondary" className="bg-pink-500 text-white hover:bg-pink-600">
          Festival
        </Badge>
        <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-600">
          Practice
        </Badge>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays}
      </div>

      {/* Mobile event count */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center sm:hidden">
        {events.length} events this month
      </div>
    </Card>
  );
}
