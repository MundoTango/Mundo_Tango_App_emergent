/**
 * Mundo Tango ESA LIFE CEO - Messages Routes
 * Phase 11 Parallel Batch 2: Updated with secure pattern (direct DB + error handling + Zod validation)
 */

import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { chatMessages, chatRooms, users, insertChatMessageSchema } from '../../shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
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
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileThumb: z.string().optional()
});

// Get user's chat rooms
router.get('/api/messages', async (req, res, next: NextFunction) => {
  try {
    const userId = getUserId(req) || 7;
    
    // Get all chat rooms (using actual schema fields)
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
      .orderBy(desc(chatRooms.updatedAt));
    
    res.json(success(rooms, 'Chat rooms fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Get messages in a specific chat room
router.get('/api/messages/:roomSlug', async (req, res, next: NextFunction) => {
  try {
    const { roomSlug } = req.params;
    
    if (!roomSlug) {
      throw new ValidationError('Room slug is required');
    }
    
    // Verify room exists
    const room = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.slug, roomSlug))
      .limit(1);
    
    if (!room[0]) {
      throw new NotFoundError('Chat room not found');
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
