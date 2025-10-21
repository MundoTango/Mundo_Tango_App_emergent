// API Response Types for consistent data handling

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// MB.MD FIX: Interface matches actual API response (all camelCase)
export interface Group {
  id: number;
  name: string;
  slug: string;
  type: 'city' | 'role' | 'practice' | 'festival' | 'topic';
  roleType?: string | null;
  emoji?: string;
  imageUrl?: string | null;
  coverImage?: string | null;
  description?: string;  // MB.MD FIX: Made optional to match actual usage
  isPrivate: boolean;
  visibility?: string;
  city?: string;  // MB.MD FIX: Made optional (some groups may not have city)
  country?: string;  // MB.MD FIX: Made optional
  latitude?: string | null;
  longitude?: string | null;
  memberCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  membershipStatus?: 'member' | 'not_member' | 'pending';
  isJoined?: boolean;
  isFollowing?: boolean;
}

export interface GroupMember {
  id: number;
  username: string;
  name: string;
  profileImage?: string;
  joinedAt: string;
  role?: string;
}

export interface GroupActivity {
  id: string;
  type: 'post' | 'event' | 'member_joined' | 'announcement';
  content: string;
  userId: number;
  userName: string;
  userUsername: string;
  userProfileImage?: string;
  createdAt: string;
  metadata?: any;
}