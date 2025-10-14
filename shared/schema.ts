import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  varchar,
  jsonb,
  index,
  uuid,
  unique,
  real,
  numeric,
  vector
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sessions table for express-session with connect-pg-simple
export const sessions = pgTable("sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6, mode: 'date' }).notNull(),
}, (table) => [
  index("idx_sessions_expire").on(table.expire),
]);

// Agents table for AI agent system (ESA LIFE CEO 61×21)
export const agents = pgTable("agents", {
  id: varchar("id", { length: 100 }).primaryKey(), // Changed to varchar to match agent-manager IDs
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // orchestrator, specialist, validator, monitor
  category: varchar("category", { length: 100 }), // Agent category for organization
  description: text("description"), // Agent description
  status: varchar("status", { length: 50 }).default('active'), // active, inactive, busy, error
  configuration: jsonb("configuration").default({}).notNull(),
  capabilities: jsonb("capabilities").default([]), // Changed to jsonb for compatibility
  personality: jsonb("personality"), // Agent personality configuration (tone, style, approach)
  systemPrompt: text("system_prompt"), // System prompt for the agent
  version: varchar("version", { length: 50 }).default('1.0.0'), // Agent version
  layer: integer("layer"), // ESA Framework layer assignment
  lastActive: timestamp("last_active"),
  metrics: jsonb("metrics").default({}), // Performance metrics
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_agents_type").on(table.type),
  index("idx_agents_status").on(table.status),
  index("idx_agents_layer").on(table.layer),
]);

// Users table with performance indexes for ESA requirements
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  mobileNo: varchar("mobile_no", { length: 20 }),
  profileImage: text("profile_image"),
  backgroundImage: text("background_image"),
  bio: text("bio"),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  facebookUrl: text("facebook_url"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  suspended: boolean("suspended").default(false),
  deviceType: varchar("device_type", { length: 20 }),
  deviceToken: text("device_token"),
  apiToken: text("api_token"),
  replitId: varchar("replit_id", { length: 255 }).unique(),
  // New onboarding fields for redesigned registration
  nickname: varchar("nickname", { length: 100 }),
  languages: text("languages").array(),
  tangoRoles: text("tango_roles").array(),
  leaderLevel: integer("leader_level").default(0),
  followerLevel: integer("follower_level").default(0),
  yearsOfDancing: integer("years_of_dancing").default(0),
  startedDancingYear: integer("started_dancing_year"),
  state: varchar("state", { length: 100 }),
  countryCode: varchar("country_code", { length: 10 }),
  stateCode: varchar("state_code", { length: 10 }),
  formStatus: integer("form_status").default(0),
  isOnboardingComplete: boolean("is_onboarding_complete").default(false),
  codeOfConductAccepted: boolean("code_of_conduct_accepted").default(false),
  occupation: varchar("occupation", { length: 255 }), // Adding missing occupation field
  termsAccepted: boolean("terms_accepted").default(false), // Adding missing terms accepted field
  // Security fields
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: varchar("last_login_ip", { length: 45 }),
  // Stripe integration fields
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  subscriptionStatus: varchar("subscription_status", { length: 50 }), // active, canceled, past_due, etc
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default('free'), // free, basic, enthusiast, professional, enterprise
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Performance indexes for ESA requirements (<200ms API response)
  index("idx_users_email").on(table.email),
  index("idx_users_replitid").on(table.replitId),
  index("idx_users_city_country").on(table.city, table.country),
  index("idx_users_created_at").on(table.createdAt),
  index("idx_users_is_active").on(table.isActive),
]);

// Password Reset Tokens table - ESA Agent #4 (Authentication)
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expires: timestamp("expires", { mode: 'date' }).notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_password_reset_email").on(table.email),
  index("idx_password_reset_token").on(table.token),
  index("idx_password_reset_expires").on(table.expires),
]);

// Password Reset Tokens types - ESA Agent #4
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Roles table for comprehensive role management
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  description: text("description").notNull(),
  isPlatformRole: boolean("is_platform_role").default(false),
  // Permission fields
  permissions: jsonb("permissions").default({}).notNull(),
  memoryAccessLevel: text("memory_access_level").default("basic"),
  emotionalTagAccess: boolean("emotional_tag_access").default(false),
  // Custom role fields
  isCustom: boolean("is_custom").default(false),
  customName: text("custom_name"),
  customDescription: text("custom_description"),
  isApproved: boolean("is_approved").default(false),
  submittedBy: integer("submitted_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Role Requests table for admin approval workflow
export const customRoleRequests = pgTable("custom_role_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleName: text("role_name").notNull(),
  roleDescription: text("role_description").notNull(),
  submittedBy: integer("submitted_by").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedBy: integer("rejected_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_custom_role_requests_status").on(table.status),
  index("idx_custom_role_requests_submitted_by").on(table.submittedBy),
  index("idx_custom_role_requests_created_at").on(table.createdAt),
]);

// ESA Project Tracker - Projects table (Layer 1: Database Architecture)
export const projects = pgTable("projects", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // Platform, Section, Feature, Project, Task, Sub-task
  status: varchar("status", { length: 50 }).notNull(), // Completed, In Progress, Planned, Blocked
  layer: integer("layer"), // ESA Framework layer (1-56)
  phase: integer("phase"), // ESA Framework phase (1-21)
  completion: integer("completion").default(0),
  mobileCompletion: integer("mobile_completion").default(0),
  priority: varchar("priority", { length: 20 }), // Critical, High, Medium, Low
  team: jsonb("team").default([]), // Array of team member IDs or names
  parentId: varchar("parent_id", { length: 255 }), // Reference to parent project
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  metadata: jsonb("metadata").default({}), // Additional flexible data
  tags: text("tags").array(),
  blockers: text("blockers").array(),
  notes: text("notes"),
  gitCommits: jsonb("git_commits").default([]), // Auto-captured commits
  attachments: jsonb("attachments").default([]), // File attachments
  dependencies: varchar("dependencies", { length: 255 }).array(), // Other project IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_projects_status").on(table.status),
  index("idx_projects_parent_id").on(table.parentId),
  index("idx_projects_layer").on(table.layer),
  index("idx_projects_priority").on(table.priority),
  index("idx_projects_assigned_to").on(table.assignedTo),
  index("idx_projects_created_at").on(table.createdAt),
]);

// Project Activity Log for tracking changes
export const projectActivity = pgTable("project_activity", {
  id: serial("id").primaryKey(),
  projectId: varchar("project_id", { length: 255 }).references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // created, updated, completed, blocked, etc
  field: varchar("field", { length: 100 }), // Which field was changed
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  description: text("description"),
  metadata: jsonb("metadata").default({}),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("idx_project_activity_project_id").on(table.projectId),
  index("idx_project_activity_user_id").on(table.userId),
  index("idx_project_activity_timestamp").on(table.timestamp),
]);

// ============ PHASE 20: COMMUNITY FEATURES SCHEMA ============
// ESA LIFE CEO 61×21 - Live Streaming, Video Calls, Gamification

// Live Streams table for WebRTC streaming
export const streams = pgTable("streams", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  hostId: integer("host_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id),
  category: varchar("category", { length: 50 }), // lesson, performance, milonga, social
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, live, ended, cancelled
  streamKey: varchar("stream_key", { length: 100 }).unique(),
  rtmpUrl: text("rtmp_url"),
  hlsUrl: text("hls_url"),
  webrtcSignaling: jsonb("webrtc_signaling").default({}),
  viewerCount: integer("viewer_count").default(0),
  peakViewers: integer("peak_viewers").default(0),
  likes: integer("likes").default(0),
  chatEnabled: boolean("chat_enabled").default(true),
  recordingEnabled: boolean("recording_enabled").default(false),
  recordingUrl: text("recording_url"),
  thumbnailUrl: text("thumbnail_url"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // in seconds
  quality: varchar("quality", { length: 20 }).default("auto"), // auto, 1080p, 720p, 480p
  isPrivate: boolean("is_private").default(false),
  password: text("password"),
  allowedUsers: integer("allowed_users").array(),
  metadata: jsonb("metadata").default({}),
  analytics: jsonb("analytics").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_streams_host").on(table.hostId),
  index("idx_streams_status").on(table.status),
  index("idx_streams_scheduled").on(table.scheduledAt),
  index("idx_streams_category").on(table.category),
]);

// Video Calls table for event video rooms
export const videoCalls = pgTable("video_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: varchar("room_id", { length: 100 }).unique().notNull(),
  eventId: integer("event_id").references(() => events.id),
  hostId: integer("host_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 20 }).default("group"), // one-on-one, group, webinar
  status: varchar("status", { length: 20 }).default("waiting"), // waiting, active, ended
  maxParticipants: integer("max_participants").default(8),
  currentParticipants: integer("current_participants").default(0),
  participantList: jsonb("participant_list").default([]),
  settings: jsonb("settings").default({
    allowScreenShare: true,
    allowRecording: false,
    virtualBackground: true,
    noiseSuppression: true,
    waitingRoom: true,
    autoMuteOnJoin: false,
  }),
  iceServers: jsonb("ice_servers").default([]),
  breakoutRooms: jsonb("breakout_rooms").default([]),
  recordingUrl: text("recording_url"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"),
  quality: jsonb("quality").default({}), // connection quality metrics
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_video_calls_event").on(table.eventId),
  index("idx_video_calls_host").on(table.hostId),
  index("idx_video_calls_status").on(table.status),
]);

// Gamification Points table
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalPoints: integer("total_points").default(0),
  currentLevel: integer("current_level").default(1),
  levelProgress: integer("level_progress").default(0), // points toward next level
  weeklyPoints: integer("weekly_points").default(0),
  monthlyPoints: integer("monthly_points").default(0),
  allTimeRank: integer("all_time_rank"),
  weeklyRank: integer("weekly_rank"),
  monthlyRank: integer("monthly_rank"),
  streakDays: integer("streak_days").default(0),
  lastActiveDate: timestamp("last_active_date"),
  statistics: jsonb("statistics").default({
    postsCreated: 0,
    eventsAttended: 0,
    streamsHosted: 0,
    videosWatched: 0,
    helpfulVotes: 0,
    achievementsUnlocked: 0,
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_points_user").on(table.userId),
  index("idx_user_points_total").on(table.totalPoints),
  index("idx_user_points_level").on(table.currentLevel),
  unique("unique_user_points").on(table.userId),
]);

// Achievements table
export const achievements = pgTable("achievements", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g., "tango_master", "event_organizer"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // skill, community, event, special
  tier: varchar("tier", { length: 20 }).default("bronze"), // bronze, silver, gold, platinum
  iconUrl: text("icon_url"),
  points: integer("points").default(100),
  requirements: jsonb("requirements").notNull(), // criteria to unlock
  isSecret: boolean("is_secret").default(false),
  isActive: boolean("is_active").default(true),
  customCreated: boolean("custom_created").default(false),
  createdBy: integer("created_by").references(() => users.id),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_achievements_category").on(table.category),
  index("idx_achievements_tier").on(table.tier),
]);

// User Achievements (many-to-many)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: varchar("achievement_id", { length: 100 }).references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(100), // percentage for progressive achievements
  showcased: boolean("showcased").default(false), // displayed on profile
  notified: boolean("notified").default(false),
}, (table) => [
  index("idx_user_achievements_user").on(table.userId),
  index("idx_user_achievements_achievement").on(table.achievementId),
  unique("unique_user_achievement").on(table.userId, table.achievementId),
]);

// Challenges table
export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // daily, weekly, seasonal, special
  category: varchar("category", { length: 50 }), // dance, social, learning, community
  status: varchar("status", { length: 20 }).default("active"), // active, completed, expired
  requirements: jsonb("requirements").notNull(),
  rewards: jsonb("rewards").default({
    points: 0,
    badges: [],
    items: [],
  }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  completedBy: integer("completed_by").array(),
  iconUrl: text("icon_url"),
  isRecurring: boolean("is_recurring").default(false),
  recurringSchedule: jsonb("recurring_schedule"),
  createdBy: integer("created_by").references(() => users.id),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_challenges_type").on(table.type),
  index("idx_challenges_status").on(table.status),
  index("idx_challenges_dates").on(table.startDate, table.endDate),
]);

// User Challenge Progress
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: uuid("challenge_id").references(() => challenges.id).notNull(),
  progress: jsonb("progress").default({}),
  progressPercentage: integer("progress_percentage").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  rewardsClaimed: boolean("rewards_claimed").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  index("idx_user_challenges_user").on(table.userId),
  index("idx_user_challenges_challenge").on(table.challengeId),
  unique("unique_user_challenge").on(table.userId, table.challengeId),
]);

// Leaderboards table
export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // global, city, event, challenge
  period: varchar("period", { length: 20 }).notNull(), // daily, weekly, monthly, all-time
  category: varchar("category", { length: 50 }), // points, streams, events, achievements
  scopeId: varchar("scope_id", { length: 100 }), // city name, event id, etc.
  rankings: jsonb("rankings").default([]), // array of {userId, rank, score, change}
  lastUpdated: timestamp("last_updated").defaultNow(),
  metadata: jsonb("metadata").default({}),
}, (table) => [
  index("idx_leaderboards_type_period").on(table.type, table.period),
  unique("unique_leaderboard").on(table.type, table.period, table.category, table.scopeId),
]);

// Point Transactions log
export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull(), // positive or negative
  action: varchar("action", { length: 100 }).notNull(), // post_created, event_attended, etc.
  referenceType: varchar("reference_type", { length: 50 }), // post, event, stream, etc.
  referenceId: varchar("reference_id", { length: 100 }),
  description: text("description"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_point_transactions_user").on(table.userId),
  index("idx_point_transactions_created").on(table.createdAt),
]);

// Export TypeScript types for Phase 20: Community Features
// Streaming types
export const insertStreamSchema = createInsertSchema(streams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertStream = z.infer<typeof insertStreamSchema>;
export type Stream = typeof streams.$inferSelect;

// Video Call types
export const insertVideoCallSchema = createInsertSchema(videoCalls).omit({
  id: true,
  createdAt: true,
});
export type InsertVideoCall = z.infer<typeof insertVideoCallSchema>;
export type VideoCall = typeof videoCalls.$inferSelect;

// Gamification types
export const insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;
export type UserPoints = typeof userPoints.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  createdAt: true,
});
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  joinedAt: true,
});
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  lastUpdated: true,
});
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({
  id: true,
  createdAt: true,
});
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;
export type PointTransaction = typeof pointTransactions.$inferSelect;

// Export TypeScript types for Sessions (ESA LIFE CEO 61x21 Critical Fix)
export const insertSessionSchema = createInsertSchema(sessions);
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Export TypeScript types for Agents (ESA LIFE CEO 61x21 AI System)
export const insertAgentSchema = createInsertSchema(agents).omit({
  createdAt: true,
  updatedAt: true,
  lastActive: true,
});
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

// Export TypeScript types for Projects (ESA Layer 1: Database Architecture)
export const insertProjectSchema = createInsertSchema(projects).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const insertProjectActivitySchema = createInsertSchema(projectActivity).omit({
  id: true,
  timestamp: true,
});
export type InsertProjectActivity = z.infer<typeof insertProjectActivitySchema>;
export type ProjectActivity = typeof projectActivity.$inferSelect;


// User Profiles table for role-based authentication (enhanced)
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  role: varchar("role", { length: 50 }).default("guest"), // Legacy single role support
  roles: text("roles").array().default(['guest']), // Multi-role support
  primaryRole: text("primary_role").default("guest"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  permissions: jsonb("permissions").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_profiles_user_id").on(table.userId),
  index("idx_user_profiles_role").on(table.role),
  index("idx_user_profiles_primary_role").on(table.primaryRole),
]);

// User Roles junction table for multi-role management
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleName: text("role_name").references(() => roles.name).notNull(),
  roleId: uuid("role_id").references(() => roles.id), // Added for compatibility
  isPrimary: boolean("is_primary").default(false), // Added for primary role tracking
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: integer("assigned_by").references(() => users.id),
}, (table) => [
  unique().on(table.userId, table.roleName),
  index("idx_user_roles_user_id").on(table.userId),
  index("idx_user_roles_role_name").on(table.roleName),
  index("idx_user_roles_role_id").on(table.roleId),
]);

// Code of Conduct Agreements table for legal compliance tracking
export const codeOfConductAgreements = pgTable("code_of_conduct_agreements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  guidelineType: varchar("guideline_type", { length: 50 }).notNull(),
  guidelineTitle: varchar("guideline_title", { length: 255 }).notNull(),
  guidelineDescription: text("guideline_description").notNull(),
  agreed: boolean("agreed").notNull().default(true),
  agreementVersion: varchar("agreement_version", { length: 10 }).notNull().default("1.0"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.guidelineType, table.agreementVersion),
  index("idx_coc_agreements_user_id").on(table.userId),
  index("idx_coc_agreements_created_at").on(table.createdAt),
]);

// Enhanced Posts table with rich text and multimedia support
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id), // Optional event association
  // ESA Layer 8: Context-aware posting - track which group/event a post belongs to
  contextType: varchar("context_type", { length: 20 }), // 'group', 'event', 'community', null
  contextId: integer("context_id"), // ID of the group/event/community
  content: text("content").notNull(),
  richContent: jsonb("rich_content"), // Rich text editor content
  plainText: text("plain_text"), // Extracted plain text for search
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  mediaEmbeds: jsonb("media_embeds").default([]), // ESA LIFE CEO 56x21 - Now storing all media URLs here
  mentions: text("mentions").array().default([]), // @mentions
  hashtags: text("hashtags").array().default([]),
  location: text("location"),
  coordinates: jsonb("coordinates"), // GPS coordinates from Google Maps
  placeId: text("place_id"), // Google Maps Place ID
  formattedAddress: text("formatted_address"), // Standardized address
  visibility: varchar("visibility", { length: 20 }).default("public"), // public, friends, private
  postType: varchar("post_type", { length: 50 }).default("memory"), // memory, story, announcement, event_update
  likes: integer("likes").default(0), // Adding missing likes field
  comments: integer("comments").default(0), // Adding missing comments field  
  shares: integer("shares").default(0), // Adding missing shares field
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  isPublic: boolean("is_public").default(true),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_posts_user_created").on(table.userId, table.createdAt),
  index("idx_posts_visibility").on(table.visibility),
  index("idx_posts_hashtags").on(table.hashtags),
  index("idx_posts_post_type").on(table.postType),
  index("idx_posts_mentions").on(table.mentions),
  // ESA Layer 8: Context filtering index for group/event feeds
  index("idx_posts_context").on(table.contextType, table.contextId),
]);

