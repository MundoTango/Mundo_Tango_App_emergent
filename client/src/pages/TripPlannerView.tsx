import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TripConfigurationWizard from '@/components/trip-planner/TripConfigurationWizard';
import UnifiedTripMap from '@/components/trip-planner/UnifiedTripMap';
import TripResultsGrid from '@/components/trip-planner/TripResultsGrid';
import MapLayerToggles from '@/components/trip-planner/MapLayerToggles';
import ItineraryBuilder from '@/components/trip-planner/ItineraryBuilder';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TripConfig {
  startDate: string;
  endDate: string;
  tripDuration: number;
  budget: string;
  interests: string[];
  travelStyle: string;
}

interface TripPlannerViewProps {
  city: string;
  country?: string;
  cityLat?: number;
  cityLng?: number;
  groupId?: number;
}

export default function TripPlannerView({ city, country, cityLat, cityLng, groupId }: TripPlannerViewProps) {
  const { toast } = useToast();
  const [tripConfig, setTripConfig] = useState<TripConfig | null>(null);
  const [mapLayers, setMapLayers] = useState({
    events: true,
    housing: true,
    recommendations: true
  });
  const [itineraryItems, setItineraryItems] = useState<any[]>([]);
  const [currentTravelPlanId, setCurrentTravelPlanId] = useState<number | null>(null);

  // Fetch trip results based on configuration
  const { data: tripResults, isLoading } = useQuery({
    queryKey: ['/api/trip-planner/results', tripConfig],
    enabled: !!tripConfig,
    queryFn: async () => {
      if (!tripConfig) return null;
      
      const params = new URLSearchParams({
        city,
        startDate: tripConfig.startDate,
        endDate: tripConfig.endDate,
        budget: tripConfig.budget,
        interests: tripConfig.interests.join(',')
      });

      const response = await fetch(`/api/trip-planner/results?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trip results');
      return response.json();
    }
  });

  // Create travel plan mutation
  const createTravelPlanMutation = useMutation({
    mutationFn: async () => {
      if (!tripConfig) throw new Error('No trip configuration');

      return await apiRequest('/api/travel-plans', {
        method: 'POST',
        body: JSON.stringify({
          cityId: groupId,
          city,
          country,
          startDate: tripConfig.startDate,
          endDate: tripConfig.endDate,
          tripDuration: tripConfig.tripDuration,
          budget: tripConfig.budget,
          interests: tripConfig.interests,
          travelStyle: tripConfig.travelStyle,
          status: 'planning'
        })
      });
    },
    onSuccess: (data) => {
      setCurrentTravelPlanId(data.id);
      toast({
        title: 'Trip Saved!',
        description: 'Your trip plan has been saved to your profile.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/travel-plans'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save your trip. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Add item to itinerary
  const handleAddToItinerary = (item: { id: number; type: 'event' | 'housing' | 'recommendation' }) => {
    // Find the item details from trip results
    let itemDetails = null;
    let subtitle = '';

    if (item.type === 'event' && tripResults?.events) {
      const event = tripResults.events.find((e: any) => e.id === item.id);
      if (event) {
        itemDetails = {
          title: event.title,
          subtitle: event.location
        };
      }
    } else if (item.type === 'housing' && tripResults?.housing) {
      const housing = tripResults.housing.find((h: any) => h.id === item.id);
      if (housing) {
        itemDetails = {
          title: housing.title,
          subtitle: housing.address
        };
      }
    } else if (item.type === 'recommendation' && tripResults?.recommendations) {
      const rec = tripResults.recommendations.find((r: any) => r.id === item.id);
      if (rec) {
        itemDetails = {
          title: rec.title,
          subtitle: rec.address || rec.city
        };
      }
    }

    if (itemDetails) {
      const newItem = {
        id: Date.now(), // Temporary ID
        day: 0, // Default to first day
        period: 'morning' as const,
        itemType: item.type,
        itemId: item.id,
        itemDetails,
        order: itineraryItems.length
      };

      setItineraryItems([...itineraryItems, newItem]);
      
      toast({
        title: 'Added to Itinerary',
        description: `${itemDetails.title} has been added to your trip.`
      });
    }
  };

  const handleRemoveFromItinerary = (itemId: number) => {
    setItineraryItems(itineraryItems.filter(item => item.id !== itemId));
  };

  const handleUpdateNotes = (itemId: number, notes: string) => {
    setItineraryItems(itineraryItems.map(item => 
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  const handleSaveTrip = () => {
    createTravelPlanMutation.mutate();
  };

  if (!tripConfig) {
    return (
      <div className="max-w-4xl mx-auto">
        <TripConfigurationWizard
          city={city}
          country={country}
          onConfigComplete={setTripConfig}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        <span className="ml-3 text-lg">Finding the best activities for your trip...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip Summary Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">
          Your Trip to {city}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            📅 {new Date(tripConfig.startDate).toLocaleDateString()} - {new Date(tripConfig.endDate).toLocaleDateString()}
          </span>
          <span>⏱️ {tripConfig.tripDuration} days</span>
          <span>💰 {tripConfig.budget}</span>
          <span>👤 {tripConfig.travelStyle}</span>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map" data-testid="tab-map">Map View</TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">Browse Results</TabsTrigger>
          <TabsTrigger value="itinerary" data-testid="tab-itinerary">
            My Itinerary ({itineraryItems.length})
          </TabsTrigger>
        </TabsList>

        {/* Map View Tab */}
        <TabsContent value="map" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <MapLayerToggles layers={mapLayers} onChange={setMapLayers} />
            </div>
            <div className="lg:col-span-3">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <UnifiedTripMap
                  events={mapLayers.events ? tripResults?.events : []}
                  housing={mapLayers.housing ? tripResults?.housing : []}
                  recommendations={mapLayers.recommendations ? tripResults?.recommendations : []}
                  layers={mapLayers}
                  cityLat={cityLat}
                  cityLng={cityLng}
                  onAddToItinerary={handleAddToItinerary}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Results Grid Tab */}
        <TabsContent value="results" className="mt-6">
          <TripResultsGrid
            events={tripResults?.events || []}
            housing={tripResults?.housing || []}
            recommendations={tripResults?.recommendations || []}
            onAddToItinerary={handleAddToItinerary}
          />
        </TabsContent>

        {/* Itinerary Tab */}
        <TabsContent value="itinerary" className="mt-6">
          <ItineraryBuilder
            tripDuration={tripConfig.tripDuration}
            startDate={tripConfig.startDate}
            items={itineraryItems}
            onAddItem={(item) => setItineraryItems([...itineraryItems, item as any])}
            onRemoveItem={handleRemoveFromItinerary}
            onUpdateNotes={handleUpdateNotes}
            onSave={handleSaveTrip}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
