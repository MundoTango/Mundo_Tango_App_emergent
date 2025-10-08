import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ItineraryItem {
  id?: number;
  day: number;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  itemType: 'event' | 'housing' | 'recommendation';
  itemId: number;
  itemDetails: {
    title: string;
    subtitle?: string;
  };
  notes?: string;
  order: number;
}

interface ItineraryBuilderProps {
  tripDuration: number;
  startDate: string;
  items: ItineraryItem[];
  onAddItem: (item: Omit<ItineraryItem, 'id'>) => void;
  onRemoveItem: (itemId: number) => void;
  onUpdateNotes: (itemId: number, notes: string) => void;
  onSave: () => void;
}

const PERIODS = [
  { value: 'morning', label: 'Morning', emoji: '🌅' },
  { value: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { value: 'evening', label: 'Evening', emoji: '🌆' },
  { value: 'night', label: 'Night', emoji: '🌙' }
];

export default function ItineraryBuilder({
  tripDuration,
  startDate,
  items,
  onRemoveItem,
  onUpdateNotes,
  onSave
}: ItineraryBuilderProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));

  const toggleDay = (day: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const getItemsForDay = (day: number) => {
    return items
      .filter(item => item.day === day)
      .sort((a, b) => {
        const periodOrder = { morning: 0, afternoon: 1, evening: 2, night: 3 };
        return periodOrder[a.period] - periodOrder[b.period] || a.order - b.order;
      });
  };

  const getDayDate = (day: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'from-cyan-500 to-blue-500';
      case 'housing': return 'from-turquoise-500 to-cyan-500';
      case 'recommendation': return 'from-pink-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const totalItems = items.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Your Itinerary</h3>
          <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400 mt-1">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} planned
          </p>
        </div>
        <Button
          onClick={onSave}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          data-testid="button-save-trip"
        >
          Save My Trip
        </Button>
      </div>

      {/* Day-by-Day Schedule */}
      <div className="space-y-3">
        {Array.from({ length: tripDuration }).map((_, index) => {
          const dayItems = getItemsForDay(index);
          const isExpanded = expandedDays.has(index);

          return (
            <Card key={index} className="overflow-hidden glass-card-depth-1">
              {/* Day Header */}
              <button
                onClick={() => toggleDay(index)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                data-testid={`button-toggle-day-${index}`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                  <div className="text-left">
                    <h4 className="font-semibold">Day {index + 1}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">{getDayDate(index)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{dayItems.length} items</Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
              </button>

              {/* Day Items */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                  {dayItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-600 dark:text-gray-400">
                      <p className="text-sm">No activities planned for this day</p>
                      <p className="text-xs mt-1">Browse the map and results to add activities</p>
                    </div>
                  ) : (
                    dayItems.map((item) => (
                      <Card key={item.id} className="p-3 bg-white dark:bg-gray-800/50" data-testid={`itinerary-item-${item.id}`}>
                        <div className="space-y-2">
                          {/* Item Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`bg-gradient-to-r ${getItemTypeColor(item.itemType)} text-white text-xs`}>
                                  {item.period} {PERIODS.find(p => p.value === item.period)?.emoji}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.itemType}
                                </Badge>
                              </div>
                              <h5 className="font-semibold">{item.itemDetails.title}</h5>
                              {item.itemDetails.subtitle && (
                                <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">{item.itemDetails.subtitle}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => item.id && onRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              data-testid={`button-remove-item-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400 italic">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <Card className="p-8 text-center glass-card-depth-1">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Start Building Your Itinerary</h3>
            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">
              Browse events, housing, and recommendations on the map or in the results grid. 
              Click "Add to Trip" to build your perfect itinerary.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