// ESA Layer 16: Mention Notifications table for @mention functionality
export const mentionNotifications = pgTable("mention_notifications", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  mentionedUserId: integer("mentioned_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  mentioningUserId: integer("mentioning_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_mention_notifications_mentioned_user").on(table.mentionedUserId, table.isRead),
  index("idx_mention_notifications_post").on(table.postId),
  index("idx_mention_notifications_created").on(table.createdAt),
]);

// Activities/Categories table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id"),
  name: varchar("name", { length: 255 }).notNull(),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attachments table
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  instanceType: varchar("instance_type", { length: 50 }),
  instanceId: integer("instance_id"),
  mediaType: varchar("media_type", { length: 50 }),
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  organizerId: integer("organizer_id").references(() => users.id), // Added for eventsRoutes compatibility
  groupId: integer("group_id").references(() => groups.id), // Foreign key to groups table for city/professional group association
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  visibility: varchar("visibility", { length: 20 }).default("public"), // Added for visibility control
  eventType: varchar("event_type", { length: 50 }).default("milonga"), // practica, milonga, marathon, encuentro, festival, competition, workshop, clase, social
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  date: text("date"), // Legacy date field for backward compatibility
  location: text("location"),
  venue: varchar("venue", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  latitude: text("latitude"),
  longitude: text("longitude"),
  price: text("price"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  ticketUrl: text("ticket_url"),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  isPublic: boolean("is_public").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  ageRestriction: integer("age_restriction"),
  dressCode: varchar("dress_code", { length: 100 }),
  musicStyle: varchar("music_style", { length: 100 }),
  level: varchar("level", { length: 50 }), // beginner, intermediate, advanced, all_levels
  specialGuests: text("special_guests"),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  websiteUrl: text("website_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  cancellationPolicy: text("cancellation_policy"),
  refundPolicy: text("refund_policy"),
  accessibilityInfo: text("accessibility_info"),
  parkingInfo: text("parking_info"),
  tags: text("tags").array(),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern", { length: 50 }), // weekly, monthly, none
  seriesId: integer("series_id"), // For recurring events
  status: varchar("status", { length: 20 }).default("active"), // active, cancelled, postponed, completed
  isFeatured: boolean("is_featured").default(false),
  // Event Pages features (Facebook Groups/Pages style)
  hasEventPage: boolean("has_event_page").default(false), // Whether this event has a dedicated page
  eventPageSlug: varchar("event_page_slug", { length: 255 }).unique(), // Unique slug for event page URL
  eventPageDescription: text("event_page_description"), // Extended description for event page
  eventPageRules: text("event_page_rules"), // Rules and guidelines for event page
  eventPageCoverImage: text("event_page_cover_image"), // Cover image for event page
  allowEventPagePosts: boolean("allow_event_page_posts").default(true), // Allow users to post on event page
  requirePostApproval: boolean("require_post_approval").default(false), // Require admin approval for posts
  eventVisualMarker: varchar("event_visual_marker", { length: 20 }).default("default"), // Visual marker/color for event type (milonga=red, practica=blue, workshop=green)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs table
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // going, interested, maybe, not_going
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.eventId, table.userId),
  index("idx_event_rsvps_event_id").on(table.eventId),
  index("idx_event_rsvps_user_id").on(table.userId),
]);

// Event Attendees table (alias for eventRsvps for test compatibility)
export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('attending'), // attending, waitlisted, cancelled, declined
  role: varchar("role", { length: 50 }), // Optional: attendee, speaker, organizer, volunteer
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.eventId, table.userId),
  index("idx_event_attendees_event_id").on(table.eventId),
  index("idx_event_attendees_user_id").on(table.userId),
  index("idx_event_attendees_status").on(table.status),
]);

// Media table for storing uploaded files and media
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  postId: integer("post_id").references(() => posts.id),
  eventId: integer("event_id").references(() => events.id),
  memoryId: integer("memory_id"), // Legacy reference
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  type: varchar("type", { length: 50 }).notNull(), // image, video, audio, document
  mimeType: varchar("mime_type", { length: 100 }),
  size: integer("size"), // Size in bytes
  width: integer("width"), // For images/videos
  height: integer("height"), // For images/videos
  duration: integer("duration"), // For videos/audio in seconds
  cloudinaryPublicId: text("cloudinary_public_id"),
  blurhash: text("blurhash"), // For image placeholders
  metadata: jsonb("metadata").default({}),
  caption: text("caption"),
  altText: text("alt_text"),
  isPublic: boolean("is_public").default(true),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_media_user_id").on(table.userId),
  index("idx_media_post_id").on(table.postId),
  index("idx_media_event_id").on(table.eventId),
  index("idx_media_type").on(table.type),
  index("idx_media_created_at").on(table.createdAt),
]);

// Event Invitations table
export const eventInvitations = pgTable("event_invitations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  inviterId: integer("inviter_id").references(() => users.id).notNull(),
  inviteeId: integer("invitee_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, declined
  message: text("message"),
  sentAt: timestamp("sent_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Recurring Events table for event patterns (ESA LIFE CEO 61x21)
export const recurringEvents = pgTable("recurring_events", {
  id: serial("id").primaryKey(),
  parentEventId: integer("parent_event_id").references(() => events.id).notNull(),
  pattern: jsonb("pattern").notNull(), // frequency, interval, dayOfWeek, endDate
  nextOccurrence: timestamp("next_occurrence"),
  lastGenerated: timestamp("last_generated"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_recurring_events_parent").on(table.parentEventId),
  index("idx_recurring_events_active").on(table.isActive),
]);

// Event Page Admins table for RBAC/ABAC controls and delegation
export const eventPageAdmins = pgTable("event_page_admins", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("moderator"), // owner, admin, moderator, content_manager
  permissions: jsonb("permissions").default({
    canManageEvent: false,
    canManageAdmins: false,
    canApproveContent: true,
    canDeleteContent: false,
    canManageRSVPs: false,
    canPostAnnouncements: true,
    canEditEventDetails: false,
    canInviteParticipants: true,
    canBanUsers: false
  }).notNull(),
  delegatedBy: integer("delegated_by").references(() => users.id), // Who delegated this role
  delegatedAt: timestamp("delegated_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiration for temporary delegations
  isActive: boolean("is_active").default(true),
  notes: text("notes"), // Delegation notes or special instructions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.eventId, table.userId, table.role),
  index("idx_event_page_admins_event").on(table.eventId),
  index("idx_event_page_admins_user").on(table.userId),
  index("idx_event_page_admins_role").on(table.role),
  index("idx_event_page_admins_active").on(table.isActive),
]);

// Event Page Posts table for community content on event pages
export const eventPagePosts = pgTable("event_page_posts", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  postType: varchar("post_type", { length: 50 }).default("discussion"), // discussion, announcement, photo, question, poll
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array().default([]),
  isApproved: boolean("is_approved").default(true), // Auto-approved unless event requires approval
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  isPinned: boolean("is_pinned").default(false),
  pinnedBy: integer("pinned_by").references(() => users.id),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  reportsCount: integer("reports_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_event_page_posts_event").on(table.eventId),
  index("idx_event_page_posts_user").on(table.userId),
  index("idx_event_page_posts_type").on(table.postType),
  index("idx_event_page_posts_approved").on(table.isApproved),
  index("idx_event_page_posts_created").on(table.createdAt),
]);

// User followed cities table
export const userFollowedCities = pgTable("user_followed_cities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Settings table for comprehensive user preferences
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),

  // Notification settings
  notifications: jsonb("notifications").default({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    newFollowerAlerts: true,
    messageAlerts: true,
    groupInvites: true,
    weeklyDigest: false,
    marketingEmails: false,
    // TTFiles-inspired additions
    mentionAlerts: true,
    replyNotifications: true,
    systemUpdates: true,
    securityAlerts: true
  }).notNull(),

  // Privacy settings
  privacy: jsonb("privacy").default({
    profileVisibility: 'public',
    showLocation: true,
    showEmail: false,
    showPhone: false,
    allowMessagesFrom: 'friends',
    showActivityStatus: true,
    allowTagging: true,
    showInSearch: true,
    // TTFiles-inspired additions
    shareAnalytics: false,
    dataExportEnabled: true,
    thirdPartySharing: false
  }).notNull(),

  // Appearance settings
  appearance: jsonb("appearance").default({
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    fontSize: 'medium',
    reduceMotion: false,
    // TTFiles-inspired additions
    colorScheme: 'ocean',
    compactMode: false,
    showAnimations: true,
    customAccentColor: null
  }).notNull(),

  // Advanced settings (TTFiles-inspired)
  advanced: jsonb("advanced").default({
    developerMode: false,
    betaFeatures: false,
    performanceMode: 'balanced',
    cacheSize: 'medium',
    offlineMode: false,
    syncFrequency: 'realtime',
    exportFormat: 'json',
    apiAccess: false,
    webhooksEnabled: false
  }).notNull(),

  // Accessibility settings
  accessibility: jsonb("accessibility").default({
    screenReaderOptimized: false,
    highContrast: false,
    keyboardNavigation: true,
    focusIndicators: true,
    altTextMode: 'enhanced',
    audioDescriptions: false,
    captionsEnabled: true
  }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_settings_user_id").on(table.userId),
]);

// Event series table for recurring events
export const eventSeries = pgTable("event_series", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pattern: varchar("pattern", { length: 50 }).notNull(), // weekly, monthly, custom
  venue: varchar("venue", { length: 255 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event Participants table for role tagging system
// Event Admins table for delegation features
export const eventAdmins = pgTable("event_admins", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // owner, admin, moderator
  permissions: jsonb("permissions").default({}).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  unique().on(table.eventId, table.userId),
  index("idx_event_admins_event_id").on(table.eventId),
  index("idx_event_admins_user_id").on(table.userId),
]);

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // DJ, teacher, musician, performer, organizer, etc.
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, declined
  invitedBy: integer("invited_by").references(() => users.id).notNull(),
  invitedAt: timestamp("invited_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.eventId, table.userId, table.role),
  index("idx_event_participants_user_id").on(table.userId),
  index("idx_event_participants_event_id").on(table.eventId),
  index("idx_event_participants_status").on(table.status),
]);

// Chat rooms table
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // single, group
  status: varchar("status", { length: 30 }),
  memberLimit: integer("member_limit").default(1024),
  canMemberEditGroup: boolean("can_member_edit_group").default(true),
  canMemberSendMessage: boolean("can_member_send_message").default(true),
  canMemberAddMember: boolean("can_member_add_member").default(true),
  lastMessageTimestamp: timestamp("last_message_timestamp"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  chatRoomSlug: varchar("chat_room_slug", { length: 100 }).references(() => chatRooms.slug).notNull(),
  userSlug: varchar("user_slug", { length: 100 }).notNull(),
  messageType: varchar("message_type", { length: 30 }).notNull(),
  message: text("message"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileThumb: text("file_thumb"),
  isForwarded: boolean("is_forwarded").default(false),
  isReply: boolean("is_reply").default(false),
  replyMessageSlug: varchar("reply_message_slug", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat room users table
export const chatRoomUsers = pgTable("chat_room_users", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  chatRoomSlug: varchar("chat_room_slug", { length: 100 }).references(() => chatRooms.slug).notNull(),
  userSlug: varchar("user_slug", { length: 100 }).notNull(),
  isOwner: boolean("is_owner").default(false),
  isSubAdmin: boolean("is_sub_admin").default(false),
  status: varchar("status", { length: 30 }).notNull(),
  unreadMessageCount: integer("unread_message_count").default(0),
  isLeaved: boolean("is_leaved").default(false),
  isKicked: boolean("is_kicked").default(false),
  isBlocked: boolean("is_blocked").default(false),
  isVisible: boolean("is_visible").default(true),
  lastMessageTimestamp: timestamp("last_message_timestamp"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Follows table
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post likes table
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post shares table - ESA Agent #1 (Database Schema)
export const postShares = pgTable("post_shares", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post comments table
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id"),
  mentions: text("mentions").array().default([]),
  gifUrl: text("gif_url"),
  imageUrl: text("image_url"),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dance experiences table
export const danceExperiences = pgTable("dance_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  socialDancingCities: text("social_dancing_cities").array(),
  recentWorkshopCities: text("recent_workshop_cities").array(),
  favouriteDancingCities: text("favourite_dancing_cities").array(),
  annualEventCount: integer("annual_event_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Creator experiences table
export const creatorExperiences = pgTable("creator_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  shoesUrl: text("shoes_url"),
  clothingUrl: text("clothing_url"),
  jewelry: text("jewelry"),
  vendorActivities: text("vendor_activities"),
  vendorUrl: text("vendor_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stories table
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 20 }).notNull(), // image, video
  caption: text("caption"),
  viewsCount: integer("views_count").default(0),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Story views table
export const storyViews = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Additional specialized experience tables from original database
export const djExperiences = pgTable("dj_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  performedEvents: integer("performed_events").default(0),
  cities: text("cities"),
  favouriteOrchestra: varchar("favourite_orchestra", { length: 255 }),
  favouriteSinger: varchar("favourite_singer", { length: 255 }),
  milongaSize: varchar("milonga_size", { length: 255 }),
  useExternalEquipments: boolean("use_external_equipments").default(false),
  djSoftwares: text("dj_softwares"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teachingExperiences = pgTable("teaching_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  partnerFacebookUrl: varchar("partner_facebook_url", { length: 255 }),
  cities: text("cities"),
  onlinePlatforms: text("online_platforms"),
  aboutTangoFuture: text("about_tango_future"),
  teachingReason: text("teaching_reason"),
  preferredSize: integer("preferred_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const performerExperiences = pgTable("performer_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  partnerProfileLink: text("partner_profile_link"),
  recentPerformanceUrl: varchar("recent_performance_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const photographerExperiences = pgTable("photographer_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 20 }).default("photographer"), // photographer, videographer, both
  facebookProfileUrl: varchar("facebook_profile_url", { length: 255 }),
  videosTakenCount: integer("videos_taken_count"),
  cities: text("cities"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tourOperatorExperiences = pgTable("tour_operator_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  cities: text("cities"),
  websiteUrl: varchar("website_url", { length: 255 }),
  theme: text("theme"),
  vendorActivities: varchar("vendor_activities", { length: 255 }),
  vendorUrl: varchar("vendor_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Blocked users table
export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  blockedUserId: integer("blocked_user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// n8n Integration tables
export const n8nWebhookLogs = pgTable('n8n_webhook_logs', {
  id: serial('id').primaryKey(),
  workflowId: varchar('workflow_id', { length: 255 }),
  webhookPath: varchar('webhook_path', { length: 255 }),
  method: varchar('method', { length: 10 }),
  headers: jsonb('headers'),
  body: jsonb('body'),
  responseStatus: integer('response_status'),
  responseBody: jsonb('response_body'),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const n8nIntegrationStatus = pgTable('n8n_integration_status', {
  id: serial('id').primaryKey(),
  serviceName: varchar('service_name', { length: 100 }).unique().notNull(),
  isActive: boolean('is_active').default(true),
  lastSync: timestamp('last_sync'),
  syncStatus: varchar('sync_status', { length: 50 }),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User API tokens for session management  
export const userApiTokens = pgTable("user_api_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  apiToken: text("api_token").notNull(),
  deviceType: varchar("device_type", { length: 100 }),
  deviceToken: text("device_token"),
  type: varchar("type", { length: 20 }).default("ACCESS"), // ACCESS, RESET, INVITE
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Media assets table for Supabase Storage metadata
export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  originalFilename: text("original_filename").notNull(),
  path: text("path").notNull(),
  url: text("url").notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull().default("public"),
  contentType: text("content_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  size: integer("size").notNull(),
  folder: text("folder").notNull().default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Media tags table for tagging system
export const mediaTags = pgTable("media_tags", {
  id: serial("id").primaryKey(),
  mediaId: text("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uniqueTag: unique().on(table.mediaId, table.tag),
}));

// Media usage tracking for relating media to specific content
export const mediaUsage = pgTable("media_usage", {
  id: serial("id").primaryKey(),
  mediaId: text("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  usedIn: text("used_in").notNull(), // 'memory', 'event', 'profile', 'experience'
  refId: integer("ref_id").notNull(), // Reference to the specific record ID
  context: text("context"), // Additional context like 'event_promo', 'profile_background'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUsage: unique().on(table.mediaId, table.usedIn, table.refId),
}));

// Friends table for mutual visibility logic
export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friendId: integer("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'blocked'
  connectionDegree: integer("connection_degree").default(1), // 1st, 2nd, 3rd degree
  closenessScore: real("closeness_score").default(0), // 0-100 based on interactions
  lastInteractionAt: timestamp("last_interaction_at"), // Track temporal decay
  interactionCount: integer("interaction_count").default(0), // Bi-directional tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueFriendship: unique().on(table.userId, table.friendId),
  idxClosenessScore: index("idx_friends_closeness_score").on(table.closenessScore),
  idxConnectionDegree: index("idx_friends_connection_degree").on(table.connectionDegree),
  idxLastInteraction: index("idx_friends_last_interaction").on(table.lastInteractionAt),
}));

// Friend Requests table with detailed information
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'snoozed'
  // Dance information
  didWeDance: boolean("did_we_dance"),
  danceLocation: text("dance_location"), // Event or city name
  danceEventId: integer("dance_event_id").references(() => events.id),
  danceStory: text("dance_story"),
  // Media attachments
  mediaUrls: text("media_urls").array().default([]),
  // Private notes (not visible to other party)
  senderPrivateNote: text("sender_private_note"),
  receiverPrivateNote: text("receiver_private_note"),
  // Messages
  senderMessage: text("sender_message"),
  receiverMessage: text("receiver_message"),
  // Snooze functionality
  snoozedUntil: timestamp("snoozed_until"),
  snoozeReminderSent: boolean("snooze_reminder_sent").default(false),
  // Timestamps
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueRequest: unique().on(table.senderId, table.receiverId),
  idxSender: index("idx_friend_requests_sender").on(table.senderId),
  idxReceiver: index("idx_friend_requests_receiver").on(table.receiverId),
  idxStatus: index("idx_friend_requests_status").on(table.status),
  idxSnoozed: index("idx_friend_requests_snoozed").on(table.snoozedUntil),
}));

// Friendship Activities table to track all interactions
export const friendshipActivities = pgTable("friendship_activities", {
  id: serial("id").primaryKey(),
  friendshipId: integer("friendship_id").notNull().references(() => friends.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(), // 'post_tag', 'comment', 'like', 'event_together', 'message'
  activityData: jsonb("activity_data").default({}), // Store relevant data for each activity type
  points: integer("points").default(1), // Weight for closeness calculation
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  idxFriendship: index("idx_friendship_activities_friendship").on(table.friendshipId),
  idxType: index("idx_friendship_activities_type").on(table.activityType),
  idxCreatedAt: index("idx_friendship_activities_created").on(table.createdAt),
}));

// Friendship Media table for photos/videos shared in friend requests
export const friendshipMedia = pgTable("friendship_media", {
  id: serial("id").primaryKey(),
  friendRequestId: integer("friend_request_id").references(() => friendRequests.id, { onDelete: "cascade" }),
  friendshipId: integer("friendship_id").references(() => friends.id, { onDelete: "cascade" }),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(), // 'photo', 'video'
  caption: text("caption"),
  phase: text("phase").notNull().default("request"), // 'request', 'acceptance', 'friendship'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  idxRequest: index("idx_friendship_media_request").on(table.friendRequestId),
  idxFriendship: index("idx_friendship_media_friendship").on(table.friendshipId),
}));

// Memories table
export const memories = pgTable("memories", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  richContent: jsonb("rich_content"),
  emotionTags: text("emotion_tags").array(),
  emotionVisibility: text("emotion_visibility").default('everyone'),
  trustCircleLevel: integer("trust_circle_level"),
  location: jsonb("location"),
  mediaUrls: text("media_urls").array(),
  coTaggedUsers: integer("co_tagged_users").array(),
  consentRequired: boolean("consent_required").default(false),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  consentStatus: text("consent_status").default('not_required'),
  approvedConsents: jsonb("approved_consents"),
  deniedConsents: jsonb("denied_consents"),
  pendingConsents: jsonb("pending_consents"),
  tenantId: uuid("tenant_id"),
});

// Memory media junction table for reusing media across memories
export const memoryMedia = pgTable("memory_media", {
  id: serial("id").primaryKey(),
  memoryId: integer("memory_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  mediaId: text("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  taggedBy: integer("tagged_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueMemoryMedia: unique().on(table.memoryId, table.mediaId),
}));

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  events: many(events),
  eventRsvps: many(eventRsvps),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  postLikes: many(postLikes),
  postComments: many(postComments),
  danceExperience: many(danceExperiences),
  creatorExperience: many(creatorExperiences),
  stories: many(stories),
  storyViews: many(storyViews),
  mediaAssets: many(mediaAssets),
  friendships: many(friends, { relationName: "user_friendships" }),
  friendOf: many(friends, { relationName: "friend_of" }),
  groupMemberships: many(groupMembers),
  createdGroups: many(groups),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  user: one(users, { fields: [mediaAssets.userId], references: [users.id] }),
  tags: many(mediaTags),
  usage: many(mediaUsage),
}));

export const mediaTagsRelations = relations(mediaTags, ({ one }) => ({
  media: one(mediaAssets, { fields: [mediaTags.mediaId], references: [mediaAssets.id] }),
}));

export const mediaUsageRelations = relations(mediaUsage, ({ one }) => ({
  media: one(mediaAssets, { fields: [mediaUsage.mediaId], references: [mediaAssets.id] }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  user: one(users, { fields: [friends.userId], references: [users.id] }),
  friend: one(users, { fields: [friends.friendId], references: [users.id] }),
}));

export const memoryMediaRelations = relations(memoryMedia, ({ one }) => ({
  memory: one(posts, { fields: [memoryMedia.memoryId], references: [posts.id] }),
  media: one(mediaAssets, { fields: [memoryMedia.mediaId], references: [mediaAssets.id] }),
  tagger: one(users, { fields: [memoryMedia.taggedBy], references: [users.id] }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  likes: many(postLikes),
  comments: many(postComments),
  attachments: many(attachments),
  memoryMedia: many(memoryMedia),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, { fields: [events.userId], references: [users.id] }),
  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, { fields: [eventRsvps.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRsvps.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
});



export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentAttendees: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertMediaTagSchema = createInsertSchema(mediaTags).omit({
  id: true,
  createdAt: true,
});

export const insertMediaUsageSchema = createInsertSchema(mediaUsage).omit({
  id: true,
  createdAt: true,
});

export const insertFriendSchema = createInsertSchema(friends).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFriendRequestSchema = createInsertSchema(friendRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
});

export const insertFriendshipActivitySchema = createInsertSchema(friendshipActivities).omit({
  id: true,
  createdAt: true,
});

export const insertFriendshipMediaSchema = createInsertSchema(friendshipMedia).omit({
  id: true,
  createdAt: true,
});

export const insertMemoryMediaSchema = createInsertSchema(memoryMedia).omit({
  id: true,
  createdAt: true,
});

// Enhanced comment schema for rich commenting system
export const insertCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Post and Comment Reactions table for enhanced engagement
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  postId: integer("post_id").references(() => posts.id),
  commentId: integer("comment_id").references(() => postComments.id),
  type: varchar("type", { length: 20 }).notNull(), // like, dislike, love, laugh, angry, sad
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_reactions_user").on(table.userId),
  index("idx_reactions_post").on(table.postId),
  index("idx_reactions_comment").on(table.commentId),
  unique().on(table.userId, table.postId, table.type),
  unique().on(table.userId, table.commentId, table.type),
]);

// Post Reports table for moderation system
export const postReports = pgTable("post_reports", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id),
  commentId: integer("comment_id").references(() => postComments.id),
  reporterId: integer("reporter_id").references(() => users.id).notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, reviewed, resolved, dismissed
  moderatorId: integer("moderator_id").references(() => users.id),
  moderatorNotes: text("moderator_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_reports_post").on(table.postId),
  index("idx_reports_comment").on(table.commentId),
  index("idx_reports_status").on(table.status),
  index("idx_reports_created").on(table.createdAt),
]);

// Notifications table for real-time updates
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // comment, like, mention, follow, event_invite
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data").default({}), // Additional data for the notification
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"), // URL to navigate when clicked
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notifications_user").on(table.userId),
  index("idx_notifications_unread").on(table.userId, table.isRead),
  index("idx_notifications_type").on(table.type),
  index("idx_notifications_created").on(table.createdAt),
]);

// Groups table for city-based and community groups
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  type: varchar("type", { length: 50 }).notNull().default("city"), // city, community, interest, role, etc.
  roleType: varchar("role_type", { length: 50 }), // teacher, organizer, dj, performer, etc.
  emoji: varchar("emoji", { length: 10 }).default("🏙️"),
  imageUrl: text("image_url"),
  coverImage: text("coverImage"), // Cover photo for group detail pages
  description: text("description"),
  isPrivate: boolean("is_private").default(false),
  visibility: varchar("visibility", { length: 20 }).default("public"), // Adding missing visibility field
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  memberCount: integer("member_count").default(0),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_groups_type").on(table.type),
  index("idx_groups_role_type").on(table.roleType),
  index("idx_groups_city").on(table.city),
  index("idx_groups_slug").on(table.slug),
  index("idx_groups_created_at").on(table.createdAt),
]);

// Group Members table for user-group relationships
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 50 }).default("member"), // member, admin, moderator
  joinedAt: timestamp("joined_at").defaultNow(),
  invitedBy: integer("invited_by").references(() => users.id),
  status: varchar("status", { length: 20 }).default("active"), // active, pending, banned
}, (table) => [
  unique().on(table.groupId, table.userId),
  index("idx_group_members_user").on(table.userId),
  index("idx_group_members_group").on(table.groupId),
  index("idx_group_members_role").on(table.role),
  index("idx_group_members_status").on(table.status),
]);

// Chat History table for tracking all conversations
export const chatHistory = pgTable("chat_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  userId: integer("user_id").references(() => users.id),
  userMessage: text("user_message"),
  assistantMessage: text("assistant_message"),
  messageType: varchar("message_type", { length: 50 }).default("conversation"), // conversation, system, error
  context: jsonb("context"), // Additional context like file attachments, tool calls
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  projectState: jsonb("project_state"), // Snapshot of project state at time of message
  toolsUsed: text("tools_used").array(), // Track which tools were used
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_chat_history_session").on(table.sessionId),
  index("idx_chat_history_user").on(table.userId),
  index("idx_chat_history_timestamp").on(table.timestamp),
  index("idx_chat_history_type").on(table.messageType),
]);

// Host Homes table for accommodation listings
export const hostHomes = pgTable("host_homes", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).notNull(),
  lat: real("lat"),
  lng: real("lng"),
  photos: text("photos").array().default(sql`ARRAY[]::text[]`), // Media URLs (images & videos)
  mediaOrder: text("media_order").array(), // Order of media display (array of URLs from photos)
  thumbnailMedia: text("thumbnail_media"), // URL of media to use as thumbnail (from photos array)
  amenities: text("amenities").array().default(sql`ARRAY[]::text[]`),
  maxGuests: integer("max_guests").default(1),
  pricePerNight: integer("price_per_night"), // in cents
  availability: jsonb("availability").default({}), // dates available
  blockedDates: jsonb("blocked_dates"), // dates manually blocked by host (array of {startDate, endDate, reason})
  // Friendship-based booking restrictions (ESA Layer 24: Social Features)
  whoCanBook: varchar("who_can_book", { length: 50 }).default("anyone"), // 'anyone', 'friends_only', '1st_degree', '2nd_degree', '3rd_degree', 'custom_closeness'
  minimumClosenessScore: integer("minimum_closeness_score").default(0), // 0-100 threshold for custom_closeness
  allowUnconnected: boolean("allow_unconnected").default(true), // Allow non-connected users to book
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_host_homes_host").on(table.hostId),
  index("idx_host_homes_city").on(table.city),
  index("idx_host_homes_active").on(table.isActive),
  index("idx_host_homes_location").on(table.lat, table.lng),
  index("idx_host_homes_who_can_book").on(table.whoCanBook),
]);

// Recommendations table for user posts with recommendations
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  postId: integer("post_id").references(() => posts.id),
  groupId: integer("group_id").references(() => groups.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // restaurant, cafe, hotel, venue
  address: text("address"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).notNull(),
  lat: real("lat"),
  lng: real("lng"),
  photos: text("photos").array().default(sql`ARRAY[]::text[]`),
  rating: integer("rating"), // 1-5 stars (legacy - replaced by mtRating for clarity)
  priceLevel: varchar("price_level", { length: 10 }), // '$', '$$', '$$$' - ESA Layer 28
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  // ESA Layer 26: Cuisine-based ranking system for restaurants
  cuisine: varchar("cuisine", { length: 50 }), // e.g., "Chinese", "Italian", "Japanese" (null for non-restaurants)
  // ESA Layer 58: Google Places API integration for dual rating system
  googlePlaceId: varchar("google_place_id", { length: 255 }), // Google Places API unique identifier
  googleRating: real("google_rating"), // 0-5 from Google Places API
  googleReviewCount: integer("google_review_count"), // Number of Google reviews
  mtRating: real("mt_rating"), // Average rating from MT community (calculated from all recommendations for this place)
  mtReviewCount: integer("mt_review_count"), // Number of MT users who recommended this place
  // ESA Layer 28: Social connection-based visibility (mirrors Housing whoCanBook system)
  whoCanView: varchar("who_can_view", { length: 50 }).default("anyone"), // 'anyone', '1st_degree', '2nd_degree', '3rd_degree', 'custom_closeness'
  minimumClosenessScore: integer("minimum_closeness_score").default(0), // 0-100 threshold for custom_closeness filter
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_recommendations_user").on(table.userId),
  index("idx_recommendations_post").on(table.postId),
  index("idx_recommendations_group").on(table.groupId),
  index("idx_recommendations_city").on(table.city),
  index("idx_recommendations_type").on(table.type),
  index("idx_recommendations_location").on(table.lat, table.lng),
  index("idx_recommendations_cuisine").on(table.cuisine), // ESA Layer 26: Optimize cuisine filtering queries
  index("idx_recommendations_who_can_view").on(table.whoCanView), // ESA Layer 28: Enable filtering by connection level
]);

// ESA LIFE CEO 61x21 - Favorites table for toolbar functionality (Layer 2: API Structure)
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  itemType: varchar("item_type", { length: 50 }).notNull(), // post, event, user, group, memory
  itemId: integer("item_id").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageUrl: text("image_url"),
  metadata: jsonb("metadata").default({}), // Extra data specific to each type
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.itemType, table.itemId),
  index("idx_favorites_user").on(table.userId),
  index("idx_favorites_type").on(table.itemType),
  index("idx_favorites_created").on(table.createdAt),
]);

