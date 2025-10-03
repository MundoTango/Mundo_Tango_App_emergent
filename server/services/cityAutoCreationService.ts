import { db } from '../db';
import { groups, groupMembers } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import fetch from 'node-fetch';

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

export class CityAutoCreationService {
  // Geocoding cache to prevent excessive API calls
  private static geocodeCache: Map<string, { data: GeocodingResult | null; timestamp: number }> = new Map();
  private static CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private static lastGeocodingCall = 0;
  private static MIN_GEOCODING_DELAY = 1000; // 1 second between calls (Nominatim usage policy)
  
  // Common city abbreviations and variations
  private static cityAbbreviations: Record<string, string> = {
    'nyc': 'New York City',
    'ny': 'New York',
    'la': 'Los Angeles',
    'sf': 'San Francisco',
    'dc': 'Washington DC',
    'philly': 'Philadelphia',
    'vegas': 'Las Vegas',
    'nola': 'New Orleans',
    'chi': 'Chicago',
    'bsas': 'Buenos Aires',
    'ba': 'Buenos Aires',
    'caba': 'Buenos Aires',
    'rio': 'Rio de Janeiro',
    'sp': 'São Paulo',
    'cdmx': 'Mexico City',
    'df': 'Mexico City',
    'bcn': 'Barcelona',
    'mad': 'Madrid',
    'ams': 'Amsterdam',
    'ldn': 'London',
    'par': 'Paris',
    'ber': 'Berlin',
    'rom': 'Rome',
    'mil': 'Milan',
    'ath': 'Athens',
    'ist': 'Istanbul',
    'mow': 'Moscow',
    'spb': 'Saint Petersburg',
    'bkk': 'Bangkok',
    'hkg': 'Hong Kong',
    'tpe': 'Taipei',
    'tyo': 'Tokyo',
    'osa': 'Osaka',
    'sel': 'Seoul',
    'bjs': 'Beijing',
    'sha': 'Shanghai',
    'del': 'Delhi',
    'bom': 'Mumbai',
    'blr': 'Bangalore',
    'syd': 'Sydney',
    'mel': 'Melbourne',
    'akl': 'Auckland',
    'wlg': 'Wellington',
    'jnb': 'Johannesburg',
    'cpt': 'Cape Town',
    'cai': 'Cairo',
    'dxb': 'Dubai',
    'tlv': 'Tel Aviv',
    'lis': 'Lisbon',
    'vie': 'Vienna',
    'prg': 'Prague',
    'bud': 'Budapest',
    'waw': 'Warsaw',
    'sto': 'Stockholm',
    'cph': 'Copenhagen',
    'hel': 'Helsinki',
    'osl': 'Oslo',
    'dub': 'Dublin',
    'edi': 'Edinburgh',
    'gla': 'Glasgow',
    'man': 'Manchester',
    'bru': 'Brussels',
    'zur': 'Zurich',
    'gen': 'Geneva',
    'muc': 'Munich',
    'fra': 'Frankfurt',
    'ham': 'Hamburg',
    'tor': 'Toronto',
    'mtl': 'Montreal',
    'van': 'Vancouver',
    'mex': 'Mexico City',
    'gru': 'São Paulo',
    'eze': 'Buenos Aires',
    'scl': 'Santiago',
    'lim': 'Lima',
    'bog': 'Bogotá',
    'ccs': 'Caracas',
    'uio': 'Quito',
    'lpb': 'La Paz',
    'asu': 'Asunción',
    'mvd': 'Montevideo'
  };

