// ESA LIFE CEO 61x21 Form Validation Schemas
// Comprehensive Zod schemas for all platform forms

import { z } from 'zod';

// ========================================
// Common Validators
// ========================================

const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

// ========================================
// User Authentication Schemas
// ========================================

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  username: z.string()
    .min(1, 'Username is required')
    .regex(usernameRegex, 'Username can only contain letters, numbers, _ and -')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  acceptTerms: z.boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
  acceptPrivacy: z.boolean()
    .refine((val) => val === true, 'You must accept the privacy policy'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ========================================
// Profile Schemas
// ========================================

export const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  nickname: z.string()
    .optional(),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  occupation: z.string()
    .max(100, 'Occupation must be less than 100 characters')
    .optional(),
  country: z.string()
    .min(1, 'Country is required'),
  state: z.string().optional(),
  city: z.string().optional(),
  mobileNo: z.string()
    .regex(phoneRegex, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  facebookUrl: z.string()
    .regex(urlRegex, 'Invalid URL')
    .optional()
    .or(z.literal('')),
  languages: z.array(z.string()).optional(),
  tangoRoles: z.array(z.string()).optional(),
  leaderLevel: z.number().min(0).max(10).optional(),
  followerLevel: z.number().min(0).max(10).optional(),
  yearsOfDancing: z.number().min(0).max(100).optional(),
  startedDancingYear: z.number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
});

export const profileImageSchema = z.object({
  profileImage: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    ),
});

// ========================================
// Event Schemas
// ========================================

export const eventCreateSchema = z.object({
  title: z.string()
    .min(1, 'Event title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(1, 'Event description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  eventType: z.enum(['milonga', 'practica', 'workshop', 'festival', 'concert', 'other']),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  startTime: z.string()
    .min(1, 'Start time is required'),
  endTime: z.string()
    .min(1, 'End time is required'),
  location: z.object({
    venue: z.string()
      .min(1, 'Venue name is required')
      .max(200, 'Venue name must be less than 200 characters'),
    address: z.string()
      .min(1, 'Address is required')
      .max(500, 'Address must be less than 500 characters'),
    city: z.string()
      .min(1, 'City is required'),
    country: z.string()
      .min(1, 'Country is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .optional(),
  currency: z.string().optional(),
  capacity: z.number()
    .min(1, 'Capacity must be at least 1')
    .max(10000, 'Capacity seems too high')
    .optional(),
  registrationRequired: z.boolean().optional(),
  registrationUrl: z.string()
    .regex(urlRegex, 'Invalid URL')
    .optional()
    .or(z.literal('')),
  contactEmail: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  contactPhone: z.string()
    .regex(phoneRegex, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  coverImage: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Image must be less than 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    )
    .optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ========================================
// Post/Memory Schemas
// ========================================

export const postCreateSchema = z.object({
  content: z.string()
    .min(1, 'Post content is required')
    .max(5000, 'Post must be less than 5000 characters'),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
  tags: z.array(z.string()).optional(),
  location: z.object({
    city: z.string(),
    country: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  emotionalTag: z.enum([
    'happy', 'excited', 'grateful', 'inspired', 'nostalgic',
    'peaceful', 'proud', 'loved', 'adventurous', 'reflective'
  ]).optional(),
  media: z.array(z.instanceof(File))
    .refine(
      (files) => files.every(file => file.size <= 50 * 1024 * 1024),
      'Each file must be less than 50MB'
    )
    .refine(
      (files) => files.every(file => 
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(file.type)
      ),
      'Only image and video files are supported'
    )
    .optional(),
});

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
});

// ========================================
// Group Schemas
// ========================================

export const groupCreateSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name must be less than 100 characters'),
  description: z.string()
    .min(1, 'Group description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  groupType: z.enum(['public', 'private', 'secret']),
  category: z.enum([
    'social', 'practice', 'performance', 'teaching',
    'travel', 'music', 'regional', 'other'
  ]),
  rules: z.array(z.string()).optional(),
  location: z.object({
    city: z.string(),
    country: z.string(),
  }).optional(),
  coverImage: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Image must be less than 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    )
    .optional(),
  requireApproval: z.boolean().default(false),
  allowMemberPosts: z.boolean().default(true),
});

// ========================================
// Message Schemas
// ========================================

export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters'),
  recipientId: z.number()
    .min(1, 'Recipient is required'),
  attachments: z.array(z.instanceof(File))
    .refine(
      (files) => files.every(file => file.size <= 25 * 1024 * 1024),
      'Each file must be less than 25MB'
    )
    .optional(),
});

export const conversationSchema = z.object({
  participants: z.array(z.number())
    .min(1, 'At least one participant is required')
    .max(10, 'Maximum 10 participants allowed'),
  groupName: z.string()
    .min(1, 'Group name is required for group chats')
    .max(100, 'Group name must be less than 100 characters')
    .optional(),
  groupImage: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    )
    .optional(),
});

// ========================================
// Payment Schemas
// ========================================

export const paymentMethodSchema = z.object({
  cardNumber: z.string()
    .min(1, 'Card number is required')
    .regex(/^[0-9]{13,19}$/, 'Invalid card number'),
  cardholderName: z.string()
    .min(1, 'Cardholder name is required')
    .max(100, 'Cardholder name must be less than 100 characters'),
  expiryMonth: z.string()
    .min(1, 'Expiry month is required')
    .regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z.string()
    .min(1, 'Expiry year is required')
    .regex(/^20[2-9][0-9]$/, 'Invalid year'),
  cvv: z.string()
    .min(1, 'CVV is required')
    .regex(/^[0-9]{3,4}$/, 'Invalid CVV'),
  billingAddress: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  saveCard: z.boolean().optional(),
});

export const subscriptionSchema = z.object({
  plan: z.enum(['free', 'basic', 'enthusiast', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  paymentMethodId: z.string().optional(),
  promoCode: z.string().optional(),
});

// ========================================
// Settings Schemas
// ========================================

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  showLocation: z.boolean(),
  allowMessages: z.enum(['everyone', 'friends', 'none']),
  allowFriendRequests: z.boolean(),
  allowGroupInvites: z.boolean(),
  allowEventInvites: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.object({
    messages: z.boolean(),
    friendRequests: z.boolean(),
    groupInvites: z.boolean(),
    eventInvites: z.boolean(),
    eventReminders: z.boolean(),
    weeklyDigest: z.boolean(),
  }),
  pushNotifications: z.object({
    messages: z.boolean(),
    friendRequests: z.boolean(),
    groupActivity: z.boolean(),
    eventUpdates: z.boolean(),
    likes: z.boolean(),
    comments: z.boolean(),
  }),
});

// ========================================
// Search/Filter Schemas
// ========================================

export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(200, 'Search query is too long'),
  type: z.enum(['all', 'users', 'events', 'groups', 'posts']).optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    radius: z.number().min(1).max(500).optional(),
  }).optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  sortBy: z.enum(['relevance', 'date', 'popularity']).optional(),
});

// ========================================
// Type Exports
// ========================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type EventCreateFormData = z.infer<typeof eventCreateSchema>;
export type PostCreateFormData = z.infer<typeof postCreateSchema>;
export type GroupCreateFormData = z.infer<typeof groupCreateSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;