// Reaction schema for post and comment reactions  
export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true,
});

// Report schema for content moderation
export const insertReportSchema = createInsertSchema(postReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Notification schema for real-time alerts
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  assignedAt: true,
});

export const insertCustomRoleRequestSchema = createInsertSchema(customRoleRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCustomRoleRequestSchema = createInsertSchema(customRoleRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedBy: true,
}).partial();

// Group schemas
export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberCount: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

// Chat History schema
export const insertChatHistorySchema = createInsertSchema(chatHistory).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

// Host Homes schema
export const insertHostHomeSchema = createInsertSchema(hostHomes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Guest Bookings table
export const guestBookings = pgTable("guest_bookings", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").references(() => users.id).notNull(),
  hostHomeId: integer("host_home_id").references(() => hostHomes.id).notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  guestCount: integer("guest_count").notNull().default(1),
  purpose: text("purpose").notNull(),
  message: text("message").notNull(),
  hasReadRules: boolean("has_read_rules").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, cancelled, completed
  hostResponse: text("host_response"),
  totalPrice: integer("total_price"), // in cents
  // Connection info snapshot at time of booking (ESA Layer 31: Validation Sentinel)
  connectionInfo: jsonb("connection_info"), // {connectionDegree: number, closenessScore: number, mutualFriends: number, sharedMemories: number}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
}, (table) => [
  index("idx_guest_bookings_guest").on(table.guestId),
  index("idx_guest_bookings_home").on(table.hostHomeId),
  index("idx_guest_bookings_status").on(table.status),
  index("idx_guest_bookings_dates").on(table.checkInDate, table.checkOutDate),
]);

// House Rule Templates table - Pre-defined rule templates (ESA Layer 27)
export const houseRuleTemplates = pgTable("house_rule_templates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // check-in-out, pets, smoking, events, noise, parking, general, safety
  icon: varchar("icon", { length: 50 }), // Icon identifier for UI
  isDefault: boolean("is_default").default(true), // Show by default in templates
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_house_rule_templates_category").on(table.category),
  index("idx_house_rule_templates_default").on(table.isDefault),
]);

// Host Home Rules table - Rules assigned to specific properties (ESA Layer 27)
export const hostHomeRules = pgTable("host_home_rules", {
  id: serial("id").primaryKey(),
  hostHomeId: integer("host_home_id").references(() => hostHomes.id, { onDelete: 'cascade' }).notNull(),
  ruleTemplateId: integer("rule_template_id").references(() => houseRuleTemplates.id), // null if custom rule
  customTitle: varchar("custom_title", { length: 255 }), // For custom rules
  customDescription: text("custom_description"), // For custom rules
  category: varchar("category", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_host_home_rules_home").on(table.hostHomeId),
  index("idx_host_home_rules_template").on(table.ruleTemplateId),
  index("idx_host_home_rules_category").on(table.category),
]);

// House Rules schemas
export const insertHouseRuleTemplateSchema = createInsertSchema(houseRuleTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertHostHomeRuleSchema = createInsertSchema(hostHomeRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Guest Bookings schema
export const insertGuestBookingSchema = createInsertSchema(guestBookings, {
  checkInDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  checkOutDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
}).omit({
  id: true,
  guestId: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  hostResponse: true,
  totalPrice: true,
  respondedAt: true,
}).extend({
  guestId: z.number().optional(),
});

// Recommendations schema
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Group relations
export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, { fields: [groups.createdBy], references: [users.id] }),
  members: many(groupMembers),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
  inviter: one(users, { fields: [groupMembers.invitedBy], references: [users.id] }),
}));

// Type definitions
export type User = typeof users.$inferSelect;
export type UserWithRoles = User & {
  roles?: string[];
};
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;

// Replit Auth specific types
export type ReplitUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
};
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
export type PostComment = typeof postComments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Reaction = typeof reactions.$inferSelect;
export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type PostReport = typeof postReports.$inferSelect;
export type InsertPostReport = z.infer<typeof insertReportSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Follow = typeof follows.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type StoryView = typeof storyViews.$inferSelect;
export type DanceExperience = typeof danceExperiences.$inferSelect;
export type CreatorExperience = typeof creatorExperiences.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaTag = typeof mediaTags.$inferSelect;
export type InsertMediaTag = z.infer<typeof insertMediaTagSchema>;
export type MediaUsage = typeof mediaUsage.$inferSelect;
export type InsertMediaUsage = z.infer<typeof insertMediaUsageSchema>;
export type Friend = typeof friends.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type FriendRequest = typeof friendRequests.$inferSelect;
export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type FriendshipActivity = typeof friendshipActivities.$inferSelect;
export type InsertFriendshipActivity = z.infer<typeof insertFriendshipActivitySchema>;
export type FriendshipMedia = typeof friendshipMedia.$inferSelect;
export type InsertFriendshipMedia = z.infer<typeof insertFriendshipMediaSchema>;
export type MemoryMedia = typeof memoryMedia.$inferSelect;
export type InsertMemoryMedia = z.infer<typeof insertMemoryMediaSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

// Event Participants schemas and types for role tagging system
export const insertEventParticipantSchema = createInsertSchema(eventParticipants, {
  role: z.string().min(1, "Role is required"),
  status: z.enum(["pending", "accepted", "declined"]).default("pending"),
});

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;

// Additional event-related types
export type EventInvitation = typeof eventInvitations.$inferSelect;
export type InsertEventInvitation = typeof eventInvitations.$inferInsert;
export type RecurringEvent = typeof recurringEvents.$inferSelect;
export type InsertRecurringEvent = typeof recurringEvents.$inferInsert;
export type UserFollowedCity = typeof userFollowedCities.$inferSelect;
export type InsertUserFollowedCity = typeof userFollowedCities.$inferInsert;
export type EventSeries = typeof eventSeries.$inferSelect;
export type InsertEventSeries = typeof eventSeries.$inferInsert;

