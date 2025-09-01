// Location Service - External API Integration
// Replaces the large 34MB locations.json file with efficient API calls

class LocationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.apiEndpoint = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  }

  // Get locations with pagination and search
  async getLocations(options = {}) {
    const {
      country = '',
      search = '',
      limit = 50,
      offset = 0,
      includeCoords = false
    } = options;

    const cacheKey = `locations_${country}_${search}_${limit}_${offset}_${includeCoords}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const params = new URLSearchParams({
        country,
        search,
        limit: limit.toString(),
        offset: offset.toString(),
        includeCoords: includeCoords.toString()
      });

      const response = await fetch(`${this.apiEndpoint}/api/locations?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      return this.getFallbackLocations(options);
    }
  }

  // Get specific location by ID
  async getLocationById(id) {
    const cacheKey = `location_${id}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/api/locations/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch location:', error);
      return null;
    }
  }

  // Search locations with autocomplete
  async searchLocations(query, limit = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = `search_${query}_${limit}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });

      const response = await fetch(`${this.apiEndpoint}/api/locations/search?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Failed to search locations:', error);
      return [];
    }
  }

  // Get countries list
  async getCountries() {
    const cacheKey = 'countries';
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout * 10) { // Cache countries longer
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/api/locations/countries`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      return this.getFallbackCountries();
    }
  }

  // Fallback data when API is unavailable
  getFallbackLocations(options = {}) {
    // Return minimal essential locations for basic functionality
    return {
      locations: [
        { id: 1, name: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lng: -58.3960 },
        { id: 2, name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060 },
        { id: 3, name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
        { id: 4, name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
        { id: 5, name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 }
      ],
      total: 5,
      hasMore: false
    };
  }

  getFallbackCountries() {
    return [
      { code: 'AR', name: 'Argentina' },
      { code: 'US', name: 'United States' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'FR', name: 'France' },
      { code: 'JP', name: 'Japan' }
    ];
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Preload essential locations
  async preloadEssentials() {
    try {
      await Promise.all([
        this.getCountries(),
        this.getLocations({ limit: 20 }) // Load first 20 popular locations
      ]);
    } catch (error) {
      console.warn('Failed to preload essential location data:', error);
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;