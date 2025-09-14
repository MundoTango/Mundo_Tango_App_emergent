// ESA LIFE CEO 61×21 - Phase 20: Streaming Service
import { db } from "../db";
import { streams, videoCalls, users, events } from "../../shared/schema";
import { eq, and, desc, gte, lte, or, inArray } from "drizzle-orm";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { WebSocketServer } from "ws";

interface StreamConfig {
  quality: "auto" | "1080p" | "720p" | "480p" | "360p";
  bitrate: number;
  framerate: number;
  codec: string;
}

interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export class StreamingService {
  private io: Server | null = null;
  private wss: WebSocketServer | null = null;
  private activeStreams: Map<string, any> = new Map();
  private streamViewers: Map<string, Set<string>> = new Map();
  private peerConnections: Map<string, any> = new Map();

  // Default ICE servers for WebRTC
  private iceServers: IceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ];

  constructor() {
    this.setupCleanupInterval();
  }

  setSocketServer(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
  }

  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on("connection", (socket) => {
      // Stream management
      socket.on("stream:join", async (data) => {
        await this.handleJoinStream(socket, data);
      });

      socket.on("stream:leave", async (data) => {
        await this.handleLeaveStream(socket, data);
      });

      socket.on("stream:start", async (data) => {
        await this.handleStartStream(socket, data);
      });

      socket.on("stream:end", async (data) => {
        await this.handleEndStream(socket, data);
      });

      // WebRTC signaling
      socket.on("webrtc:offer", async (data) => {
        await this.handleWebRTCOffer(socket, data);
      });

      socket.on("webrtc:answer", async (data) => {
        await this.handleWebRTCAnswer(socket, data);
      });

      socket.on("webrtc:ice-candidate", async (data) => {
        await this.handleICECandidate(socket, data);
      });

      // Stream interactions
      socket.on("stream:chat", async (data) => {
        await this.handleStreamChat(socket, data);
      });

      socket.on("stream:like", async (data) => {
        await this.handleStreamLike(socket, data);
      });

      // Video calls
      socket.on("call:join", async (data) => {
        await this.handleJoinCall(socket, data);
      });

      socket.on("call:leave", async (data) => {
        await this.handleLeaveCall(socket, data);
      });

      socket.on("call:signal", async (data) => {
        await this.handleCallSignal(socket, data);
      });
    });
  }

  // Create a new live stream
  async createStream(userId: number, data: any) {
    try {
      const streamKey = this.generateStreamKey();
      const rtmpUrl = `rtmp://stream.mundotango.life/live/${streamKey}`;
      const hlsUrl = `https://stream.mundotango.life/hls/${streamKey}/index.m3u8`;

      const [stream] = await db.insert(streams).values({
        hostId: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        eventId: data.eventId,
        streamKey,
        rtmpUrl,
        hlsUrl,
        status: data.scheduledAt ? "scheduled" : "live",
        scheduledAt: data.scheduledAt,
        chatEnabled: data.chatEnabled ?? true,
        recordingEnabled: data.recordingEnabled ?? false,
        isPrivate: data.isPrivate ?? false,
        password: data.password,
        allowedUsers: data.allowedUsers,
        quality: data.quality || "auto",
        thumbnailUrl: data.thumbnailUrl,
        metadata: data.metadata || {},
      }).returning();

      // Initialize stream in memory
      this.activeStreams.set(stream.id, {
        ...stream,
        viewers: new Set(),
        peakViewers: 0,
        startTime: Date.now(),
      });

      this.streamViewers.set(stream.id, new Set());

      return stream;
    } catch (error) {
      console.error("Failed to create stream:", error);
      throw new Error("Failed to create stream");
    }
  }

  // Start streaming
  async startStream(streamId: string, userId: number) {
    try {
      const [stream] = await db
        .select()
        .from(streams)
        .where(and(eq(streams.id, streamId), eq(streams.hostId, userId)))
        .limit(1);

      if (!stream) {
        throw new Error("Stream not found");
      }

      await db
        .update(streams)
        .set({
          status: "live",
          startedAt: new Date(),
          viewerCount: 0,
        })
        .where(eq(streams.id, streamId));

      // Notify all subscribers
      if (this.io) {
        this.io.emit("stream:started", {
          streamId,
          title: stream.title,
          hostId: stream.hostId,
          category: stream.category,
        });
      }

      return { success: true, streamKey: stream.streamKey };
    } catch (error) {
      console.error("Failed to start stream:", error);
      throw error;
    }
  }

  // End streaming
  async endStream(streamId: string, userId: number) {
    try {
      const activeStream = this.activeStreams.get(streamId);
      if (!activeStream) {
        throw new Error("Stream not active");
      }

      const duration = Math.floor((Date.now() - activeStream.startTime) / 1000);

      await db
        .update(streams)
        .set({
          status: "ended",
          endedAt: new Date(),
          duration,
          peakViewers: activeStream.peakViewers,
        })
        .where(eq(streams.id, streamId));

      // Clean up
      this.activeStreams.delete(streamId);
      this.streamViewers.delete(streamId);

      // Notify viewers
      if (this.io) {
        this.io.to(`stream:${streamId}`).emit("stream:ended", { streamId });
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to end stream:", error);
      throw error;
    }
  }

  // Handle viewer joining stream
  private async handleJoinStream(socket: any, data: any) {
    const { streamId, userId } = data;

    // Join socket room
    socket.join(`stream:${streamId}`);

    // Update viewer count
    const viewers = this.streamViewers.get(streamId) || new Set();
    viewers.add(userId || socket.id);
    this.streamViewers.set(streamId, viewers);

    const viewerCount = viewers.size;

    // Update peak viewers
    const activeStream = this.activeStreams.get(streamId);
    if (activeStream && viewerCount > activeStream.peakViewers) {
      activeStream.peakViewers = viewerCount;
    }

    // Update database
    await db
      .update(streams)
      .set({ viewerCount })
      .where(eq(streams.id, streamId));

    // Notify host and other viewers
    this.io?.to(`stream:${streamId}`).emit("stream:viewer-joined", {
      viewerCount,
      userId,
    });

    // Send ICE servers to viewer
    socket.emit("webrtc:ice-servers", { iceServers: this.iceServers });
  }

  // Handle viewer leaving stream
  private async handleLeaveStream(socket: any, data: any) {
    const { streamId, userId } = data;

    socket.leave(`stream:${streamId}`);

    const viewers = this.streamViewers.get(streamId);
    if (viewers) {
      viewers.delete(userId || socket.id);
      const viewerCount = viewers.size;

      await db
        .update(streams)
        .set({ viewerCount })
        .where(eq(streams.id, streamId));

      this.io?.to(`stream:${streamId}`).emit("stream:viewer-left", {
        viewerCount,
        userId,
      });
    }
  }

  // Handle stream start
  private async handleStartStream(socket: any, data: any) {
    const { streamId, userId } = data;
    await this.startStream(streamId, userId);
  }

  // Handle stream end
  private async handleEndStream(socket: any, data: any) {
    const { streamId, userId } = data;
    await this.endStream(streamId, userId);
  }

  // WebRTC signaling handlers
  private async handleWebRTCOffer(socket: any, data: any) {
    const { streamId, offer, userId } = data;
    
    // Forward offer to stream host
    this.io?.to(`host:${streamId}`).emit("webrtc:offer", {
      offer,
      viewerId: userId || socket.id,
    });
  }

  private async handleWebRTCAnswer(socket: any, data: any) {
    const { streamId, answer, viewerId } = data;
    
    // Forward answer to specific viewer
    this.io?.to(viewerId).emit("webrtc:answer", { answer });
  }

  private async handleICECandidate(socket: any, data: any) {
    const { streamId, candidate, targetId } = data;
    
    // Forward ICE candidate to target peer
    if (targetId) {
      this.io?.to(targetId).emit("webrtc:ice-candidate", { candidate });
    } else {
      this.io?.to(`stream:${streamId}`).emit("webrtc:ice-candidate", { candidate });
    }
  }

  // Handle stream chat
  private async handleStreamChat(socket: any, data: any) {
    const { streamId, message, userId, username } = data;
    
    this.io?.to(`stream:${streamId}`).emit("stream:chat-message", {
      message,
      userId,
      username,
      timestamp: Date.now(),
    });
  }

  // Handle stream like
  private async handleStreamLike(socket: any, data: any) {
    const { streamId, userId } = data;
    
    await db
      .update(streams)
      .set({ likes: (streams.likes || 0) + 1 })
      .where(eq(streams.id, streamId));

    this.io?.to(`stream:${streamId}`).emit("stream:liked", { userId });
  }

  // Video call handlers
  private async handleJoinCall(socket: any, data: any) {
    const { roomId, userId, username } = data;
    
    socket.join(`call:${roomId}`);
    
    // Update participant list
    const [call] = await db
      .select()
      .from(videoCalls)
      .where(eq(videoCalls.roomId, roomId))
      .limit(1);

    if (call) {
      const participants = call.participantList as any[] || [];
      participants.push({ userId, username, socketId: socket.id });
      
      await db
        .update(videoCalls)
        .set({
          currentParticipants: participants.length,
          participantList: participants,
        })
        .where(eq(videoCalls.roomId, roomId));

      // Notify other participants
      socket.to(`call:${roomId}`).emit("call:participant-joined", {
        userId,
        username,
        socketId: socket.id,
      });

      // Send current participants to new joiner
      socket.emit("call:participants", { participants });
    }
  }

  private async handleLeaveCall(socket: any, data: any) {
    const { roomId, userId } = data;
    
    socket.leave(`call:${roomId}`);
    
    const [call] = await db
      .select()
      .from(videoCalls)
      .where(eq(videoCalls.roomId, roomId))
      .limit(1);

    if (call) {
      let participants = call.participantList as any[] || [];
      participants = participants.filter(p => p.userId !== userId);
      
      await db
        .update(videoCalls)
        .set({
          currentParticipants: participants.length,
          participantList: participants,
          status: participants.length === 0 ? "ended" : call.status,
          endedAt: participants.length === 0 ? new Date() : null,
        })
        .where(eq(videoCalls.roomId, roomId));

      // Notify other participants
      this.io?.to(`call:${roomId}`).emit("call:participant-left", { userId });
    }
  }

  private async handleCallSignal(socket: any, data: any) {
    const { roomId, signal, targetId } = data;
    
    // Forward WebRTC signal to target participant
    this.io?.to(targetId).emit("call:signal", {
      signal,
      senderId: socket.id,
    });
  }

  // Create video call room
  async createVideoCall(userId: number, data: any) {
    try {
      const roomId = this.generateRoomId();
      
      const [call] = await db.insert(videoCalls).values({
        roomId,
        hostId: userId,
        eventId: data.eventId,
        type: data.type || "group",
        status: "waiting",
        maxParticipants: data.maxParticipants || 8,
        settings: data.settings || {},
        iceServers: this.iceServers,
      }).returning();

      return call;
    } catch (error) {
      console.error("Failed to create video call:", error);
      throw new Error("Failed to create video call");
    }
  }

  // Get active streams
  async getActiveStreams(category?: string) {
    try {
      let query = db
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
        .where(eq(streams.status, "live"));

      if (category) {
        query = query.where(and(eq(streams.status, "live"), eq(streams.category, category)));
      }

      const activeStreams = await query.orderBy(desc(streams.viewerCount));
      
      return activeStreams.map(row => ({
        ...row.stream,
        host: row.host,
        isLive: true,
      }));
    } catch (error) {
      console.error("Failed to get active streams:", error);
      throw error;
    }
  }

  // Get scheduled streams
  async getScheduledStreams(userId?: number) {
    try {
      const now = new Date();
      const query = db
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
        .where(
          and(
            eq(streams.status, "scheduled"),
            gte(streams.scheduledAt, now)
          )
        )
        .orderBy(streams.scheduledAt);

      const results = await query;
      
      return results.map(row => ({
        ...row.stream,
        host: row.host,
      }));
    } catch (error) {
      console.error("Failed to get scheduled streams:", error);
      throw error;
    }
  }

  // Generate unique stream key
  private generateStreamKey(): string {
    return randomBytes(16).toString("hex");
  }

  // Generate unique room ID
  private generateRoomId(): string {
    return `room_${randomBytes(8).toString("hex")}`;
  }

  // Cleanup inactive streams
  private setupCleanupInterval() {
    setInterval(async () => {
      try {
        // Clean up streams that have been "live" for more than 24 hours
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        await db
          .update(streams)
          .set({
            status: "ended",
            endedAt: new Date(),
          })
          .where(
            and(
              eq(streams.status, "live"),
              lte(streams.startedAt, cutoffTime)
            )
          );

        // Clean up ended video calls
        await db
          .update(videoCalls)
          .set({ status: "ended" })
          .where(
            and(
              eq(videoCalls.status, "active"),
              lte(videoCalls.startedAt, cutoffTime)
            )
          );
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    }, 60 * 60 * 1000); // Run every hour
  }

  // Get stream analytics
  async getStreamAnalytics(streamId: string, userId: number) {
    try {
      const [stream] = await db
        .select()
        .from(streams)
        .where(and(eq(streams.id, streamId), eq(streams.hostId, userId)))
        .limit(1);

      if (!stream) {
        throw new Error("Stream not found");
      }

      return {
        totalViews: stream.peakViewers || 0,
        avgViewDuration: stream.duration ? stream.duration / 2 : 0, // Simplified
        likes: stream.likes || 0,
        chatMessages: 0, // Would need separate tracking
        recordingUrl: stream.recordingUrl,
        analytics: stream.analytics || {},
      };
    } catch (error) {
      console.error("Failed to get stream analytics:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const streamingService = new StreamingService();