// Event Page system types
export type EventPageAdmin = typeof eventPageAdmins.$inferSelect;
export type InsertEventPageAdmin = typeof eventPageAdmins.$inferInsert;
export type EventPagePost = typeof eventPagePosts.$inferSelect;
export type InsertEventPagePost = z.infer<typeof insertEventPagePostSchema>;


// Event Page insert schemas
export const insertEventPageAdminSchema = createInsertSchema(eventPageAdmins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  delegatedAt: true,
});

export const insertEventPagePostSchema = createInsertSchema(eventPagePosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesCount: true,
  commentsCount: true,
  reportsCount: true,
});

// Custom role types
export type CustomRoleRequest = typeof customRoleRequests.$inferSelect;
export type InsertCustomRoleRequest = z.infer<typeof insertCustomRoleRequestSchema>;
export type UpdateCustomRoleRequest = z.infer<typeof updateCustomRoleRequestSchema>;

// Code of Conduct Agreement types
export const insertCodeOfConductAgreementSchema = createInsertSchema(codeOfConductAgreements).omit({
  id: true,
  createdAt: true,
});

export type CodeOfConductAgreement = typeof codeOfConductAgreements.$inferSelect;
export type InsertCodeOfConductAgreement = z.infer<typeof insertCodeOfConductAgreementSchema>;

// 11L Project Tracker System - Master tracking for all Mundo Tango features
export const projectTrackerItems = pgTable("project_tracker_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // Feature, Prompt, Automation, Agent, UI, Schema
  layer: varchar("layer", { length: 100 }).notNull(), // Layer 1-11 with name
  createdOn: timestamp("created_on").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  reviewStatus: varchar("review_status", { length: 50 }).notNull().default("Pending"), // Pending, Needs Review, Approved, Deprecated
  reviewedBy: text("reviewed_by"),
  version: varchar("version", { length: 20 }).notNull().default("v1.0.0"),
  mvpScope: boolean("mvp_scope").notNull().default(false),
  mvpStatus: varchar("mvp_status", { length: 50 }).notNull().default("In Progress"), // In Progress, Ready, Signed Off, Deferred
  mvpSignedOffBy: text("mvp_signed_off_by"),
  summary: text("summary").notNull(),
  metadata: jsonb("metadata"), // Additional technical details, dependencies, etc.
  codeLocation: text("code_location"), // File paths where this is implemented
  apiEndpoints: text("api_endpoints").array(), // Related API endpoints
  dependencies: text("dependencies").array(), // What this depends on
  relatedItems: text("related_items").array(), // UUIDs of related tracker items
  tags: text("tags").array(), // Searchable tags
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, critical
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  completionPercentage: integer("completion_percentage").default(0),
  blockers: text("blockers").array(), // Current blocking issues
  notes: text("notes"), // Implementation notes
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
}, (table) => [
  index("idx_tracker_layer").on(table.layer),
  index("idx_tracker_type").on(table.type),
  index("idx_tracker_review_status").on(table.reviewStatus),
  index("idx_tracker_mvp_scope").on(table.mvpScope),
  index("idx_tracker_mvp_status").on(table.mvpStatus),
  index("idx_tracker_priority").on(table.priority),
  index("idx_tracker_completion").on(table.completionPercentage),
  index("idx_tracker_created_on").on(table.createdOn),
  index("idx_tracker_last_updated").on(table.lastUpdated),
]);

// Project Tracker Change Log for version control
export const projectTrackerChangelog = pgTable("project_tracker_changelog", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id").references(() => projectTrackerItems.id).notNull(),
  changeType: varchar("change_type", { length: 50 }).notNull(), // created, updated, deleted, reviewed, mvp_status_change
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  changedBy: integer("changed_by").references(() => users.id),
  changeReason: text("change_reason"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("idx_changelog_item").on(table.itemId),
  index("idx_changelog_type").on(table.changeType),
  index("idx_changelog_timestamp").on(table.timestamp),
]);

// Live Agent Actions for real-time tracking
export const liveAgentActions = pgTable("live_agent_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentName: varchar("agent_name", { length: 100 }).notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(), // feature_detection, classification, tracking, analysis
  targetType: varchar("target_type", { length: 50 }).notNull(), // component, api, schema, automation
  targetPath: text("target_path"), // File path or identifier
  detectedChanges: jsonb("detected_changes"),
  autoClassification: jsonb("auto_classification"), // AI-determined layer, type, etc.
  confidence: integer("confidence"), // 0-100 confidence in classification
  requiresReview: boolean("requires_review").default(true),
  trackerItemId: uuid("tracker_item_id").references(() => projectTrackerItems.id),
  sessionId: varchar("session_id", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_actions_agent").on(table.agentName),
  index("idx_agent_actions_type").on(table.actionType),
  index("idx_agent_actions_session").on(table.sessionId),
  index("idx_agent_actions_timestamp").on(table.timestamp),
]);

// Project Tracker Schemas
export const insertProjectTrackerItemSchema = createInsertSchema(projectTrackerItems).omit({
  id: true,
  createdOn: true,
  lastUpdated: true,
});

export const insertProjectTrackerChangelogSchema = createInsertSchema(projectTrackerChangelog).omit({
  id: true,
  timestamp: true,
});

export const insertLiveAgentActionSchema = createInsertSchema(liveAgentActions).omit({
  id: true,
  timestamp: true,
});

// Life CEO Chat System Tables
export const lifeCeoAgentConfigurations = pgTable("life_ceo_agent_configurations", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: varchar("agent_id", { length: 100 }).notNull().unique(),
  configurationData: jsonb("configuration_data").notNull().default({}),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_config_id").on(table.agentId),
  index("idx_agent_config_updated").on(table.lastUpdated),
]);

// Life CEO Agent Memory Storage
export const life_ceo_agent_memories = pgTable("life_ceo_agent_memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentType: varchar("agent_type", { length: 50 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  content: jsonb("content").notNull(),
  importance: real("importance").default(0.5),
  tags: text("tags").array().default([]),
  embedding: jsonb("embedding"), // Store as JSONB for now, can be migrated to vector later
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => [
  index("idx_agent_memory_user_agent").on(table.userId, table.agentType),
  index("idx_agent_memory_importance").on(table.importance),
  index("idx_agent_memory_created").on(table.createdAt),
]);

export const lifeCeoChatMessages = pgTable("life_ceo_chat_messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_chat_user_agent").on(table.userId, table.agentId),
  index("idx_chat_timestamp").on(table.timestamp),
  index("idx_chat_agent").on(table.agentId),
]);

export const lifeCeoConversations = pgTable("life_ceo_conversations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  messages: jsonb("messages").default([]).notNull(),
  metadata: jsonb("metadata").default({}),
  projectId: varchar("project_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastMessage: timestamp("last_message").defaultNow().notNull(),
}, (table) => [
  index("idx_conv_user").on(table.userId),
  index("idx_conv_agent").on(table.agentId),
  index("idx_conv_last_message").on(table.lastMessage),
  index("idx_conv_project").on(table.projectId),
]);

export const lifeCeoProjects = pgTable("life_ceo_projects", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  conversations: text("conversations").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_project_user").on(table.userId),
]);

// Life CEO Chat System Schemas
export const insertLifeCeoAgentConfigSchema = createInsertSchema(lifeCeoAgentConfigurations).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertLifeCeoChatMessageSchema = createInsertSchema(lifeCeoChatMessages).omit({
  createdAt: true,
});

export const insertLifeCeoConversationSchema = createInsertSchema(lifeCeoConversations).omit({
  createdAt: true,
  updatedAt: true,
  lastMessage: true,
});

export const insertLifeCeoProjectSchema = createInsertSchema(lifeCeoProjects).omit({
  createdAt: true,
});

// Project Tracker Types
export type ProjectTrackerItem = typeof projectTrackerItems.$inferSelect;
export type InsertProjectTrackerItem = z.infer<typeof insertProjectTrackerItemSchema>;
export type ProjectTrackerChangelog = typeof projectTrackerChangelog.$inferSelect;
export type InsertProjectTrackerChangelog = z.infer<typeof insertProjectTrackerChangelogSchema>;
export type LiveAgentAction = typeof liveAgentActions.$inferSelect;
export type InsertLiveAgentAction = z.infer<typeof insertLiveAgentActionSchema>;

// Life CEO Chat System Types
export type LifeCeoAgentConfiguration = typeof lifeCeoAgentConfigurations.$inferSelect;
export type InsertLifeCeoAgentConfiguration = z.infer<typeof insertLifeCeoAgentConfigSchema>;
export type LifeCeoChatMessage = typeof lifeCeoChatMessages.$inferSelect;
export type InsertLifeCeoChatMessage = z.infer<typeof insertLifeCeoChatMessageSchema>;
export type LifeCeoConversation = typeof lifeCeoConversations.$inferSelect;
export type InsertLifeCeoConversation = z.infer<typeof insertLifeCeoConversationSchema>;
export type LifeCeoProject = typeof lifeCeoProjects.$inferSelect;
export type InsertLifeCeoProject = z.infer<typeof insertLifeCeoProjectSchema>;

// Multi-Tenant Platform Tables
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  logo_url: text("logo_url"),
  primary_color: text("primary_color").default('#FF1744'),
  secondary_color: text("secondary_color").default('#3F51B5'),
  domain: text("domain").unique(),
  is_active: boolean("is_active").default(true),
  settings: jsonb("settings").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_tenants_slug").on(table.slug),
  index("idx_tenants_is_active").on(table.is_active),
]);

export const tenantUsers = pgTable("tenant_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenant_id: uuid("tenant_id").references(() => tenants.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull().default('member'),
  is_admin: boolean("is_admin").default(false),
  display_in_feed: boolean("display_in_feed").default(true),
  notification_preferences: jsonb("notification_preferences").default({email: true, push: true}).notNull(),
  expertise_level: text("expertise_level").default('beginner'),
  interests: text("interests").array().default([]),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.tenant_id, table.user_id),
  index("idx_tenant_users_tenant_id").on(table.tenant_id),
  index("idx_tenant_users_user_id").on(table.user_id),
]);

export const userViewPreferences = pgTable("user_view_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  view_mode: text("view_mode").notNull().default('single_community'),
  selected_tenant_id: uuid("selected_tenant_id").references(() => tenants.id),
  selected_tenant_ids: uuid("selected_tenant_ids").array().default([]),
  custom_filters: jsonb("custom_filters").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.user_id),
  index("idx_user_view_preferences_user_id").on(table.user_id),
]);

export const contentSharing = pgTable("content_sharing", {
  id: uuid("id").primaryKey().defaultRandom(),
  content_type: text("content_type").notNull(),
  content_id: uuid("content_id").notNull(),
  source_tenant_id: uuid("source_tenant_id").references(() => tenants.id).notNull(),
  shared_tenant_id: uuid("shared_tenant_id").references(() => tenants.id).notNull(),
  shared_by: integer("shared_by").references(() => users.id),
  is_approved: boolean("is_approved").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.content_type, table.content_id, table.shared_tenant_id),
  index("idx_content_sharing_content_id").on(table.content_id),
  index("idx_content_sharing_source_tenant_id").on(table.source_tenant_id),
  index("idx_content_sharing_shared_tenant_id").on(table.shared_tenant_id),
]);

export const communityConnections = pgTable("community_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenant_id_1: uuid("tenant_id_1").references(() => tenants.id).notNull(),
  tenant_id_2: uuid("tenant_id_2").references(() => tenants.id).notNull(),
  relationship_type: text("relationship_type").notNull(),
  is_bidirectional: boolean("is_bidirectional").default(true),
  settings: jsonb("settings").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.tenant_id_1, table.tenant_id_2),
]);

export const userJourneys = pgTable("user_journeys", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
  locations: jsonb("locations").array().default([]),
  tenant_ids: uuid("tenant_ids").array().default([]),
  journey_type: text("journey_type").default('travel'),
  status: text("status").default('planning'),
  is_public: boolean("is_public").default(false),
  settings: jsonb("settings").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_journeys_user_id").on(table.user_id),
  // Note: GIN index for tenant_ids array would be added via migration
]);

export const journeyActivities = pgTable("journey_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  journey_id: uuid("journey_id").references(() => userJourneys.id).notNull(),
  tenant_id: uuid("tenant_id").references(() => tenants.id),
  activity_type: text("activity_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: jsonb("location"),
  start_datetime: timestamp("start_datetime"),
  end_datetime: timestamp("end_datetime"),
  external_url: text("external_url"),
  content_reference_id: uuid("content_reference_id"),
  content_reference_type: text("content_reference_type"),
  settings: jsonb("settings").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_journey_activities_journey_id").on(table.journey_id),
  index("idx_journey_activities_tenant_id").on(table.tenant_id),
]);

// Multi-Tenant Schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTenantUserSchema = createInsertSchema(tenantUsers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertUserViewPreferencesSchema = createInsertSchema(userViewPreferences).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertContentSharingSchema = createInsertSchema(contentSharing).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCommunityConnectionSchema = createInsertSchema(communityConnections).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertUserJourneySchema = createInsertSchema(userJourneys).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertJourneyActivitySchema = createInsertSchema(journeyActivities).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Multi-Tenant Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;
export type UserViewPreferences = typeof userViewPreferences.$inferSelect;
export type InsertUserViewPreferences = z.infer<typeof insertUserViewPreferencesSchema>;
export type ContentSharing = typeof contentSharing.$inferSelect;
export type InsertContentSharing = z.infer<typeof insertContentSharingSchema>;
export type CommunityConnection = typeof communityConnections.$inferSelect;
export type InsertCommunityConnection = z.infer<typeof insertCommunityConnectionSchema>;
export type UserJourney = typeof userJourneys.$inferSelect;
export type InsertUserJourney = z.infer<typeof insertUserJourneySchema>;
export type JourneyActivity = typeof journeyActivities.$inferSelect;
export type InsertJourneyActivity = z.infer<typeof insertJourneyActivitySchema>;

// Daily activities tracking for project management
export const dailyActivities = pgTable("daily_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  project_id: text("project_id").notNull(),
  project_title: text("project_title").notNull(),
  activity_type: text("activity_type").notNull(), // created, updated, completed, reviewed, blocked
  description: text("description").notNull(),
  changes: jsonb("changes").array().default([]), // Array of change descriptions
  team: text("team").array().default([]),
  tags: text("tags").array().default([]),
  completion_before: integer("completion_before"),
  completion_after: integer("completion_after"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default({}).notNull(),
}, (table) => [
  index("idx_daily_activities_user_id").on(table.user_id),
  index("idx_daily_activities_timestamp").on(table.timestamp),
  index("idx_daily_activities_project_id").on(table.project_id),
]);

// Host reviews for marketplace (guests review hosts/properties)
export const hostReviews = pgTable("host_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  booking_id: integer("booking_id").references(() => guestBookings.id).notNull(),
  home_id: integer("home_id").references(() => hostHomes.id).notNull(),
  reviewer_id: integer("reviewer_id").references(() => users.id).notNull(),
  host_id: integer("host_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars overall
  review_text: text("review_text"),
  cleanliness_rating: integer("cleanliness_rating"),
  communication_rating: integer("communication_rating"),
  accuracy_rating: integer("accuracy_rating"),
  location_rating: integer("location_rating"),
  value_rating: integer("value_rating"),
  photos: text("photos").array().default(sql`ARRAY[]::text[]`), // Review photos
  host_response: text("host_response"),
  host_response_at: timestamp("host_response_at"),
  is_verified_stay: boolean("is_verified_stay").default(true),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_host_reviews_home_id").on(table.home_id),
  index("idx_host_reviews_reviewer_id").on(table.reviewer_id),
  index("idx_host_reviews_booking_id").on(table.booking_id),
  unique().on(table.booking_id), // One review per booking
]);

// Guest reviews (hosts review guests after their stay)
export const guestReviews = pgTable("guest_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  booking_id: integer("booking_id").references(() => guestBookings.id).notNull(),
  guest_id: integer("guest_id").references(() => users.id).notNull(),
  reviewer_id: integer("reviewer_id").references(() => users.id).notNull(), // Host ID
  rating: integer("rating").notNull(), // 1-5 stars overall
  review_text: text("review_text"),
  cleanliness_rating: integer("cleanliness_rating"),
  communication_rating: integer("communication_rating"),
  respect_rating: integer("respect_rating"), // Respect for house rules
  would_host_again: boolean("would_host_again").default(true),
  guest_response: text("guest_response"),
  guest_response_at: timestamp("guest_response_at"),
  is_verified_stay: boolean("is_verified_stay").default(true),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_guest_reviews_guest_id").on(table.guest_id),
  index("idx_guest_reviews_reviewer_id").on(table.reviewer_id),
  index("idx_guest_reviews_booking_id").on(table.booking_id),
  unique().on(table.booking_id), // One review per booking
]);

// Guest profiles for personalized preferences
export const guestProfiles = pgTable("guest_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accommodationPreferences: jsonb("accommodation_preferences").default({}),
  dietaryRestrictions: text("dietary_restrictions").array().default([]),
  languagesSpoken: text("languages_spoken").array().default([]),
  travelInterests: text("travel_interests").array().default([]),
  emergencyContact: jsonb("emergency_contact").default({}),
  specialNeeds: text("special_needs"),
  preferredNeighborhoods: text("preferred_neighborhoods").array().default([]),
  budgetRange: jsonb("budget_range").default({}),
  stayDurationPreference: varchar("stay_duration_preference", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
}, (table) => [
  index("idx_guest_profiles_user_id").on(table.userId),
  unique().on(table.userId),
]);

// Insert schemas
export const insertDailyActivitySchema = createInsertSchema(dailyActivities).omit({
  id: true,
  timestamp: true,
});

export const insertHostReviewSchema = createInsertSchema(hostReviews).omit({
  id: true,
  created_at: true,
  host_response: true,
  host_response_at: true,
});

export const insertGuestReviewSchema = createInsertSchema(guestReviews).omit({
  id: true,
  created_at: true,
  guest_response: true,
  guest_response_at: true,
});

