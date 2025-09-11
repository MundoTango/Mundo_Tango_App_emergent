import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { setUserContext } from '../middleware/tenantMiddleware';
import { setupUpload } from '../middleware/upload';
import { z } from 'zod';
import { getUserId } from '../utils/authHelper';
import { apiCache, cacheKeys, CACHE_TTL, cacheMiddleware } from '../utils/cache';

const router = Router();
const upload = setupUpload();

// Privacy enforcement helper
const enforcePrivacy = async (requesterId: number, targetUserId: number, userSettings: any) => {
  // If same user, allow full access
  if (requesterId === targetUserId) return true;
  
  // Check privacy settings
  const privacySettings = userSettings?.privacy || {};
  
  // Check profile visibility
  if (privacySettings.profileVisibility === 'private') {
    // Check if they're friends
    const areFriends = await storage.isFollowing(requesterId, targetUserId);
    if (!areFriends) return false;
  }
  
  return true;
};

// Filter user data based on privacy settings
const filterUserDataByPrivacy = (userData: any, isOwnProfile: boolean, privacySettings: any) => {
  if (isOwnProfile) return userData;
  
  const filtered = { ...userData };
  
  // Remove sensitive data based on privacy settings
  if (!privacySettings?.showEmail) delete filtered.email;
  if (!privacySettings?.showPhone) delete filtered.mobileNo;
  if (!privacySettings?.showLocation) {
    delete filtered.city;
    delete filtered.country;
    delete filtered.state;
  }
  
  // Always remove sensitive fields for other users
  delete filtered.password;
  delete filtered.apiToken;
  delete filtered.deviceToken;
  delete filtered.stripeCustomerId;
  delete filtered.stripeSubscriptionId;
  
  return filtered;
};

// Get current user profile with caching
router.get('/user', 
  isAuthenticated,
  cacheMiddleware(
    (req: any) => cacheKeys.userProfile(req.user.claims.sub),
    CACHE_TTL.USER_PROFILE
  ),
  async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ 
        code: 401,
        message: 'User not found',
        data: {}
      });
    }

    res.json({
      code: 200,
      message: 'Record fetched successfully.',
      data: user
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      code: 500,
      message: 'Internal server error. Please try again later.',
      data: {}
    });
  }
});

// Update user profile
router.patch('/user', isAuthenticated, upload.any(), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ 
        code: 401,
        message: 'User not found',
        data: {}
      });
    }

    const files = req.files as Express.Multer.File[];
    const updateData: any = {};
    
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.bio) updateData.bio = req.body.bio;
    if (req.body.country) updateData.country = req.body.country;
    if (req.body.city) updateData.city = req.body.city;
    if (req.body.facebook_url) updateData.facebookUrl = req.body.facebook_url;
    
    const profileImageFile = files?.find(file => file.fieldname === 'image_url');
    const backgroundImageFile = files?.find(file => file.fieldname === 'background_url');
    
    if (profileImageFile) updateData.profileImage = `/uploads/${profileImageFile.filename}`;
    if (backgroundImageFile) updateData.backgroundImage = `/uploads/${backgroundImageFile.filename}`;

    const updatedUser = await storage.updateUser(user.id, updateData);

    res.json({
      code: 200,
      message: 'Record updated successfully.',
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      code: 500,
      message: 'Internal server error. Please try again later.',
      data: {}
    });
  }
});

// User Settings Routes with caching
router.get("/user/settings", 
  setUserContext,
  cacheMiddleware(
    (req: any) => cacheKeys.userSettings(getUserId(req) || 'anonymous'),
    CACHE_TTL.USER_SETTINGS
  ),
  async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user settings from database
    const settings = await storage.getUserSettings(Number(userId));
    
    // Return default settings if none exist
    if (!settings) {
      return res.json({
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          eventReminders: true,
          newFollowerAlerts: true,
          messageAlerts: true,
          groupInvites: true,
          weeklyDigest: false,
          marketingEmails: false
        },
        privacy: {
          profileVisibility: 'public',
          showLocation: true,
          showEmail: false,
          showPhone: false,
          allowMessagesFrom: 'friends',
          showActivityStatus: true,
          allowTagging: true,
          showInSearch: true
        },
        appearance: {
          theme: 'light',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          fontSize: 'medium',
          reduceMotion: false
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/user/settings", setUserContext, async (req, res) => {
  try {
    const userId = getUserId(req);
    // Invalidate settings cache on update
    if (userId) {
      apiCache.delete(cacheKeys.userSettings(userId));
      apiCache.delete(cacheKeys.userProfile(userId));
    }
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { notifications, privacy, appearance } = req.body;

    // Validate and save settings
    await storage.updateUserSettings(Number(userId), {
      notifications,
      privacy,
      appearance
    });

    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Get user profile by ID (with privacy enforcement and caching)
router.get('/user/:userId', 
  setUserContext,
  cacheMiddleware(
    (req: any) => cacheKeys.userProfile(req.params.userId),
    CACHE_TTL.USER_PROFILE
  ),
  async (req: any, res) => {
  try {
    const requesterId = getUserId(req);
    const targetUserId = parseInt(req.params.userId);
    
    if (!requesterId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Get target user
    const targetUser = await storage.getUser(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get privacy settings
    const userSettings = await storage.getUserSettings(targetUserId);
    
    // Check privacy enforcement
    const hasAccess = await enforcePrivacy(Number(requesterId), targetUserId, userSettings);
    if (!hasAccess) {
      return res.status(403).json({ 
        error: "This profile is private",
        message: "You don't have permission to view this profile"
      });
    }
    
    // Filter data based on privacy settings
    const isOwnProfile = requesterId === targetUserId;
    const filteredData = filterUserDataByPrivacy(targetUser, isOwnProfile, userSettings?.privacy);
    
    res.json({
      success: true,
      data: filteredData
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// Update user profile (for EditProfileModal)
router.put('/user/profile', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    // Invalidate cache on profile update
    if (userId) {
      apiCache.delete(cacheKeys.userProfile(userId));
      apiCache.delete(cacheKeys.userPosts(userId));
      apiCache.delete(cacheKeys.userStats(userId));
    }
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updateData: any = {};
    
    // Handle all profile fields from EditProfileModal
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.bio !== undefined) updateData.bio = req.body.bio;
    if (req.body.city !== undefined) updateData.city = req.body.city;
    if (req.body.country !== undefined) updateData.country = req.body.country;
    if (req.body.tangoRoles !== undefined) updateData.tangoRoles = req.body.tangoRoles;
    if (req.body.yearsOfDancing !== undefined) updateData.yearsOfDancing = parseInt(req.body.yearsOfDancing) || 0;
    if (req.body.leaderLevel !== undefined) updateData.leaderLevel = parseInt(req.body.leaderLevel) || 0;
    if (req.body.followerLevel !== undefined) updateData.followerLevel = parseInt(req.body.followerLevel) || 0;
    if (req.body.languages !== undefined) updateData.languages = req.body.languages;
    
    // Handle social links - store in user table directly for now
    if (req.body.instagram !== undefined) updateData.instagram = req.body.instagram;
    if (req.body.facebook !== undefined) updateData.facebookUrl = req.body.facebook;
    if (req.body.twitter !== undefined) updateData.twitter = req.body.twitter;
    if (req.body.website !== undefined) updateData.website = req.body.website;

    // Update user in database
    const updatedUser = await storage.updateUser(Number(userId), updateData);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

export default router;