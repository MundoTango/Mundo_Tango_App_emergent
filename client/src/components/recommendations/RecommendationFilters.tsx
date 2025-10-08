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
  cuisine?: string; // For restaurant ranking (not filtering)
  city?: string; // Journey R4: City filter
  categories?: string[]; // Journey R5: Multi-select categories
  type?: string; // Deprecated - use categories instead
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
              className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400 hover:text-turquoise-600"
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
              <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Filters Grid - Two Column Layout */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Column 1: Connection & People */}
          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-turquoise-600 dark:text-turquoise-400 mb-4">
              Connection & People
            </h4>

          {/* Connection Level Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300">
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
                        : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-600 dark:text-gray-300 hover:border-turquoise-400'
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300 mb-2 block">
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
                <p className="text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400 mt-1">
                  Higher scores mean closer friendships (0-100)
                </p>
              </div>
            )}
          </div>

          {/* Local vs Visitor Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300">
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
                        : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-600 dark:text-gray-300 hover:border-turquoise-400'
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

          {/* Journey R4: City Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 text-turquoise-600" />
              City
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.city || ''}
                onChange={(e) => updateFilter('city', e.target.value || undefined)}
                placeholder="e.g., Buenos Aires, Paris, Tokyo..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                data-testid="input-city-filter"
              />
              {filters.city && (
                <button
                  onClick={() => updateFilter('city', undefined)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-turquoise-600"
                  data-testid="button-clear-city-filter"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400">
              Filter recommendations by city
            </p>
          </div>
          </div>

          {/* Column 2: Experience Details */}
          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-turquoise-600 dark:text-turquoise-400 mb-4">
              Experience Details
            </h4>

          {/* Journey R5: Category Multi-Select Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300">
              <Tag className="h-4 w-4 text-turquoise-600" />
              Categories
              {filters.categories && filters.categories.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-turquoise-100 dark:bg-turquoise-900/30 text-turquoise-700 dark:text-turquoise-300 text-xs rounded-full">
                  {filters.categories.length}
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'restaurant', label: 'Restaurants', icon: '🍽️' },
                { value: 'cafe', label: 'Cafés', icon: '☕' },
                { value: 'bar', label: 'Bars', icon: '🍷' },
                { value: 'hotel', label: 'Hotels', icon: '🏨' },
                { value: 'venue', label: 'Venues', icon: '🎭' },
                { value: 'shop', label: 'Shops', icon: '🛍️' },
                { value: 'activity', label: 'Activities', icon: '⚽' },
                { value: 'other', label: 'Other', icon: '📍' }
              ].map((category) => {
                const isActive = filters.categories?.includes(category.value) || false;
                return (
                  <button
                    key={category.value}
                    onClick={() => {
                      const current = filters.categories || [];
                      const updated = isActive
                        ? current.filter(c => c !== category.value)
                        : [...current, category.value];
                      updateFilter('categories', updated.length > 0 ? updated : undefined);
                    }}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium
                      ${isActive
                        ? 'bg-gradient-to-br from-turquoise-400 to-ocean-500 text-white border-turquoise-500 shadow-lg'
                        : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-600 dark:text-gray-300 hover:border-turquoise-400'
                      }
                    `}
                    data-testid={`filter-category-${category.value}`}
                  >
                    <span>{category.icon}</span>
                    <span className="truncate">{category.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400">
              Select multiple categories to filter recommendations
            </p>
          </div>

          {/* Dynamic: Cuisine (restaurants) OR Cultural Expertise (all others) */}
          {filters.categories?.includes('restaurant') ? (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300">
                <Globe className="h-4 w-4 text-turquoise-600" />
                Cuisine
              </label>
              <select
                value={filters.cuisine || ''}
                onChange={(e) => updateFilter('cuisine', e.target.value || undefined)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                data-testid="select-cuisine"
              >
                <option value="">All cuisines</option>
                <option value="Italian">🇮🇹 Italian</option>
                <option value="Japanese">🇯🇵 Japanese</option>
                <option value="Korean">🇰🇷 Korean</option>
                <option value="Chinese">🇨🇳 Chinese</option>
                <option value="French">🇫🇷 French</option>
                <option value="Mexican">🇲🇽 Mexican</option>
                <option value="Argentine">🇦🇷 Argentine</option>
                <option value="Spanish">🇪🇸 Spanish</option>
                <option value="Thai">🇹🇭 Thai</option>
                <option value="Indian">🇮🇳 Indian</option>
                <option value="Brazilian">🇧🇷 Brazilian</option>
                <option value="Greek">🇬🇷 Greek</option>
                <option value="American">🇺🇸 American</option>
                <option value="Vietnamese">🇻🇳 Vietnamese</option>
                <option value="Middle Eastern">🌍 Middle Eastern</option>
                <option value="Fusion">🌐 Fusion</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400">
                🎯 Ranks higher when recommended by people from that culture (e.g., Italian restaurants from Italian users)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300">
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
              <p className="text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400">
                Filter by recommender's cultural background (e.g., Korean friends for authentic spots)
              </p>
            </div>
          )}

          {/* Price Level Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300">
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
                        : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-600 dark:text-gray-300 hover:border-turquoise-400'
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300">
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
              <span className="text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300 w-12 text-right">
                {filters.minRating ? `${filters.minRating}+` : 'Any'}
              </span>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