export const insertGuestProfileSchema = createInsertSchema(guestProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type DailyActivity = typeof dailyActivities.$inferSelect;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
export type HostHome = typeof hostHomes.$inferSelect;
export type InsertHostHome = z.infer<typeof insertHostHomeSchema>;
export type HouseRuleTemplate = typeof houseRuleTemplates.$inferSelect;
export type InsertHouseRuleTemplate = z.infer<typeof insertHouseRuleTemplateSchema>;
export type HostHomeRule = typeof hostHomeRules.$inferSelect;
export type InsertHostHomeRule = z.infer<typeof insertHostHomeRuleSchema>;
export type GuestBooking = typeof guestBookings.$inferSelect;
export type InsertGuestBooking = z.infer<typeof insertGuestBookingSchema>;
export type HostReview = typeof hostReviews.$inferSelect;
export type InsertHostReview = z.infer<typeof insertHostReviewSchema>;
export type GuestReview = typeof guestReviews.$inferSelect;
export type InsertGuestReview = z.infer<typeof insertGuestReviewSchema>;
export type GuestProfile = typeof guestProfiles.$inferSelect;
export type InsertGuestProfile = z.infer<typeof insertGuestProfileSchema>;

// User Settings schema
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

// Performance metrics table for intelligent monitoring
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(),
  metricType: text("metric_type").notNull(), // api_response, cache_hit, db_query, etc.
  endpoint: text("endpoint"),
  responseTime: numeric("response_time", { precision: 10, scale: 2 }),
  cacheHitRate: numeric("cache_hit_rate", { precision: 5, scale: 2 }),
  memoryUsage: numeric("memory_usage", { precision: 10, scale: 2 }),
  activeConnections: integer("active_connections"),
  errorCount: integer("error_count").default(0),
  metadata: jsonb("metadata"), // Additional metric-specific data
  anomalyDetected: boolean("anomaly_detected").default(false),
  autoFixed: boolean("auto_fixed").default(false),
  severity: text("severity"), // low, medium, high, critical
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow()
}, (table) => [
  index("idx_performance_metrics_timestamp").on(table.timestamp),
  index("idx_performance_metrics_type").on(table.metricType),
  index("idx_performance_metrics_anomaly").on(table.anomalyDetected)
]);

export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  timestamp: true,
  createdAt: true
});
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricsSchema>;

// Export language-related tables and types from languageSchema
export {
  languages,
  userLanguagePreferences,
  translations,
  contentTranslations,
  translationVotes,
  languageAnalytics,
  lunfardoDictionary,
  type Language,
  type InsertLanguage,
  type UserLanguagePreference,
  type InsertUserLanguagePreference,
  type Translation,
  type InsertTranslation,
  type ContentTranslation,
  type InsertContentTranslation,
  type TranslationVote,
  type InsertTranslationVote,
  type LanguageAnalytics,
  type InsertLanguageAnalytics,
  type LunfardoDictionary,
  type InsertLunfardoDictionary
} from './languageSchema';

// TestSprite test results table
export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  testId: text("test_id").notNull().unique(),
  eventType: text("event_type"),
  status: text("status").notNull(), // passed, failed, running
  testSuite: text("test_suite"),
  passed: integer("passed").default(0),
  failed: integer("failed").default(0),
  skipped: integer("skipped").default(0),
  duration: text("duration"),
  errorDetails: jsonb("error_details"),
  testTimestamp: timestamp("test_timestamp"),
  receivedAt: timestamp("received_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = typeof testResults.$inferInsert;

// Note: homeAmenities and homePhotos are available from ./schema/hostHomes module
// Note: travelDetails is available from ./travelDetails module
// These are not re-exported here to avoid duplicate export conflicts

// Subscriptions table (matching existing database)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  planId: varchar("plan_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  paymentProvider: varchar("payment_provider", { length: 50 }).notNull(),
  providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment methods table (matching existing database)
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  provider: varchar("provider", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  lastFour: varchar("last_four", { length: 4 }),
  brand: varchar("brand", { length: 50 }),
  country: varchar("country", { length: 2 }),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").default(false),
  providerPaymentMethodId: varchar("provider_payment_method_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments/transactions table for payment history
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).unique(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).notNull().default('usd'),
  status: varchar("status", { length: 50 }).notNull(), // succeeded, pending, failed, etc
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_payments_user_id").on(table.userId),
  index("idx_payments_subscription_id").on(table.subscriptionId),
  index("idx_payments_stripe_payment_intent_id").on(table.stripePaymentIntentId),
]);

// Subscription features table for feature gating
export const subscriptionFeatures = pgTable("subscription_features", {
  id: serial("id").primaryKey(),
  featureName: varchar("feature_name", { length: 255 }).unique().notNull(),
  description: text("description"),
  tiers: text("tiers").array().notNull(), // Array of tiers that have access to this feature
  limitValue: integer("limit_value"), // NULL for unlimited, number for limited features
  limitUnit: varchar("limit_unit", { length: 50 }), // 'count', 'mb', 'minutes', etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook events table for Stripe webhook tracking
export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  stripeEventId: varchar("stripe_event_id", { length: 255 }).unique().notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  data: jsonb("data").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_webhook_events_stripe_event_id").on(table.stripeEventId),
  index("idx_webhook_events_processed").on(table.processed),
]);

// Insert schemas for payment tables
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionFeatureSchema = createInsertSchema(subscriptionFeatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  createdAt: true,
});

// Types for payment tables
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SubscriptionFeature = typeof subscriptionFeatures.$inferSelect;
export type InsertSubscriptionFeature = z.infer<typeof insertSubscriptionFeatureSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;

// ============================================
// ESA LIFE CEO 61x21 - Phase 13: Security Tables
// ============================================

// OAuth providers table
export const oauthProviders = pgTable("oauth_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // google, github, etc.
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.provider, table.providerId),
  index("idx_oauth_providers_user_id").on(table.userId),
  index("idx_oauth_providers_provider").on(table.provider),
]);

// Two-factor authentication table
export const twoFactorAuth = pgTable("two_factor_auth", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  secret: text("secret"),
  tempSecret: text("temp_secret"),
  enabled: boolean("enabled").default(false),
  enabledAt: timestamp("enabled_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_two_factor_auth_user_id").on(table.userId),
]);

// Two-factor backup codes table
export const twoFactorBackupCodes = pgTable("two_factor_backup_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  code: text("code").notNull(),
  used: boolean("used").default(false),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_two_factor_backup_codes_user_id").on(table.userId),
  index("idx_two_factor_backup_codes_code").on(table.code),
]);

// API keys table
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).unique().notNull(),
  secret: text("secret").notNull(),
  scopes: text("scopes").notNull(), // Comma-separated list
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_api_keys_user_id").on(table.userId),
  index("idx_api_keys_key").on(table.key),
]);

// API key usage tracking
export const apiKeyUsage = pgTable("api_key_usage", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").references(() => apiKeys.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("idx_api_key_usage_api_key_id").on(table.apiKeyId),
  index("idx_api_key_usage_timestamp").on(table.timestamp),
]);

// Audit logs table (matches actual database structure)
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(), // Required NOT NULL column in actual database
  resource: varchar("resource", { length: 255 }),
  resourceId: varchar("resource_id", { length: 255 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  eventType: varchar("event_type", { length: 100 }), // Optional in actual database
  level: varchar("level", { length: 20 }).default('INFO'), // Has default in actual database
  message: text("message"),
  metadata: jsonb("metadata"),
  requestId: varchar("request_id", { length: 100 }),
  sessionId: varchar("session_id", { length: 255 }),
}, (table) => [
  index("idx_audit_logs_user_id").on(table.userId),
  index("idx_audit_logs_timestamp").on(table.timestamp),
  index("idx_audit_logs_ip_address").on(table.ipAddress),
  index("idx_audit_logs_action").on(table.action),
]);

// Security events table
export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // low, medium, high, critical
  description: text("description").notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  userId: integer("user_id").references(() => users.id),
  metadata: jsonb("metadata"),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("idx_security_events_event_type").on(table.eventType),
  index("idx_security_events_severity").on(table.severity),
  index("idx_security_events_resolved").on(table.resolved),
  index("idx_security_events_timestamp").on(table.timestamp),
]);

// Suspicious activities table
export const suspiciousActivities = pgTable("suspicious_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activityType: varchar("activity_type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  severity: varchar("severity", { length: 20 }).notNull(),
  investigated: boolean("investigated").default(false),
  investigatedAt: timestamp("investigated_at"),
  investigatedBy: integer("investigated_by").references(() => users.id),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("idx_suspicious_activities_user_id").on(table.userId),
  index("idx_suspicious_activities_activity_type").on(table.activityType),
  index("idx_suspicious_activities_severity").on(table.severity),
  index("idx_suspicious_activities_timestamp").on(table.timestamp),
]);

// Update users table to include 2FA field (if not already present)
// Note: This would be done via migration in production

// Insert schemas for security tables
export const insertOAuthProviderSchema = createInsertSchema(oauthProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTwoFactorAuthSchema = createInsertSchema(twoFactorAuth).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTwoFactorBackupCodeSchema = createInsertSchema(twoFactorBackupCodes).omit({
  id: true,
  createdAt: true,
});

export const insertAPIKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAPIKeyUsageSchema = createInsertSchema(apiKeyUsage).omit({
  id: true,
  timestamp: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({
  id: true,
  timestamp: true,
});

export const insertSuspiciousActivitySchema = createInsertSchema(suspiciousActivities).omit({
  id: true,
  timestamp: true,
});

// Types for security tables
export type OAuthProvider = typeof oauthProviders.$inferSelect;
export type InsertOAuthProvider = z.infer<typeof insertOAuthProviderSchema>;
export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type InsertTwoFactorAuth = z.infer<typeof insertTwoFactorAuthSchema>;
export type TwoFactorBackupCode = typeof twoFactorBackupCodes.$inferSelect;
export type InsertTwoFactorBackupCode = z.infer<typeof insertTwoFactorBackupCodeSchema>;
export type APIKey = typeof apiKeys.$inferSelect;
export type InsertAPIKey = z.infer<typeof insertAPIKeySchema>;
export type APIKeyUsage = typeof apiKeyUsage.$inferSelect;
export type InsertAPIKeyUsage = z.infer<typeof insertAPIKeyUsageSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type SuspiciousActivity = typeof suspiciousActivities.$inferSelect;
export type InsertSuspiciousActivity = z.infer<typeof insertSuspiciousActivitySchema>;

// Agent System tables for PostgreSQL-based queue (replacing Redis/BullMQ)
export const agentJobs = pgTable("agent_jobs", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  data: jsonb("data").notNull(),
  status: varchar("status", { length: 50 }).notNull().default('pending'), // pending, processing, completed, failed, retrying
  result: jsonb("result"),
  error: text("error"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  priority: integer("priority").default(0),
  scheduledAt: timestamp("scheduled_at"),
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_agent_jobs_agent_id").on(table.agentId),
  index("idx_agent_jobs_status").on(table.status),
  index("idx_agent_jobs_priority_status").on(table.priority, table.status),
  index("idx_agent_jobs_scheduled_at").on(table.scheduledAt),
  index("idx_agent_jobs_created_at").on(table.createdAt),
]);

export const agentState = pgTable("agent_state", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  value: jsonb("value").notNull(),
  expiresAt: timestamp("expires_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.agentId, table.key),
  index("idx_agent_state_agent_id").on(table.agentId),
  index("idx_agent_state_key").on(table.key),
  index("idx_agent_state_expires_at").on(table.expiresAt),
]);

export const agentEvents = pgTable("agent_events", {
  id: serial("id").primaryKey(),
  event: varchar("event", { length: 255 }).notNull(),
  agentId: varchar("agent_id", { length: 100 }),
  data: jsonb("data"),
  processed: boolean("processed").default(false),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_agent_events_event").on(table.event),
  index("idx_agent_events_agent_id").on(table.agentId),
  index("idx_agent_events_processed").on(table.processed),
  index("idx_agent_events_created_at").on(table.createdAt),
]);

// Insert schemas for agent system tables
export const insertAgentJobSchema = createInsertSchema(agentJobs).omit({
  id: true,
  createdAt: true,
});

export const insertAgentStateSchema = createInsertSchema(agentState).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentEventSchema = createInsertSchema(agentEvents).omit({
  id: true,
  createdAt: true,
});

// Agent Messages table for Life CEO conversations
export const agentMessages = pgTable("agent_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  conversationId: varchar("conversation_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_messages_user_id").on(table.userId),
  index("idx_agent_messages_agent_id").on(table.agentId),
  index("idx_agent_messages_conversation_id").on(table.conversationId),
  index("idx_agent_messages_created_at").on(table.createdAt),
]);

// Agent Token Usage table for OpenAI cost tracking
export const agentTokenUsage = pgTable("agent_token_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  totalTokens: integer("total_tokens").notNull(),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 6 }).notNull(),
  model: varchar("model", { length: 50 }).default('gpt-4o'),
  conversationId: varchar("conversation_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_token_usage_user_id").on(table.userId),
  index("idx_agent_token_usage_agent_id").on(table.agentId),
  index("idx_agent_token_usage_created_at").on(table.createdAt),
]);

// Types for agent system tables
export type AgentJob = typeof agentJobs.$inferSelect;
export type InsertAgentJob = z.infer<typeof insertAgentJobSchema>;
export type AgentState = typeof agentState.$inferSelect;
export type InsertAgentState = z.infer<typeof insertAgentStateSchema>;
export type AgentEvent = typeof agentEvents.$inferSelect;
export type InsertAgentEvent = z.infer<typeof insertAgentEventSchema>;

// Insert schemas for agent messages and token usage
export const insertAgentMessageSchema = createInsertSchema(agentMessages).omit({
  id: true,
  createdAt: true,
});

export const insertAgentTokenUsageSchema = createInsertSchema(agentTokenUsage).omit({
  id: true,
  createdAt: true,
});

// ESA Layer 36/37/44: Agent Learning System - Persistent knowledge capture
export const agentLearnings = pgTable("agent_learnings", {
  id: serial("id").primaryKey(),
  pattern: varchar("pattern", { length: 255 }).notNull(), // e.g., "segment-aware-query-matching"
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  esaLayers: text("esa_layers").array(), // ["7", "14"]
  agentDomains: text("agent_domains").array(), // ["infrastructure", "frontend"]
  codeExample: text("code_example"),
  confidence: numeric("confidence", { precision: 3, scale: 2 }), // 0.00-1.00
  successMetrics: jsonb("success_metrics"), // { latencyReduction: "90%", ... }
  discoveredBy: varchar("discovered_by", { length: 100 }), // "architect", "user", "agent"
  relatedPatterns: text("related_patterns").array(),
  appliedTo: jsonb("applied_to"), // Files/components where pattern was applied
  validatedAt: timestamp("validated_at"),
  documentedAt: timestamp("documented_at"), // When auto-documented to docs/pages
  documentationPath: varchar("documentation_path", { length: 500 }), // Path to generated doc
  // Agent #80 Learning Coordinator fields
  agentId: varchar("agent_id", { length: 100 }), // Agent who reported the learning
  domain: varchar("domain", { length: 100 }), // Domain category (mobile, performance, ui, backend, etc.)
  outcome: jsonb("outcome"), // Learning outcome metadata {impact: 'high', notes: '...'}
  tags: text("tags").array(), // Categorization tags
  reuseCount: integer("reuse_count").default(0), // How many times this learning has been reused
  successRate: real("success_rate").default(0.5), // Success rate when reused (0.0-1.0)
  embedding: text("embedding"), // Semantic search embedding vector (stringified JSON)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_agent_learnings_pattern").on(table.pattern),
  index("idx_agent_learnings_confidence").on(table.confidence),
  index("idx_agent_learnings_validated_at").on(table.validatedAt),
  index("idx_agent_learnings_created_at").on(table.createdAt),
  index("idx_agent_learnings_agent_id").on(table.agentId),
  index("idx_agent_learnings_domain").on(table.domain),
]);

// ESA Layer 46: Agent Collaboration tracking for cross-domain learning
export const agentCollaborationLog = pgTable("agent_collaboration_log", {
  id: serial("id").primaryKey(),
  collaborationId: varchar("collaboration_id", { length: 100 }).notNull().unique(),
  initiatorAgent: varchar("initiator_agent", { length: 100 }).notNull(),
  participantAgents: text("participant_agents").array(),
  goal: text("goal").notNull(),
  status: varchar("status", { length: 20 }).default('active'), // 'active', 'completed', 'failed'
  tasks: jsonb("tasks"), // Task breakdown with assignments
  result: jsonb("result"), // Aggregated results
  knowledgeShared: jsonb("knowledge_shared"), // What each agent learned
  duration: integer("duration"), // milliseconds
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_agent_collab_initiator").on(table.initiatorAgent),
  index("idx_agent_collab_status").on(table.status),
  index("idx_agent_collab_start_time").on(table.startTime),
]);

// Agent #80: Knowledge Flow table - Track UP/ACROSS/DOWN knowledge distribution
export const knowledgeFlow = pgTable("knowledge_flow", {
  id: serial("id").primaryKey(),
  direction: varchar("direction", { length: 10 }).notNull(), // 'UP', 'ACROSS', 'DOWN'
  fromAgent: varchar("from_agent", { length: 100 }).notNull(), // Agent ID (matches agents table)
  toAgent: varchar("to_agent", { length: 100 }), // null for DOWN (broadcast to all)
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 50 }), // pattern, solution, best-practice
  effectiveness: varchar("effectiveness", { length: 10 }), // stored as string "0.95"
  timesReused: integer("times_reused").default(0),
  metadata: jsonb("metadata"), // Additional context
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_knowledge_flow_direction").on(table.direction),
  index("idx_knowledge_flow_from_agent").on(table.fromAgent),
  index("idx_knowledge_flow_to_agent").on(table.toAgent),
  index("idx_knowledge_flow_timestamp").on(table.timestamp),
]);

// Agent #80: Best Practices table - Reusable knowledge for all agents
export const bestPractices = pgTable("best_practices", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // code-quality, performance, security, ux, etc.
  adoptionRate: varchar("adoption_rate", { length: 10 }).default('0'), // stored as string "0.95"
  sourceAgent: varchar("source_agent", { length: 100 }), // Agent ID (matches agents table)
  codeExample: text("code_example"),
  relatedPatterns: text("related_patterns").array(),
  tags: text("tags").array(),
  validated: boolean("validated").default(false),
  validatedBy: varchar("validated_by", { length: 100 }), // Agent #79 validation
  validatedAt: timestamp("validated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_best_practices_category").on(table.category),
  index("idx_best_practices_adoption_rate").on(table.adoptionRate),
  index("idx_best_practices_validated").on(table.validated),
  index("idx_best_practices_created_at").on(table.createdAt),
]);

