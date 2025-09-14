// ESA LIFE CEO 61x21 - Phase 2: Client-side CASL Abilities
import { PureAbility, AbilityBuilder, subject } from '@casl/ability';

// Define actions for all 72 pages
type Actions = 
  | 'manage' 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete'
  | 'approve'
  | 'deny'
  | 'filter'
  | 'view_pending'
  | 'access_admin'
  | 'view'
  | 'edit'
  | 'publish'
  | 'moderate'
  | 'access'
  | 'subscribe'
  | 'rsvp'
  | 'join'
  | 'leave'
  | 'invite'
  | 'ban'
  | 'unban';

// Define all subjects (covering all 72 pages and entities)
type Subjects = 
  | 'Memory'
  | 'ConsentRequest' 
  | 'MemoryFilter'
  | 'AdminPanel'
  | 'UserProfile'
  | 'Post'
  | 'Event'
  | 'Group'
  | 'Message'
  | 'Community'
  | 'BillingPage'
  | 'Analytics'
  | 'Friend'
  | 'Story'
  | 'Timeline'
  | 'Notification'
  | 'Settings'
  | 'ProjectTracker'
  | 'LifeCEO'
  | 'Hierarchy'
  | 'Subscription'
  | 'PromoCode'
  | 'Invoice'
  | 'PaymentMethod'
  | 'Housing'
  | 'TravelPlanner'
  | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;

export interface User {
  id: number;
  roles: string[];
  primaryRole?: string;
  role?: string; // Single role for compatibility
  email?: string;
  username?: string;
}

