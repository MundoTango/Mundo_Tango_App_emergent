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

// Calculate profile completion percentage - Fixed for database field names
const calculateProfileCompletion = (userData: any): number => {
  if (!userData) return 0;
  
  // These are the actual database field names (snake_case as per schema)
  const requiredFields = ['username', 'name', 'email'];
  const optionalFields = [
    'bio', 
    'city', 
    'country', 
    'profile_image',  // Use actual database column name
    'background_image',  // Use actual database column name
    'tango_roles',  // Use actual database column name
    'years_of_dancing',  // Use actual database column name
    'occupation', 
    'first_name',  // Use actual database column name
    'last_name'  // Use actual database column name
  ];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  requiredFields.forEach(field => {
    if (userData[field]) completedRequired++;
  });
  
  optionalFields.forEach(field => {
    const value = userData[field];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) completedOptional++;
      } else {
        completedOptional++;
      }
    }
  });
  
  // Required fields are worth 60%, optional fields worth 40%
  const requiredPercentage = (completedRequired / requiredFields.length) * 60;
  const optionalPercentage = (completedOptional / optionalFields.length) * 40;
  
  return Math.round(requiredPercentage + optionalPercentage);
};

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
  if (isOwnProfile) {
    // For own profile, return everything except password
    const { password, ...safeData } = userData;
    return safeData;
  }
  
  const filtered = { ...userData };
  
  // IMPORTANT: Always include username - it's public information
  // Never remove username as it's needed for profile display
  // Ensure username is ALWAYS preserved
  const username = userData.username; // Save username before any deletions
  
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
  
  // Restore username if it was accidentally deleted
  if (username && !filtered.username) {
    filtered.username = username;
  }
  
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

    // Add profile completion to user data
    const userWithCompletion = {
      ...user,
      profileCompletion: calculateProfileCompletion(user)
    };
    
    res.json({
      code: 200,
      message: 'Record fetched successfully.',
      data: userWithCompletion
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
    const isOwnProfile = Number(requesterId) === targetUserId;
    const filteredData = filterUserDataByPrivacy(targetUser, isOwnProfile, userSettings?.privacy);
    
    // Add profile completion to the response
    const dataWithCompletion = {
      ...filteredData,
      profileCompletion: calculateProfileCompletion(targetUser)
    };
    
    res.json({
      success: true,
      data: dataWithCompletion
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// Update user profile (for EditProfileModal) - Fixed for production
router.put('/user/profile', setUserContext, async (req: any, res) => {
  try {
    // Get current user ID with proper error handling
    const userId = getUserId(req);
    if (!userId) {
      console.error('PUT /api/user/profile - No userId found in request');
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "User not authenticated",
        code: 401 
      });
    }
    
    // Convert userId to number for consistency
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (isNaN(numericUserId)) {
      console.error('PUT /api/user/profile - Invalid userId format:', userId);
      return res.status(400).json({ 
        error: "Invalid user ID",
        message: "User ID must be a valid number",
        code: 400 
      });
    }
    
    // Get current user to check permissions
    const currentUser = await storage.getUser(numericUserId);
    if (!currentUser) {
      console.error('PUT /api/user/profile - User not found:', numericUserId);
      return res.status(404).json({ 
        error: "User not found",
        message: "Current user does not exist",
        code: 404 
      });
    }
    
    // Check if user is admin (can edit any profile)
    const isAdmin = currentUser.email === 'admin@mundotango.life' || 
                    await storage.userHasRole(numericUserId, 'super_admin') ||
                    await storage.userHasRole(numericUserId, 'admin');
    
    // Determine which profile to update
    let targetUserId = numericUserId;
    if (req.body.userId && req.body.userId !== numericUserId.toString()) {
      // Trying to edit another user's profile
      targetUserId = parseInt(req.body.userId, 10);
      if (isNaN(targetUserId)) {
        return res.status(400).json({ 
          error: "Invalid target user ID",
          message: "Target user ID must be a valid number",
          code: 400 
        });
      }
      
      // Only admins can edit other users' profiles
      if (!isAdmin) {
        console.error('PUT /api/user/profile - Non-admin trying to edit another profile');
        return res.status(403).json({ 
          error: "Forbidden",
          message: "You can only edit your own profile",
          code: 403 
        });
      }
    }
    
    // Build update data object with all possible fields
    const updateData: any = {};
    
    // Handle all profile fields from EditProfileModal
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.username !== undefined) updateData.username = req.body.username;
    if (req.body.bio !== undefined) updateData.bio = req.body.bio;
    if (req.body.city !== undefined) updateData.city = req.body.city;
    if (req.body.country !== undefined) updateData.country = req.body.country;
    if (req.body.state !== undefined) updateData.state = req.body.state;
    if (req.body.occupation !== undefined) updateData.occupation = req.body.occupation;
    if (req.body.firstName !== undefined) updateData.first_name = req.body.firstName;
    if (req.body.lastName !== undefined) updateData.last_name = req.body.lastName;
    if (req.body.tangoRoles !== undefined) updateData.tango_roles = req.body.tangoRoles;
    if (req.body.yearsOfDancing !== undefined) updateData.years_of_dancing = parseInt(req.body.yearsOfDancing) || 0;
    if (req.body.leaderLevel !== undefined) updateData.leader_level = parseInt(req.body.leaderLevel) || 0;
    if (req.body.followerLevel !== undefined) updateData.follower_level = parseInt(req.body.followerLevel) || 0;
    if (req.body.languages !== undefined) updateData.languages = req.body.languages;
    if (req.body.profileImage !== undefined) updateData.profile_image = req.body.profileImage;
    if (req.body.backgroundImage !== undefined) updateData.background_image = req.body.backgroundImage;
    
    // Handle social links - store in user table directly for now
    if (req.body.instagram !== undefined) updateData.instagram = req.body.instagram;
    if (req.body.facebook !== undefined) updateData.facebook_url = req.body.facebook;
    if (req.body.facebookUrl !== undefined) updateData.facebook_url = req.body.facebookUrl;
    if (req.body.twitter !== undefined) updateData.twitter = req.body.twitter;
    if (req.body.website !== undefined) updateData.website = req.body.website;
    
    // Log the update for debugging
    console.log(`PUT /api/user/profile - Updating user ${targetUserId} with:`, Object.keys(updateData));

    // Update user in database
    const updatedUser = await storage.updateUser(targetUserId, updateData);
    
    // Add profile completion to response
    const userWithCompletion = {
      ...updatedUser,
      profileCompletion: calculateProfileCompletion(updatedUser)
    };
    
    // Invalidate cache after successful update
    apiCache.delete(cacheKeys.userProfile(targetUserId.toString()));
    apiCache.delete(cacheKeys.userPosts(targetUserId.toString()));
    apiCache.delete(cacheKeys.userStats(targetUserId.toString()));
    if (targetUserId !== numericUserId) {
      // Also invalidate admin's cache if they edited someone else
      apiCache.delete(cacheKeys.userProfile(numericUserId.toString()));
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: userWithCompletion,
      code: 200
    });
  } catch (error: any) {
    console.error('PUT /api/user/profile - Error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: error.message || 'Internal server error',
      code: 500
    });
  }
});

export default router;