// Insert schemas for agent learning tables
export const insertAgentLearningSchema = createInsertSchema(agentLearnings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentCollaborationLogSchema = createInsertSchema(agentCollaborationLog).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeFlowSchema = createInsertSchema(knowledgeFlow).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export const insertBestPracticeSchema = createInsertSchema(bestPractices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for agent learning tables
export type AgentLearning = typeof agentLearnings.$inferSelect;
export type InsertAgentLearning = z.infer<typeof insertAgentLearningSchema>;
export type AgentCollaboration = typeof agentCollaborationLog.$inferSelect;
export type InsertAgentCollaboration = z.infer<typeof insertAgentCollaborationLogSchema>;
export type KnowledgeFlow = typeof knowledgeFlow.$inferSelect;
export type InsertKnowledgeFlow = z.infer<typeof insertKnowledgeFlowSchema>;
export type BestPractice = typeof bestPractices.$inferSelect;
export type InsertBestPractice = z.infer<typeof insertBestPracticeSchema>;

// Types for agent messages and token usage
export type AgentMessage = typeof agentMessages.$inferSelect;
export type InsertAgentMessage = z.infer<typeof insertAgentMessageSchema>;
export type AgentTokenUsage = typeof agentTokenUsage.$inferSelect;
export type InsertAgentTokenUsage = z.infer<typeof insertAgentTokenUsageSchema>;

// Travel Plans table for Community Hub Trip Planner
export const travelPlans = pgTable("travel_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cityId: integer("city_id").references(() => groups.id),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  tripDuration: integer("trip_duration").notNull(), // In days
  budget: varchar("budget", { length: 50 }), // low, medium, high, luxury
  interests: text("interests").array().default([]),
  travelStyle: varchar("travel_style", { length: 50 }), // solo, couple, group, family
  status: varchar("status", { length: 50 }).default('planning'), // planning, confirmed, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_travel_plans_user_id").on(table.userId),
  index("idx_travel_plans_city").on(table.city),
  index("idx_travel_plans_dates").on(table.startDate, table.endDate),
  index("idx_travel_plans_status").on(table.status),
]);

// Itinerary Items table (Many-to-Many with polymorphic relations)
export const itineraryItems = pgTable("itinerary_items", {
  id: serial("id").primaryKey(),
  travelPlanId: integer("travel_plan_id").notNull().references(() => travelPlans.id),
  day: integer("day").notNull(), // 0-indexed day of trip
  period: varchar("period", { length: 20 }).notNull(), // morning, afternoon, evening, night
  itemType: varchar("item_type", { length: 50 }).notNull(), // event, housing, recommendation
  itemId: integer("item_id").notNull(), // Polymorphic FK to events/housing/recommendations
  notes: text("notes"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_itinerary_items_travel_plan_id").on(table.travelPlanId),
  index("idx_itinerary_items_day").on(table.day),
  index("idx_itinerary_items_item_type_id").on(table.itemType, table.itemId),
]);

// Insert schemas for travel planning
export const insertTravelPlanSchema = createInsertSchema(travelPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItineraryItemSchema = createInsertSchema(itineraryItems).omit({
  id: true,
  createdAt: true,
});

// Relations for travel planning
export const travelPlansRelations = relations(travelPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [travelPlans.userId],
    references: [users.id]
  }),
  city: one(groups, {
    fields: [travelPlans.cityId],
    references: [groups.id]
  }),
  itineraryItems: many(itineraryItems)
}));

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  travelPlan: one(travelPlans, {
    fields: [itineraryItems.travelPlanId],
    references: [travelPlans.id]
  })
}));

// Types for travel planning
export type TravelPlan = typeof travelPlans.$inferSelect;
export type InsertTravelPlan = z.infer<typeof insertTravelPlanSchema>;
export type ItineraryItem = typeof itineraryItems.$inferSelect;
export type InsertItineraryItem = z.infer<typeof insertItineraryItemSchema>;

// Knowledge Graph Tables (ESA Layer 44)
// PostgreSQL-based graph implementation using recursive CTEs
export const knowledgeGraphNodes = pgTable("knowledge_graph_nodes", {
  id: serial("id").primaryKey(),
  nodeType: varchar("node_type", { length: 100 }).notNull(), // user, recommendation, event, group, concept, skill
  entityId: integer("entity_id"), // FK to actual entity (user, recommendation, etc.)
  label: varchar("label", { length: 255 }).notNull(),
  properties: jsonb("properties").default({}),
  embedding: jsonb("embedding"), // Vector embedding for semantic search
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_kg_nodes_type").on(table.nodeType),
  index("idx_kg_nodes_entity").on(table.nodeType, table.entityId),
  index("idx_kg_nodes_label").on(table.label),
]);

export const knowledgeGraphEdges = pgTable("knowledge_graph_edges", {
  id: serial("id").primaryKey(),
  sourceNodeId: integer("source_node_id").notNull().references(() => knowledgeGraphNodes.id),
  targetNodeId: integer("target_node_id").notNull().references(() => knowledgeGraphNodes.id),
  relationshipType: varchar("relationship_type", { length: 100 }).notNull(), // likes, knows, visited, recommends, belongs_to
  weight: real("weight").default(1.0), // Relationship strength
  properties: jsonb("properties").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  bidirectional: boolean("bidirectional").default(false)
}, (table) => [
  index("idx_kg_edges_source").on(table.sourceNodeId),
  index("idx_kg_edges_target").on(table.targetNodeId),
  index("idx_kg_edges_type").on(table.relationshipType),
  index("idx_kg_edges_source_target").on(table.sourceNodeId, table.targetNodeId),
]);

// Insert schemas for knowledge graph
export const insertKnowledgeGraphNodeSchema = createInsertSchema(knowledgeGraphNodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeGraphEdgeSchema = createInsertSchema(knowledgeGraphEdges).omit({
  id: true,
  createdAt: true,
});

// Relations for knowledge graph
export const knowledgeGraphNodesRelations = relations(knowledgeGraphNodes, ({ many }) => ({
  outgoingEdges: many(knowledgeGraphEdges, { relationName: 'source' }),
  incomingEdges: many(knowledgeGraphEdges, { relationName: 'target' })
}));

export const knowledgeGraphEdgesRelations = relations(knowledgeGraphEdges, ({ one }) => ({
  sourceNode: one(knowledgeGraphNodes, {
    fields: [knowledgeGraphEdges.sourceNodeId],
    references: [knowledgeGraphNodes.id],
    relationName: 'source'
  }),
  targetNode: one(knowledgeGraphNodes, {
    fields: [knowledgeGraphEdges.targetNodeId],
    references: [knowledgeGraphNodes.id],
    relationName: 'target'
  })
}));

// Types for knowledge graph
export type KnowledgeGraphNode = typeof knowledgeGraphNodes.$inferSelect;
export type InsertKnowledgeGraphNode = z.infer<typeof insertKnowledgeGraphNodeSchema>;
export type KnowledgeGraphEdge = typeof knowledgeGraphEdges.$inferSelect;
export type InsertKnowledgeGraphEdge = z.infer<typeof insertKnowledgeGraphEdgeSchema>;

// ========== Self-Hosted Project Tracker (ESA Layer 65) ==========
// Replaces Jira with internal admin center tracking
// Hierarchical Structure: System → Area → Epic → Story → Task

// Systems (Top level - e.g., "Mundo Tango Platform")
export const projectSystems = pgTable("project_systems", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).unique().notNull(), // e.g., "MT"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default('Layers'), // Lucide icon name
  color: varchar("color", { length: 20 }).default('turquoise'), // Theme color
  status: varchar("status", { length: 50 }).default('active').notNull(), // active, archived
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_systems_status").on(table.status),
  index("idx_systems_key").on(table.key),
]);

// Areas (Mid level - e.g., "Admin Center", "User Features", "AI System")
export const projectAreas = pgTable("project_areas", {
  id: serial("id").primaryKey(),
  systemId: integer("system_id").references(() => projectSystems.id, { onDelete: 'cascade' }),
  key: varchar("key", { length: 50 }).unique().notNull(), // e.g., "MT-ADMIN"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default('FolderOpen'), // Lucide icon name
  color: varchar("color", { length: 20 }).default('ocean'), // Theme color
  status: varchar("status", { length: 50 }).default('active').notNull(), // active, archived
  assignedAgentId: varchar("assigned_agent_id", { length: 50 }), // Lead agent for area
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_areas_system").on(table.systemId),
  index("idx_areas_status").on(table.status),
  index("idx_areas_key").on(table.key),
  index("idx_areas_agent").on(table.assignedAgentId),
]);

// Epics (Large initiatives spanning multiple sprints)
export const projectEpics = pgTable("project_epics", {
  id: serial("id").primaryKey(),
  areaId: integer("area_id").references(() => projectAreas.id, { onDelete: 'cascade' }), // Links to area
  key: varchar("key", { length: 50 }).unique().notNull(), // e.g., MUN-1
  summary: varchar("summary", { length: 500 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default('to_do').notNull(), // to_do, in_progress, done, cancelled
  priority: varchar("priority", { length: 20 }).default('medium'), // low, medium, high, critical
  labels: text("labels").array().default([]),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_epics_area").on(table.areaId),
  index("idx_epics_status").on(table.status),
  index("idx_epics_assigned").on(table.assignedToId),
  index("idx_epics_key").on(table.key),
]);

// Stories (User stories within epics)
export const projectStories = pgTable("project_stories", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).unique().notNull(), // e.g., MUN-6
  epicId: integer("epic_id").references(() => projectEpics.id, { onDelete: 'cascade' }),
  summary: varchar("summary", { length: 500 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default('to_do').notNull(),
  priority: varchar("priority", { length: 20 }).default('medium'),
  storyPoints: integer("story_points"),
  labels: text("labels").array().default([]),
  sprintId: integer("sprint_id").references(() => projectSprints.id),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  assignedAgentId: varchar("assigned_agent_id", { length: 50 }), // e.g., "agent-52"
  teamAgentIds: text("team_agent_ids").array().default([]), // ["agent-51", "agent-53", ...]
  codeFiles: jsonb("code_files").default([]), // [{ path: "...", lines: "49-54" }]
  estimatedHours: real("estimated_hours"),
  actualHours: real("actual_hours"),
  dueDate: timestamp("due_date"), // Story due date for calendar/timeline views
  referenceLinks: jsonb("reference_links").default([]), // External docs
  // ESA Audit Metadata (11 sections for Human Review Stories)
  metadata: jsonb("metadata").default({}), // Review notes, ESA layers, metrics, risk, complexity, etc.
  // GitHub Integration (Agent #67)
  githubIssueNumber: integer("github_issue_number"),
  githubIssueUrl: varchar("github_issue_url", { length: 500 }),
  githubRepoName: varchar("github_repo_name", { length: 255 }), // e.g., "owner/repo"
  githubSyncedAt: timestamp("github_synced_at"),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_stories_epic").on(table.epicId),
  index("idx_stories_sprint").on(table.sprintId),
  index("idx_stories_status").on(table.status),
  index("idx_stories_assigned").on(table.assignedToId),
  index("idx_stories_assigned_agent").on(table.assignedAgentId),
]);

// Tasks (Granular work items within stories)
export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => projectStories.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default('to_do').notNull(),
  estimatedHours: real("estimated_hours"),
  actualHours: real("actual_hours"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  assignedAgentId: varchar("assigned_agent_id", { length: 50 }), // e.g., "agent-11"
  codeFilePath: varchar("code_file_path", { length: 500 }), // "client/src/pages/home.tsx"
  codeLineRange: varchar("code_line_range", { length: 20 }), // "49-54"
  acceptanceCriteria: text("acceptance_criteria").array().default([]),
  referenceImplementation: text("reference_implementation"),
  // GitHub Integration (Agent #67)
  githubPrNumber: integer("github_pr_number"),
  githubPrUrl: varchar("github_pr_url", { length: 500 }),
  githubBranch: varchar("github_branch", { length: 255 }),
  githubCommitSha: varchar("github_commit_sha", { length: 40 }),
  githubSyncedAt: timestamp("github_synced_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_project_tasks_story").on(table.storyId),
  index("idx_project_tasks_status").on(table.status),
  index("idx_project_tasks_assigned").on(table.assignedToId),
  index("idx_project_tasks_assigned_agent").on(table.assignedAgentId),
]);

// Sprints (Time-boxed iterations with auto-close)
export const projectSprints = pgTable("project_sprints", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  goal: text("goal"),
  status: varchar("status", { length: 50 }).default('planning').notNull(), // planning, active, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  autoClose: boolean("auto_close").default(true), // Automatically close when endDate is reached
  completedDate: timestamp("completed_date"), // When sprint was actually completed
  velocityTarget: integer("velocity_target"), // Story points target
  actualVelocity: integer("actual_velocity"), // Story points completed
  completedStoryPoints: integer("completed_story_points").default(0),
  totalStoryPoints: integer("total_story_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_sprints_status").on(table.status),
  index("idx_sprints_dates").on(table.startDate, table.endDate),
  index("idx_sprints_auto_close").on(table.autoClose, table.endDate),
]);

// Milestones (Major project checkpoints)
export const projectMilestones = pgTable("project_milestones", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: varchar("status", { length: 50 }).default('upcoming').notNull(), // upcoming, at_risk, achieved, missed
  completionPercentage: integer("completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_milestones_status").on(table.status),
  index("idx_milestones_due").on(table.dueDate),
]);

// Comments/Activity on stories (Enhanced with rich text, attachments, threads)
export const projectComments = pgTable("project_comments", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => projectStories.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id),
  comment: text("comment").notNull(),
  parentCommentId: integer("parent_comment_id"), // For threaded replies
  attachments: jsonb("attachments").default([]), // [{ name, url, type, size }]
  mentions: text("mentions").array().default([]), // [@user123, @agent-11]
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_comments_story").on(table.storyId),
  index("idx_comments_user").on(table.userId),
  index("idx_comments_parent").on(table.parentCommentId),
]);

// Saved Views/Filters (Custom views for filtering stories)
export const projectViews = pgTable("project_views", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  viewType: varchar("view_type", { length: 50 }).notNull(), // kanban, list, calendar, roadmap
  filters: jsonb("filters").default({}), // { status: ['to_do'], assignedAgentId: 'agent-11', ... }
  sorting: jsonb("sorting").default({}), // { field: 'priority', direction: 'desc' }
  columns: text("columns").array(), // For list view column selection
  isShared: boolean("is_shared").default(false), // Team-wide or personal
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_views_created_by").on(table.createdById),
  index("idx_views_type").on(table.viewType),
]);

// Story Watchers/Subscribers (Users following stories for updates)
export const projectWatchers = pgTable("project_watchers", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => projectStories.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_watchers_story").on(table.storyId),
  index("idx_watchers_user").on(table.userId),
  unique("unique_watcher").on(table.storyId, table.userId),
]);

// Activity Feed (Real-time updates and notifications for project tracker)
export const projectTrackerActivity = pgTable("project_tracker_activity", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // story, task, sprint, comment
  entityId: integer("entity_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // created, updated, completed, commented, mentioned
  userId: integer("user_id").references(() => users.id),
  agentId: varchar("agent_id", { length: 50 }), // Agent that performed action
  changes: jsonb("changes").default({}), // { field: 'status', from: 'to_do', to: 'in_progress' }
  metadata: jsonb("metadata").default({}), // Additional context
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_tracker_activity_entity").on(table.entityType, table.entityId),
  index("idx_tracker_activity_user").on(table.userId),
  index("idx_tracker_activity_created").on(table.createdAt),
]);

// Story Dependencies (Link related stories)
export const projectDependencies = pgTable("project_dependencies", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => projectStories.id, { onDelete: 'cascade' }).notNull(),
  dependsOnStoryId: integer("depends_on_story_id").references(() => projectStories.id, { onDelete: 'cascade' }).notNull(),
  type: varchar("type", { length: 50 }).default('blocks'), // blocks, is_blocked_by, relates_to
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_dependencies_story").on(table.storyId),
  index("idx_dependencies_depends_on").on(table.dependsOnStoryId),
  unique("unique_dependency").on(table.storyId, table.dependsOnStoryId),
]);

