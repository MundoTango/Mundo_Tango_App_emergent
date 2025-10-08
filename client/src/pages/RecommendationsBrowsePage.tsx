/**
 * ESA LIFE CEO 61x21 - Journey R2: Browse Recommendations
 * Layer 8 (Client Framework) + Layer 28 (Recommendations/Marketplace)
 * 
 * Dedicated recommendations browse page with comprehensive filtering
 * Aurora Tide Design System compliant
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin } from 'lucide-react';
import RecommendationsList from '@/components/Recommendations/RecommendationsList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

export default function RecommendationsBrowsePage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchCity, setSearchCity] = useState('');
  const [activeCity, setActiveCity] = useState('');

  const handleSearch = () => {
    if (searchCity.trim()) {
      setActiveCity(searchCity.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Helmet>
        <title>Recommendations Browse Page | Life CEO</title>
      </Helmet>
      
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-white to-ocean-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section - Aurora Tide Design */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-turquoise-500 to-ocean-600 opacity-10 dark:opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 dark:from-turquoise-400 dark:to-ocean-400 bg-clip-text text-transparent">
              {t('recommendations.browse.title', 'Discover Amazing Places')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('recommendations.browse.subtitle', 'Explore curated recommendations from friends and locals around the world')}
            </p>

            {/* City Search */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="glass-card glass-depth-2 p-4 rounded-xl">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t('recommendations.browse.searchPlaceholder', 'Search by city (e.g., Buenos Aires, Paris, Tokyo)...')}
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 pr-4 h-12 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 focus:ring-2 focus:ring-turquoise-500 dark:focus:ring-turquoise-400"
                      data-testid="input-city-search"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-12 px-6 bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                    data-testid="button-search-city"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {t('recommendations.browse.search', 'Search')}
                  </Button>
                </div>

                {activeCity && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                      {t('recommendations.browse.showing', 'Showing recommendations in')}:
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-turquoise-500 to-ocean-600 text-white rounded-full text-sm font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      {activeCity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveCity('');
                        setSearchCity('');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                      data-testid="button-clear-city"
                    >
                      {t('recommendations.browse.clear', 'Clear')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations List with Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeCity ? (
          <RecommendationsList 
            city={activeCity}
            showFilters={true}
          />
        ) : (
          <div className="text-center py-16">
            <div className="glass-card glass-depth-1 inline-block px-12 py-8 rounded-2xl">
              <MapPin className="h-16 w-16 text-turquoise-400 dark:text-turquoise-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-600 dark:text-gray-300 mb-2">
                {t('recommendations.browse.emptyTitle', 'Choose a City to Explore')}
              </h3>
              <p className="text-gray-500 dark:text-gray-600 dark:text-gray-400 max-w-md">
                {t('recommendations.browse.emptyDescription', 'Search for a city above to discover recommendations from our global community')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  
    </>
  );
}
