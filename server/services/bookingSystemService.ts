/**
 * ESA LIFE CEO 61x21 - Layer 29: Booking System Service
 * Reservations, availability, confirmations for tango events and services
 */

import { EventEmitter } from 'events';

export interface BookableResource {
  id: string;
  type: 'lesson' | 'milonga' | 'workshop' | 'venue' | 'instructor';
  name: string;
  description: string;
  provider: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  pricing: {
    basePrice: number;
    currency: 'USD' | 'EUR' | 'ARS' | 'GBP';
    priceType: 'per_hour' | 'per_session' | 'per_person' | 'fixed';
    discounts?: {
      type: 'early_bird' | 'bulk' | 'member';
      percentage: number;
      conditions: string;
    }[];
  };
  availability: {
    schedule: {
      dayOfWeek: number; // 0-6 (Sunday-Saturday)
      startTime: string; // HH:MM format
      endTime: string;
      duration: number; // minutes
      maxBookings: number;
    }[];
    blackoutDates: Date[];
    advanceBookingDays: number;
    cancellationPolicy: {
      hours: number;
      refundPercentage: number;
    };
  };
  location: {
    venue?: string;
    address?: string;
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
    isOnline: boolean;
  };
  requirements: {
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
    minAge?: number;
    maxParticipants?: number;
    equipment?: string[];
  };
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  resourceId: string;
  customerId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  bookingDetails: {
    date: Date;
    startTime: string;
    endTime: string;
    duration: number;
    participants: number;
    specialRequests?: string;
  };
  pricing: {
    baseAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    paidAmount: number;
  };
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed';
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    emergencyContact?: {
      name: string;
      phone: string;
    };
  };
  cancellation?: {
    cancelledAt: Date;
    cancelledBy: string;
    reason: string;
    refundAmount: number;
  };
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
  remindersSent: Date[];
}

export interface AvailabilitySlot {
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  spotsRemaining: number;
  price: number;
  currency: string;
}

export interface BookingStatistics {
  resourceId: string;
  period: 'daily' | 'weekly' | 'monthly';
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    noShows: number;
    revenue: number;
    occupancyRate: number;
    averageBookingValue: number;
    repeatCustomers: number;
  };
}

class BookingSystemService extends EventEmitter {
  private resources = new Map<string, BookableResource>();
  private bookings = new Map<string, Booking>();
  private availabilityCache = new Map<string, AvailabilitySlot[]>();

  constructor() {
    super();
    this.setupSampleResources();
    console.log('[ESA Layer 29] Booking system service initialized');
  }

