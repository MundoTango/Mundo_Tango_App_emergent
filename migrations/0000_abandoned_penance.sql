CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"name" varchar(255) NOT NULL,
	"icon_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"instance_type" varchar(50),
	"instance_id" integer,
	"media_type" varchar(50),
	"media_url" text,
	"thumbnail_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blocked_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"blocked_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"user_id" integer,
	"user_message" text,
	"assistant_message" text,
	"message_type" varchar(50) DEFAULT 'conversation',
	"context" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"project_state" jsonb,
	"tools_used" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"chat_room_slug" varchar(100) NOT NULL,
	"user_slug" varchar(100) NOT NULL,
	"message_type" varchar(30) NOT NULL,
	"message" text,
	"file_url" text,
	"file_name" text,
	"file_thumb" text,
	"is_forwarded" boolean DEFAULT false,
	"is_reply" boolean DEFAULT false,
	"reply_message_slug" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chat_messages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "chat_room_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"chat_room_slug" varchar(100) NOT NULL,
	"user_slug" varchar(100) NOT NULL,
	"is_owner" boolean DEFAULT false,
	"is_sub_admin" boolean DEFAULT false,
	"status" varchar(30) NOT NULL,
	"unread_message_count" integer DEFAULT 0,
	"is_leaved" boolean DEFAULT false,
	"is_kicked" boolean DEFAULT false,
	"is_blocked" boolean DEFAULT false,
	"is_visible" boolean DEFAULT true,
	"last_message_timestamp" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chat_room_users_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(150) NOT NULL,
	"image_url" text,
	"description" text,
	"type" varchar(50) NOT NULL,
	"status" varchar(30),
	"member_limit" integer DEFAULT 1024,
	"can_member_edit_group" boolean DEFAULT true,
	"can_member_send_message" boolean DEFAULT true,
	"can_member_add_member" boolean DEFAULT true,
	"last_message_timestamp" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chat_rooms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "code_of_conduct_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"guideline_type" varchar(50) NOT NULL,
	"guideline_title" varchar(255) NOT NULL,
	"guideline_description" text NOT NULL,
	"agreed" boolean DEFAULT true NOT NULL,
	"agreement_version" varchar(10) DEFAULT '1.0' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "code_of_conduct_agreements_user_id_guideline_type_agreement_version_unique" UNIQUE("user_id","guideline_type","agreement_version")
);
--> statement-breakpoint
CREATE TABLE "community_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id_1" uuid NOT NULL,
	"tenant_id_2" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"is_bidirectional" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "community_connections_tenant_id_1_tenant_id_2_unique" UNIQUE("tenant_id_1","tenant_id_2")
);
--> statement-breakpoint
CREATE TABLE "content_sharing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" text NOT NULL,
	"content_id" uuid NOT NULL,
	"source_tenant_id" uuid NOT NULL,
	"shared_tenant_id" uuid NOT NULL,
	"shared_by" integer,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "content_sharing_content_type_content_id_shared_tenant_id_unique" UNIQUE("content_type","content_id","shared_tenant_id")
);
--> statement-breakpoint
CREATE TABLE "content_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" text NOT NULL,
	"original_language_id" integer NOT NULL,
	"target_language_id" integer NOT NULL,
	"original_text" text NOT NULL,
	"translated_text" text NOT NULL,
	"translation_type" varchar(20) NOT NULL,
	"translated_by" integer,
	"translation_service" varchar(50),
	"confidence" numeric(3, 2),
	"votes" integer DEFAULT 0,
	"is_approved" boolean DEFAULT false,
	"approved_by" integer,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creator_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"shoes_url" text,
	"clothing_url" text,
	"jewelry" text,
	"vendor_activities" text,
	"vendor_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_role_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_name" text NOT NULL,
	"role_description" text NOT NULL,
	"submitted_by" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"rejected_by" integer,
	"rejected_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" text NOT NULL,
	"project_title" text NOT NULL,
	"activity_type" text NOT NULL,
	"description" text NOT NULL,
	"changes" jsonb[] DEFAULT '{}',
	"team" text[] DEFAULT '{}',
	"tags" text[] DEFAULT '{}',
	"completion_before" integer,
	"completion_after" integer,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dance_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"social_dancing_cities" text[],
	"recent_workshop_cities" text[],
	"favourite_dancing_cities" text[],
	"annual_event_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dj_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"performed_events" integer DEFAULT 0,
	"cities" text,
	"favourite_orchestra" varchar(255),
	"favourite_singer" varchar(255),
	"milonga_size" varchar(255),
	"use_external_equipments" boolean DEFAULT false,
	"dj_softwares" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(20) NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"added_at" timestamp DEFAULT now(),
	CONSTRAINT "event_admins_event_id_user_id_unique" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "event_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"inviter_id" integer NOT NULL,
	"invitee_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"message" text,
	"sent_at" timestamp DEFAULT now(),
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "event_page_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'moderator' NOT NULL,
	"permissions" jsonb DEFAULT '{"canManageEvent":false,"canManageAdmins":false,"canApproveContent":true,"canDeleteContent":false,"canManageRSVPs":false,"canPostAnnouncements":true,"canEditEventDetails":false,"canInviteParticipants":true,"canBanUsers":false}'::jsonb NOT NULL,
	"delegated_by" integer,
	"delegated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "event_page_admins_event_id_user_id_role_unique" UNIQUE("event_id","user_id","role")
);
--> statement-breakpoint
CREATE TABLE "event_page_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"post_type" varchar(50) DEFAULT 'discussion',
	"title" varchar(255),
	"content" text NOT NULL,
	"media_urls" text[] DEFAULT '{}',
	"is_approved" boolean DEFAULT true,
	"approved_by" integer,
	"approved_at" timestamp,
	"is_pinned" boolean DEFAULT false,
	"pinned_by" integer,
	"likes_count" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"reports_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"invited_by" integer NOT NULL,
	"invited_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "event_participants_event_id_user_id_role_unique" UNIQUE("event_id","user_id","role")
);
--> statement-breakpoint
CREATE TABLE "event_rsvps" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "event_rsvps_event_id_user_id_unique" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "event_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"pattern" varchar(50) NOT NULL,
	"venue" varchar(255),
	"city" varchar(100),
	"country" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"event_type" varchar(50) DEFAULT 'milonga',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"date" text,
	"location" text,
	"venue" varchar(255),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"latitude" text,
	"longitude" text,
	"price" text,
	"currency" varchar(10) DEFAULT 'USD',
	"ticket_url" text,
	"max_attendees" integer,
	"current_attendees" integer DEFAULT 0,
	"is_public" boolean DEFAULT true,
	"requires_approval" boolean DEFAULT false,
	"age_restriction" integer,
	"dress_code" varchar(100),
	"music_style" varchar(100),
	"level" varchar(50),
	"special_guests" text,
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"website_url" text,
	"facebook_url" text,
	"instagram_url" text,
	"cancellation_policy" text,
	"refund_policy" text,
	"accessibility_info" text,
	"parking_info" text,
	"tags" text[],
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" varchar(50),
	"series_id" integer,
	"status" varchar(20) DEFAULT 'active',
	"is_featured" boolean DEFAULT false,
	"has_event_page" boolean DEFAULT false,
	"event_page_slug" varchar(255),
	"event_page_description" text,
	"event_page_rules" text,
	"event_page_cover_image" text,
	"allow_event_page_posts" boolean DEFAULT true,
	"require_post_approval" boolean DEFAULT false,
	"event_visual_marker" varchar(20) DEFAULT 'default',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "events_event_page_slug_unique" UNIQUE("event_page_slug")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"did_we_dance" boolean,
	"dance_location" text,
	"dance_event_id" integer,
	"dance_story" text,
	"media_urls" text[] DEFAULT '{}',
	"sender_private_note" text,
	"receiver_private_note" text,
	"sender_message" text,
	"receiver_message" text,
	"snoozed_until" timestamp,
	"snooze_reminder_sent" boolean DEFAULT false,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friend_requests_sender_id_receiver_id_unique" UNIQUE("sender_id","receiver_id")
);
--> statement-breakpoint
CREATE TABLE "friends" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"friend_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"connection_degree" integer DEFAULT 1,
	"closeness_score" real DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friends_user_id_friend_id_unique" UNIQUE("user_id","friend_id")
);
--> statement-breakpoint
CREATE TABLE "friendship_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"friendship_id" integer NOT NULL,
	"activity_type" text NOT NULL,
	"activity_data" jsonb DEFAULT '{}'::jsonb,
	"points" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendship_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"friend_request_id" integer,
	"friendship_id" integer,
	"uploaded_by" integer NOT NULL,
	"media_url" text NOT NULL,
	"media_type" text NOT NULL,
	"caption" text,
	"phase" text DEFAULT 'request' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	"invited_by" integer,
	"status" varchar(20) DEFAULT 'active',
	CONSTRAINT "group_members_group_id_user_id_unique" UNIQUE("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'city' NOT NULL,
	"role_type" varchar(50),
	"emoji" varchar(10) DEFAULT '🏙️',
	"image_url" text,
	"coverImage" text,
	"description" text,
	"is_private" boolean DEFAULT false,
	"visibility" varchar(20) DEFAULT 'public',
	"city" varchar(100),
	"country" varchar(100),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"member_count" integer DEFAULT 0,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "guest_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"guest_id" integer NOT NULL,
	"host_home_id" integer NOT NULL,
	"check_in_date" timestamp NOT NULL,
	"check_out_date" timestamp NOT NULL,
	"guest_count" integer DEFAULT 1 NOT NULL,
	"purpose" text NOT NULL,
	"message" text NOT NULL,
	"has_read_rules" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"host_response" text,
	"total_price" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "guest_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"accommodation_preferences" jsonb DEFAULT '{}'::jsonb,
	"dietary_restrictions" text[] DEFAULT '{}',
	"languages_spoken" text[] DEFAULT '{}',
	"travel_interests" text[] DEFAULT '{}',
	"emergency_contact" jsonb DEFAULT '{}'::jsonb,
	"special_needs" text,
	"preferred_neighborhoods" text[] DEFAULT '{}',
	"budget_range" jsonb DEFAULT '{}'::jsonb,
	"stay_duration_preference" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"onboarding_completed" boolean DEFAULT false,
	CONSTRAINT "guest_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "home_amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"home_id" uuid NOT NULL,
	"category" varchar(50) NOT NULL,
	"amenity" varchar(100) NOT NULL,
	"icon_name" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "home_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"home_id" uuid NOT NULL,
	"url" varchar(500) NOT NULL,
	"caption" varchar(255),
	"room_type" varchar(50),
	"display_order" integer DEFAULT 0,
	"is_cover" boolean DEFAULT false,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "host_homes" (
	"id" serial PRIMARY KEY NOT NULL,
	"host_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"country" varchar(100) NOT NULL,
	"lat" real,
	"lng" real,
	"photos" text[] DEFAULT ARRAY[]::text[],
	"amenities" text[] DEFAULT ARRAY[]::text[],
	"max_guests" integer DEFAULT 1,
	"price_per_night" integer,
	"availability" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "host_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"home_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text,
	"cleanliness_rating" integer,
	"communication_rating" integer,
	"location_rating" integer,
	"value_rating" integer,
	"host_response" text,
	"host_response_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "host_reviews_home_id_reviewer_id_unique" UNIQUE("home_id","reviewer_id")
);
--> statement-breakpoint
CREATE TABLE "journey_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journey_id" uuid NOT NULL,
	"tenant_id" uuid,
	"activity_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" jsonb,
	"start_datetime" timestamp,
	"end_datetime" timestamp,
	"external_url" text,
	"content_reference_id" uuid,
	"content_reference_type" text,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "language_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"language_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"content_type" varchar(50),
	"content_id" text,
	"source_language_id" integer,
	"ip_address" varchar(45),
	"user_agent" text,
	"country" varchar(100),
	"city" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"country_code" varchar(10),
	"direction" varchar(10) DEFAULT 'ltr',
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "life_ceo_agent_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar(100) NOT NULL,
	"configuration_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "life_ceo_agent_configurations_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "life_ceo_chat_messages" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"agent_id" varchar(100) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_ceo_conversations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"agent_id" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_message" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_ceo_agent_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_type" varchar(50) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"content" jsonb NOT NULL,
	"importance" real DEFAULT 0.5,
	"tags" text[] DEFAULT '{}',
	"embedding" jsonb,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "live_agent_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_name" varchar(100) NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_path" text,
	"detected_changes" jsonb,
	"auto_classification" jsonb,
	"confidence" integer,
	"requires_review" boolean DEFAULT true,
	"tracker_item_id" uuid,
	"session_id" varchar(255),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lunfardo_dictionary" (
	"id" serial PRIMARY KEY NOT NULL,
	"term" varchar(100) NOT NULL,
	"meaning" text NOT NULL,
	"example" text,
	"category" varchar(50),
	"region" varchar(100) DEFAULT 'Buenos Aires',
	"synonyms" text[],
	"related_terms" text[],
	"audio_url" text,
	"is_verified" boolean DEFAULT false,
	"verified_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "lunfardo_dictionary_term_unique" UNIQUE("term")
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"original_filename" text NOT NULL,
	"path" text NOT NULL,
	"url" text NOT NULL,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"content_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"size" integer NOT NULL,
	"folder" text DEFAULT 'general' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_id" text NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_tags_media_id_tag_unique" UNIQUE("media_id","tag")
);
--> statement-breakpoint
CREATE TABLE "media_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_id" text NOT NULL,
	"used_in" text NOT NULL,
	"ref_id" integer NOT NULL,
	"context" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_usage_media_id_used_in_ref_id_unique" UNIQUE("media_id","used_in","ref_id")
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"rich_content" jsonb,
	"emotion_tags" text[],
	"emotion_visibility" text DEFAULT 'everyone',
	"trust_circle_level" integer,
	"location" jsonb,
	"media_urls" text[],
	"co_tagged_users" integer[],
	"consent_required" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"consent_status" text DEFAULT 'not_required',
	"approved_consents" jsonb,
	"denied_consents" jsonb,
	"pending_consents" jsonb,
	"tenant_id" uuid
);
--> statement-breakpoint
CREATE TABLE "memory_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"memory_id" integer NOT NULL,
	"media_id" text NOT NULL,
	"tagged_by" integer NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "memory_media_memory_id_media_id_unique" UNIQUE("memory_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "n8n_integration_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_sync" timestamp,
	"sync_status" varchar(50),
	"error_message" text,
	"metadata" jsonb,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "n8n_integration_status_service_name_unique" UNIQUE("service_name")
);
--> statement-breakpoint
CREATE TABLE "n8n_webhook_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" varchar(255),
	"webhook_path" varchar(255),
	"method" varchar(10),
	"headers" jsonb,
	"body" jsonb,
	"response_status" integer,
	"response_body" jsonb,
	"execution_time_ms" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false,
	"action_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"provider" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"last_four" varchar(4),
	"brand" varchar(50),
	"country" varchar(2),
	"expiry_month" integer,
	"expiry_year" integer,
	"is_default" boolean DEFAULT false,
	"provider_payment_method_id" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"subscription_id" integer,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd' NOT NULL,
	"status" varchar(50) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metric_type" text NOT NULL,
	"endpoint" text,
	"response_time" numeric(10, 2),
	"cache_hit_rate" numeric(5, 2),
	"memory_usage" numeric(10, 2),
	"active_connections" integer,
	"error_count" integer DEFAULT 0,
	"metadata" jsonb,
	"anomaly_detected" boolean DEFAULT false,
	"auto_fixed" boolean DEFAULT false,
	"severity" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performer_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"partner_profile_link" text,
	"recent_performance_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photographer_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(20) DEFAULT 'photographer',
	"facebook_profile_url" varchar(255),
	"videos_taken_count" integer,
	"cities" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"parent_id" integer,
	"mentions" text[] DEFAULT '{}',
	"gif_url" text,
	"image_url" text,
	"likes" integer DEFAULT 0,
	"dislikes" integer DEFAULT 0,
	"is_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer,
	"comment_id" integer,
	"reporter_id" integer NOT NULL,
	"reason" varchar(100) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending',
	"moderator_id" integer,
	"moderator_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_id" integer,
	"content" text NOT NULL,
	"rich_content" jsonb,
	"plain_text" text,
	"image_url" text,
	"video_url" text,
	"media_embeds" jsonb DEFAULT '[]'::jsonb,
	"mentions" text[] DEFAULT '{}',
	"hashtags" text[] DEFAULT '{}',
	"location" text,
	"coordinates" jsonb,
	"place_id" text,
	"formatted_address" text,
	"visibility" varchar(20) DEFAULT 'public',
	"post_type" varchar(50) DEFAULT 'memory',
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"likes_count" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"shares_count" integer DEFAULT 0,
	"is_public" boolean DEFAULT true,
	"is_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"user_id" integer,
	"action" varchar(50) NOT NULL,
	"field" varchar(100),
	"old_value" jsonb,
	"new_value" jsonb,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_tracker_changelog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"change_type" varchar(50) NOT NULL,
	"previous_value" jsonb,
	"new_value" jsonb,
	"changed_by" integer,
	"change_reason" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tracker_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"layer" varchar(100) NOT NULL,
	"created_on" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"review_status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"reviewed_by" text,
	"version" varchar(20) DEFAULT 'v1.0.0' NOT NULL,
	"mvp_scope" boolean DEFAULT false NOT NULL,
	"mvp_status" varchar(50) DEFAULT 'In Progress' NOT NULL,
	"mvp_signed_off_by" text,
	"summary" text NOT NULL,
	"metadata" jsonb,
	"code_location" text,
	"api_endpoints" text[],
	"dependencies" text[],
	"related_items" text[],
	"tags" text[],
	"priority" varchar(20) DEFAULT 'medium',
	"estimated_hours" integer,
	"actual_hours" integer,
	"completion_percentage" integer DEFAULT 0,
	"blockers" text[],
	"notes" text,
	"created_by" integer,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"layer" integer,
	"phase" integer,
	"completion" integer DEFAULT 0,
	"mobile_completion" integer DEFAULT 0,
	"priority" varchar(20),
	"team" jsonb DEFAULT '[]'::jsonb,
	"parent_id" varchar(255),
	"estimated_hours" integer,
	"actual_hours" integer,
	"start_date" timestamp,
	"end_date" timestamp,
	"assigned_to" integer,
	"created_by" integer,
	"updated_by" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"tags" text[],
	"blockers" text[],
	"notes" text,
	"git_commits" jsonb DEFAULT '[]'::jsonb,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"dependencies" varchar(255)[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer,
	"comment_id" integer,
	"type" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "reactions_user_id_post_id_type_unique" UNIQUE("user_id","post_id","type"),
	CONSTRAINT "reactions_user_id_comment_id_type_unique" UNIQUE("user_id","comment_id","type")
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer,
	"group_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"address" text,
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"country" varchar(100) NOT NULL,
	"lat" real,
	"lng" real,
	"photos" text[] DEFAULT ARRAY[]::text[],
	"rating" integer,
	"tags" text[] DEFAULT ARRAY[]::text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"is_platform_role" boolean DEFAULT false,
	"permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"memory_access_level" text DEFAULT 'basic',
	"emotional_tag_access" boolean DEFAULT false,
	"is_custom" boolean DEFAULT false,
	"custom_name" text,
	"custom_description" text,
	"is_approved" boolean DEFAULT false,
	"submitted_by" integer,
	"approved_by" integer,
	"approved_at" timestamp,
	"submitted_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"media_url" text NOT NULL,
	"media_type" varchar(20) NOT NULL,
	"caption" text,
	"views_count" integer DEFAULT 0,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "story_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"viewed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_name" varchar(255) NOT NULL,
	"description" text,
	"tiers" text[] NOT NULL,
	"limit_value" integer,
	"limit_unit" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscription_features_feature_name_unique" UNIQUE("feature_name")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"plan_id" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"payment_provider" varchar(50) NOT NULL,
	"provider_subscription_id" varchar(255) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teaching_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"partner_facebook_url" varchar(255),
	"cities" text,
	"online_platforms" text,
	"about_tango_future" text,
	"teaching_reason" text,
	"preferred_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"is_admin" boolean DEFAULT false,
	"display_in_feed" boolean DEFAULT true,
	"notification_preferences" jsonb DEFAULT '{"email":true,"push":true}'::jsonb NOT NULL,
	"expertise_level" text DEFAULT 'beginner',
	"interests" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenant_users_tenant_id_user_id_unique" UNIQUE("tenant_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"logo_url" text,
	"primary_color" text DEFAULT '#FF1744',
	"secondary_color" text DEFAULT '#3F51B5',
	"domain" text,
	"is_active" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"event_type" text,
	"status" text NOT NULL,
	"test_suite" text,
	"passed" integer DEFAULT 0,
	"failed" integer DEFAULT 0,
	"skipped" integer DEFAULT 0,
	"duration" text,
	"error_details" jsonb,
	"test_timestamp" timestamp,
	"received_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "test_results_test_id_unique" UNIQUE("test_id")
);
--> statement-breakpoint
CREATE TABLE "tour_operator_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"cities" text,
	"website_url" varchar(255),
	"theme" text,
	"vendor_activities" varchar(255),
	"vendor_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translation_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"translation_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"vote_type" varchar(10) NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_translation_vote" UNIQUE("translation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"language_id" integer NOT NULL,
	"value" text NOT NULL,
	"category" varchar(100),
	"is_reviewed" boolean DEFAULT false,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_translation" UNIQUE("key","language_id")
);
--> statement-breakpoint
CREATE TABLE "travel_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_name" varchar(255),
	"event_type" varchar(50),
	"city" varchar(255) NOT NULL,
	"country" varchar(255),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "travel_status" DEFAULT 'planned',
	"notes" text,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_api_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"api_token" text NOT NULL,
	"device_type" varchar(100),
	"device_token" text,
	"type" varchar(20) DEFAULT 'ACCESS',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_followed_cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_journeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"locations" jsonb[] DEFAULT '{}',
	"tenant_ids" uuid[] DEFAULT '{}',
	"journey_type" text DEFAULT 'travel',
	"status" text DEFAULT 'planning',
	"is_public" boolean DEFAULT false,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_language_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"primary_language_id" integer NOT NULL,
	"secondary_languages" integer[],
	"interface_language_id" integer NOT NULL,
	"content_language_ids" integer[],
	"auto_translate" boolean DEFAULT true,
	"show_original_with_translation" boolean DEFAULT false,
	"preferred_translation_service" varchar(50) DEFAULT 'google',
	"detected_from_ip" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_user_language_pref" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'guest',
	"roles" text[] DEFAULT '{"guest"}',
	"primary_role" text DEFAULT 'guest',
	"display_name" text,
	"avatar_url" text,
	"permissions" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_name" text NOT NULL,
	"role_id" uuid,
	"is_primary" boolean DEFAULT false,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" integer,
	CONSTRAINT "user_roles_user_id_role_name_unique" UNIQUE("user_id","role_name")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"notifications" jsonb DEFAULT '{"emailNotifications":true,"pushNotifications":true,"smsNotifications":false,"eventReminders":true,"newFollowerAlerts":true,"messageAlerts":true,"groupInvites":true,"weeklyDigest":false,"marketingEmails":false,"mentionAlerts":true,"replyNotifications":true,"systemUpdates":true,"securityAlerts":true}'::jsonb NOT NULL,
	"privacy" jsonb DEFAULT '{"profileVisibility":"public","showLocation":true,"showEmail":false,"showPhone":false,"allowMessagesFrom":"friends","showActivityStatus":true,"allowTagging":true,"showInSearch":true,"shareAnalytics":false,"dataExportEnabled":true,"thirdPartySharing":false}'::jsonb NOT NULL,
	"appearance" jsonb DEFAULT '{"theme":"light","language":"en","dateFormat":"MM/DD/YYYY","timeFormat":"12h","fontSize":"medium","reduceMotion":false,"colorScheme":"ocean","compactMode":false,"showAnimations":true,"customAccentColor":null}'::jsonb NOT NULL,
	"advanced" jsonb DEFAULT '{"developerMode":false,"betaFeatures":false,"performanceMode":"balanced","cacheSize":"medium","offlineMode":false,"syncFrequency":"realtime","exportFormat":"json","apiAccess":false,"webhooksEnabled":false}'::jsonb NOT NULL,
	"accessibility" jsonb DEFAULT '{"screenReaderOptimized":false,"highContrast":false,"keyboardNavigation":true,"focusIndicators":true,"altTextMode":"enhanced","audioDescriptions":false,"captionsEnabled":true}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_view_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"view_mode" text DEFAULT 'single_community' NOT NULL,
	"selected_tenant_id" uuid,
	"selected_tenant_ids" uuid[] DEFAULT '{}',
	"custom_filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_view_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"mobile_no" varchar(20),
	"profile_image" text,
	"background_image" text,
	"bio" text,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"country" varchar(100),
	"city" varchar(100),
	"facebook_url" text,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"suspended" boolean DEFAULT false,
	"device_type" varchar(20),
	"device_token" text,
	"api_token" text,
	"replit_id" varchar(255),
	"nickname" varchar(100),
	"languages" text[],
	"tango_roles" text[],
	"leader_level" integer DEFAULT 0,
	"follower_level" integer DEFAULT 0,
	"years_of_dancing" integer DEFAULT 0,
	"started_dancing_year" integer,
	"state" varchar(100),
	"country_code" varchar(10),
	"state_code" varchar(10),
	"form_status" integer DEFAULT 0,
	"is_onboarding_complete" boolean DEFAULT false,
	"code_of_conduct_accepted" boolean DEFAULT false,
	"occupation" varchar(255),
	"terms_accepted" boolean DEFAULT false,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"subscription_status" varchar(50),
	"subscription_tier" varchar(50) DEFAULT 'free',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_replit_id_unique" UNIQUE("replit_id"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_event_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"data" jsonb NOT NULL,
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "webhook_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_user_id_users_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_room_slug_chat_rooms_slug_fk" FOREIGN KEY ("chat_room_slug") REFERENCES "public"."chat_rooms"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_users" ADD CONSTRAINT "chat_room_users_chat_room_slug_chat_rooms_slug_fk" FOREIGN KEY ("chat_room_slug") REFERENCES "public"."chat_rooms"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_of_conduct_agreements" ADD CONSTRAINT "code_of_conduct_agreements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_connections" ADD CONSTRAINT "community_connections_tenant_id_1_tenants_id_fk" FOREIGN KEY ("tenant_id_1") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_connections" ADD CONSTRAINT "community_connections_tenant_id_2_tenants_id_fk" FOREIGN KEY ("tenant_id_2") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_sharing" ADD CONSTRAINT "content_sharing_source_tenant_id_tenants_id_fk" FOREIGN KEY ("source_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_sharing" ADD CONSTRAINT "content_sharing_shared_tenant_id_tenants_id_fk" FOREIGN KEY ("shared_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_sharing" ADD CONSTRAINT "content_sharing_shared_by_users_id_fk" FOREIGN KEY ("shared_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translations" ADD CONSTRAINT "content_translations_original_language_id_languages_id_fk" FOREIGN KEY ("original_language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translations" ADD CONSTRAINT "content_translations_target_language_id_languages_id_fk" FOREIGN KEY ("target_language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translations" ADD CONSTRAINT "content_translations_translated_by_users_id_fk" FOREIGN KEY ("translated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translations" ADD CONSTRAINT "content_translations_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_experiences" ADD CONSTRAINT "creator_experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_role_requests" ADD CONSTRAINT "custom_role_requests_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_role_requests" ADD CONSTRAINT "custom_role_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_role_requests" ADD CONSTRAINT "custom_role_requests_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_activities" ADD CONSTRAINT "daily_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dance_experiences" ADD CONSTRAINT "dance_experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dj_experiences" ADD CONSTRAINT "dj_experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_admins" ADD CONSTRAINT "event_admins_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_admins" ADD CONSTRAINT "event_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_invitee_id_users_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_page_admins" ADD CONSTRAINT "event_page_admins_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_page_admins" ADD CONSTRAINT "event_page_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_page_admins" ADD CONSTRAINT "event_page_admins_delegated_by_users_id_fk" FOREIGN KEY ("delegated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_page_posts" ADD CONSTRAINT "event_page_posts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_page_posts" ADD CONSTRAINT "event_page_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_page_posts" ADD CONSTRAINT "event_page_posts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_page_posts" ADD CONSTRAINT "event_page_posts_pinned_by_users_id_fk" FOREIGN KEY ("pinned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_series" ADD CONSTRAINT "event_series_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_dance_event_id_events_id_fk" FOREIGN KEY ("dance_event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship_activities" ADD CONSTRAINT "friendship_activities_friendship_id_friends_id_fk" FOREIGN KEY ("friendship_id") REFERENCES "public"."friends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship_media" ADD CONSTRAINT "friendship_media_friend_request_id_friend_requests_id_fk" FOREIGN KEY ("friend_request_id") REFERENCES "public"."friend_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship_media" ADD CONSTRAINT "friendship_media_friendship_id_friends_id_fk" FOREIGN KEY ("friendship_id") REFERENCES "public"."friends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship_media" ADD CONSTRAINT "friendship_media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_bookings" ADD CONSTRAINT "guest_bookings_guest_id_users_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_bookings" ADD CONSTRAINT "guest_bookings_host_home_id_host_homes_id_fk" FOREIGN KEY ("host_home_id") REFERENCES "public"."host_homes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_profiles" ADD CONSTRAINT "guest_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_amenities" ADD CONSTRAINT "home_amenities_home_id_host_homes_id_fk" FOREIGN KEY ("home_id") REFERENCES "public"."host_homes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_photos" ADD CONSTRAINT "home_photos_home_id_host_homes_id_fk" FOREIGN KEY ("home_id") REFERENCES "public"."host_homes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_homes" ADD CONSTRAINT "host_homes_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_reviews" ADD CONSTRAINT "host_reviews_home_id_host_homes_id_fk" FOREIGN KEY ("home_id") REFERENCES "public"."host_homes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_reviews" ADD CONSTRAINT "host_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_activities" ADD CONSTRAINT "journey_activities_journey_id_user_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."user_journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_activities" ADD CONSTRAINT "journey_activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language_analytics" ADD CONSTRAINT "language_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language_analytics" ADD CONSTRAINT "language_analytics_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language_analytics" ADD CONSTRAINT "language_analytics_source_language_id_languages_id_fk" FOREIGN KEY ("source_language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_chat_messages" ADD CONSTRAINT "life_ceo_chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_conversations" ADD CONSTRAINT "life_ceo_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_agent_actions" ADD CONSTRAINT "live_agent_actions_tracker_item_id_project_tracker_items_id_fk" FOREIGN KEY ("tracker_item_id") REFERENCES "public"."project_tracker_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lunfardo_dictionary" ADD CONSTRAINT "lunfardo_dictionary_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_usage" ADD CONSTRAINT "media_usage_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_memory_id_posts_id_fk" FOREIGN KEY ("memory_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_tagged_by_users_id_fk" FOREIGN KEY ("tagged_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performer_experiences" ADD CONSTRAINT "performer_experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photographer_experiences" ADD CONSTRAINT "photographer_experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_comment_id_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."post_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_activity" ADD CONSTRAINT "project_activity_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_activity" ADD CONSTRAINT "project_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tracker_changelog" ADD CONSTRAINT "project_tracker_changelog_item_id_project_tracker_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."project_tracker_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tracker_changelog" ADD CONSTRAINT "project_tracker_changelog_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tracker_items" ADD CONSTRAINT "project_tracker_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tracker_items" ADD CONSTRAINT "project_tracker_items_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_comment_id_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."post_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_experiences" ADD CONSTRAINT "teaching_experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_operator_experiences" ADD CONSTRAINT "tour_operator_experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_votes" ADD CONSTRAINT "translation_votes_translation_id_content_translations_id_fk" FOREIGN KEY ("translation_id") REFERENCES "public"."content_translations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_votes" ADD CONSTRAINT "translation_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_details" ADD CONSTRAINT "travel_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_tokens" ADD CONSTRAINT "user_api_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_followed_cities" ADD CONSTRAINT "user_followed_cities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_journeys" ADD CONSTRAINT "user_journeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_preferences" ADD CONSTRAINT "user_language_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_preferences" ADD CONSTRAINT "user_language_preferences_primary_language_id_languages_id_fk" FOREIGN KEY ("primary_language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_preferences" ADD CONSTRAINT "user_language_preferences_interface_language_id_languages_id_fk" FOREIGN KEY ("interface_language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_name_roles_name_fk" FOREIGN KEY ("role_name") REFERENCES "public"."roles"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_view_preferences" ADD CONSTRAINT "user_view_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_view_preferences" ADD CONSTRAINT "user_view_preferences_selected_tenant_id_tenants_id_fk" FOREIGN KEY ("selected_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chat_history_session" ON "chat_history" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_chat_history_user" ON "chat_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_history_timestamp" ON "chat_history" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_chat_history_type" ON "chat_history" USING btree ("message_type");--> statement-breakpoint
CREATE INDEX "idx_coc_agreements_user_id" ON "code_of_conduct_agreements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_coc_agreements_created_at" ON "code_of_conduct_agreements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_content_sharing_content_id" ON "content_sharing" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "idx_content_sharing_source_tenant_id" ON "content_sharing" USING btree ("source_tenant_id");--> statement-breakpoint
CREATE INDEX "idx_content_sharing_shared_tenant_id" ON "content_sharing" USING btree ("shared_tenant_id");--> statement-breakpoint
CREATE INDEX "idx_content_trans_content" ON "content_translations" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "idx_content_trans_languages" ON "content_translations" USING btree ("original_language_id","target_language_id");--> statement-breakpoint
CREATE INDEX "idx_content_trans_type" ON "content_translations" USING btree ("translation_type");--> statement-breakpoint
CREATE INDEX "idx_custom_role_requests_status" ON "custom_role_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_custom_role_requests_submitted_by" ON "custom_role_requests" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "idx_custom_role_requests_created_at" ON "custom_role_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_daily_activities_user_id" ON "daily_activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_activities_timestamp" ON "daily_activities" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_daily_activities_project_id" ON "daily_activities" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_event_admins_event_id" ON "event_admins" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_admins_user_id" ON "event_admins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_event_page_admins_event" ON "event_page_admins" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_page_admins_user" ON "event_page_admins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_event_page_admins_role" ON "event_page_admins" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_event_page_admins_active" ON "event_page_admins" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_event_page_posts_event" ON "event_page_posts" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_page_posts_user" ON "event_page_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_event_page_posts_type" ON "event_page_posts" USING btree ("post_type");--> statement-breakpoint
CREATE INDEX "idx_event_page_posts_approved" ON "event_page_posts" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "idx_event_page_posts_created" ON "event_page_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_event_participants_user_id" ON "event_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_event_participants_event_id" ON "event_participants" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_participants_status" ON "event_participants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_event_rsvps_event_id" ON "event_rsvps" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_rsvps_user_id" ON "event_rsvps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_friend_requests_sender" ON "friend_requests" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_friend_requests_receiver" ON "friend_requests" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "idx_friend_requests_status" ON "friend_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_friend_requests_snoozed" ON "friend_requests" USING btree ("snoozed_until");--> statement-breakpoint
CREATE INDEX "idx_friendship_activities_friendship" ON "friendship_activities" USING btree ("friendship_id");--> statement-breakpoint
CREATE INDEX "idx_friendship_activities_type" ON "friendship_activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "idx_friendship_activities_created" ON "friendship_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_friendship_media_request" ON "friendship_media" USING btree ("friend_request_id");--> statement-breakpoint
CREATE INDEX "idx_friendship_media_friendship" ON "friendship_media" USING btree ("friendship_id");--> statement-breakpoint
CREATE INDEX "idx_group_members_user" ON "group_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_group_members_group" ON "group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_group_members_role" ON "group_members" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_group_members_status" ON "group_members" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_groups_type" ON "groups" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_groups_role_type" ON "groups" USING btree ("role_type");--> statement-breakpoint
CREATE INDEX "idx_groups_city" ON "groups" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_groups_slug" ON "groups" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_groups_created_at" ON "groups" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_guest_bookings_guest" ON "guest_bookings" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "idx_guest_bookings_home" ON "guest_bookings" USING btree ("host_home_id");--> statement-breakpoint
CREATE INDEX "idx_guest_bookings_status" ON "guest_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_guest_bookings_dates" ON "guest_bookings" USING btree ("check_in_date","check_out_date");--> statement-breakpoint
CREATE INDEX "idx_guest_profiles_user_id" ON "guest_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "home_amenities_home_id_idx" ON "home_amenities" USING btree ("home_id");--> statement-breakpoint
CREATE INDEX "home_amenities_category_idx" ON "home_amenities" USING btree ("category");--> statement-breakpoint
CREATE INDEX "home_photos_home_id_idx" ON "home_photos" USING btree ("home_id");--> statement-breakpoint
CREATE INDEX "home_photos_cover_idx" ON "home_photos" USING btree ("home_id","is_cover");--> statement-breakpoint
CREATE INDEX "idx_host_homes_host" ON "host_homes" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "idx_host_homes_city" ON "host_homes" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_host_homes_active" ON "host_homes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_host_homes_location" ON "host_homes" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "idx_host_reviews_home_id" ON "host_reviews" USING btree ("home_id");--> statement-breakpoint
CREATE INDEX "idx_host_reviews_reviewer_id" ON "host_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "idx_journey_activities_journey_id" ON "journey_activities" USING btree ("journey_id");--> statement-breakpoint
CREATE INDEX "idx_journey_activities_tenant_id" ON "journey_activities" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_lang_analytics_user" ON "language_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_lang_analytics_language" ON "language_analytics" USING btree ("language_id");--> statement-breakpoint
CREATE INDEX "idx_lang_analytics_action" ON "language_analytics" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_lang_analytics_date" ON "language_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_languages_code" ON "languages" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_languages_active" ON "languages" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_agent_config_id" ON "life_ceo_agent_configurations" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_config_updated" ON "life_ceo_agent_configurations" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "idx_chat_user_agent" ON "life_ceo_chat_messages" USING btree ("user_id","agent_id");--> statement-breakpoint
CREATE INDEX "idx_chat_timestamp" ON "life_ceo_chat_messages" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_chat_agent" ON "life_ceo_chat_messages" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_conv_user" ON "life_ceo_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_conv_agent" ON "life_ceo_conversations" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_conv_last_message" ON "life_ceo_conversations" USING btree ("last_message");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_user_agent" ON "life_ceo_agent_memories" USING btree ("user_id","agent_type");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_importance" ON "life_ceo_agent_memories" USING btree ("importance");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_created" ON "life_ceo_agent_memories" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_agent_actions_agent" ON "live_agent_actions" USING btree ("agent_name");--> statement-breakpoint
CREATE INDEX "idx_agent_actions_type" ON "live_agent_actions" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "idx_agent_actions_session" ON "live_agent_actions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_actions_timestamp" ON "live_agent_actions" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_lunfardo_term" ON "lunfardo_dictionary" USING btree ("term");--> statement-breakpoint
CREATE INDEX "idx_lunfardo_category" ON "lunfardo_dictionary" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_unread" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_type" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notifications_created" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_payments_user_id" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_subscription_id" ON "payments" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_payments_stripe_payment_intent_id" ON "payments" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "idx_performance_metrics_timestamp" ON "performance_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_performance_metrics_type" ON "performance_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "idx_performance_metrics_anomaly" ON "performance_metrics" USING btree ("anomaly_detected");--> statement-breakpoint
CREATE INDEX "idx_reports_post" ON "post_reports" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_reports_comment" ON "post_reports" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "post_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reports_created" ON "post_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_posts_user_created" ON "posts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_posts_visibility" ON "posts" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "idx_posts_hashtags" ON "posts" USING btree ("hashtags");--> statement-breakpoint
CREATE INDEX "idx_posts_post_type" ON "posts" USING btree ("post_type");--> statement-breakpoint
CREATE INDEX "idx_project_activity_project_id" ON "project_activity" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_activity_user_id" ON "project_activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_project_activity_timestamp" ON "project_activity" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_changelog_item" ON "project_tracker_changelog" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_changelog_type" ON "project_tracker_changelog" USING btree ("change_type");--> statement-breakpoint
CREATE INDEX "idx_changelog_timestamp" ON "project_tracker_changelog" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_tracker_layer" ON "project_tracker_items" USING btree ("layer");--> statement-breakpoint
CREATE INDEX "idx_tracker_type" ON "project_tracker_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_tracker_review_status" ON "project_tracker_items" USING btree ("review_status");--> statement-breakpoint
CREATE INDEX "idx_tracker_mvp_scope" ON "project_tracker_items" USING btree ("mvp_scope");--> statement-breakpoint
CREATE INDEX "idx_tracker_mvp_status" ON "project_tracker_items" USING btree ("mvp_status");--> statement-breakpoint
CREATE INDEX "idx_tracker_priority" ON "project_tracker_items" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_tracker_completion" ON "project_tracker_items" USING btree ("completion_percentage");--> statement-breakpoint
CREATE INDEX "idx_tracker_created_on" ON "project_tracker_items" USING btree ("created_on");--> statement-breakpoint
CREATE INDEX "idx_tracker_last_updated" ON "project_tracker_items" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_projects_parent_id" ON "projects" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_projects_layer" ON "projects" USING btree ("layer");--> statement-breakpoint
CREATE INDEX "idx_projects_priority" ON "projects" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_projects_assigned_to" ON "projects" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_projects_created_at" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_reactions_user" ON "reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reactions_post" ON "reactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_reactions_comment" ON "reactions" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_recommendations_user" ON "recommendations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_recommendations_post" ON "recommendations" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_recommendations_group" ON "recommendations" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_recommendations_city" ON "recommendations" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_recommendations_type" ON "recommendations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_recommendations_location" ON "recommendations" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "idx_tenant_users_tenant_id" ON "tenant_users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_tenant_users_user_id" ON "tenant_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_tenants_slug" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_tenants_is_active" ON "tenants" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_trans_votes_translation" ON "translation_votes" USING btree ("translation_id");--> statement-breakpoint
CREATE INDEX "idx_trans_votes_user" ON "translation_votes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_translations_key_lang" ON "translations" USING btree ("key","language_id");--> statement-breakpoint
CREATE INDEX "idx_translations_category" ON "translations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_user_journeys_user_id" ON "user_journeys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_lang_pref_user" ON "user_language_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_role" ON "user_profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_primary_role" ON "user_profiles" USING btree ("primary_role");--> statement-breakpoint
CREATE INDEX "idx_user_roles_user_id" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_role_name" ON "user_roles" USING btree ("role_name");--> statement-breakpoint
CREATE INDEX "idx_user_roles_role_id" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_user_settings_user_id" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_view_preferences_user_id" ON "user_view_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_stripe_event_id" ON "webhook_events" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_processed" ON "webhook_events" USING btree ("processed");