// Insert schemas for project tracker
export const insertProjectSystemSchema = createInsertSchema(projectSystems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectAreaSchema = createInsertSchema(projectAreas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectEpicSchema = createInsertSchema(projectEpics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectStorySchema = createInsertSchema(projectStories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectTaskSchema = createInsertSchema(projectTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSprintSchema = createInsertSchema(projectSprints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectCommentSchema = createInsertSchema(projectComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectViewSchema = createInsertSchema(projectViews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectWatcherSchema = createInsertSchema(projectWatchers).omit({
  id: true,
  createdAt: true,
});

export const insertProjectTrackerActivitySchema = createInsertSchema(projectTrackerActivity).omit({
  id: true,
  createdAt: true,
});

export const insertProjectDependencySchema = createInsertSchema(projectDependencies).omit({
  id: true,
  createdAt: true,
});

// Relations for project tracker
export const projectSystemsRelations = relations(projectSystems, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [projectSystems.createdById],
    references: [users.id],
    relationName: 'systemCreator'
  }),
  areas: many(projectAreas)
}));

export const projectAreasRelations = relations(projectAreas, ({ one, many }) => ({
  system: one(projectSystems, {
    fields: [projectAreas.systemId],
    references: [projectSystems.id]
  }),
  createdBy: one(users, {
    fields: [projectAreas.createdById],
    references: [users.id],
    relationName: 'areaCreator'
  }),
  epics: many(projectEpics)
}));

export const projectEpicsRelations = relations(projectEpics, ({ one, many }) => ({
  area: one(projectAreas, {
    fields: [projectEpics.areaId],
    references: [projectAreas.id]
  }),
  assignedTo: one(users, {
    fields: [projectEpics.assignedToId],
    references: [users.id],
    relationName: 'epicAssignee'
  }),
  createdBy: one(users, {
    fields: [projectEpics.createdById],
    references: [users.id],
    relationName: 'epicCreator'
  }),
  stories: many(projectStories)
}));

export const projectStoriesRelations = relations(projectStories, ({ one, many }) => ({
  epic: one(projectEpics, {
    fields: [projectStories.epicId],
    references: [projectEpics.id]
  }),
  sprint: one(projectSprints, {
    fields: [projectStories.sprintId],
    references: [projectSprints.id]
  }),
  assignedTo: one(users, {
    fields: [projectStories.assignedToId],
    references: [users.id],
    relationName: 'storyAssignee'
  }),
  createdBy: one(users, {
    fields: [projectStories.createdById],
    references: [users.id],
    relationName: 'storyCreator'
  }),
  tasks: many(projectTasks),
  comments: many(projectComments)
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  story: one(projectStories, {
    fields: [projectTasks.storyId],
    references: [projectStories.id]
  }),
  assignedTo: one(users, {
    fields: [projectTasks.assignedToId],
    references: [users.id]
  })
}));

export const projectSprintsRelations = relations(projectSprints, ({ many }) => ({
  stories: many(projectStories)
}));

export const projectCommentsRelations = relations(projectComments, ({ one }) => ({
  story: one(projectStories, {
    fields: [projectComments.storyId],
    references: [projectStories.id]
  }),
  user: one(users, {
    fields: [projectComments.userId],
    references: [users.id]
  }),
  parentComment: one(projectComments, {
    fields: [projectComments.parentCommentId],
    references: [projectComments.id]
  })
}));

export const projectViewsRelations = relations(projectViews, ({ one }) => ({
  createdBy: one(users, {
    fields: [projectViews.createdById],
    references: [users.id]
  })
}));

export const projectWatchersRelations = relations(projectWatchers, ({ one }) => ({
  story: one(projectStories, {
    fields: [projectWatchers.storyId],
    references: [projectStories.id]
  }),
  user: one(users, {
    fields: [projectWatchers.userId],
    references: [users.id]
  })
}));

export const projectTrackerActivityRelations = relations(projectTrackerActivity, ({ one }) => ({
  user: one(users, {
    fields: [projectTrackerActivity.userId],
    references: [users.id]
  })
}));

export const projectDependenciesRelations = relations(projectDependencies, ({ one }) => ({
  story: one(projectStories, {
    fields: [projectDependencies.storyId],
    references: [projectStories.id],
    relationName: 'dependentStory'
  }),
  dependsOnStory: one(projectStories, {
    fields: [projectDependencies.dependsOnStoryId],
    references: [projectStories.id],
    relationName: 'blockedByStory'
  })
}));

// Types for project tracker
export type ProjectSystem = typeof projectSystems.$inferSelect;
export type InsertProjectSystem = z.infer<typeof insertProjectSystemSchema>;
export type ProjectArea = typeof projectAreas.$inferSelect;
export type InsertProjectArea = z.infer<typeof insertProjectAreaSchema>;
export type ProjectEpic = typeof projectEpics.$inferSelect;
export type InsertProjectEpic = z.infer<typeof insertProjectEpicSchema>;
export type ProjectStory = typeof projectStories.$inferSelect;
export type InsertProjectStory = z.infer<typeof insertProjectStorySchema>;
export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = z.infer<typeof insertProjectTaskSchema>;
export type ProjectSprint = typeof projectSprints.$inferSelect;
export type InsertProjectSprint = z.infer<typeof insertProjectSprintSchema>;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type ProjectComment = typeof projectComments.$inferSelect;
export type InsertProjectComment = z.infer<typeof insertProjectCommentSchema>;
export type ProjectView = typeof projectViews.$inferSelect;
export type InsertProjectView = z.infer<typeof insertProjectViewSchema>;
export type ProjectWatcher = typeof projectWatchers.$inferSelect;
export type InsertProjectWatcher = z.infer<typeof insertProjectWatcherSchema>;
export type ProjectTrackerActivity = typeof projectTrackerActivity.$inferSelect;
export type InsertProjectTrackerActivity = z.infer<typeof insertProjectTrackerActivitySchema>;
export type ProjectDependency = typeof projectDependencies.$inferSelect;
export type InsertProjectDependency = z.infer<typeof insertProjectDependencySchema>;

// ========================================
// AI INTELLIGENCE NETWORK TABLES
// Agent #31 (AI Infrastructure) + Agent #36 (Memory Systems)
// ESA Framework - Tier 1: Foundation Layer
// ========================================

// AI Conversation Memory - stores user AI conversations for cross-page context
export const aiConversationMemory = pgTable("ai_conversation_memory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id", { length: 255 }).notNull(), // Group related conversations
  pageRoute: varchar("page_route", { length: 500 }).notNull(), // Where conversation happened
  userQuery: text("user_query").notNull(), // What user asked
  aiResponse: text("ai_response").notNull(), // What AI responded
  context: jsonb("context").default({}).notNull(), // Page context (journey history, user role, etc)
  intent: varchar("intent", { length: 100 }), // Detected user intent (help, navigation, troubleshoot)
  sentiment: varchar("sentiment", { length: 50 }), // User sentiment (frustrated, confused, satisfied)
  wasHelpful: boolean("was_helpful"), // User feedback on AI response
  agentUsed: varchar("agent_used", { length: 100 }), // Which sub-agent handled this (Agent #68-71, Life CEO agents)
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_ai_conv_userid").on(table.userId),
  index("idx_ai_conv_session").on(table.sessionId),
  index("idx_ai_conv_page").on(table.pageRoute),
  index("idx_ai_conv_intent").on(table.intent),
  index("idx_ai_conv_created").on(table.createdAt),
]);

// Page Journey Patterns - ML-learned patterns of user journeys
export const pageJourneyPatterns = pgTable("page_journey_patterns", {
  id: serial("id").primaryKey(),
  patternName: varchar("pattern_name", { length: 255 }).notNull(), // e.g., "new_user_housing_search"
  journeySequence: text("journey_sequence").array().notNull(), // ['/profile', '/community', '/housing', '/apply']
  userRole: varchar("user_role", { length: 100 }), // Which role follows this pattern
  frequency: integer("frequency").default(0).notNull(), // How many times observed
  confidence: real("confidence").default(0.0).notNull(), // ML confidence score (0.0 - 1.0)
  nextPagePrediction: varchar("next_page_prediction", { length: 500 }), // Predicted next page
  predictionProbability: real("prediction_probability").default(0.0), // Probability of prediction
  avgTimePerPage: jsonb("avg_time_per_page").default({}).notNull(), // {'/profile': 45000, '/housing': 120000} ms
  commonExitPoints: text("common_exit_points").array(), // Where users typically leave
  conversionRate: real("conversion_rate"), // If pattern leads to conversion
  metadata: jsonb("metadata").default({}).notNull(), // Additional ML metadata
  isActive: boolean("is_active").default(true), // Pattern still relevant
  learnedBy: varchar("learned_by", { length: 100 }).default('Agent #71'), // Which agent learned this
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_journey_role").on(table.userRole),
  index("idx_journey_confidence").on(table.confidence),
  index("idx_journey_active").on(table.isActive),
  index("idx_journey_frequency").on(table.frequency),
]);

// Learned Patterns - patterns extracted from audits (Agent #68 Pattern Recognition)
export const learnedPatterns = pgTable("learned_patterns", {
  id: serial("id").primaryKey(),
  patternType: varchar("pattern_type", { length: 100 }).notNull(), // issue, success, optimization, accessibility
  title: varchar("title", { length: 255 }).notNull(), // "Missing dark mode on buttons"
  description: text("description").notNull(), // Detailed pattern description
  affectedPages: text("affected_pages").array().notNull(), // ['/admin/users', '/admin/events']
  occurrences: integer("occurrences").default(1).notNull(), // How many pages have this
  severity: varchar("severity", { length: 50 }).default('medium'), // low, medium, high, critical
  confidence: real("confidence").default(0.0).notNull(), // Pattern confidence (0.0 - 1.0)
  suggestedSolution: text("suggested_solution"), // AI-suggested fix
  implementationStatus: varchar("implementation_status", { length: 50 }).default('pending'), // pending, in_progress, resolved
  auditPhase: integer("audit_phase"), // Which audit phase detected this (1-18)
  discoveredBy: varchar("discovered_by", { length: 100 }).default('Agent #68'), // Which agent found this
  resolvedBy: varchar("resolved_by", { length: 100 }), // Which agent fixed it
  metadata: jsonb("metadata").default({}).notNull(), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_pattern_type").on(table.patternType),
  index("idx_pattern_severity").on(table.severity),
  index("idx_pattern_status").on(table.implementationStatus),
  index("idx_pattern_confidence").on(table.confidence),
]);

// AI User Preferences - personalized AI support preferences
export const aiUserPreferences = pgTable("ai_user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").unique().references(() => users.id, { onDelete: 'cascade' }),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default('en'), // User's preferred language for AI
  aiHelpFrequency: varchar("ai_help_frequency", { length: 50 }).default('moderate'), // never, minimal, moderate, proactive
  showSmartSuggestions: boolean("show_smart_suggestions").default(true), // Show AI page suggestions
  showProactiveTips: boolean("show_proactive_tips").default(true), // Show proactive help
  contextPreservation: boolean("context_preservation").default(true), // Remember cross-page context
  favoriteAgents: text("favorite_agents").array(), // Preferred Life CEO agents
  interactionHistory: jsonb("interaction_history").default({}).notNull(), // {total: 150, helpful: 120, dismissed: 30}
  learningPreferences: jsonb("learning_preferences").default({}).notNull(), // User's learning style preferences
  privacySettings: jsonb("privacy_settings").default({
    shareJourneyData: true,
    allowPersonalization: true,
    storeConversations: true
  }).notNull(),
  lastAiInteraction: timestamp("last_ai_interaction"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_ai_pref_userid").on(table.userId),
  index("idx_ai_pref_lang").on(table.preferredLanguage),
]);

// Insert schemas for AI tables
export const insertAiConversationMemorySchema = createInsertSchema(aiConversationMemory).omit({
  id: true,
  createdAt: true,
});

export const insertPageJourneyPatternSchema = createInsertSchema(pageJourneyPatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearnedPatternSchema = createInsertSchema(learnedPatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiUserPreferencesSchema = createInsertSchema(aiUserPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for AI Intelligence Network
export type AiConversationMemory = typeof aiConversationMemory.$inferSelect;
export type InsertAiConversationMemory = z.infer<typeof insertAiConversationMemorySchema>;
export type PageJourneyPattern = typeof pageJourneyPatterns.$inferSelect;
export type InsertPageJourneyPattern = z.infer<typeof insertPageJourneyPatternSchema>;
export type LearnedPattern = typeof learnedPatterns.$inferSelect;
export type InsertLearnedPattern = z.infer<typeof insertLearnedPatternSchema>;
export type AiUserPreferences = typeof aiUserPreferences.$inferSelect;
export type InsertAiUserPreferences = z.infer<typeof insertAiUserPreferencesSchema>;

// Relations for AI tables
export const aiConversationMemoryRelations = relations(aiConversationMemory, ({ one }) => ({
  user: one(users, {
    fields: [aiConversationMemory.userId],
    references: [users.id]
  })
}));

export const aiUserPreferencesRelations = relations(aiUserPreferences, ({ one }) => ({
  user: one(users, {
    fields: [aiUserPreferences.userId],
    references: [users.id]
  })
}));

// ============================================================================
// ESA AGENT #75: SUBSCRIPTION TIER & FEATURE FLAG SYSTEM
// ============================================================================

// Subscription Tiers (Agent #72 Pricing Strategy)
export const subscriptionTiers = pgTable("subscription_tiers", {
  id: varchar("id").primaryKey(), // 'free', 'explorer', 'mrblue', 'professional'
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default('USD'),
  billingInterval: varchar("billing_interval"), // 'month', 'year'
  stripePriceId: varchar("stripe_price_id"),
  features: jsonb("features").$type<string[]>(),
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Feature Flags (Agent #75 Subscription Manager)
export const featureFlags = pgTable("feature_flags", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"), // 'social', 'ai', 'professional', 'global'
  requiredTier: varchar("required_tier").references(() => subscriptionTiers.id),
  enabled: boolean("enabled").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_feature_tier").on(table.requiredTier),
  index("idx_feature_category").on(table.category),
]);

// User Subscriptions (Enhanced)
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  tierId: varchar("tier_id").notNull().references(() => subscriptionTiers.id),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  status: varchar("status"), // 'active', 'canceled', 'past_due', 'trialing'
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_user_sub_userid").on(table.userId),
  index("idx_user_sub_status").on(table.status),
]);

// Promo Codes
export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(),
  description: text("description"),
  discountType: varchar("discount_type"), // 'percent', 'fixed'
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }),
  tierId: varchar("tier_id").references(() => subscriptionTiers.id),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  active: boolean("active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_promo_code").on(table.code),
  index("idx_promo_active").on(table.active),
]);

// Subscription History
export const subscriptionHistory = pgTable("subscription_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  fromTier: varchar("from_tier").references(() => subscriptionTiers.id),
  toTier: varchar("to_tier").references(() => subscriptionTiers.id),
  action: varchar("action"), // 'upgrade', 'downgrade', 'cancel', 'reactivate'
  reason: text("reason"),
  refundAmount: numeric("refund_amount", { precision: 10, scale: 2 }),
  promoCode: varchar("promo_code"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_sub_history_userid").on(table.userId),
  index("idx_sub_history_action").on(table.action),
]);

// ============================================================================
// ESA AGENT #74: INTERACTIVE TOUR SYSTEM
// ============================================================================

// User Tour Progress
export const userTourProgress = pgTable("user_tour_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  tourId: varchar("tour_id").notNull(), // 'welcome', 'host', 'teacher', 'organizer', 'professional'
  currentStep: integer("current_step").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  skipped: boolean("skipped").default(false),
  timeSpent: integer("time_spent_seconds"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_tour_userid").on(table.userId),
  index("idx_tour_id").on(table.tourId),
  unique("unique_user_tour").on(table.userId, table.tourId),
]);

// ============================================================================
// ESA AGENT #77: AI SITE BUILDER SYSTEM
// ============================================================================

// Professional Sites
export const professionalSites = pgTable("professional_sites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type"), // 'event', 'school', 'teacher', 'host', 'generic'
  subdomain: varchar("subdomain").unique(),
  customDomain: varchar("custom_domain"),
  domain: varchar("domain"), // Full domain
  template: varchar("template"),
  content: jsonb("content"), // Site structure & content
  html: text("html"),
  css: text("css"),
  status: varchar("status").default('draft'), // 'draft', 'live', 'archived'
  views: integer("views").default(0),
  seo: jsonb("seo").$type<{
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  }>(),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_pro_site_userid").on(table.userId),
  index("idx_pro_site_status").on(table.status),
  index("idx_pro_site_subdomain").on(table.subdomain),
]);

// Site Analytics
export const siteAnalytics = pgTable("site_analytics", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => professionalSites.id, { onDelete: 'cascade' }),
  event: varchar("event"), // 'page_view', 'click', 'conversion'
  data: jsonb("data"),
  timestamp: timestamp("timestamp").defaultNow()
}, (table) => [
  index("idx_site_analytics_siteid").on(table.siteId),
  index("idx_site_analytics_event").on(table.event),
]);

// ============================================================================
// INSERT SCHEMAS & TYPES
// ============================================================================

// Subscription Tier Schemas
export const insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  createdAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionHistorySchema = createInsertSchema(subscriptionHistory).omit({
  id: true,
  createdAt: true,
});

// Tour Schemas
export const insertUserTourProgressSchema = createInsertSchema(userTourProgress).omit({
  id: true,
  createdAt: true,
});

// Site Builder Schemas
export const insertProfessionalSiteSchema = createInsertSchema(professionalSites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteAnalyticsSchema = createInsertSchema(siteAnalytics).omit({
  id: true,
  timestamp: true,
});

// Types
export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = z.infer<typeof insertSubscriptionTierSchema>;

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;

export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type InsertSubscriptionHistory = z.infer<typeof insertSubscriptionHistorySchema>;

export type UserTourProgress = typeof userTourProgress.$inferSelect;
export type InsertUserTourProgress = z.infer<typeof insertUserTourProgressSchema>;

export type ProfessionalSite = typeof professionalSites.$inferSelect;
export type InsertProfessionalSite = z.infer<typeof insertProfessionalSiteSchema>;

export type SiteAnalytics = typeof siteAnalytics.$inferSelect;
export type InsertSiteAnalytics = z.infer<typeof insertSiteAnalyticsSchema>;

// ============================================================================
// ESA AGENT #78: VISUAL PAGE EDITOR SYSTEM
// ============================================================================

// Visual Edits - Track all page edits made in edit mode
export const visualEdits = pgTable("visual_edits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id").notNull(),
  page: varchar("page").notNull(), // URL or route
  changes: jsonb("changes").$type<{
    elementSelector: string;
    changeType: 'text' | 'style' | 'layout' | 'structure';
    before: any;
    after: any;
    componentPath: string;
    lineNumber?: number;
  }[]>().notNull(),
  status: varchar("status").default('draft'), // 'draft', 'pending', 'approved', 'deployed', 'reverted'
  branchName: varchar("branch_name"),
  previewUrl: varchar("preview_url"),
  deployedAt: timestamp("deployed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_visual_edits_user").on(table.userId),
  index("idx_visual_edits_status").on(table.status),
  index("idx_visual_edits_session").on(table.sessionId),
]);

// Edit Sessions - Track active edit sessions
export const editSessions = pgTable("edit_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id").unique().notNull(),
  page: varchar("page").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  changesCount: integer("changes_count").default(0),
  isActive: boolean("is_active").default(true)
}, (table) => [
  index("idx_edit_sessions_user").on(table.userId),
  index("idx_edit_sessions_active").on(table.isActive),
]);

// ============================================================================
// MR BLUE CONVERSATIONS
// ============================================================================

// Mr Blue Chat History
export const mrBlueConversations = pgTable("mr_blue_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id").notNull(),
  messages: jsonb("messages").$type<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[]>().default([]).notNull(),
  context: jsonb("context"), // Page context, user intent
  commandExecuted: varchar("command_executed"),
  resultStatus: varchar("result_status"), // 'success', 'failed', 'partial'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_mrblue_conv_user").on(table.userId),
  index("idx_mrblue_conv_session").on(table.sessionId),
]);

// ============================================================================
// INSERT SCHEMAS & TYPES
// ============================================================================