  /**
   * Normalize city name by handling abbreviations and common variations
   */
  private static normalizeCityName(cityName: string): string {
    if (!cityName) return '';
    
    const normalized = cityName.trim().toLowerCase();
    
    // Check if it's a known abbreviation
    if (this.cityAbbreviations[normalized]) {
      return this.cityAbbreviations[normalized];
    }
    
    // Remove common suffixes
    const cleaned = normalized
      .replace(/\s*(city|town|ville|burg|stadt|grad)$/i, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
      .trim();
    
    // Capitalize properly
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get geocoding data for a city using OpenStreetMap Nominatim
   * Includes caching and rate limiting to respect API usage policy
   */
  private static async geocodeCity(cityName: string): Promise<GeocodingResult | null> {
    try {
      const normalizedCity = this.normalizeCityName(cityName);
      const cacheKey = normalizedCity.toLowerCase();
      
      // Check cache first
      const cached = this.geocodeCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
        console.log(`[Geocode] Using cached result for: ${cityName}`);
        return cached.data;
      }
      
      // Rate limiting: ensure minimum delay between API calls
      const timeSinceLastCall = Date.now() - this.lastGeocodingCall;
      if (timeSinceLastCall < this.MIN_GEOCODING_DELAY) {
        const waitTime = this.MIN_GEOCODING_DELAY - timeSinceLastCall;
        console.log(`[Geocode] Rate limiting: waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      const encodedCity = encodeURIComponent(normalizedCity);
      this.lastGeocodingCall = Date.now();
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedCity}&format=json&addressdetails=1&limit=1`,
        {
          headers: {
            'User-Agent': 'MundoTango/1.0 (https://mundotango.life)'
          }
        }
      );
      
      if (!response.ok) {
        console.error(`Geocoding failed for ${cityName}: ${response.statusText}`);
        // Cache the failure to avoid repeated attempts
        this.geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
        return null;
      }
      
      const data = await response.json() as any[];
      
      if (data.length === 0) {
        console.warn(`No geocoding results found for ${cityName}`);
        // Cache null result
        this.geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
        return null;
      }
      
      const result = data[0];
      const geoResult: GeocodingResult = {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        display_name: result.display_name,
        address: result.address || {}
      };
      
      // Cache the result
      this.geocodeCache.set(cacheKey, { data: geoResult, timestamp: Date.now() });
      console.log(`[Geocode] Cached result for: ${cityName}`);
      
      return geoResult;
    } catch (error) {
      console.error(`Geocoding error for ${cityName}:`, error);
      return null;
    }
  }

  /**
   * Generate a slug for the city group
   */
  private static generateSlug(cityName: string, country?: string): string {
    const normalizedCity = this.normalizeCityName(cityName);
    let slug = normalizedCity.toLowerCase().replace(/\s+/g, '-');
    
    if (country) {
      const countrySlug = country.toLowerCase().replace(/\s+/g, '-');
      slug = `${slug}-${countrySlug}`;
    }
    
    // Remove any non-alphanumeric characters except hyphens
    return slug.replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Create or get a city group
   */
  static async createOrGetCityGroup(
    cityName: string, 
    triggerType: 'registration' | 'recommendation' | 'event',
    userId?: number,
    country?: string
  ): Promise<{ groupId: number; created: boolean } | null> {
    try {
      if (!cityName || cityName.trim().length === 0) {
        console.warn('Empty city name provided');
        return null;
      }

      const normalizedCity = this.normalizeCityName(cityName);
      
      // Check if group already exists (case-insensitive) - match both city and country for precision
      // Use COALESCE to handle NULL countries consistently with unique constraint
      const existingGroup = await db
        .select()
        .from(groups)
        .where(
          and(
            eq(groups.type, 'city'),
            sql`LOWER(${groups.city}) = LOWER(${normalizedCity})`,
            sql`LOWER(COALESCE(${groups.country}, '')) = LOWER(COALESCE(${country || ''}, ''))`
          )
        )
        .limit(1);
      
      if (existingGroup.length > 0) {
        console.log(`City group already exists: ${normalizedCity}`);
        return { groupId: existingGroup[0].id, created: false };
      }
      
      // Get geocoding data - include country for better accuracy
      const geocodeQuery = country ? `${normalizedCity}, ${country}` : normalizedCity;
      const geoData = await this.geocodeCity(geocodeQuery);
      
      if (!geoData) {
        console.error(`Could not geocode city: ${geocodeQuery}`);
        // Still create the group without coordinates
      }
      
      // Determine the full location name
      let fullLocationName = normalizedCity;
      let resolvedCountry = country || '';
      
      if (geoData?.address) {
        const addr = geoData.address;
        if (!resolvedCountry) {
          resolvedCountry = addr.country || '';
        }
        const state = addr.state || '';
        
        if (resolvedCountry) {
          fullLocationName = state 
            ? `${normalizedCity}, ${state}, ${resolvedCountry}`
            : `${normalizedCity}, ${resolvedCountry}`;
        }
      }
      
      // Generate slug
      const slug = this.generateSlug(normalizedCity, resolvedCountry);
      
      // Create the city group with retry logic for race conditions
      let newGroup;
      try {
        [newGroup] = await db
          .insert(groups)
          .values({
            name: normalizedCity,
            slug: slug,
            description: `Tango community in ${fullLocationName}`,
            type: 'city',
            isPrivate: false,
            memberCount: 0,
            city: normalizedCity,
            country: resolvedCountry || null,
            latitude: geoData?.lat || null,
            longitude: geoData?.lon || null,
            createdBy: userId || 1, // Default to system user if no user provided
            coverImage: null,
            emoji: '🏙️',
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        console.log(`Created new city group: ${normalizedCity} (ID: ${newGroup.id}) via ${triggerType} trigger`);
      } catch (error: any) {
        // Handle race condition: if another request created the same group
        if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          console.log(`[Race condition] City group created by another request: ${normalizedCity}, ${resolvedCountry}`);
          
          // Retry the check for existing group with NULL-safe comparison
          const retryCheck = await db
            .select()
            .from(groups)
            .where(
              and(
                eq(groups.type, 'city'),
                sql`LOWER(${groups.city}) = LOWER(${normalizedCity})`,
                sql`LOWER(COALESCE(${groups.country}, '')) = LOWER(COALESCE(${resolvedCountry || ''}, ''))`
              )
            )
            .limit(1);
          
          if (retryCheck.length > 0) {
            console.log(`[Race condition resolved] Using existing group ID: ${retryCheck[0].id}`);
            return { groupId: retryCheck[0].id, created: false };
          }
        }
        throw error; // Re-throw if not a duplicate key error
      }
      
      // Log the auto-creation event (you might want to create an audit table for this)
      console.log(`Auto-created city group via ${triggerType}:`, {
        groupId: newGroup.id,
        cityName: normalizedCity,
        fullLocation: fullLocationName,
        coordinates: geoData ? { lat: geoData.lat, lon: geoData.lon } : null,
        triggeredBy: userId,
        timestamp: new Date()
      });
      
      return { groupId: newGroup.id, created: true };
    } catch (error) {
      console.error('Error creating city group:', error);
      return null;
    }
  }

  /**
   * Add user to city group
   */
  static async addUserToCityGroup(userId: number, groupId: number, role: string = 'member'): Promise<boolean> {
    try {
      // Check if user is already a member
      const existingMembership = await db
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.userId, userId),
            eq(groupMembers.groupId, groupId)
          )
        )
        .limit(1);
      
      if (existingMembership.length > 0) {
        console.log(`User ${userId} is already a member of group ${groupId}`);
        return true;
      }
      
      // Add user to group
      await db
        .insert(groupMembers)
        .values({
          groupId,
          userId,
          role,
          joinedAt: new Date()
        });
      
      // Update member count
      await db
        .update(groups)
        .set({
          memberCount: sql`${groups.memberCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(groups.id, groupId));
      
      console.log(`Added user ${userId} to city group ${groupId}`);
      return true;
    } catch (error) {
      console.error('Error adding user to city group:', error);
      return false;
    }
  }

  /**
   * Process city from user registration
   */
  static async processRegistrationCity(userId: number, cityName: string): Promise<boolean> {
    try {
      const result = await this.createOrGetCityGroup(cityName, 'registration', userId);
      
      if (!result) {
        console.error(`Failed to create/get city group for registration: ${cityName}`);
        return false;
      }
      
      // Add user to their city group
      const added = await this.addUserToCityGroup(userId, result.groupId, 'member');
      
      if (added && result.created) {
        // Make the registering user an admin of the newly created group
        await db
          .update(groupMembers)
          .set({ role: 'admin' })
          .where(
            and(
              eq(groupMembers.userId, userId),
              eq(groupMembers.groupId, result.groupId)
            )
          );
        
        console.log(`User ${userId} is now admin of newly created city group ${result.groupId}`);
      }
      
      return added;
    } catch (error) {
      console.error('Error processing registration city:', error);
      return false;
    }
  }

  /**
   * Process city from recommendation
   */
  static async processRecommendationCity(cityName: string, userId: number): Promise<number | null> {
    try {
      const result = await this.createOrGetCityGroup(cityName, 'recommendation', userId);
      return result?.groupId || null;
    } catch (error) {
      console.error('Error processing recommendation city:', error);
      return null;
    }
  }

  /**
   * Process city from event creation
   */
  static async processEventCity(cityName: string, userId: number, country?: string): Promise<number | null> {
    try {
      const result = await this.createOrGetCityGroup(cityName, 'event', userId, country);
      return result?.groupId || null;
    } catch (error) {
      console.error('Error processing event city:', error);
      return null;
    }
  }

  /**
   * Extract city from location string
   */
  static extractCityFromLocation(location: string): string | null {
    if (!location) return null;
    
    // Common patterns: "City, State, Country" or "City, Country" or just "City"
    const parts = location.split(',').map(part => part.trim());
    
    if (parts.length > 0 && parts[0]) {
      return parts[0]; // Return the first part as the city
    }
    
    return null;
  }

  /**
   * Handle recommendation city creation
   */
  static async handleRecommendation(
    recommendationId: number,
    city: string,
    country: string,
    userId: number
  ): Promise<{ group: any; isNew: boolean } | null> {
    try {
      const result = await this.createOrGetCityGroup(city, 'recommendation', userId);
      
      if (!result) {
        return null;
      }
      
      // Get the full group data
      const [group] = await db
        .select()
        .from(groups)
        .where(eq(groups.id, result.groupId))
        .limit(1);
      
      return {
        group,
        isNew: result.created
      };
    } catch (error) {
      console.error('Error handling recommendation city:', error);
      return null;
    }
  }

  /**
   * Handle event city creation
   */
  static async handleEvent(
    eventId: number,
    city: string,
    country: string,
    userId: number
  ): Promise<{ group: any; isNew: boolean } | null> {
    try {
      const result = await this.createOrGetCityGroup(city, 'event', userId);
      
      if (!result) {
        return null;
      }
      
      // Get the full group data
      const [group] = await db
        .select()
        .from(groups)
        .where(eq(groups.id, result.groupId))
        .limit(1);
      
      return {
        group,
        isNew: result.created
      };
    } catch (error) {
      console.error('Error handling event city:', error);
      return null;
    }
  }

  /**
   * Handle post city creation
   */
  static async handlePost(
    postId: number,
    city: string,
    country: string,
    userId: number
  ): Promise<{ group: any; isNew: boolean } | null> {
    try {
      const result = await this.createOrGetCityGroup(city, 'recommendation', userId);
      
      if (!result) {
        return null;
      }
      
      // Get the full group data
      const [group] = await db
        .select()
        .from(groups)
        .where(eq(groups.id, result.groupId))
        .limit(1);
      
      return {
        group,
        isNew: result.created
      };
    } catch (error) {
      console.error('Error handling post city:', error);
      return null;
    }
  }

  /**
   * ESA LIFE CEO 56x21 - Handle location from posts (including recommendations)
   * This method is called when a post with location is created
   */
  static async handleLocation(
    city: string,
    country: string,
    userId: number,
    postType: string = 'recommendation'
  ): Promise<{ group: any; isNew: boolean } | null> {
    try {
      console.log(`🌍 ESA LIFE CEO 56x21 - Processing location: ${city}, ${country} for ${postType}`);
      
      // Use recommendation handler to create city groups
      const result = await this.handleRecommendation(
        Date.now(), // Use timestamp as temporary ID
        city,
        country,
        userId
      );
      
      if (result?.isNew) {
        console.log(`✅ ESA LIFE CEO 56x21 - Created new city group: ${city}, ${country}`);
      } else if (result) {
        console.log(`📍 ESA LIFE CEO 56x21 - City group already exists: ${city}, ${country}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ ESA LIFE CEO 56x21 - Error handling location:', error);
      return null;
    }
  }
}