  private setupSampleResources() {
    const sampleResources: BookableResource[] = [
      {
        id: 'instructor_maria_private',
        type: 'lesson',
        name: 'Private Tango Lessons with María González',
        description: 'Professional private tango instruction focusing on technique, musicality, and Argentine tango traditions. Perfect for all skill levels.',
        provider: {
          id: 'instructor_maria',
          name: 'María González',
          avatar: '/avatars/maria.jpg',
          verified: true
        },
        pricing: {
          basePrice: 85,
          currency: 'USD',
          priceType: 'per_hour',
          discounts: [
            { type: 'bulk', percentage: 10, conditions: 'Book 5+ lessons' },
            { type: 'early_bird', percentage: 15, conditions: 'Book 2+ weeks in advance' }
          ]
        },
        availability: {
          schedule: [
            { dayOfWeek: 1, startTime: '10:00', endTime: '20:00', duration: 60, maxBookings: 1 },
            { dayOfWeek: 2, startTime: '14:00', endTime: '20:00', duration: 60, maxBookings: 1 },
            { dayOfWeek: 4, startTime: '10:00', endTime: '18:00', duration: 60, maxBookings: 1 },
            { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', duration: 60, maxBookings: 1 }
          ],
          blackoutDates: [new Date('2025-12-25'), new Date('2025-01-01')],
          advanceBookingDays: 30,
          cancellationPolicy: { hours: 24, refundPercentage: 80 }
        },
        location: {
          venue: 'Studio Central',
          address: '123 Tango Street',
          city: 'Buenos Aires',
          country: 'Argentina',
          isOnline: false
        },
        requirements: {
          skillLevel: 'all',
          maxParticipants: 2,
          equipment: ['Comfortable shoes', 'Appropriate attire']
        },
        tags: ['private', 'technique', 'musicality', 'traditional'],
        rating: { average: 4.9, count: 127 },
        status: 'active',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: 'workshop_nuevo_intensive',
        type: 'workshop',
        name: 'Nuevo Tango Intensive Workshop',
        description: 'Three-day intensive workshop exploring contemporary tango movements, unconventional figures, and modern interpretation.',
        provider: {
          id: 'instructor_carlos',
          name: 'Carlos & Elena',
          verified: true
        },
        pricing: {
          basePrice: 150,
          currency: 'USD',
          priceType: 'per_person',
          discounts: [
            { type: 'early_bird', percentage: 20, conditions: '1 month early registration' }
          ]
        },
        availability: {
          schedule: [
            { dayOfWeek: 5, startTime: '19:00', endTime: '22:00', duration: 180, maxBookings: 30 },
            { dayOfWeek: 6, startTime: '14:00', endTime: '18:00', duration: 240, maxBookings: 30 },
            { dayOfWeek: 0, startTime: '14:00', endTime: '17:00', duration: 180, maxBookings: 30 }
          ],
          blackoutDates: [],
          advanceBookingDays: 60,
          cancellationPolicy: { hours: 72, refundPercentage: 90 }
        },
        location: {
          venue: 'Tango Academy Paris',
          address: '45 Rue de la Danse',
          city: 'Paris',
          country: 'France',
          isOnline: false
        },
        requirements: {
          skillLevel: 'intermediate',
          minAge: 16,
          maxParticipants: 30,
          equipment: ['Tango shoes recommended', 'Comfortable clothing']
        },
        tags: ['nuevo', 'intensive', 'weekend', 'contemporary'],
        rating: { average: 4.7, count: 43 },
        status: 'active',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: 'milonga_salon_weekly',
        type: 'milonga',
        name: 'Traditional Salon Milonga',
        description: 'Weekly traditional milonga with classic tandas and cortinas. Perfect for practicing your salon tango in an authentic atmosphere.',
        provider: {
          id: 'organizer_pablo',
          name: 'Milonga Organizers BA',
          verified: true
        },
        pricing: {
          basePrice: 15,
          currency: 'USD',
          priceType: 'per_person'
        },
        availability: {
          schedule: [
            { dayOfWeek: 3, startTime: '21:00', endTime: '02:00', duration: 300, maxBookings: 120 }
          ],
          blackoutDates: [],
          advanceBookingDays: 7,
          cancellationPolicy: { hours: 2, refundPercentage: 50 }
        },
        location: {
          venue: 'Salon Canning',
          address: 'Scalabrini Ortiz 1331',
          city: 'Buenos Aires',
          country: 'Argentina',
          isOnline: false
        },
        requirements: {
          skillLevel: 'all',
          minAge: 18,
          maxParticipants: 120
        },
        tags: ['traditional', 'milonga', 'weekly', 'salon'],
        rating: { average: 4.8, count: 892 },
        status: 'active',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    sampleResources.forEach(resource => {
      this.resources.set(resource.id, resource);
    });

    console.log(`[ESA Layer 29] Loaded ${sampleResources.length} bookable resources`);
  }

  async createResource(
    providerId: string,
    resourceData: Omit<BookableResource, 'id' | 'createdAt' | 'updatedAt' | 'rating'>
  ): Promise<string> {
    const resourceId = `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const resource: BookableResource = {
      ...resourceData,
      id: resourceId,
      rating: { average: 0, count: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.resources.set(resourceId, resource);

    this.emit('resourceCreated', resource);
    console.log(`[ESA Layer 29] Created bookable resource ${resourceId}: ${resource.name}`);

    return resourceId;
  }

  async getAvailability(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilitySlot[]> {
    const resource = this.resources.get(resourceId);
    if (!resource) return [];

    const cacheKey = `${resourceId}-${startDate.toISOString()}-${endDate.toISOString()}`;
    const cached = this.availabilityCache.get(cacheKey);
    if (cached) return cached;

    const slots: AvailabilitySlot[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const scheduleItems = resource.availability.schedule.filter(s => s.dayOfWeek === dayOfWeek);

      for (const scheduleItem of scheduleItems) {
        // Check if date is not blacklisted
        const isBlackout = resource.availability.blackoutDates.some(
          blackoutDate => blackoutDate.toDateString() === currentDate.toDateString()
        );

        if (!isBlackout) {
          // Check existing bookings for this date and time
          const existingBookings = this.getBookingsForSlot(
            resourceId,
            currentDate,
            scheduleItem.startTime,
            scheduleItem.endTime
          );

          const confirmedBookings = existingBookings.filter(
            b => b.status === 'confirmed' || b.status === 'pending'
          );

          const spotsRemaining = scheduleItem.maxBookings - confirmedBookings.length;

          slots.push({
            date: new Date(currentDate),
            startTime: scheduleItem.startTime,
            endTime: scheduleItem.endTime,
            available: spotsRemaining > 0,
            spotsRemaining,
            price: this.calculatePrice(resource, currentDate),
            currency: resource.pricing.currency
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Cache for 5 minutes
    this.availabilityCache.set(cacheKey, slots);
    setTimeout(() => this.availabilityCache.delete(cacheKey), 5 * 60 * 1000);

    return slots;
  }

  private getBookingsForSlot(
    resourceId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Booking[] {
    return Array.from(this.bookings.values()).filter(booking => {
      return booking.resourceId === resourceId &&
             booking.bookingDetails.date.toDateString() === date.toDateString() &&
             booking.bookingDetails.startTime === startTime &&
             (booking.status === 'confirmed' || booking.status === 'pending');
    });
  }

  private calculatePrice(resource: BookableResource, date: Date): number {
    let price = resource.pricing.basePrice;
    
    // Apply early bird discount if applicable
    const earlyBirdDiscount = resource.pricing.discounts?.find(d => d.type === 'early_bird');
    if (earlyBirdDiscount) {
      const daysInAdvance = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysInAdvance >= 14) { // 2 weeks advance
        price *= (1 - earlyBirdDiscount.percentage / 100);
      }
    }

    return Math.round(price * 100) / 100; // Round to 2 decimal places
  }

  async createBooking(
    resourceId: string,
    customerId: string,
    bookingData: {
      date: Date;
      startTime: string;
      participants: number;
      specialRequests?: string;
      customer: {
        name: string;
        email: string;
        phone?: string;
      };
    }
  ): Promise<string | null> {
    const resource = this.resources.get(resourceId);
    if (!resource) return null;

    // Check availability
    const availabilitySlots = await this.getAvailability(
      resourceId,
      bookingData.date,
      bookingData.date
    );

    const slot = availabilitySlots.find(s => 
      s.date.toDateString() === bookingData.date.toDateString() &&
      s.startTime === bookingData.startTime &&
      s.available &&
      s.spotsRemaining >= bookingData.participants
    );

    if (!slot) {
      console.log(`[ESA Layer 29] No availability for booking on ${bookingData.date} at ${bookingData.startTime}`);
      return null;
    }

    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Find schedule item to get duration and end time
    const dayOfWeek = bookingData.date.getDay();
    const scheduleItem = resource.availability.schedule.find(s => 
      s.dayOfWeek === dayOfWeek && s.startTime === bookingData.startTime
    );

    if (!scheduleItem) return null;

    const baseAmount = slot.price * bookingData.participants;
    
    const booking: Booking = {
      id: bookingId,
      resourceId,
      customerId,
      status: 'pending',
      bookingDetails: {
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: scheduleItem.endTime,
        duration: scheduleItem.duration,
        participants: bookingData.participants,
        specialRequests: bookingData.specialRequests
      },
      pricing: {
        baseAmount,
        discountAmount: 0,
        totalAmount: baseAmount,
        currency: resource.pricing.currency,
        paidAmount: 0
      },
      paymentStatus: 'pending',
      customer: {
        id: customerId,
        name: bookingData.customer.name,
        email: bookingData.customer.email,
        phone: bookingData.customer.phone
      },
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      remindersSent: []
    };

    this.bookings.set(bookingId, booking);

    // Clear availability cache
    this.clearAvailabilityCache(resourceId);

    this.emit('bookingCreated', booking);
    console.log(`[ESA Layer 29] Created booking ${bookingId} for resource ${resourceId}`);

    return bookingId;
  }

  async confirmBooking(bookingId: string, paymentConfirmed = false): Promise<boolean> {
    const booking = this.bookings.get(bookingId);
    if (!booking) return false;

    booking.status = 'confirmed';
    booking.updatedAt = new Date();

    if (paymentConfirmed) {
      booking.paymentStatus = 'paid';
      booking.pricing.paidAmount = booking.pricing.totalAmount;
    }

    this.bookings.set(bookingId, booking);

    // Schedule reminder (in a real system, this would use a job queue)
    this.scheduleReminders(booking);

    this.emit('bookingConfirmed', booking);
    console.log(`[ESA Layer 29] Confirmed booking ${bookingId}`);

    return true;
  }

  async cancelBooking(
    bookingId: string,
    cancelledBy: string,
    reason: string
  ): Promise<{ success: boolean; refundAmount: number }> {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, refundAmount: 0 };

    const resource = this.resources.get(booking.resourceId);
    if (!resource) return { success: false, refundAmount: 0 };

    const now = new Date();
    const bookingDateTime = new Date(
      booking.bookingDetails.date.toDateString() + ' ' + booking.bookingDetails.startTime
    );
    
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Calculate refund based on cancellation policy
    let refundPercentage = 0;
    if (hoursUntilBooking >= resource.availability.cancellationPolicy.hours) {
      refundPercentage = resource.availability.cancellationPolicy.refundPercentage;
    }

    const refundAmount = (booking.pricing.paidAmount * refundPercentage) / 100;

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: now,
      cancelledBy,
      reason,
      refundAmount
    };
    booking.updatedAt = now;

    this.bookings.set(bookingId, booking);

    // Clear availability cache
    this.clearAvailabilityCache(booking.resourceId);

    this.emit('bookingCancelled', booking);
    console.log(`[ESA Layer 29] Cancelled booking ${bookingId}, refund: ${refundAmount}`);

    return { success: true, refundAmount };
  }

  private scheduleReminders(booking: Booking) {
    const bookingDateTime = new Date(
      booking.bookingDetails.date.toDateString() + ' ' + booking.bookingDetails.startTime
    );

    // Schedule 24-hour reminder
    const reminderTime24h = new Date(bookingDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (reminderTime24h > new Date()) {
      setTimeout(() => {
        this.sendReminder(booking, '24 hours');
      }, reminderTime24h.getTime() - Date.now());
    }

    // Schedule 2-hour reminder
    const reminderTime2h = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
    if (reminderTime2h > new Date()) {
      setTimeout(() => {
        this.sendReminder(booking, '2 hours');
      }, reminderTime2h.getTime() - Date.now());
    }
  }

  private sendReminder(booking: Booking, timeframe: string) {
    if (booking.status !== 'confirmed') return;

    console.log(`[ESA Layer 29] Reminder sent for booking ${booking.id}: ${timeframe} before`);
    
    // Update reminder tracking
    booking.remindersSent.push(new Date());
    this.bookings.set(booking.id, booking);
    
    this.emit('reminderSent', booking, timeframe);
    
    // In a real system, this would integrate with the notification service
    // await notificationService.sendBookingReminder(booking.customer.email, booking, timeframe);
  }

  private clearAvailabilityCache(resourceId: string) {
    // Clear all cache entries for this resource
    const keysToDelete = Array.from(this.availabilityCache.keys())
      .filter(key => key.startsWith(resourceId));
    
    keysToDelete.forEach(key => {
      this.availabilityCache.delete(key);
    });
  }

  async searchResources(criteria: {
    type?: BookableResource['type'];
    location?: string;
    date?: Date;
    skillLevel?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    sortBy?: 'price' | 'rating' | 'distance' | 'popularity';
    limit?: number;
  }): Promise<BookableResource[]> {
    let resources = Array.from(this.resources.values())
      .filter(resource => resource.status === 'active');

    // Apply filters
    if (criteria.type) {
      resources = resources.filter(r => r.type === criteria.type);
    }

    if (criteria.location) {
      const location = criteria.location.toLowerCase();
      resources = resources.filter(r => 
        r.location.city.toLowerCase().includes(location) ||
        r.location.country.toLowerCase().includes(location)
      );
    }

    if (criteria.skillLevel && criteria.skillLevel !== 'all') {
      resources = resources.filter(r => 
        !r.requirements.skillLevel || 
        r.requirements.skillLevel === 'all' || 
        r.requirements.skillLevel === criteria.skillLevel
      );
    }

    if (criteria.minPrice !== undefined) {
      resources = resources.filter(r => r.pricing.basePrice >= criteria.minPrice!);
    }

    if (criteria.maxPrice !== undefined) {
      resources = resources.filter(r => r.pricing.basePrice <= criteria.maxPrice!);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      resources = resources.filter(r => 
        criteria.tags!.some(tag => r.tags.includes(tag))
      );
    }

    // Apply date availability filter
    if (criteria.date) {
      const availableResources: BookableResource[] = [];
      
      for (const resource of resources) {
        const availability = await this.getAvailability(
          resource.id,
          criteria.date,
          criteria.date
        );
        
        if (availability.some(slot => slot.available)) {
          availableResources.push(resource);
        }
      }
      
      resources = availableResources;
    }

    // Apply sorting
    switch (criteria.sortBy) {
      case 'price':
        resources.sort((a, b) => a.pricing.basePrice - b.pricing.basePrice);
        break;
      case 'rating':
        resources.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case 'popularity':
        resources.sort((a, b) => b.rating.count - a.rating.count);
        break;
      default:
        // Default sort by rating then by count
        resources.sort((a, b) => {
          if (a.rating.average !== b.rating.average) {
            return b.rating.average - a.rating.average;
          }
          return b.rating.count - a.rating.count;
        });
    }

    return resources.slice(0, criteria.limit || 20);
  }

  getBooking(bookingId: string): Booking | null {
    return this.bookings.get(bookingId) || null;
  }

  getUserBookings(
    customerId: string,
    status?: Booking['status']
  ): Booking[] {
    return Array.from(this.bookings.values())
      .filter(booking => 
        booking.customerId === customerId &&
        (!status || booking.status === status)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getProviderBookings(
    providerId: string,
    status?: Booking['status']
  ): Booking[] {
    const providerResources = Array.from(this.resources.values())
      .filter(resource => resource.provider.id === providerId)
      .map(resource => resource.id);

    return Array.from(this.bookings.values())
      .filter(booking => 
        providerResources.includes(booking.resourceId) &&
        (!status || booking.status === status)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBookingStatistics(
    resourceId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<BookingStatistics> {
    const bookings = Array.from(this.bookings.values())
      .filter(booking => booking.resourceId === resourceId);

    const now = new Date();
    let periodStart: Date;

    switch (period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const periodBookings = bookings.filter(
      booking => booking.createdAt >= periodStart
    );

    const confirmedBookings = periodBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const cancelledBookings = periodBookings.filter(b => b.status === 'cancelled');
    const noShows = periodBookings.filter(b => b.status === 'no_show');

    const revenue = confirmedBookings.reduce((acc, b) => acc + b.pricing.paidAmount, 0);
    const averageBookingValue = confirmedBookings.length > 0 ? revenue / confirmedBookings.length : 0;

    // Calculate occupancy rate (simplified)
    const resource = this.resources.get(resourceId);
    const maxCapacity = resource?.availability.schedule.reduce((acc, s) => acc + s.maxBookings, 0) || 1;
    const occupancyRate = (confirmedBookings.length / maxCapacity) * 100;

    // Count repeat customers
    const customerIds = new Set();
    const repeatCustomers = confirmedBookings.filter(booking => {
      if (customerIds.has(booking.customerId)) {
        return true;
      } else {
        customerIds.add(booking.customerId);
        return false;
      }
    }).length;

    return {
      resourceId,
      period,
      stats: {
        totalBookings: periodBookings.length,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: cancelledBookings.length,
        noShows: noShows.length,
        revenue: Math.round(revenue * 100) / 100,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
        repeatCustomers
      }
    };
  }

  getSystemMetrics() {
    const resources = Array.from(this.resources.values());
    const bookings = Array.from(this.bookings.values());
    
    const activeResources = resources.filter(r => r.status === 'active').length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((acc, b) => acc + b.pricing.paidAmount, 0);

    const last30Days = bookings.filter(
      b => b.createdAt.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    return {
      totalResources: resources.length,
      activeResources,
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRating: resources.reduce((acc, r) => acc + r.rating.average, 0) / resources.length || 0,
      last30Days: {
        newBookings: last30Days.length,
        revenue: last30Days
          .filter(b => b.status === 'confirmed' || b.status === 'completed')
          .reduce((acc, b) => acc + b.pricing.paidAmount, 0)
      },
      resourceTypes: {
        lessons: resources.filter(r => r.type === 'lesson').length,
        workshops: resources.filter(r => r.type === 'workshop').length,
        milongas: resources.filter(r => r.type === 'milonga').length,
        venues: resources.filter(r => r.type === 'venue').length
      }
    };
  }
}

export const bookingSystemService = new BookingSystemService();

// Export for Layer 57 (Automation Management) integration
export const setupBookingAutomation = () => {
  // Check for no-shows and update booking status
  setInterval(() => {
    const now = new Date();
    let noShowsMarked = 0;
    
    for (const [id, booking] of bookingSystemService['bookings'].entries()) {
      if (booking.status === 'confirmed') {
        const bookingDateTime = new Date(
          booking.bookingDetails.date.toDateString() + ' ' + booking.bookingDetails.startTime
        );
        
        // Mark as no-show if 2 hours past booking time
        const twoHoursAfter = new Date(bookingDateTime.getTime() + 2 * 60 * 60 * 1000);
        if (now > twoHoursAfter) {
          booking.status = 'no_show';
          booking.updatedAt = now;
          bookingSystemService['bookings'].set(id, booking);
          noShowsMarked++;
        }
      }
    }
    
    if (noShowsMarked > 0) {
      console.log(`[ESA Layer 29] Marked ${noShowsMarked} bookings as no-shows`);
    }
  }, 60 * 60 * 1000); // Check every hour

  // Clear old availability cache every 30 minutes
  setInterval(() => {
    bookingSystemService['availabilityCache'].clear();
    console.log('[ESA Layer 29] Cleared availability cache');
  }, 30 * 60 * 1000);
};