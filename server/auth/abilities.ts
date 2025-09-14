// ESA LIFE CEO 61x21 - Phase 3: Authentication & Security
// CASL Ability Definitions for Role-Based Access Control

import { AbilityBuilder, MongoAbility, createMongoAbility } from '@casl/ability';
import { z } from 'zod';

// Define all subject types in the system - using class-based subjects for CASL
export class User {
  static readonly modelName = 'User';
  constructor(public id: number, public role: string) {}
}

export class Post {
  static readonly modelName = 'Post';
  constructor(public id: number, public userId: number, public isPublic?: boolean) {}
}

export class Event {
  static readonly modelName = 'Event';
  constructor(public id: number, public organizerId: number, public isPublic?: boolean) {}
}

export class Group {
  static readonly modelName = 'Group';
  constructor(public id: number, public ownerId: number, public isPublic?: boolean) {}
}

export class Message {
  static readonly modelName = 'Message';
  constructor(public id: number, public senderId: number, public recipientId: number) {}
}

export class Memory {
  static readonly modelName = 'Memory';
  constructor(public id: number, public userId: number, public isPublic?: boolean) {}
}

export class Community {
  static readonly modelName = 'Community';
  constructor(public id: number, public adminId: number, public isPublic?: boolean) {}
}

export class AdminPanel {
  static readonly modelName = 'AdminPanel';
}

export class BillingPage {
  static readonly modelName = 'BillingPage';
}

export class Analytics {
  static readonly modelName = 'Analytics';
  constructor(public type?: string) {}
}

export class UserProfile {
  static readonly modelName = 'UserProfile';
  constructor(public id: number, public userId: number) {}
}

// All possible subjects - using string literals for CASL
type Subjects = 
  | typeof User.modelName
  | typeof Post.modelName
  | typeof Event.modelName
  | typeof Group.modelName
  | typeof Message.modelName
  | typeof Memory.modelName
  | typeof Community.modelName
  | typeof AdminPanel.modelName
  | typeof BillingPage.modelName
  | typeof Analytics.modelName
  | typeof UserProfile.modelName
  | Post
  | Event
  | Group
  | Message
  | Memory
  | Community
  | AdminPanel
  | BillingPage
  | Analytics
  | UserProfile
  | 'all';

// All possible actions
export type Actions = 
  | 'manage' // Full CRUD
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete'
  | 'view'
  | 'edit'
  | 'publish'
  | 'moderate'
  | 'access' // For page access
  | 'subscribe'
  | 'rsvp'
  | 'join'
  | 'leave'
  | 'invite'
  | 'ban'
  | 'unban';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

// Define abilities for each role
export function defineAbilitiesFor(user: { id: number; role: string } | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (!user) {
    // Guest/Unauthenticated users - PUBLIC ACCESS ONLY
    can('read', Post.modelName, { isPublic: true });
    can('read', Event.modelName, { isPublic: true });
    can('read', Group.modelName, { isPublic: true });
    can('read', Community.modelName, { isPublic: true });
    can('read', Memory.modelName, { isPublic: true });
    can('view', UserProfile.modelName); // Can view public profiles
    // Guests can access these pages without auth:
    // - Landing, Login, Register, Code of Conduct, Public events, Public profiles
    
    return build();
  }

  // ALL AUTHENTICATED USERS
  if (user.role === 'user' || user.role === 'dancer') {
    // Basic user permissions
    can('create', Post.modelName);
    can('read', Post.modelName);
    can('update', Post.modelName, { userId: user.id });
    can('delete', Post.modelName, { userId: user.id });
    
    can('create', Memory.modelName);
    can('read', Memory.modelName);
    can('update', Memory.modelName, { userId: user.id });
    can('delete', Memory.modelName, { userId: user.id });
    
    can('read', Event.modelName);
    can('rsvp', Event.modelName);
    
    can('read', Group.modelName);
    can('join', Group.modelName);
    can('leave', Group.modelName);
    
    can('create', Message.modelName);
    can('read', Message.modelName, { $or: [{ senderId: user.id }, { recipientId: user.id }] });
    
    can('read', Community.modelName);
    can('join', Community.modelName);
    
    can('view', UserProfile.modelName);
    can('edit', UserProfile.modelName, { userId: user.id });
    
    // Cannot access admin areas
    cannot('access', AdminPanel.modelName);
    cannot('access', Analytics.modelName);
  }

  // ORGANIZER ROLE (Event organizers)
  if (user.role === 'organizer') {
    // All basic user permissions
    can('create', Post.modelName);
    can('read', Post.modelName);
    can('update', Post.modelName, { userId: user.id });
    can('delete', Post.modelName, { userId: user.id });
    
    // Enhanced event permissions
    can('create', Event.modelName);
    can('read', Event.modelName);
    can('update', Event.modelName, { organizerId: user.id });
    can('delete', Event.modelName, { organizerId: user.id });
    can('moderate', Event.modelName, { organizerId: user.id });
    
    // Can create and manage groups
    can('create', Group.modelName);
    can('update', Group.modelName, { ownerId: user.id });
    can('delete', Group.modelName, { ownerId: user.id });
    can('invite', Group.modelName, { ownerId: user.id });
    
    // Limited analytics for their events
    can('view', Analytics.modelName, { type: 'event' });
    
    // Still cannot access main admin panel
    cannot('access', AdminPanel.modelName);
  }

  // TEACHER ROLE (Can create educational content)
  if (user.role === 'teacher') {
    // All organizer permissions
    can('create', Post.modelName);
    can('read', Post.modelName);
    can('update', Post.modelName, { userId: user.id });
    can('delete', Post.modelName, { userId: user.id });
    
    can('create', Event.modelName);
    can('read', Event.modelName);
    can('update', Event.modelName, { organizerId: user.id });
    can('delete', Event.modelName, { organizerId: user.id });
    
    // Can moderate content in their groups
    can('moderate', Post.modelName, { groupId: { $in: user.id } });
    can('moderate', Memory.modelName, { groupId: { $in: user.id } });
    
    // Educational content permissions
    can('publish', Post.modelName);
    can('publish', Memory.modelName);
    
    // Still no admin access
    cannot('access', AdminPanel.modelName);
  }

  // MODERATOR ROLE
  if (user.role === 'moderator') {
    // Can moderate all content
    can('read', 'all');
    can('moderate', Post.modelName);
    can('moderate', Event.modelName);
    can('moderate', Group.modelName);
    can('moderate', Memory.modelName);
    can('moderate', Community.modelName);
    
    // Can ban/unban users from groups
    can('ban', Group.modelName);
    can('unban', Group.modelName);
    
    // Can access moderation analytics
    can('access', Analytics.modelName, { type: 'moderation' });
    
    // Still cannot fully manage admin panel
    cannot('manage', AdminPanel.modelName);
    cannot('access', BillingPage.modelName);
  }

  // ADMIN ROLE - Full access
  if (user.role === 'admin' || user.role === 'super_admin') {
    can('manage', 'all'); // Full CRUD on everything
    can('access', AdminPanel.modelName);
    can('access', BillingPage.modelName);
    can('access', Analytics.modelName);
  }

  return build();
}

