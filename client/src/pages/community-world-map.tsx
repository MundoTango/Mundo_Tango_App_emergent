import React, { useState, memo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import WorldMap from '@/components/Community/WorldMap';
import RankingsPanel from '@/components/Community/RankingsPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CityRanking {
  rank: number;
  id: number;
  name: string;
  city: string;
  country: string;
  lat: string;
  lng: string;
  memberCount: number;
}

const CommunityWorldMap = memo(function CommunityWorldMap() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<any>(null);
  
  // Fetch city groups data for search
  const { data: cityGroups } = useQuery({
    queryKey: ['/api/community/city-groups', 'search-data'],
    queryFn: async () => {
      const response = await fetch('/api/community/city-groups', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch city groups');
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Handle city selection from rankings panel
  const handleCityClick = useCallback((city: CityRanking) => {
    if (mapRef.current?.centerOnCity) {
      const lat = parseFloat(city.lat);
      const lng = parseFloat(city.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.centerOnCity({ lat, lng, city: city.city });
        toast({
          title: `Viewing ${city.city}`,
          description: `${city.memberCount.toLocaleString()} members in this community`,
        });
      }
    }
  }, [toast]);

  const handleSearch = () => {
    if (!searchQuery) return;
    
    const city = cityGroups?.find(
      (c: any) => c.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (city) {
      handleCityClick({
        rank: 0,
        id: city.id,
        name: city.name,
        city: city.city,
        country: city.country,
        lat: city.lat,
        lng: city.lng,
        memberCount: city.memberCount
      });
    } else {
      toast({
        title: "City not found",
        description: "No tango community found in that location.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tango World Map
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">
                Explore tango communities around the world
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  data-testid="input-search-city"
                  placeholder="Search city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 w-64 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                />
              </div>
              <Button 
                data-testid="button-search"
                onClick={handleSearch} 
                variant="outline"
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Split Panel Layout: Map + Rankings */}
        <div className={cn(
          "grid gap-6",
          // Desktop: side-by-side (true 60/40 split: 3fr map, 2fr rankings)
          "lg:grid-cols-[3fr,2fr]",
          // Mobile: stacked
          "grid-cols-1"
        )}>
          {/* Left Panel: Interactive Map */}
          <div className="relative">
            <div className={cn(
              "rounded-lg border overflow-hidden",
              "bg-white dark:bg-slate-900",
              "border-gray-200 dark:border-slate-800",
              // Fixed height on desktop, responsive on mobile
              "h-[600px] lg:h-[700px]"
            )}>
              <WorldMap ref={mapRef} />
            </div>
          </div>

          {/* Right Panel: Rankings */}
          <div className={cn(
            "rounded-lg border p-6",
            "bg-white dark:bg-slate-900",
            "border-gray-200 dark:border-slate-800",
            // Fixed height on desktop, auto on mobile
            "lg:h-[700px] h-auto"
          )}>
            <RankingsPanel onCityClick={handleCityClick} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
});

export default CommunityWorldMap;
