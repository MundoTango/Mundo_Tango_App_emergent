// ESA LIFE CEO 61x21 - Phase 7: Data Validation Schemas
import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms')
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  languages: z.array(z.string()).optional(),
  tangoRoles: z.array(z.string()).optional(),
  profileImage: z.string().url().optional()
});

// Event validation schemas
export const eventCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().max(500),
  capacity: z.number().int().positive().optional(),
  eventType: z.enum(['milonga', 'class', 'workshop', 'festival', 'practice', 'social']),
  isPublic: z.boolean().default(true),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).optional()
}).refine(data => new Date(data.startDate) < new Date(data.endDate), {
  message: 'End date must be after start date'
});

// Post validation schemas
export const postCreateSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(5000),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
  tags: z.array(z.string()).max(10).optional(),
  mediaUrls: z.array(z.string().url()).max(10).optional(),
  location: z.string().max(255).optional()
});

// Group validation schemas
export const groupCreateSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(10).max(1000),
  type: z.enum(['city', 'interest', 'skill_level', 'event', 'custom']),
  visibility: z.enum(['public', 'private', 'invite_only']).default('public'),
  rules: z.string().max(2000).optional(),
  coverImage: z.string().url().optional(),
  maxMembers: z.number().int().positive().max(10000).optional()
});

// Chat message validation
export const chatMessageSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  type: z.enum(['text', 'image', 'video', 'audio', 'file']).default('text'),
  metadata: z.record(z.any()).optional()
});

// AI agent interaction validation
export const agentInteractionSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  sessionId: z.string().optional(),
  agentId: z.string().optional(),
  context: z.record(z.any()).optional()
});

// Memory creation validation
export const memoryCreateSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  date: z.string().datetime(),
  participants: z.array(z.number().int().positive()).min(1),
  mediaUrls: z.array(z.string().url()).max(20).optional(),
  emotionalTags: z.array(z.string()).max(10).optional(),
  visibility: z.enum(['public', 'participants', 'private']).default('participants')
});

// Travel details validation
export const travelDetailsSchema = z.object({
  destination: z.string().min(2).max(255),
  arrivalDate: z.string().datetime(),
  departureDate: z.string().datetime(),
  purpose: z.enum(['tourism', 'event', 'practice', 'teaching', 'other']),
  accommodationType: z.enum(['hotel', 'hostel', 'airbnb', 'friend', 'other']).optional(),
  notes: z.string().max(1000).optional()
}).refine(data => new Date(data.arrivalDate) < new Date(data.departureDate), {
  message: 'Departure date must be after arrival date'
});

// Host home validation
export const hostHomeSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20).max(2000),
  address: z.string().min(10).max(500),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  maxGuests: z.number().int().min(1).max(10),
  amenities: z.array(z.string()).optional(),
  houseRules: z.string().max(1000).optional(),
  availability: z.array(z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  })).optional(),
  pricePerNight: z.number().min(0).optional()
});

// Payment validation schemas
export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code'),
  paymentMethodId: z.string(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.any()).optional()
});

// Subscription validation
export const subscriptionSchema = z.object({
  tier: z.enum(['free', 'basic', 'enthusiast', 'professional', 'enterprise']),
  paymentMethodId: z.string().optional(),
  billingInterval: z.enum(['monthly', 'yearly']).optional()
});

// Role assignment validation
export const roleAssignmentSchema = z.object({
  userId: z.number().int().positive(),
  roleName: z.string().min(2).max(100),
  reason: z.string().max(500).optional()
});

// Custom role request validation
export const customRoleRequestSchema = z.object({
  roleName: z.string().min(3).max(100),
  roleDescription: z.string().min(10).max(500),
  justification: z.string().min(20).max(1000)
});

// Project tracker validation (ESA Framework)
export const projectTrackerSchema = z.object({
  title: z.string().min(3).max(500),
  description: z.string().optional(),
  type: z.enum(['Platform', 'Section', 'Feature', 'Project', 'Task', 'Sub-task']),
  status: z.enum(['Completed', 'In Progress', 'Planned', 'Blocked']),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
  layer: z.number().int().min(1).max(61).optional(),
  phase: z.number().int().min(1).max(21).optional(),
  completion: z.number().int().min(0).max(100).default(0),
  estimatedHours: z.number().positive().optional(),
  assignedTo: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional()
});

// Validation helper functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Middleware factory for Express routes
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    const result = validateRequest(schema, req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: result.errors 
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

// Export all schemas for use across the application
export const dataSchemas = {
  user: {
    registration: userRegistrationSchema,
    update: userUpdateSchema
  },
  event: {
    create: eventCreateSchema
  },
  post: {
    create: postCreateSchema
  },
  group: {
    create: groupCreateSchema
  },
  chat: {
    message: chatMessageSchema
  },
  ai: {
    interaction: agentInteractionSchema
  },
  memory: {
    create: memoryCreateSchema
  },
  travel: {
    details: travelDetailsSchema
  },
  host: {
    home: hostHomeSchema
  },
  payment: {
    create: paymentSchema,
    subscription: subscriptionSchema
  },
  role: {
    assignment: roleAssignmentSchema,
    customRequest: customRoleRequestSchema
  },
  project: {
    tracker: projectTrackerSchema
  }
};