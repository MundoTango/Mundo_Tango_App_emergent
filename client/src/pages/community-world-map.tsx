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
import { FadeIn, ScaleIn } from '@/components/animations/FramerMotionWrappers';
import { GlassCard } from '@/components/glass/GlassComponents';
import { MagneticButton } from '@/components/interactions/MicroInteractions';

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
        {/* Header - Aurora Tide */}
        <FadeIn>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Tango World Map
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  Explore tango communities around the world
                </p>
              </div>
              <div className="flex gap-3">
                <GlassCard depth={1} className="relative border-cyan-200/30 dark:border-ocean-500/30 p-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4 z-10" />
                  <Input
                    data-testid="input-search-city"
                    placeholder="Search city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 w-64 bg-transparent border-0 focus-visible:ring-0 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  />
                </GlassCard>
                <MagneticButton 
                  data-testid="button-search"
                  onClick={handleSearch}
                  strength={0.2}
                  className="glass-card glass-depth-1 border-cyan-200/30 dark:border-ocean-500/30 px-4 py-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-semibold"
                >
                  Search
                </MagneticButton>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Map Section - Aurora Tide */}
        <ScaleIn delay={0.1}>
          <div className="relative mb-6">
            <GlassCard depth={2} className={cn(
              "overflow-hidden border-cyan-200/30 dark:border-ocean-500/30",
              "h-[600px] lg:h-[700px]"
            )}>
              <WorldMap ref={mapRef} />
            </GlassCard>
          </div>
        </ScaleIn>

        {/* Rankings Panel Below Map - Aurora Tide */}
        <ScaleIn delay={0.2}>
          <GlassCard depth={2} className="p-6 border-cyan-200/30 dark:border-ocean-500/30">
            <RankingsPanel onCityClick={handleCityClick} />
          </GlassCard>
        </ScaleIn>
      </div>
    </DashboardLayout>
  );
});

export default CommunityWorldMap;
