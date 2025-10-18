/**
 * Mundo Tango ESA LIFE CEO - User Routes
 * Phase 11 Parallel Batch 2: Updated with secure pattern (direct DB + error handling + Zod validation)
 */

import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { setupUpload } from '../middleware/upload';
import { z } from 'zod';
import { ValidationError, AuthenticationError, NotFoundError } from '../middleware/errorHandler';
import { success } from '../utils/apiResponse';

const router = Router();
const upload = setupUpload();

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  bio: z.string().max(1000, 'Bio too long').optional(),
  country: z.string().max(100, 'Country name too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  facebook_url: z.string().url('Invalid Facebook URL').optional(),
  nickname: z.string().max(100, 'Nickname too long').optional(),
  occupation: z.string().max(255, 'Occupation too long').optional()
});

const updateSettingsSchema = z.object({
  notifications: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    eventReminders: z.boolean().optional(),
    newFollowerAlerts: z.boolean().optional(),
    messageAlerts: z.boolean().optional(),
    groupInvites: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    marketingEmails: z.boolean().optional()
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
    showLocation: z.boolean().optional(),
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional(),
    allowMessagesFrom: z.enum(['everyone', 'friends', 'none']).optional(),
    showActivityStatus: z.boolean().optional(),
    allowTagging: z.boolean().optional(),
    showInSearch: z.boolean().optional()
  }).optional(),
  appearance: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    language: z.string().optional(),
    dateFormat: z.string().optional(),
    timeFormat: z.enum(['12h', '24h']).optional(),
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
    reduceMotion: z.boolean().optional()
  }).optional()
});

// Get current user profile
router.get('/user', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const replitId = req.user.claims.sub;
    
    // Direct DB query
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.replitId, replitId))
      .limit(1);
    
    if (!userResult[0]) {
      throw new NotFoundError('User not found');
    }

    res.json(success(userResult[0], 'User profile fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/user', isAuthenticated, upload.any(), async (req: any, res, next: NextFunction) => {
  try {
    const replitId = req.user.claims.sub;
    
    // Get user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.replitId, replitId))
      .limit(1);
    
    if (!userResult[0]) {
      throw new NotFoundError('User not found');
    }

    // Validate request body
    const validated = updateUserSchema.parse(req.body);
    
    const files = req.files as Express.Multer.File[];
    
    // Build update object with explicit field mapping
    const updateData: any = {};
    
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.bio !== undefined) updateData.bio = validated.bio;
    if (validated.country !== undefined) updateData.country = validated.country;
    if (validated.city !== undefined) updateData.city = validated.city;
    if (validated.facebook_url !== undefined) updateData.facebookUrl = validated.facebook_url;
    if (validated.nickname !== undefined) updateData.nickname = validated.nickname;
    if (validated.occupation !== undefined) updateData.occupation = validated.occupation;
    
    // Handle file uploads
    const profileImageFile = files?.find(file => file.fieldname === 'image_url');
    const backgroundImageFile = files?.find(file => file.fieldname === 'background_url');
    
    if (profileImageFile) updateData.profileImage = `/uploads/${profileImageFile.filename}`;
    if (backgroundImageFile) updateData.backgroundImage = `/uploads/${backgroundImageFile.filename}`;

    // Update user in database
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userResult[0].id))
      .returning();

    res.json(success(updatedUser[0], 'Profile updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

// Get user settings
// NOTE: Settings are stored in a separate userSettings table (not yet in schema)
// For now, return default settings
router.get("/user/settings", isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const replitId = req.user.claims.sub;
    
    // Verify user exists
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.replitId, replitId))
      .limit(1);
    
    if (!userResult[0]) {
      throw new NotFoundError('User not found');
    }

    // TODO: Implement userSettings table in schema
    // For now, return default settings
    const defaultSettings = {
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        eventReminders: true,
        newFollowerAlerts: true,
        messageAlerts: true,
        groupInvites: true,
        weeklyDigest: false,
        marketingEmails: false
      },
      privacy: {
        profileVisibility: 'public',
        showLocation: true,
        showEmail: false,
        showPhone: false,
        allowMessagesFrom: 'friends',
        showActivityStatus: true,
        allowTagging: true,
        showInSearch: true
      },
      appearance: {
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        fontSize: 'medium',
        reduceMotion: false
      }
    };

    res.json(success(defaultSettings, 'User settings fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Update user settings
// NOTE: Settings table not yet implemented in schema
router.put("/user/settings", isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const replitId = req.user.claims.sub;
    
    // Verify user exists
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.replitId, replitId))
      .limit(1);
    
    if (!userResult[0]) {
      throw new NotFoundError('User not found');
    }

    // Validate settings
    const validated = updateSettingsSchema.parse(req.body);

    // TODO: Implement userSettings table and save settings
    console.log('[User Settings] Update requested for user:', userResult[0].id, validated);

    res.json(success({ updated: true }, 'Settings updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

export default router;
