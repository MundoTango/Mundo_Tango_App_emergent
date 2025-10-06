import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Users, Globe, MapPin, Star, DollarSign, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ESA LIFE CEO 61x21 - Layer 28: Recommendations System
// Aurora Tide Design System - Glassmorphic Filter Component

interface FilterState {
  connectionDegree: 'anyone' | '1st_degree' | '2nd_degree' | '3rd_degree' | 'custom_closeness';
  minClosenessScore?: number;
  localStatus: 'all' | 'local' | 'visitor';
  originCountry?: string;
  type?: string;
  priceLevel?: string;
  minRating?: number;
  tags?: string[];
}

interface RecommendationFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCities?: string[];
  availableCountries?: string[];
  className?: string;
}

export default function RecommendationFilters({
  filters,
  onFiltersChange,
  availableCities = [],
  availableCountries = [],
  className = ''
}: RecommendationFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      connectionDegree: 'anyone',
      localStatus: 'all'
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'connectionDegree') return value !== 'anyone';
    if (key === 'localStatus') return value !== 'all';
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div
      className={`glass-card glass-depth-2 rounded-xl p-6 mt-ocean-gradient border border-white/20 backdrop-blur-md ${className}`}
      data-testid="recommendation-filters"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-turquoise-400 to-ocean-500 rounded-lg">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              Filter Recommendations
            </h3>
            {activeFiltersCount > 0 && (
              <p className="text-sm text-turquoise-600 dark:text-turquoise-400">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600"
              data-testid="button-reset-filters"
            >
              Reset all
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            data-testid="button-toggle-filters"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Filters Grid */}
      {isExpanded && (
        <div className="space-y-6 animate-fade-in">
          {/* Connection Level Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Users className="h-4 w-4 text-turquoise-600" />
              Connection Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { value: 'anyone', label: 'Anyone', icon: Globe },
                { value: '1st_degree', label: '1st Degree', icon: Users },
                { value: '2nd_degree', label: '2nd Degree', icon: Users },
                { value: '3rd_degree', label: '3rd Degree', icon: Users },
                { value: 'custom_closeness', label: 'Close Friends', icon: Users }
              ].map((option) => {
                const Icon = option.icon;
                const isActive = filters.connectionDegree === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('connectionDegree', option.value)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                      ${isActive
                        ? 'bg-gradient-to-br from-turquoise-400 to-ocean-500 text-white border-turquoise-500 shadow-lg'
                        : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-turquoise-400'
                      }
                    `}
                    data-testid={`filter-connection-${option.value}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Closeness Score (shown when custom_closeness selected) */}
            {filters.connectionDegree === 'custom_closeness' && (
              <div className="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-turquoise-200 dark:border-turquoise-800">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Minimum Closeness Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minClosenessScore || 50}
                  onChange={(e) => updateFilter('minClosenessScore', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  data-testid="input-closeness-score"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher scores mean closer friendships (0-100)
                </p>
              </div>
            )}
          </div>

          {/* Local vs Visitor Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <MapPin className="h-4 w-4 text-turquoise-600" />
              Recommended By
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'all', label: 'Everyone' },
                { value: 'local', label: 'Locals' },
                { value: 'visitor', label: 'Visitors' }
              ].map((option) => {
                const isActive = filters.localStatus === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('localStatus', option.value)}
                    className={`
                      px-4 py-2 rounded-lg border transition-all text-sm font-medium
                      ${isActive
                        ? 'bg-gradient-to-br from-turquoise-400 to-ocean-500 text-white border-turquoise-500 shadow-lg'
                        : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-turquoise-400'
                      }
                    `}
                    data-testid={`filter-local-${option.value}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cultural Expertise (Origin Country) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Globe className="h-4 w-4 text-turquoise-600" />
              Cultural Expertise
            </label>
            <select
              value={filters.originCountry || ''}
              onChange={(e) => updateFilter('originCountry', e.target.value || undefined)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              data-testid="select-origin-country"
            >
              <option value="">All countries</option>
              <option value="Argentina">🇦🇷 Argentina</option>
              <option value="Brazil">🇧🇷 Brazil</option>
              <option value="China">🇨🇳 China</option>
              <option value="France">🇫🇷 France</option>
              <option value="Germany">🇩🇪 Germany</option>
              <option value="India">🇮🇳 India</option>
              <option value="Italy">🇮🇹 Italy</option>
              <option value="Japan">🇯🇵 Japan</option>
              <option value="Korea">🇰🇷 Korea</option>
              <option value="Mexico">🇲🇽 Mexico</option>
              <option value="Spain">🇪🇸 Spain</option>
              <option value="United States">🇺🇸 United States</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Find recommendations from people with cultural expertise (e.g., Korean friends for Korean restaurants)
            </p>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Tag className="h-4 w-4 text-turquoise-600" />
              Category
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value || undefined)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              data-testid="select-category"
            >
              <option value="">All categories</option>
              <option value="restaurant">🍽️ Restaurants</option>
              <option value="cafe">☕ Cafés</option>
              <option value="bar">🍷 Bars</option>
              <option value="hotel">🏨 Hotels</option>
              <option value="venue">🎭 Venues</option>
              <option value="shop">🛍️ Shops</option>
              <option value="activity">⚽ Activities</option>
            </select>
          </div>

          {/* Price Level Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <DollarSign className="h-4 w-4 text-turquoise-600" />
              Price Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['$', '$$', '$$$', '$$$$'].map((price, index) => {
                const value = (index + 1).toString();
                const isActive = filters.priceLevel === value;
                return (
                  <button
                    key={value}
                    onClick={() => updateFilter('priceLevel', isActive ? undefined : value)}
                    className={`
                      px-4 py-2 rounded-lg border transition-all text-sm font-medium
                      ${isActive
                        ? 'bg-gradient-to-br from-turquoise-400 to-ocean-500 text-white border-turquoise-500 shadow-lg'
                        : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-turquoise-400'
                      }
                    `}
                    data-testid={`filter-price-${value}`}
                  >
                    {price}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Star className="h-4 w-4 text-turquoise-600" />
              Minimum Rating
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating || 0}
                onChange={(e) => updateFilter('minRating', parseFloat(e.target.value) || undefined)}
                className="flex-1 accent-turquoise-600"
                data-testid="input-min-rating"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                {filters.minRating ? `${filters.minRating}+` : 'Any'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
