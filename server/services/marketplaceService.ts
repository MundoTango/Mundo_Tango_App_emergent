/**
 * ESA LIFE CEO 61x21 - Layer 28: Marketplace Service
 * Listings, transactions, reviews, tango-related commerce
 */

import { EventEmitter } from 'events';

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  category: 'shoes' | 'clothing' | 'instruments' | 'lessons' | 'accessories' | 'music' | 'events' | 'other';
  subcategory: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: 'USD' | 'EUR' | 'ARS' | 'GBP';
    negotiable: boolean;
  };
  images: string[];
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  location: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  shipping: {
    available: boolean;
    cost?: number;
    worldwide: boolean;
    estimatedDays?: number;
  };
  status: 'draft' | 'active' | 'sold' | 'paused' | 'expired' | 'removed';
  features: string[];
  specifications: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  views: number;
  favorites: number;
  promoted: boolean;
}

export interface MarketplaceTransaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer' | 'cash' | 'other';
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface MarketplaceReview {
  id: string;
  transactionId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number; // 1-5 stars
  comment: string;
  type: 'buyer' | 'seller';
  helpful: number;
  createdAt: Date;
}

export interface UserMarketplaceProfile {
  userId: string;
  rating: {
    average: number;
    count: number;
    breakdown: { 1: number; 2: number; 3: number; 4: number; 5: number };
  };
  stats: {
    totalSales: number;
    totalPurchases: number;
    responseTime: number; // average hours
    completionRate: number; // percentage
  };
  badges: string[];
  joinedAt: Date;
  lastActive: Date;
}

class MarketplaceService extends EventEmitter {
  private listings = new Map<string, MarketplaceListing>();
  private transactions = new Map<string, MarketplaceTransaction>();
  private reviews = new Map<string, MarketplaceReview>();
  private userProfiles = new Map<string, UserMarketplaceProfile>();

  constructor() {
    super();
    this.setupSampleData();
    console.log('[ESA Layer 28] Marketplace service initialized');
  }

  private setupSampleData() {
    // Sample listings for demonstration
    const sampleListings: MarketplaceListing[] = [
      {
        id: 'listing_shoes_001',
        sellerId: 'seller_maria_ba',
        category: 'shoes',
        subcategory: 'women_heels',
        title: 'Professional Tango Heels - Comme il Faut, Size 39',
        description: 'Beautiful red tango shoes from Comme il Faut, barely worn. Perfect for milongas and performances. Made in Buenos Aires with premium leather.',
        price: { amount: 180, currency: 'USD', negotiable: true },
        images: ['/images/shoes/cif_red_heels.jpg', '/images/shoes/cif_side.jpg'],
        condition: 'excellent',
        location: { city: 'Buenos Aires', country: 'Argentina' },
        shipping: { available: true, cost: 25, worldwide: true, estimatedDays: 7 },
        status: 'active',
        features: ['Suede sole', 'Leather upper', '8cm heel', 'Adjustable strap'],
        specifications: { size: 39, brand: 'Comme il Faut', heelHeight: '8cm', color: 'red' },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        views: 156,
        favorites: 23,
        promoted: false
      },
      {
        id: 'listing_lessons_001',
        sellerId: 'instructor_carlos',
        category: 'lessons',
        subcategory: 'private_lessons',
        title: 'Private Tango Lessons with Professional Instructor',
        description: 'Learn authentic Argentine Tango with 15 years of experience. Specializing in technique, musicality, and leading/following. All levels welcome.',
        price: { amount: 80, currency: 'USD', negotiable: false },
        images: ['/images/lessons/carlos_teaching.jpg'],
        condition: 'new',
        location: { city: 'Paris', country: 'France' },
        shipping: { available: false, worldwide: false },
        status: 'active',
        features: ['One-on-one instruction', 'Flexible scheduling', 'All skill levels', 'Studio included'],
        specifications: { duration: '60 minutes', location: 'Central Paris', experience: '15 years' },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        views: 89,
        favorites: 12,
        promoted: true
      },
      {
        id: 'listing_bandoneon_001',
        sellerId: 'musician_pablo',
        category: 'instruments',
        subcategory: 'bandoneon',
        title: 'Vintage Bandoneon AA 142-tone Rheinische Tonlage',
        description: 'Beautiful vintage bandoneon in excellent playing condition. Perfect for traditional tango music. Recently serviced and tuned.',
        price: { amount: 3500, currency: 'EUR', negotiable: true },
        images: ['/images/instruments/bandoneon_front.jpg', '/images/instruments/bandoneon_side.jpg'],
        condition: 'good',
        location: { city: 'Berlin', country: 'Germany' },
        shipping: { available: true, cost: 150, worldwide: false, estimatedDays: 5 },
        status: 'active',
        features: ['142 tones', 'Rheinische tonlage', 'Original case', 'Recently serviced'],
        specifications: { tones: 142, type: 'Rheinische', year: '1960s', brand: 'AA' },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        views: 234,
        favorites: 45,
        promoted: true
      }
    ];

    sampleListings.forEach(listing => {
      this.listings.set(listing.id, listing);
    });

    console.log(`[ESA Layer 28] Loaded ${sampleListings.length} sample marketplace listings`);
  }

