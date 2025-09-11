/**
 * ESA LIFE CEO 61×21 - API Response Types
 * Standardized API response interfaces following { success, data } pattern
 */

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Event API Types
export interface EventWaitlist {
  id: number;
  eventId: number;
  userId: number;
  position: number;
  joinedAt: string;
  notificationsSent: boolean;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

export interface EventCheckIn {
  id: number;
  eventId: number;
  userId: number;
  checkInTime: string;
  checkOutTime?: string;
  role?: string;
  notes?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

export interface EventAnalytics {
  eventId: number;
  totalViews: number;
  rsvpBreakdown: {
    going: number;
    interested: number;
    maybe: number;
    notGoing: number;
  };
  waitlistCount: number;
  checkInCount: number;
  noShowCount: number;
  popularTimes: Array<{
    hour: number;
    count: number;
  }>;
  attendanceRate: number;
  conversionRate: number; // From interested to going
}

// API Endpoint Types
export interface CreateEventRequest {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  maxAttendees?: number;
  eventType?: string;
  level?: string;
  price?: string;
  currency?: string;
  isPublic?: boolean;
  isRecurring?: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
  assignedRoles?: Array<{
    userIdentifier: string;
    role: string;
  }>;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: number;
}

export interface RSVPRequest {
  eventId: number;
  status: 'going' | 'interested' | 'maybe' | 'not_going';
}

export interface WaitlistRequest {
  eventId: number;
  action: 'join' | 'leave';
}

export interface CheckInRequest {
  eventId: number;
  userId?: number; // Optional for self check-in
  role?: string;
  notes?: string;
}

// Response Types
export type EventsResponse = ApiResponse<Array<any>>;
export type EventResponse = ApiResponse<any>;
export type WaitlistResponse = ApiResponse<EventWaitlist[]>;
export type CheckInsResponse = ApiResponse<EventCheckIn[]>;
export type AnalyticsResponse = ApiResponse<EventAnalytics>;