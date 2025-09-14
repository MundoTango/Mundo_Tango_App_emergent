// ESA LIFE CEO 61×21 - Phase 20: Streaming API Routes
import { Router } from "express";
import { streamingService } from "../services/streamingService";
import { requireAuth, optionalAuth } from "../middleware/secureAuth";
import { z } from "zod";

const router = Router();

// Schema validation
const createStreamSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(["lesson", "performance", "milonga", "social"]).optional(),
  eventId: z.number().optional(),
  scheduledAt: z.string().optional(),
  chatEnabled: z.boolean().optional(),
  recordingEnabled: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  password: z.string().optional(),
  allowedUsers: z.array(z.number()).optional(),
  quality: z.enum(["auto", "1080p", "720p", "480p", "360p"]).optional(),
  thumbnailUrl: z.string().optional(),
  metadata: z.object({}).optional(),
});

const createVideoCallSchema = z.object({
  eventId: z.number().optional(),
  type: z.enum(["one-on-one", "group", "webinar"]).optional(),
  maxParticipants: z.number().min(2).max(100).optional(),
  settings: z.object({
    allowScreenShare: z.boolean().optional(),
    allowRecording: z.boolean().optional(),
    virtualBackground: z.boolean().optional(),
    noiseSuppression: z.boolean().optional(),
    waitingRoom: z.boolean().optional(),
    autoMuteOnJoin: z.boolean().optional(),
  }).optional(),
});

// Create a new stream
router.post("/streams", requireAuth, async (req, res) => {
  try {
    const validatedData = createStreamSchema.parse(req.body);
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const stream = await streamingService.createStream(userId, validatedData);
    res.json({ success: true, stream });
  } catch (error: any) {
    console.error("Failed to create stream:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: error.message || "Failed to create stream" });
  }
});

// Start a stream
router.post("/streams/:streamId/start", requireAuth, async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await streamingService.startStream(streamId, userId);
    res.json(result);
  } catch (error: any) {
    console.error("Failed to start stream:", error);
    res.status(500).json({ error: error.message || "Failed to start stream" });
  }
});

// End a stream
router.post("/streams/:streamId/end", requireAuth, async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await streamingService.endStream(streamId, userId);
    res.json(result);
  } catch (error: any) {
    console.error("Failed to end stream:", error);
    res.status(500).json({ error: error.message || "Failed to end stream" });
  }
});

// Get active streams
router.get("/streams/active", optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    const streams = await streamingService.getActiveStreams(category as string);
    res.json({ success: true, streams });
  } catch (error: any) {
    console.error("Failed to get active streams:", error);
    res.status(500).json({ error: error.message || "Failed to get active streams" });
  }
});

// Get scheduled streams
router.get("/streams/scheduled", optionalAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const streams = await streamingService.getScheduledStreams(userId);
    res.json({ success: true, streams });
  } catch (error: any) {
    console.error("Failed to get scheduled streams:", error);
    res.status(500).json({ error: error.message || "Failed to get scheduled streams" });
  }
});

// Get stream details
router.get("/streams/:streamId", optionalAuth, async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = (req as any).user?.id;
    
    // Get stream from database
    const { db } = require("../db");
    const { streams, users } = require("../../shared/schema");
    const { eq } = require("drizzle-orm");
    
    const [stream] = await db
      .select({
        stream: streams,
        host: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(streams)
      .leftJoin(users, eq(streams.hostId, users.id))
      .where(eq(streams.id, streamId))
      .limit(1);

    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    // Check access for private streams
    if (stream.stream.isPrivate && userId !== stream.stream.hostId) {
      const allowedUsers = stream.stream.allowedUsers || [];
      if (!allowedUsers.includes(userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    res.json({ 
      success: true, 
      stream: {
        ...stream.stream,
        host: stream.host,
      }
    });
  } catch (error: any) {
    console.error("Failed to get stream details:", error);
    res.status(500).json({ error: error.message || "Failed to get stream details" });
  }
});

// Get stream analytics
router.get("/streams/:streamId/analytics", requireAuth, async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const analytics = await streamingService.getStreamAnalytics(streamId, userId);
    res.json({ success: true, analytics });
  } catch (error: any) {
    console.error("Failed to get stream analytics:", error);
    res.status(500).json({ error: error.message || "Failed to get stream analytics" });
  }
});

// Create a video call room
router.post("/video-calls", requireAuth, async (req, res) => {
  try {
    const validatedData = createVideoCallSchema.parse(req.body);
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const call = await streamingService.createVideoCall(userId, validatedData);
    res.json({ success: true, call });
  } catch (error: any) {
    console.error("Failed to create video call:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: error.message || "Failed to create video call" });
  }
});

// Get video call room details
router.get("/video-calls/:roomId", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;
    
    // Get call from database
    const { db } = require("../db");
    const { videoCalls, users } = require("../../shared/schema");
    const { eq } = require("drizzle-orm");
    
    const [call] = await db
      .select({
        call: videoCalls,
        host: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(videoCalls)
      .leftJoin(users, eq(videoCalls.hostId, users.id))
      .where(eq(videoCalls.roomId, roomId))
      .limit(1);

    if (!call) {
      return res.status(404).json({ error: "Video call not found" });
    }

    res.json({ 
      success: true, 
      call: {
        ...call.call,
        host: call.host,
      }
    });
  } catch (error: any) {
    console.error("Failed to get video call details:", error);
    res.status(500).json({ error: error.message || "Failed to get video call details" });
  }
});

// Update video call status
router.patch("/video-calls/:roomId/status", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Update call status in database
    const { db } = require("../db");
    const { videoCalls } = require("../../shared/schema");
    const { eq, and } = require("drizzle-orm");
    
    const [updated] = await db
      .update(videoCalls)
      .set({
        status,
        startedAt: status === "active" ? new Date() : undefined,
        endedAt: status === "ended" ? new Date() : undefined,
      })
      .where(
        and(
          eq(videoCalls.roomId, roomId),
          eq(videoCalls.hostId, userId)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Video call not found or unauthorized" });
    }

    res.json({ success: true, call: updated });
  } catch (error: any) {
    console.error("Failed to update video call status:", error);
    res.status(500).json({ error: error.message || "Failed to update video call status" });
  }
});

// Get user's streams
router.get("/users/:userId/streams", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    // Get streams from database
    const { db } = require("../db");
    const { streams } = require("../../shared/schema");
    const { eq, and, desc } = require("drizzle-orm");
    
    let query = db
      .select()
      .from(streams)
      .where(eq(streams.hostId, parseInt(userId)));

    if (status) {
      query = query.where(
        and(
          eq(streams.hostId, parseInt(userId)),
          eq(streams.status, status)
        )
      );
    }

    const userStreams = await query.orderBy(desc(streams.createdAt));
    
    res.json({ success: true, streams: userStreams });
  } catch (error: any) {
    console.error("Failed to get user streams:", error);
    res.status(500).json({ error: error.message || "Failed to get user streams" });
  }
});

export default router;