  async createListing(
    sellerId: string,
    listingData: Omit<MarketplaceListing, 'id' | 'sellerId' | 'createdAt' | 'updatedAt' | 'views' | 'favorites'>
  ): Promise<string> {
    const listingId = `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const listing: MarketplaceListing = {
      ...listingData,
      id: listingId,
      sellerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      favorites: 0
    };

    this.listings.set(listingId, listing);

    // Ensure user has marketplace profile
    await this.ensureUserProfile(sellerId);

    this.emit('listingCreated', listing);
    console.log(`[ESA Layer 28] Created listing ${listingId} by user ${sellerId}: ${listing.title}`);

    return listingId;
  }

  async updateListing(
    listingId: string,
    updates: Partial<MarketplaceListing>,
    userId: string
  ): Promise<boolean> {
    const listing = this.listings.get(listingId);
    if (!listing || listing.sellerId !== userId) {
      return false;
    }

    const updatedListing = {
      ...listing,
      ...updates,
      updatedAt: new Date()
    };

    this.listings.set(listingId, updatedListing);

    this.emit('listingUpdated', updatedListing);
    console.log(`[ESA Layer 28] Updated listing ${listingId}`);

    return true;
  }

  async searchListings(criteria: {
    query?: string;
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    location?: string;
    condition?: string;
    shippingAvailable?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'relevance';
    limit?: number;
    offset?: number;
  }): Promise<{
    listings: MarketplaceListing[];
    total: number;
    hasMore: boolean;
  }> {
    let results = Array.from(this.listings.values())
      .filter(listing => listing.status === 'active');

    // Apply filters
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.features.some(f => f.toLowerCase().includes(query))
      );
    }

    if (criteria.category) {
      results = results.filter(listing => listing.category === criteria.category);
    }

    if (criteria.subcategory) {
      results = results.filter(listing => listing.subcategory === criteria.subcategory);
    }

    if (criteria.minPrice !== undefined) {
      results = results.filter(listing => listing.price.amount >= criteria.minPrice!);
    }

    if (criteria.maxPrice !== undefined) {
      results = results.filter(listing => listing.price.amount <= criteria.maxPrice!);
    }

    if (criteria.currency) {
      results = results.filter(listing => listing.price.currency === criteria.currency);
    }

    if (criteria.location) {
      const location = criteria.location.toLowerCase();
      results = results.filter(listing => 
        listing.location.city.toLowerCase().includes(location) ||
        listing.location.country.toLowerCase().includes(location)
      );
    }

    if (criteria.condition) {
      results = results.filter(listing => listing.condition === criteria.condition);
    }

    if (criteria.shippingAvailable !== undefined) {
      results = results.filter(listing => listing.shipping.available === criteria.shippingAvailable);
    }

    // Apply sorting
    switch (criteria.sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'newest':
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'popular':
        results.sort((a, b) => (b.views + b.favorites * 5) - (a.views + a.favorites * 5));
        break;
      default:
        // Relevance or default - promoted listings first, then by views
        results.sort((a, b) => {
          if (a.promoted !== b.promoted) return b.promoted ? 1 : -1;
          return b.views - a.views;
        });
    }

    const limit = criteria.limit || 20;
    const offset = criteria.offset || 0;
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      listings: paginatedResults,
      total: results.length,
      hasMore: offset + limit < results.length
    };
  }

  async getListing(listingId: string, viewerId?: string): Promise<MarketplaceListing | null> {
    const listing = this.listings.get(listingId);
    if (!listing) return null;

    // Increment view count (but not for the seller viewing their own listing)
    if (viewerId && viewerId !== listing.sellerId) {
      listing.views++;
      this.listings.set(listingId, listing);
    }

    return listing;
  }

  async createTransaction(
    listingId: string,
    buyerId: string,
    shippingAddress?: MarketplaceTransaction['shippingAddress']
  ): Promise<string | null> {
    const listing = this.listings.get(listingId);
    if (!listing || listing.status !== 'active' || listing.sellerId === buyerId) {
      return null;
    }

    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: MarketplaceTransaction = {
      id: transactionId,
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      amount: listing.price.amount,
      currency: listing.price.currency,
      status: 'pending',
      paymentMethod: 'stripe', // Default to Stripe
      shippingAddress,
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.transactions.set(transactionId, transaction);

    // Mark listing as sold (or keep active for multiple quantity items)
    listing.status = 'sold';
    this.listings.set(listingId, listing);

    // Ensure both users have marketplace profiles
    await this.ensureUserProfile(buyerId);
    await this.ensureUserProfile(listing.sellerId);

    this.emit('transactionCreated', transaction);
    console.log(`[ESA Layer 28] Created transaction ${transactionId}: ${buyerId} buying from ${listing.sellerId}`);

    return transactionId;
  }

  async updateTransactionStatus(
    transactionId: string,
    status: MarketplaceTransaction['status'],
    userId: string,
    note?: string
  ): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || (transaction.buyerId !== userId && transaction.sellerId !== userId)) {
      return false;
    }

    transaction.status = status;
    transaction.updatedAt = new Date();

    if (note) {
      transaction.notes.push(`${new Date().toISOString()}: ${note}`);
    }

    if (status === 'completed' || status === 'cancelled') {
      transaction.completedAt = new Date();
    }

    this.transactions.set(transactionId, transaction);

    // Update user statistics
    if (status === 'completed') {
      await this.updateUserStats(transaction.sellerId, 'sale');
      await this.updateUserStats(transaction.buyerId, 'purchase');
    }

    this.emit('transactionUpdated', transaction);
    console.log(`[ESA Layer 28] Transaction ${transactionId} status updated to ${status}`);

    return true;
  }

  async createReview(
    transactionId: string,
    reviewerId: string,
    rating: number,
    comment: string
  ): Promise<string | null> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.status !== 'completed') {
      return null;
    }

    // Determine reviewer type and who is being reviewed
    let reviewedUserId: string;
    let reviewType: 'buyer' | 'seller';

    if (reviewerId === transaction.buyerId) {
      reviewedUserId = transaction.sellerId;
      reviewType = 'buyer';
    } else if (reviewerId === transaction.sellerId) {
      reviewedUserId = transaction.buyerId;
      reviewType = 'seller';
    } else {
      return null; // Reviewer not part of transaction
    }

    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const review: MarketplaceReview = {
      id: reviewId,
      transactionId,
      reviewerId,
      reviewedUserId,
      rating: Math.max(1, Math.min(5, rating)), // Ensure 1-5 range
      comment,
      type: reviewType,
      helpful: 0,
      createdAt: new Date()
    };

    this.reviews.set(reviewId, review);

    // Update user's rating
    await this.updateUserRating(reviewedUserId, rating);

    this.emit('reviewCreated', review);
    console.log(`[ESA Layer 28] Created review ${reviewId}: ${rating} stars for user ${reviewedUserId}`);

    return reviewId;
  }

  private async ensureUserProfile(userId: string): Promise<UserMarketplaceProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        rating: { average: 0, count: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        stats: { totalSales: 0, totalPurchases: 0, responseTime: 0, completionRate: 0 },
        badges: [],
        joinedAt: new Date(),
        lastActive: new Date()
      };
      
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  private async updateUserRating(userId: string, newRating: number): Promise<void> {
    const profile = await this.ensureUserProfile(userId);
    
    // Update rating breakdown
    profile.rating.breakdown[newRating as keyof typeof profile.rating.breakdown]++;
    profile.rating.count++;
    
    // Recalculate average
    let totalRating = 0;
    Object.entries(profile.rating.breakdown).forEach(([stars, count]) => {
      totalRating += parseInt(stars) * count;
    });
    
    profile.rating.average = totalRating / profile.rating.count;
    
    this.userProfiles.set(userId, profile);
  }

  private async updateUserStats(userId: string, type: 'sale' | 'purchase'): Promise<void> {
    const profile = await this.ensureUserProfile(userId);
    
    if (type === 'sale') {
      profile.stats.totalSales++;
    } else {
      profile.stats.totalPurchases++;
    }
    
    // Award badges based on milestones
    if (profile.stats.totalSales === 1 && !profile.badges.includes('first_sale')) {
      profile.badges.push('first_sale');
    } else if (profile.stats.totalSales === 10 && !profile.badges.includes('experienced_seller')) {
      profile.badges.push('experienced_seller');
    } else if (profile.stats.totalSales >= 50 && !profile.badges.includes('marketplace_pro')) {
      profile.badges.push('marketplace_pro');
    }
    
    // High rating badges
    if (profile.rating.count >= 10 && profile.rating.average >= 4.8 && !profile.badges.includes('top_rated')) {
      profile.badges.push('top_rated');
    }
    
    this.userProfiles.set(userId, profile);
  }

  async getUserProfile(userId: string): Promise<UserMarketplaceProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  async getUserListings(userId: string, status?: MarketplaceListing['status']): Promise<MarketplaceListing[]> {
    return Array.from(this.listings.values())
      .filter(listing => listing.sellerId === userId && (!status || listing.status === status))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getUserTransactions(
    userId: string,
    type?: 'buying' | 'selling'
  ): Promise<MarketplaceTransaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => {
        if (type === 'buying') return transaction.buyerId === userId;
        if (type === 'selling') return transaction.sellerId === userId;
        return transaction.buyerId === userId || transaction.sellerId === userId;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserReviews(userId: string): Promise<MarketplaceReview[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.reviewedUserId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFeaturedListings(category?: string, limit = 10): Promise<MarketplaceListing[]> {
    let listings = Array.from(this.listings.values())
      .filter(listing => listing.status === 'active');

    if (category) {
      listings = listings.filter(listing => listing.category === category);
    }

    // Promoted listings first, then by popularity
    return listings
      .sort((a, b) => {
        if (a.promoted !== b.promoted) return b.promoted ? 1 : -1;
        return (b.views + b.favorites * 5) - (a.views + a.favorites * 5);
      })
      .slice(0, limit);
  }

  getCategories(): Array<{ category: string; subcategories: string[]; count: number }> {
    const categoryMap = new Map<string, { subcategories: Set<string>; count: number }>();
    
    Array.from(this.listings.values())
      .filter(listing => listing.status === 'active')
      .forEach(listing => {
        if (!categoryMap.has(listing.category)) {
          categoryMap.set(listing.category, { subcategories: new Set(), count: 0 });
        }
        
        const categoryData = categoryMap.get(listing.category)!;
        categoryData.subcategories.add(listing.subcategory);
        categoryData.count++;
      });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      subcategories: Array.from(data.subcategories),
      count: data.count
    }));
  }

  getSystemMetrics() {
    const listings = Array.from(this.listings.values());
    const transactions = Array.from(this.transactions.values());
    const reviews = Array.from(this.reviews.values());
    
    const activeListings = listings.filter(l => l.status === 'active').length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const averageRating = reviews.length > 0 
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
      : 0;
    
    const totalValue = transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      totalListings: listings.length,
      activeListings,
      totalTransactions: transactions.length,
      completedTransactions,
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalMarketplaceValue: totalValue,
      activeUsers: this.userProfiles.size,
      categoriesCount: this.getCategories().length,
      last30Days: {
        newListings: listings.filter(l => l.createdAt.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length,
        completedSales: transactions.filter(t => 
          t.status === 'completed' && t.completedAt && 
          t.completedAt.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        ).length
      }
    };
  }
}

export const marketplaceService = new MarketplaceService();

// Export for Layer 57 (Automation Management) integration
export const setupMarketplaceAutomation = () => {
  // Auto-expire old listings every day
  setInterval(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let expired = 0;
    
    for (const [id, listing] of marketplaceService['listings'].entries()) {
      if (listing.status === 'active' && listing.createdAt < thirtyDaysAgo) {
        listing.status = 'expired';
        marketplaceService['listings'].set(id, listing);
        expired++;
      }
    }
    
    if (expired > 0) {
      console.log(`[ESA Layer 28] Auto-expired ${expired} old marketplace listings`);
    }
  }, 24 * 60 * 60 * 1000);

  // Monitor transaction completion rates
  setInterval(() => {
    const metrics = marketplaceService.getSystemMetrics();
    const completionRate = metrics.totalTransactions > 0 
      ? (metrics.completedTransactions / metrics.totalTransactions) * 100 
      : 0;
    
    if (completionRate < 70) {
      console.log(`[ESA Layer 28] Low transaction completion rate: ${completionRate.toFixed(1)}%`);
    }
  }, 60 * 60 * 1000);
};