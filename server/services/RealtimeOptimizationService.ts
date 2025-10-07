import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

/**
 * Supabase Realtime Optimization Service (Phase 4)
 * ESA Layer 11 - Optimized WebSocket communication
 * 
 * Features:
 * - Exponential backoff reconnection
 * - Broadcast patterns for system events
 * - Channel lifecycle management
 * - Connection health monitoring
 */

interface ReconnectionConfig {
  baseDelay: number;
  maxDelay: number;
  multiplier: number;
  maxRetries?: number;
}

export class RealtimeOptimizationService {
  private client: SupabaseClient | null = null;
  private channels: Map<string, RealtimeChannel> = new Map();
  private reconnectionAttempts: Map<string, number> = new Map();
  private reconnectionConfig: ReconnectionConfig = {
    baseDelay: 1000,
    maxDelay: 30000,
    multiplier: 1.5,
    maxRetries: 10,
  };

  initialize(supabaseUrl: string, supabaseKey: string): void {
    this.client = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    console.log("✅ Realtime Optimization Service initialized");
  }

  /**
   * Subscribe to a channel with automatic reconnection
   */
  async subscribeWithReconnection(
    channelName: string,
    config: {
      event: string;
      callback: (payload: any) => void;
      private?: boolean;
    }
  ): Promise<RealtimeChannel> {
    if (!this.client) {
      throw new Error("Supabase client not initialized");
    }

    const channel = this.client.channel(channelName, {
      config: {
        private: config.private ?? true,
      },
    });

    channel
      .on("broadcast", { event: config.event }, config.callback)
      .subscribe(async (status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`✅ Subscribed to channel: ${channelName}`);
          this.reconnectionAttempts.set(channelName, 0);
        }

        if (status === "CHANNEL_ERROR" || status === "CLOSED") {
          console.log(`⚠️  Channel error on ${channelName}: ${err?.message}`);
          await this.handleReconnection(channelName, config);
        }

        if (status === "TIMED_OUT") {
          console.log(`⏱️  Channel timeout on ${channelName}`);
          await this.handleReconnection(channelName, config);
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private async handleReconnection(
    channelName: string,
    config: {
      event: string;
      callback: (payload: any) => void;
      private?: boolean;
    }
  ): Promise<void> {
    const attempts = this.reconnectionAttempts.get(channelName) || 0;

    if (
      this.reconnectionConfig.maxRetries &&
      attempts >= this.reconnectionConfig.maxRetries
    ) {
      console.error(`❌ Max reconnection attempts reached for ${channelName}`);
      return;
    }

    const delay = Math.min(
      this.reconnectionConfig.baseDelay *
        Math.pow(this.reconnectionConfig.multiplier, attempts),
      this.reconnectionConfig.maxDelay
    );

    console.log(
      `🔄 Reconnecting to ${channelName} in ${delay}ms (attempt ${attempts + 1})`
    );

    await new Promise((resolve) => setTimeout(resolve, delay));

    this.reconnectionAttempts.set(channelName, attempts + 1);

    // Clean up old channel
    const oldChannel = this.channels.get(channelName);
    if (oldChannel) {
      await oldChannel.unsubscribe();
    }

    // Create new subscription
    await this.subscribeWithReconnection(channelName, config);
  }

  /**
   * Broadcast a message to a channel
   */
  async broadcast(
    channelName: string,
    event: string,
    payload: any
  ): Promise<void> {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error(`Channel ${channelName} not found`);
    }

    await channel.send({
      type: "broadcast",
      event,
      payload,
    });
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.unsubscribe();
      this.channels.delete(channelName);
      this.reconnectionAttempts.delete(channelName);
      console.log(`✅ Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  async unsubscribeAll(): Promise<void> {
    for (const [channelName] of this.channels) {
      await this.unsubscribe(channelName);
    }
  }

  /**
   * Get connection health status
   */
  getHealthStatus(): {
    totalChannels: number;
    activeChannels: number;
    channelsWithErrors: number;
  } {
    return {
      totalChannels: this.channels.size,
      activeChannels: Array.from(this.channels.values()).filter(
        (ch) => ch.state === "joined"
      ).length,
      channelsWithErrors: Array.from(this.reconnectionAttempts.values()).filter(
        (attempts) => attempts > 0
      ).length,
    };
  }
}

export const realtimeOptimizationService = new RealtimeOptimizationService();