// Helper function to check abilities
export function checkAbility(
  user: { id: number; role: string } | null, 
  action: Actions, 
  subject: Subjects | any,
  field?: string
): boolean {
  const ability = defineAbilitiesFor(user);
  return ability.can(action, subject, field);
}

// Middleware factory for Express routes
export function requireAbility(action: Actions, subject: Subjects | any) {
  return (req: any, res: any, next: any) => {
    const ability = defineAbilitiesFor(req.user);
    
    if (ability.can(action, subject)) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `You don't have permission to ${action} ${typeof subject === 'string' ? subject : subject.type || subject.constructor.name}`
      });
    }
  };
}

// Export for use in frontend
export function createAbilityForUser(user: { id: number; role: string } | null): AppAbility {
  return defineAbilitiesFor(user);
}

// Page access definitions - which pages require what permissions
export const PAGE_PERMISSIONS = {
  // Public pages (no auth required)
  public: [
    '/login',
    '/register', 
    '/landing',
    '/code-of-conduct',
    '/events', // Public events list
    '/communities', // Public communities
    '/profile/:username', // Public profiles
  ],
  
  // Authenticated user pages
  authenticated: [
    '/home',
    '/profile', // Own profile
    '/messages',
    '/friends',
    '/timeline',
    '/memories',
    '/groups',
    '/settings',
    '/notifications',
    '/search',
  ],
  
  // Organizer pages
  organizer: [
    '/events/create',
    '/events/manage',
    '/groups/create',
    '/groups/manage',
  ],
  
  // Admin only pages
  admin: [
    '/admin',
    '/admin/*',
    '/analytics',
    '/billing',
    '/billing/*',
    '/users/manage',
    '/moderation',
    '/life-ceo',
    '/hierarchy',
    '/project-tracker',
  ],
  
  // Moderator pages
  moderator: [
    '/moderation',
    '/reports',
    '/analytics/moderation',
  ],
};

// Helper to check page access
export function canAccessPage(user: { id: number; role: string } | null, path: string): boolean {
  // Check if public page
  if (PAGE_PERMISSIONS.public.some(p => {
    if (p.includes(':')) {
      const pattern = p.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(path);
    }
    return p === path || (p.endsWith('*') && path.startsWith(p.slice(0, -1)));
  })) {
    return true;
  }
  
  // No user = no access to protected pages
  if (!user) return false;
  
  // Check admin pages
  if (PAGE_PERMISSIONS.admin.some(p => 
    p === path || (p.endsWith('*') && path.startsWith(p.slice(0, -1)))
  )) {
    return user.role === 'admin' || user.role === 'super_admin';
  }
  
  // Check moderator pages
  if (PAGE_PERMISSIONS.moderator.some(p => path === p)) {
    return ['moderator', 'admin', 'super_admin'].includes(user.role);
  }
  
  // Check organizer pages
  if (PAGE_PERMISSIONS.organizer.some(p => path === p)) {
    return ['organizer', 'teacher', 'admin', 'super_admin'].includes(user.role);
  }
  
  // All other authenticated pages
  return true;
}

export default {
  defineAbilitiesFor,
  checkAbility,
  requireAbility,
  createAbilityForUser,
  canAccessPage,
  PAGE_PERMISSIONS
};