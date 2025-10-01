import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Globe, Users, TrendingUp, Calendar } from 'lucide-react';
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-500" />
          Rankings
        </h3>
        
        {/* City/Region Toggle */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-slate-800 p-1">
          <button
            data-testid="toggle-city-view"
            onClick={() => setView('city')}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              view === 'city'
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <MapPin className="w-4 h-4 inline mr-1" />
            Cities
          </button>
          <button
            data-testid="toggle-region-view"
            onClick={() => setView('region')}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              view === 'region'
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Globe className="w-4 h-4 inline mr-1" />
            Regions
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          data-testid="filter-people"
          onClick={() => setFilterBy('people')}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "border-2",
            filterBy === 'people'
              ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 hover:border-cyan-300 dark:hover:border-cyan-700"
          )}
        >
          <Users className="w-4 h-4 inline mr-2" />
          People
        </button>
        <button
          data-testid="filter-events"
          onClick={() => setFilterBy('events')}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "border-2",
            filterBy === 'events'
              ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 hover:border-cyan-300 dark:hover:border-cyan-700"
          )}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Events
        </button>
      </div>

      {/* Rankings List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
          </div>
        ) : view === 'city' ? (
          // City Rankings
          (rankings as CityRanking[])?.map((city) => (
            <button
              key={city.id}
              data-testid={`city-ranking-${city.id}`}
              onClick={() => onCityClick?.(city)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-200",
                "hover:bg-gray-100 dark:hover:bg-slate-800/50",
                "border border-transparent hover:border-cyan-500/50",
                "transform hover:translate-x-1"
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
                      "text-gray-400 dark:text-slate-500"
                    )}>
                      #{city.rank}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {city.city}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {city.country}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
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
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {filterBy === 'people' ? 'members' : 'events'}
                  </span>
                </div>
              </div>
            </button>
          ))
        ) : (
          // Region Rankings
          (rankings as RegionRanking[])?.map((region) => (
            <div
              key={region.name}
              data-testid={`region-ranking-${region.rank}`}
              className={cn(
                "p-3 rounded-lg",
                "bg-gray-50 dark:bg-slate-800/30",
                "border border-gray-200 dark:border-slate-700"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-2xl font-bold",
                      region.rank === 1 ? "text-yellow-500" :
                      region.rank === 2 ? "text-gray-400" :
                      region.rank === 3 ? "text-orange-500" :
                      "text-gray-400 dark:text-slate-500"
                    )}>
                      #{region.rank}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {region.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 ml-10">
                    {region.cityCount} {region.cityCount === 1 ? 'city' : 'cities'}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
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
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {filterBy === 'people' ? 'total members' : 'total events'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