export function defineAbilitiesFor(user: User | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

  // Handle guest/unauthenticated users
  if (!user) {
    // Guests can only view public content
    can('read', 'Post', { isPublic: true });
    can('read', 'Event', { isPublic: true });
    can('read', 'Group', { isPublic: true });
    can('read', 'Community', { isPublic: true });
    can('read', 'Memory', { isPublic: true });
    can('view', 'UserProfile'); // Can view public profiles
    return build();
  }

  // Determine primary role (for backward compatibility)
  const primaryRole = user.primaryRole || user.role || 
    (user.roles?.includes('admin') ? 'admin' : 
     user.roles?.includes('moderator') ? 'moderator' :
     user.roles?.includes('organizer') ? 'organizer' :
     user.roles?.includes('teacher') ? 'teacher' : 'user');

  // Admin/Super Admin - Full access to all 72 pages
  if (user.roles?.includes('super_admin') || user.roles?.includes('admin') || primaryRole === 'admin') {
    can('manage', 'all');
    can('access', 'AdminPanel');
    can('access', 'BillingPage');
    can('access', 'Analytics');
    can('access', 'LifeCEO');
    can('access', 'ProjectTracker');
    can('access', 'Hierarchy');
  } 
  // Moderator - Can moderate content but limited admin access
  else if (user.roles?.includes('moderator') || primaryRole === 'moderator') {
    can('read', 'all');
    can('moderate', 'Post');
    can('moderate', 'Event');
    can('moderate', 'Group');
    can('moderate', 'Memory');
    can('moderate', 'Community');
    can('ban', 'Group');
    can('unban', 'Group');
    can('access', 'Analytics', { type: 'moderation' });
    cannot('access', 'AdminPanel');
    cannot('access', 'BillingPage');
  }
  // Organizer/Teacher - Can create and manage events/groups
  else if (user.roles?.includes('organizer') || user.roles?.includes('teacher') || 
           primaryRole === 'organizer' || primaryRole === 'teacher') {
    // All basic user permissions
    can('create', 'Post');
    can('read', 'Post');
    can('update', 'Post', { userId: user.id });
    can('delete', 'Post', { userId: user.id });
    
    // Event management
    can('create', 'Event');
    can('read', 'Event');
    can('update', 'Event', { organizerId: user.id });
    can('delete', 'Event', { organizerId: user.id });
    can('moderate', 'Event', { organizerId: user.id });
    
    // Group management
    can('create', 'Group');
    can('update', 'Group', { ownerId: user.id });
    can('delete', 'Group', { ownerId: user.id });
    can('invite', 'Group', { ownerId: user.id });
    
    // Limited analytics
    can('view', 'Analytics', { type: 'event' });
    
    // Memory and other permissions
    can('create', 'Memory');
    can('read', 'Memory');
    can('update', 'Memory', { userId: user.id });
    can('delete', 'Memory', { userId: user.id });
    
    // Message permissions
    can('create', 'Message');
    can('read', 'Message');
    
    // Community permissions
    can('read', 'Community');
    can('join', 'Community');
    
    // Cannot access admin areas
    cannot('access', 'AdminPanel');
    cannot('access', 'LifeCEO');
  }
  // Basic authenticated user permissions (dancer, user, etc.)
  else {
    // Posts
    can('create', 'Post');
    can('read', 'Post');
    can('update', 'Post', { userId: user.id });
    can('delete', 'Post', { userId: user.id });
    
    // Memories
    can('create', 'Memory');
    can('read', 'Memory');
    can('update', 'Memory', { userId: user.id });
    can('delete', 'Memory', { userId: user.id });
    
    // Memory consent permissions
    can('view_pending', 'ConsentRequest');
    can('approve', 'ConsentRequest', { coTaggedUsers: { $in: [user.id] } });
    can('deny', 'ConsentRequest', { coTaggedUsers: { $in: [user.id] } });
    
    // Memory filtering
    can('filter', 'MemoryFilter');
    
    // Events - can view and RSVP
    can('read', 'Event');
    can('rsvp', 'Event');
    
    // Groups - can view and join
    can('read', 'Group');
    can('join', 'Group');
    can('leave', 'Group');
    
    // Messages
    can('create', 'Message');
    can('read', 'Message', { $or: [{ senderId: user.id }, { recipientId: user.id }] });
    
    // Communities
    can('read', 'Community');
    can('join', 'Community');
    
    // Profile permissions
    can('read', 'UserProfile');
    can('update', 'UserProfile', { id: user.id });
    
    // Friends
    can('read', 'Friend');
    can('create', 'Friend');
    can('delete', 'Friend', { userId: user.id });
    
    // Stories
    can('create', 'Story');
    can('read', 'Story');
    can('update', 'Story', { userId: user.id });
    can('delete', 'Story', { userId: user.id });
    
    // Timeline
    can('read', 'Timeline');
    
    // Notifications
    can('read', 'Notification', { userId: user.id });
    can('update', 'Notification', { userId: user.id });
    
    // Settings
    can('read', 'Settings', { userId: user.id });
    can('update', 'Settings', { userId: user.id });
    
    // Subscription (view own)
    can('read', 'Subscription', { userId: user.id });
    can('update', 'Subscription', { userId: user.id });
    
    // Cannot access admin/billing areas
    cannot('access', 'AdminPanel');
    cannot('access', 'BillingPage');
    cannot('access', 'Analytics');
    cannot('access', 'LifeCEO');
    cannot('access', 'ProjectTracker');
    cannot('access', 'Hierarchy');
  }

  // Special role-based permissions (backward compatibility)
  if (user.roles?.includes('curator')) {
    can('filter', 'MemoryFilter');
    can('read', 'Memory');
  }

  // Trust-level based permissions
  if (user.roles?.includes('dancer') || user.roles?.includes('teacher') || user.roles?.includes('organizer')) {
    can('read', 'Memory', { trustLevel: { $lte: 2 } });
  }

  return build();
}

// React hook for abilities
import { createContext, useContext } from 'react';

export const AbilityContext = createContext<AppAbility | undefined>(undefined);

export const useAbility = () => {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error('useAbility must be used within an AbilityProvider');
  }
  return ability;
};

// Helper functions for common checks
export const useCanApproveConsent = (memory: any, user: User) => {
  const ability = useAbility();
  return ability.can('approve', 'ConsentRequest', memory);
};

export const useCanViewPendingRequests = () => {
  const ability = useAbility();
  return ability.can('view_pending', 'ConsentRequest');
};

export const useCanFilterMemories = () => {
  const ability = useAbility();
  return ability.can('filter', 'MemoryFilter');
};

export const useCanAccessAdmin = () => {
  const ability = useAbility();
  return ability.can('access_admin', 'AdminPanel');
};