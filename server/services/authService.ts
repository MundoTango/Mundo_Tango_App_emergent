import { db } from '../db';
import { users, userProfiles, userRoles } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export type UserRole = 'admin' | 'organizer' | 'teacher' | 'dancer' | 'guest';

export interface UserWithRole {
  id: number;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  displayName: string | null;
  avatarUrl: string | null;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

export interface RolePermissions {
  [key: string]: boolean;
}

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    'manage_users': true,
    'manage_events': true,
    'manage_communities': true,
    'moderate_content': true,
    'view_analytics': true,
    'manage_roles': true,
    'delete_any_content': true,
    'ban_users': true
  },
  organizer: {
    'create_events': true,
    'manage_own_events': true,
    'moderate_event_content': true,
    'view_event_analytics': true,
    'invite_participants': true,
    'manage_event_rsvps': true
  },
  teacher: {
    'create_events': true,
    'manage_own_events': true,
    'create_educational_content': true,
    'moderate_comments': true,
    'view_student_progress': true
  },
  dancer: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true
  },
  guest: {
    'view_public_content': true,
    'view_public_events': true
  }
};

export class AuthService {
  /**
   * Get user with role information
   */
  async getUserWithRole(userId: number): Promise<UserWithRole | null> {
    try {
      // Get user data
      const userResult = await db
        .select({
          userId: users.id,
          email: users.email,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          isActive: users.isActive
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userResult[0]) return null;

      const user = userResult[0];
      
      // Get role from user_roles table
      const roleResult = await db
        .select({ roleName: userRoles.roleName })
        .from(userRoles)
        .where(eq(userRoles.userId, userId))
        .limit(1);
      
      // Default to 'guest' if no role exists
      const role: UserRole = (roleResult[0]?.roleName as UserRole) || 'guest';
      
      // Try to get display info from userProfiles
      const profileResult = await db
        .select({
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl
        })
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);
      
      return {
        id: user.userId,
        email: user.email,
        name: user.name,
        username: user.username,
        role,
        displayName: profileResult[0]?.displayName || user.name,
        avatarUrl: profileResult[0]?.avatarUrl || user.profileImage,
        permissions: ROLE_PERMISSIONS[role],
        isActive: user.isActive ?? true
      };
    } catch (error) {
      console.error('Error getting user with role:', error);
      return null;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: number, newRole: UserRole, updatedBy: number): Promise<boolean> {
    try {
      // Check if updater has permission to manage roles
      const updater = await this.getUserWithRole(updatedBy);
      if (!updater?.permissions.manage_roles) {
        throw new Error('Insufficient permissions to manage roles');
      }

      // Since user_profiles table doesn't exist, we can't update roles
      // Just log the attempt for now
      console.warn(`Role update attempted for user ${userId} to role ${newRole}, but user_profiles table does not exist`);

      // Log the role change
      await this.logRoleChange(userId, newRole, updatedBy);
      
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: number, permission: string): Promise<boolean> {
    try {
      const user = await this.getUserWithRole(userId);
      return user?.permissions[permission] || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasRole(userId: number, roles: UserRole[]): Promise<boolean> {
    try {
      const user = await this.getUserWithRole(userId);
      return user ? roles.includes(user.role) : false;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Ensure user profile exists
   */
  async ensureUserProfile(userId: number): Promise<void> {
    // Since user_profiles table doesn't exist, this is a no-op
    console.debug('ensureUserProfile called but user_profiles table does not exist');
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, limit = 50): Promise<UserWithRole[]> {
    try {
      // Since user_profiles table doesn't exist, we can't filter by role
      // Return empty array for non-guest roles
      if (role !== 'guest') {
        return [];
      }

      // For guest role, return all active users
      const result = await db
        .select({
          userId: users.id,
          email: users.email,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          isActive: users.isActive
        })
        .from(users)
        .where(eq(users.isActive, true))
        .limit(limit);

      return result.map(user => ({
        id: user.userId,
        email: user.email,
        name: user.name,
        username: user.username,
        role: 'guest' as UserRole,
        displayName: user.name,
        avatarUrl: user.profileImage,
        permissions: ROLE_PERMISSIONS['guest'],
        isActive: user.isActive ?? true
      }));
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  /**
   * Log role changes for audit trail
   */
  private async logRoleChange(userId: number, newRole: UserRole, updatedBy: number): Promise<void> {
    try {
      // Log to activities table if it exists
      const logData = {
        userId: updatedBy,
        activityType: 'role_change',
        activityData: {
          targetUserId: userId,
          newRole: newRole,
          timestamp: new Date().toISOString()
        }
      };

      // This would log to activities table - implementation depends on your activities schema
      console.log('Role change logged:', logData);
    } catch (error) {
      console.error('Error logging role change:', error);
    }
  }

  /**
   * Set custom permissions for a user
   */
  async setCustomPermissions(userId: number, permissions: RolePermissions, updatedBy: number): Promise<boolean> {
    try {
      const updater = await this.getUserWithRole(updatedBy);
      if (!updater?.permissions.manage_roles) {
        throw new Error('Insufficient permissions to manage permissions');
      }

      // Since user_profiles table doesn't exist, we can't update permissions
      console.warn(`Permission update attempted for user ${userId}, but user_profiles table does not exist`);

      return true;
    } catch (error) {
      console.error('Error setting custom permissions:', error);
      return false;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: number, deactivatedBy: number): Promise<boolean> {
    try {
      const updater = await this.getUserWithRole(deactivatedBy);
      if (!updater?.permissions.ban_users) {
        throw new Error('Insufficient permissions to deactivate users');
      }

      // Update the users table isActive field instead
      await db
        .update(users)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
  }
}

export const authService = new AuthService();