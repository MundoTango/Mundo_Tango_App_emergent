/**
 * Mundo Tango ESA LIFE CEO - Messages Routes
 * Phase 11 Parallel Batch 2: Updated with secure pattern (direct DB + error handling + Zod validation)
 */

import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { chatMessages, chatRooms, chatRoomUsers, users, insertChatMessageSchema } from '../../shared/schema';
import { eq, and, sql, desc, or } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';
import { isAuthenticated } from '../replitAuth';
import { ValidationError, AuthenticationError, NotFoundError } from '../middleware/errorHandler';
import { success } from '../utils/apiResponse';
import { z } from 'zod';

const router = Router();

// Slug generation utility with 240-char truncation + timestamp safeguard
function generateMessageSlug(prefix: string = 'msg'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const baseSlug = `${prefix}_${timestamp}_${random}`;
  
  // Truncate to 240 chars to leave room for timestamp suffix if needed
  return baseSlug.substring(0, 240);
}

// Validation schemas
const sendMessageSchema = z.object({
  roomSlug: z.string().min(1, 'Room slug is required'),
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  messageType: z.enum(['text', 'image', 'video', 'audio', 'file']).default('text'),
  replyToSlug: z.string().optional(),
  forwardedFromSlug: z.string().optional(),
  // Security: Validate URLs to prevent SSRF
  fileUrl: z.string().url('Invalid file URL').refine(
    (url) => url.startsWith('/uploads/') || url.startsWith('https://'),
    'File URL must be internal (/uploads/) or HTTPS'
  ).optional(),
  fileName: z.string().max(255, 'Filename too long').optional(),
  fileThumb: z.string().url('Invalid thumbnail URL').optional()
});

// Get user's chat rooms
router.get('/api/messages', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const replitId = req.user.claims.sub;
    const userResult = await db.select().from(users).where(eq(users.replitId, replitId)).limit(1);
    if (!userResult[0]) throw new AuthenticationError('User not found');
    
    // Security: Get only chat rooms where user is a participant
    const rooms = await db
      .select({
        id: chatRooms.id,
        slug: chatRooms.slug,
        userId: chatRooms.userId,
        title: chatRooms.title,
        imageUrl: chatRooms.imageUrl,
        description: chatRooms.description,
        type: chatRooms.type,
        status: chatRooms.status,
        lastMessageTimestamp: chatRooms.lastMessageTimestamp,
        createdAt: chatRooms.createdAt,
        updatedAt: chatRooms.updatedAt
      })
      .from(chatRooms)
      .innerJoin(chatRoomUsers, eq(chatRoomUsers.chatRoomSlug, chatRooms.slug))
      .where(
        and(
          eq(chatRoomUsers.userSlug, userResult[0].username || `user_${userResult[0].id}`),
          eq(chatRoomUsers.isLeaved, false),
          eq(chatRoomUsers.isKicked, false)
        )
      )
      .orderBy(desc(chatRooms.updatedAt));
    
    res.json(success(rooms, 'Chat rooms fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Get messages in a specific chat room
router.get('/api/messages/:roomSlug', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const { roomSlug } = req.params;
    
    if (!roomSlug) {
      throw new ValidationError('Room slug is required');
    }
    
    // Security: Get authenticated user
    const replitId = req.user.claims.sub;
    const userResult = await db.select().from(users).where(eq(users.replitId, replitId)).limit(1);
    if (!userResult[0]) throw new AuthenticationError('User not found');
    
    // Verify room exists
    const room = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.slug, roomSlug))
      .limit(1);
    
    if (!room[0]) {
      throw new NotFoundError('Chat room not found');
    }
    
    // Security: Verify user is a participant in this room
    const userSlug = userResult[0].username || `user_${userResult[0].id}`;
    const membership = await db
      .select()
      .from(chatRoomUsers)
      .where(
        and(
          eq(chatRoomUsers.chatRoomSlug, roomSlug),
          eq(chatRoomUsers.userSlug, userSlug),
          eq(chatRoomUsers.isLeaved, false),
          eq(chatRoomUsers.isKicked, false)
        )
      )
      .limit(1);
    
    if (!membership[0]) {
      throw new AuthenticationError('You are not authorized to view messages in this room');
    }
    
    // Get messages with actual schema fields
    const messages = await db
      .select({
        id: chatMessages.id,
        slug: chatMessages.slug,
        chatRoomSlug: chatMessages.chatRoomSlug,
        userSlug: chatMessages.userSlug,
        messageType: chatMessages.messageType,
        message: chatMessages.message,
        fileUrl: chatMessages.fileUrl,
        fileName: chatMessages.fileName,
        fileThumb: chatMessages.fileThumb,
        isForwarded: chatMessages.isForwarded,
        isReply: chatMessages.isReply,
        replyMessageSlug: chatMessages.replyMessageSlug,
        createdAt: chatMessages.createdAt
      })
      .from(chatMessages)
      .where(eq(chatMessages.chatRoomSlug, roomSlug))
      .orderBy(desc(chatMessages.createdAt))
      .limit(100);
    
    res.json(success(messages, 'Messages fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Send a message
router.post('/api/messages', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate request body with Zod
    const validated = sendMessageSchema.parse(req.body);
    
    // Get user by replitId to construct userSlug
    const user = await db
      .select()
      .from(users)
      .where(eq(users.replitId, userId))
      .limit(1);
    
    if (!user[0]) {
      throw new AuthenticationError('User not found');
    }
    
    // Verify chat room exists
    const room = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.slug, validated.roomSlug))
      .limit(1);
    
    if (!room[0]) {
      throw new NotFoundError('Chat room not found');
    }
    
    // If replying, verify reply target exists
    if (validated.replyToSlug) {
      const replyTarget = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.slug, validated.replyToSlug))
        .limit(1);
      
      if (!replyTarget[0]) {
        throw new ValidationError('Reply target message not found');
      }
    }
    
    // Generate unique userSlug if user doesn't have one
    const userSlug = user[0].username || `user_${user[0].id}`;
    
    // Create message with explicit field mapping (NEVER spread req.body)
    const newMessage = await db
      .insert(chatMessages)
      .values({
        slug: generateMessageSlug('msg'),
        chatRoomSlug: validated.roomSlug,
        userSlug: userSlug,
        messageType: validated.messageType,
        message: validated.message,
        fileUrl: validated.fileUrl || null,
        fileName: validated.fileName || null,
        fileThumb: validated.fileThumb || null,
        isForwarded: !!validated.forwardedFromSlug,
        isReply: !!validated.replyToSlug,
        replyMessageSlug: validated.replyToSlug || null
      })
      .returning();
    
    // Update room's last message timestamp
    await db
      .update(chatRooms)
      .set({
        lastMessageTimestamp: new Date(),
        updatedAt: new Date()
      })
      .where(eq(chatRooms.slug, validated.roomSlug));
    
    res.status(201).json(success(newMessage[0], 'Message sent successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

export default router;
