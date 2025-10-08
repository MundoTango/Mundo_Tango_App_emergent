import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Globe, Users, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StaggerContainer } from '@/components/animations/FramerMotionWrappers';
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
  eventCount?: number;
}

interface RegionRanking {
  rank: number;
  name: string;
  memberCount: number;
  eventCount?: number;
  cityCount: number;
}

interface RankingsPanelProps {
  onCityClick?: (city: CityRanking) => void;
  className?: string;
}

export default function RankingsPanel({ onCityClick, className }: RankingsPanelProps) {
  const [view, setView] = useState<'city' | 'region'>('city');
  const [filterBy, setFilterBy] = useState<'people' | 'events'>('people');

  const { data: rankings, isLoading } = useQuery({
    queryKey: ['/api/community/rankings', view, filterBy],
    queryFn: async () => {
      const response = await fetch(`/api/community/rankings?view=${view}&filterBy=${filterBy}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)] dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
          Rankings
        </h3>
        
        {/* City/Region Toggle */}
        <div className="flex rounded-lg bg-[var(--color-neutral-100)] dark:bg-slate-800 p-1">
          <button
            data-testid="toggle-city-view"
            onClick={() => setView('city')}
            aria-label="View city rankings"
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              view === 'city'
                ? "bg-[var(--color-surface)] dark:bg-slate-700 text-[var(--color-text)] dark:text-white shadow-sm"
                : "text-gray-600 dark:text-slate-400 hover:text-[var(--color-text)] dark:hover:text-white"
            )}
          >
            <MapPin className="w-4 h-4 inline mr-1" />
            Cities
          </button>
          <button
            data-testid="toggle-region-view"
            onClick={() => setView('region')}
            aria-label="View region rankings"
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              view === 'region'
                ? "bg-[var(--color-surface)] dark:bg-slate-700 text-[var(--color-text)] dark:text-white shadow-sm"
                : "text-gray-600 dark:text-slate-400 hover:text-[var(--color-text)] dark:hover:text-white"
            )}
          >
            <Globe className="w-4 h-4 inline mr-1" />
            Regions
          </button>
        </div>
      </div>

      {/* Filter Buttons - Aurora Tide */}
      <div className="flex gap-2 mb-4">
        <MagneticButton
          data-testid="filter-people"
          onClick={() => setFilterBy('people')}
          strength={0.15}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "border-2",
            filterBy === 'people'
              ? "border-cyan-500 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 text-cyan-700 dark:text-cyan-300"
              : "glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 text-slate-700 dark:text-slate-300"
          )}
        >
          <Users className="w-4 h-4 inline mr-2" />
          People
        </MagneticButton>
        <MagneticButton
          data-testid="filter-events"
          onClick={() => setFilterBy('events')}
          strength={0.15}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "border-2",
            filterBy === 'events'
              ? "border-cyan-500 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 text-cyan-700 dark:text-cyan-300"
              : "glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 text-slate-700 dark:text-slate-300"
          )}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Events
        </MagneticButton>
      </div>

      {/* Rankings List - Aurora Tide */}
      <StaggerContainer className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
          </div>
        ) : view === 'city' ? (
          // City Rankings - Aurora Tide
          (rankings as CityRanking[])?.map((city) => (
            <MagneticButton
              key={city.id}
              data-testid={`city-ranking-${city.id}`}
              onClick={() => onCityClick?.(city)}
              strength={0.1}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-200",
                "glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30",
                "hover:glass-depth-2"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-2xl font-bold",
                      city.rank === 1 ? "text-yellow-500" :
                      city.rank === 2 ? "text-gray-400" :
                      city.rank === 3 ? "text-orange-500" :
                      "text-slate-400 dark:text-slate-500"
                    )}>
                      #{city.rank}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {city.city}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {city.country}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-[var(--color-primary-hover)] dark:text-cyan-400">
                    {filterBy === 'people' ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    <span className="font-bold">
                      {filterBy === 'people' 
                        ? city.memberCount.toLocaleString()
                        : (city.eventCount || 0).toLocaleString()
                      }
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {filterBy === 'people' ? 'members' : 'events'}
                  </span>
                </div>
              </div>
            </MagneticButton>
          ))
        ) : (
          // Region Rankings - Aurora Tide
          (rankings as RegionRanking[])?.map((region) => (
            <GlassCard
              key={region.name}
              data-testid={`region-ranking-${region.rank}`}
              depth={1}
              className="p-3 border-cyan-200/30 dark:border-cyan-500/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-2xl font-bold",
                      region.rank === 1 ? "text-yellow-500" :
                      region.rank === 2 ? "text-gray-400" :
                      region.rank === 3 ? "text-orange-500" :
                      "text-slate-400 dark:text-slate-500"
                    )}>
                      #{region.rank}
                    </span>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {region.name}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 ml-10">
                    {region.cityCount} {region.cityCount === 1 ? 'city' : 'cities'}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-[var(--color-primary-hover)] dark:text-cyan-400">
                    {filterBy === 'people' ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    <span className="font-bold">
                      {filterBy === 'people'
                        ? region.memberCount.toLocaleString()
                        : (region.eventCount || 0).toLocaleString()
                      }
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {filterBy === 'people' ? 'total members' : 'total events'}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </StaggerContainer>
    </div>
  );
}