// Visual Edits Schemas
export const insertVisualEditSchema = createInsertSchema(visualEdits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEditSessionSchema = createInsertSchema(editSessions).omit({
  id: true,
  startedAt: true,
});

export const insertMrBlueConversationSchema = createInsertSchema(mrBlueConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type VisualEdit = typeof visualEdits.$inferSelect;
export type InsertVisualEdit = z.infer<typeof insertVisualEditSchema>;

export type EditSession = typeof editSessions.$inferSelect;
export type InsertEditSession = z.infer<typeof insertEditSessionSchema>;

export type MrBlueConversation = typeof mrBlueConversations.$inferSelect;
export type InsertMrBlueConversation = z.infer<typeof insertMrBlueConversationSchema>;

// ============================================================================
// ESA AGENT #80: ENHANCED INTER-AGENT LEARNING (extends existing system)
// Note: agentLearnings table already exists above (line 3154)
// ============================================================================

// Learning Patterns - Synthesized patterns from multiple learnings (NEW)
export const learningPatterns = pgTable("learning_patterns", {
  id: serial("id").primaryKey(),
  patternName: varchar("pattern_name").unique().notNull(),
  problemSignature: text("problem_signature").notNull(),
  solutionTemplate: text("solution_template").notNull(),
  discoveredBy: text("discovered_by").array(), // Agent IDs
  timesApplied: integer("times_applied").default(0),
  successRate: real("success_rate").default(0),
  variations: jsonb("variations").$type<Array<{
    scenario: string;
    solution: string;
    success_rate: number;
  }>>(),
  whenNotToUse: text("when_not_to_use"),
  codeExample: text("code_example"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_learning_patterns_name").on(table.patternName),
]);

// ============================================================================
// ESA AGENT #79: QUALITY VALIDATION SYSTEM
// ============================================================================

// Validation Results - Stores all validation outcomes
export const validationResults = pgTable("validation_results", {
  id: serial("id").primaryKey(),
  validatorAgent: varchar("validator_agent").default('Agent #79'),
  targetAgent: varchar("target_agent").notNull(), // Agent responsible for feature
  feature: varchar("feature").notNull(),
  page: varchar("page"),
  testType: varchar("test_type").notNull(), // 'functional', 'performance', 'mobile', 'journey'
  status: varchar("status").notNull(), // 'passed', 'failed', 'warning'
  issues: jsonb("issues").$type<Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    root_cause?: string;
    location?: string;
  }>>(),
  suggestions: jsonb("suggestions").$type<Array<{
    type: 'proven_pattern' | 'ai_generated' | 'best_practice';
    solution: string;
    source?: string;
    confidence: number;
    code_example?: string;
  }>>(),
  fixPlan: jsonb("fix_plan").$type<{
    priority: string;
    estimated_time: string;
    steps: string[];
    files_to_modify: string[];
    validation_criteria: string[];
  }>(),
  collaborationOffered: boolean("collaboration_offered").default(false),
  agentResponse: varchar("agent_response"), // 'accepted', 'modified', 'rejected'
  timeToFix: integer("time_to_fix"), // Minutes
  validatedAt: timestamp("validated_at").defaultNow(),
  fixedAt: timestamp("fixed_at"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_validation_results_target").on(table.targetAgent),
  index("idx_validation_results_status").on(table.status),
  index("idx_validation_results_feature").on(table.feature),
]);

// Customer Journey Tests - Track journey validation
export const customerJourneyTests = pgTable("customer_journey_tests", {
  id: serial("id").primaryKey(),
  journeyName: varchar("journey_name").notNull(),
  journeySteps: jsonb("journey_steps").$type<Array<{
    step: number;
    description: string;
    route: string;
    expected_outcome: string;
  }>>(),
  status: varchar("status").notNull(), // 'passed', 'failed', 'partial'
  failedStep: integer("failed_step"),
  failureReason: text("failure_reason"),
  responsibleAgents: text("responsible_agents").array(),
  deviceTested: varchar("device_tested"), // 'desktop', 'mobile', 'tablet'
  testedAt: timestamp("tested_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_journey_tests_name").on(table.journeyName),
  index("idx_journey_tests_status").on(table.status),
]);

// ============================================================================
// ESA65: THE PLAN - DYNAMIC STORY CARD SYSTEM (H2AC Pattern)
// ============================================================================

// Features (Level 1) - Top-level story cards
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  pageAgentId: varchar("page_agent_id", { length: 10 }), // e.g., "P1"
  journeyAgentId: varchar("journey_agent_id", { length: 10 }), // e.g., "J1"
  status: varchar("status", { length: 50 }).default('backlog'), // backlog/active/review/done
  assignedTo: varchar("assigned_to", { length: 100 }), // Human role (frontend/backend/designer)
  category: varchar("category", { length: 50 }), // frontend/backend/design
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_features_page_agent").on(table.pageAgentId),
  index("idx_features_status").on(table.status),
  index("idx_features_assigned_to").on(table.assignedTo),
]);

// Sub-Features (Level 2) - Audit phases or feature sections
export const subFeatures = pgTable("sub_features", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id").references(() => features.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  whatWasBuilt: text("what_was_built"), // From audit findings
  whatNeedsReview: text("what_needs_review"), // Human action items
  status: varchar("status", { length: 50 }).default('pending'), // pending/in-progress/done
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_sub_features_feature").on(table.featureId),
  index("idx_sub_features_status").on(table.status),
]);

// Components (Level 3) - Specific files or UI elements to fix
export const components = pgTable("components", {
  id: serial("id").primaryKey(),
  subFeatureId: integer("sub_feature_id").references(() => subFeatures.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  fileLocation: text("file_location"), // e.g., "client/src/pages/Login.tsx:45"
  instructions: text("instructions"), // Step-by-step for human
  codeExample: text("code_example"), // Auto-generated fix
  status: varchar("status", { length: 50 }).default('pending'), // pending/in-progress/done
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_components_sub_feature").on(table.subFeatureId),
  index("idx_components_status").on(table.status),
  index("idx_components_file").on(table.fileLocation),
]);

// Tasks (Level 4) - Individual action items
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id").references(() => components.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  agentResponsible: text("agent_responsible"), // e.g., "ESA2, P1"
  estimatedTime: varchar("estimated_time", { length: 50 }),
  status: varchar("status", { length: 50 }).default('todo'), // todo/in-progress/done
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_tasks_component").on(table.componentId),
  index("idx_tasks_status").on(table.status),
]);

// Relations for hierarchy traversal
export const featuresRelations = relations(features, ({ many }) => ({
  subFeatures: many(subFeatures),
}));

export const subFeaturesRelations = relations(subFeatures, ({ one, many }) => ({
  feature: one(features, {
    fields: [subFeatures.featureId],
    references: [features.id],
  }),
  components: many(components),
}));

export const componentsRelations = relations(components, ({ one, many }) => ({
  subFeature: one(subFeatures, {
    fields: [components.subFeatureId],
    references: [subFeatures.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  component: one(components, {
    fields: [tasks.componentId],
    references: [components.id],
  }),
}));

// ============================================================================
// INSERT SCHEMAS & TYPES (ESA Agent #79 & #80)
// ============================================================================

// Learning Patterns (NEW)
export const insertLearningPatternSchema = createInsertSchema(learningPatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Validation Results
export const insertValidationResultSchema = createInsertSchema(validationResults).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerJourneyTestSchema = createInsertSchema(customerJourneyTests).omit({
  id: true,
  createdAt: true,
});

// The Plan - Dynamic Story Cards
export const insertFeatureSchema = createInsertSchema(features).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubFeatureSchema = createInsertSchema(subFeatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComponentSchema = createInsertSchema(components).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Types
export type LearningPattern = typeof learningPatterns.$inferSelect;
export type InsertLearningPattern = z.infer<typeof insertLearningPatternSchema>;

export type ValidationResult = typeof validationResults.$inferSelect;
export type InsertValidationResult = z.infer<typeof insertValidationResultSchema>;

export type CustomerJourneyTest = typeof customerJourneyTests.$inferSelect;
export type InsertCustomerJourneyTest = z.infer<typeof insertCustomerJourneyTestSchema>;

export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;

export type SubFeature = typeof subFeatures.$inferSelect;
export type InsertSubFeature = z.infer<typeof insertSubFeatureSchema>;

export type Component = typeof components.$inferSelect;
export type InsertComponent = z.infer<typeof insertComponentSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Voice Settings - TRACK 3
export const voiceSettings = pgTable("voice_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  enabled: boolean("enabled").default(true),
  inputEnabled: boolean("input_enabled").default(true),
  outputEnabled: boolean("output_enabled").default(true),
  language: varchar("language", { length: 10 }).default('en-US'),
  voice: varchar("voice", { length: 100 }),
  rate: real("rate").default(1.0),
  pitch: real("pitch").default(1.0),
  volume: real("volume").default(1.0),
  autoSpeak: boolean("auto_speak").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_voice_settings_user").on(table.userId),
]);

// Agent Personalities - TRACK 4
export const agentPersonalities = pgTable("agent_personalities", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  expertise: text("expertise").array(),
  tone: varchar("tone", { length: 100 }).default('professional'),
  style: varchar("style", { length: 100 }).default('concise'),
  systemPrompt: text("system_prompt").notNull(),
  exampleResponses: jsonb("example_responses").default([]),
  capabilities: text("capabilities").array(),
  category: varchar("category", { length: 100 }),
  journeyTier: varchar("journey_tier", { length: 50 }),
  pageRoute: varchar("page_route", { length: 255 }),
  version: integer("version").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_personalities_agent").on(table.agentId),
  index("idx_personalities_category").on(table.category),
  index("idx_personalities_journey").on(table.journeyTier),
]);

// Personality Templates - TRACK 4
export const personalityTemplates = pgTable("personality_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  templateType: varchar("template_type", { length: 100 }).notNull(),
  promptTemplate: text("prompt_template").notNull(),
  variables: jsonb("variables").default([]),
  category: varchar("category", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_templates_type").on(table.templateType),
  index("idx_templates_category").on(table.category),
]);

// Audit Results - TRACK 5
export const auditResults = pgTable("audit_results", {
  id: serial("id").primaryKey(),
  pageAgent: varchar("page_agent", { length: 100 }).notNull(),
  pageRoute: varchar("page_route", { length: 255 }).notNull(),
  auditType: varchar("audit_type", { length: 100 }).notNull(),
  toolName: varchar("tool_name", { length: 100 }).notNull(),
  score: real("score"),
  passed: integer("passed").default(0),
  failed: integer("failed").default(0),
  warnings: integer("warnings").default(0),
  findings: jsonb("findings").default([]),
  recommendations: jsonb("recommendations").default([]),
  severity: varchar("severity", { length: 50 }),
  storyCardGenerated: boolean("story_card_generated").default(false),
  featureId: integer("feature_id").references(() => features.id),
  runDuration: integer("run_duration"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_audit_page").on(table.pageAgent),
  index("idx_audit_type").on(table.auditType),
  index("idx_audit_created").on(table.createdAt),
]);

// Audit Schedules - TRACK 5
export const auditSchedules = pgTable("audit_schedules", {
  id: serial("id").primaryKey(),
  pageAgent: varchar("page_agent", { length: 100 }).notNull(),
  pageRoute: varchar("page_route", { length: 255 }).notNull(),
  journeyTier: varchar("journey_tier", { length: 50 }),
  priority: varchar("priority", { length: 50 }).default('medium'),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  cronExpression: varchar("cron_expression", { length: 100 }),
  auditTypes: text("audit_types").array(),
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_schedule_page").on(table.pageAgent),
  index("idx_schedule_priority").on(table.priority),
  index("idx_schedule_next_run").on(table.nextRun),
]);

// Audit Metrics - TRACK 5
export const auditMetrics = pgTable("audit_metrics", {
  id: serial("id").primaryKey(),
  pageAgent: varchar("page_agent", { length: 100 }).notNull(),
  metricType: varchar("metric_type", { length: 100 }).notNull(),
  metricName: varchar("metric_name", { length: 255 }).notNull(),
  value: real("value").notNull(),
  threshold: real("threshold"),
  status: varchar("status", { length: 50 }),
  trend: varchar("trend", { length: 50 }),
  previousValue: real("previous_value"),
  changePercent: real("change_percent"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_metrics_page").on(table.pageAgent),
  index("idx_metrics_type").on(table.metricType),
  index("idx_metrics_created").on(table.createdAt),
]);

// Insert Schemas
export const insertVoiceSettingsSchema = createInsertSchema(voiceSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentPersonalitySchema = createInsertSchema(agentPersonalities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPersonalityTemplateSchema = createInsertSchema(personalityTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditResultSchema = createInsertSchema(auditResults).omit({
  id: true,
  createdAt: true,
});

export const insertAuditScheduleSchema = createInsertSchema(auditSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditMetricSchema = createInsertSchema(auditMetrics).omit({
  id: true,
  createdAt: true,
});

// Types
export type VoiceSettings = typeof voiceSettings.$inferSelect;
export type InsertVoiceSettings = z.infer<typeof insertVoiceSettingsSchema>;

export type AgentPersonality = typeof agentPersonalities.$inferSelect;
export type InsertAgentPersonality = z.infer<typeof insertAgentPersonalitySchema>;

export type PersonalityTemplate = typeof personalityTemplates.$inferSelect;
export type InsertPersonalityTemplate = z.infer<typeof insertPersonalityTemplateSchema>;

export type AuditResult = typeof auditResults.$inferSelect;
export type InsertAuditResult = z.infer<typeof insertAuditResultSchema>;

export type AuditSchedule = typeof auditSchedules.$inferSelect;
export type InsertAuditSchedule = z.infer<typeof insertAuditScheduleSchema>;

export type AuditMetric = typeof auditMetrics.$inferSelect;
export type InsertAuditMetric = z.infer<typeof insertAuditMetricSchema>;

// Quality Patterns - Agent #79 (Quality Validator)
export const qualityPatterns = pgTable("quality_patterns", {
  id: serial("id").primaryKey(),
  pattern: text("pattern").notNull(),
  issueType: varchar("issue_type", { length: 100 }).notNull(),
  rootCause: text("root_cause").notNull(),
  solutions: jsonb("solutions").default([]).notNull(),
  codeExamples: jsonb("code_examples").default([]),
  effectiveness: real("effectiveness").default(0),
  timesReused: integer("times_reused").default(0),
  agentId: varchar("agent_id", { length: 100 }),
  category: varchar("category", { length: 100 }),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_quality_patterns_type").on(table.issueType),
  index("idx_quality_patterns_agent").on(table.agentId),
  index("idx_quality_patterns_effectiveness").on(table.effectiveness),
]);

// Solution Tracking - Agent #79 (Quality Validator)
export const solutionTracking = pgTable("solution_tracking", {
  id: serial("id").primaryKey(),
  solutionId: integer("solution_id").references(() => qualityPatterns.id),
  reusedBy: varchar("reused_by", { length: 100 }),
  issueContext: text("issue_context"),
  successful: boolean("successful").default(false),
  feedback: text("feedback"),
  appliedAt: timestamp("applied_at").defaultNow(),
  metadata: jsonb("metadata").default({}),
}, (table) => [
  index("idx_solution_tracking_solution").on(table.solutionId),
  index("idx_solution_tracking_reused").on(table.reusedBy),
  index("idx_solution_tracking_successful").on(table.successful),
]);

// Insert Schemas for Quality Validator
export const insertQualityPatternSchema = createInsertSchema(qualityPatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSolutionTrackingSchema = createInsertSchema(solutionTracking).omit({
  id: true,
  appliedAt: true,
});

// Types for Quality Validator
export type QualityPattern = typeof qualityPatterns.$inferSelect;
export type InsertQualityPattern = z.infer<typeof insertQualityPatternSchema>;

export type SolutionTracking = typeof solutionTracking.$inferSelect;
export type InsertSolutionTracking = z.infer<typeof insertSolutionTrackingSchema>;
// ============================================================================
// MB.MD PHASE 9: INTELLIGENCE LAYER SCHEMAS
// ============================================================================

// Cross-Phase Learning System
export const crossPhaseLearning = pgTable('cross_phase_learning', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  sourceAgentId: varchar('source_agent_id', { length: 100 }).notNull(),
  targetAgentId: varchar('target_agent_id', { length: 100 }),
  phaseNumber: integer('phase_number').notNull(),
  insightType: varchar('insight_type', { length: 50 }).notNull(),
  insight: text('insight').notNull(),
  confidence: real('confidence').notNull(),
  impactScore: real('impact_score'),
  validatedBy: text('validated_by').array(),
  applicablePhases: integer('applicable_phases').array(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_cross_phase_source").on(table.sourceAgentId),
  index("idx_cross_phase_phase").on(table.phaseNumber),
]);

export const agentInsights = pgTable('agent_insights', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  applicablePhases: integer('applicable_phases').array(),
  implementation: text('implementation').notNull(),
  successRate: real('success_rate'),
  usageCount: integer('usage_count').default(0),
  embeddings: text('embeddings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const learningPatterns = pgTable('learning_patterns', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  patternName: varchar('pattern_name', { length: 255 }).notNull(),
  detectedBy: text('detected_by').array().notNull(),
  frequency: integer('frequency').notNull(),
  phases: integer('phases').array(),
  triggerConditions: jsonb('trigger_conditions'),
  recommendedActions: jsonb('recommended_actions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Mr Blue Conversations
export const mrBlueConversations = pgTable('mrblue_conversations', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: integer('user_id').notNull(),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  pageUrl: varchar('page_url', { length: 500 }),
  pageContext: jsonb('page_context'),
  messages: jsonb('messages').notNull(),
  mode: varchar('mode', { length: 50 }).default('chat'),
  codeGenerated: text('code_generated').array(),
  filesModified: text('files_modified').array(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

// Codebase Index for Code Intelligence
export const codebaseIndex = pgTable('codebase_index', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  filePath: varchar('file_path', { length: 500 }).notNull().unique(),
  fileType: varchar('file_type', { length: 50 }).notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  symbols: jsonb('symbols').notNull(),
  imports: text('imports').array(),
  exports: text('exports').array(),
  dependencies: text('dependencies').array(),
  astHash: varchar('ast_hash', { length: 64 }),
  embeddings: text('embeddings'),
  lastIndexed: timestamp('last_indexed').defaultNow().notNull(),
  indexVersion: varchar('index_version', { length: 50 }),
});

// Insert Schemas
export const insertCrossPhaseLearningSchema = createInsertSchema(crossPhaseLearning).omit({ id: true, createdAt: true });
export const insertAgentInsightSchema = createInsertSchema(agentInsights).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLearningPatternSchema = createInsertSchema(learningPatterns).omit({ id: true, createdAt: true });
export const insertMrBlueConversationSchema = createInsertSchema(mrBlueConversations).omit({ id: true, startedAt: true });
export const insertCodebaseIndexSchema = createInsertSchema(codebaseIndex).omit({ id: true, lastIndexed: true });

// Types
export type CrossPhaseLearning = typeof crossPhaseLearning.$inferSelect;
export type AgentInsight = typeof agentInsights.$inferSelect;
export type LearningPattern = typeof learningPatterns.$inferSelect;
export type MrBlueConversation = typeof mrBlueConversations.$inferSelect;
export type CodebaseIndex = typeof codebaseIndex.$inferSelect;
