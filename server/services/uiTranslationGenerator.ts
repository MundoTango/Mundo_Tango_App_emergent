import { promises as fs } from 'fs';
import path from 'path';
import { translateObject, getSupportedLanguages, batchTranslate } from './translationService';

// UI translations structure
interface UITranslations {
  [languageCode: string]: {
    translation: TranslationContent;
  };
}

interface TranslationContent {
  nav: any;
  sidebar: any;
  memories: any;
  community: any;
  events: any;
  messages: any;
  groups: any;
  friends: any;
  settings: any;
  common: any;
  notifications: any;
  auth: any;
  profile: any;
  admin: any;
  errors: any;
  [key: string]: any;
}

// Get comprehensive UI strings for the platform
function getDefaultUIStrings(): TranslationContent {
  return {
    nav: {
      search: 'Search',
      notifications: 'Notifications',
      messages: 'Messages',
      favorites: 'Favorites',
      language: 'Language',
      theme: 'Theme',
      profile: 'Profile',
      settings: 'Settings',
      admin: 'Admin',
      billing: 'Billing',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
    },
    sidebar: {
      memories: 'Memories',
      tangoCommunity: 'Tango Community',
      friends: 'Friends',
      messages: 'Messages',
      groups: 'Groups',
      events: 'Events',
      roleInvitations: 'Role Invitations',
      menu: 'MENU',
      globalStatistics: 'GLOBAL STATISTICS',
      globalDancers: 'Global Dancers',
      activeEvents: 'Active Events',
      communities: 'Communities',
      yourCity: 'Your City',
    },
    memories: {
      title: 'Memories',
      shareMemory: 'Share your tango moment...',
      postVisibility: 'Post visibility',
      public: 'Public',
      private: 'Private',
      friendsOnly: 'Friends Only',
      shareRecommendation: 'Share a recommendation',
      helpOthers: 'Help others discover amazing places',
      searchVenues: 'Search for venues, restaurants, milongas...',
      addTags: 'Add tags to your memory',
      uploadMedia: 'Upload Media Files',
      supportFormats: 'Support images and videos - Max 30 files - Up to 500MB each',
      milonga: 'Milonga',
      practica: 'Práctica',
      performance: 'Performance',
      workshop: 'Workshop',
      festival: 'Festival',
      travel: 'Travel',
      music: 'Music',
      fashion: 'Fashion',
    },
    community: {
      feed: 'Community Feed',
      trending: 'Trending',
      following: 'Following',
      discover: 'Discover',
      createPost: 'Create Post',
      likePost: 'Like',
      commentPost: 'Comment',
      sharePost: 'Share',
      reportPost: 'Report',
      deletePost: 'Delete',
      editPost: 'Edit',
      viewProfile: 'View Profile',
      follow: 'Follow',
      unfollow: 'Unfollow',
      block: 'Block',
      unblock: 'Unblock',
    },
    events: {
      upcomingEvents: 'Upcoming Events',
      pastEvents: 'Past Events',
      myEvents: 'My Events',
      createEvent: 'Create Event',
      eventDetails: 'Event Details',
      eventName: 'Event Name',
      eventDate: 'Date',
      eventTime: 'Time',
      eventLocation: 'Location',
      eventDescription: 'Description',
      eventCapacity: 'Capacity',
      eventPrice: 'Price',
      free: 'Free',
      paid: 'Paid',
      register: 'Register',
      unregister: 'Cancel Registration',
      attendees: 'Attendees',
      waitlist: 'Waitlist',
      milongaNight: 'Milonga Night',
      tangoFestival: 'Tango Festival',
      beginnerWorkshop: 'Beginner Tango Workshop',
      advancedWorkshop: 'Advanced Workshop',
      practice: 'Practice',
    },
    messages: {
      inbox: 'Inbox',
      sent: 'Sent',
      archived: 'Archived',
      compose: 'Compose',
      newMessage: 'New Message',
      to: 'To',
      subject: 'Subject',
      message: 'Message',
      send: 'Send',
      reply: 'Reply',
      forward: 'Forward',
      delete: 'Delete',
      markAsRead: 'Mark as Read',
      markAsUnread: 'Mark as Unread',
      noMessages: 'No messages',
      typeMessage: 'Type a message...',
      online: 'Online',
      offline: 'Offline',
      typing: 'is typing...',
    },
    groups: {
      myGroups: 'My Groups',
      discoverGroups: 'Discover Groups',
      createGroup: 'Create Group',
      groupName: 'Group Name',
      groupDescription: 'Description',
      groupRules: 'Group Rules',
      groupMembers: 'Members',
      groupPosts: 'Posts',
      joinGroup: 'Join Group',
      leaveGroup: 'Leave Group',
      inviteMembers: 'Invite Members',
      groupSettings: 'Group Settings',
      groupAdmin: 'Admin',
      groupModerator: 'Moderator',
      groupMember: 'Member',
      publicGroup: 'Public Group',
      privateGroup: 'Private Group',
      cityGroup: 'City Group',
      practiceGroup: 'Practice Group',
      performanceGroup: 'Performance Group',
    },
    friends: {
      myFriends: 'My Friends',
      findFriends: 'Find Friends',
      friendRequests: 'Friend Requests',
      sentRequests: 'Sent Requests',
      addFriend: 'Add Friend',
      removeFriend: 'Remove Friend',
      acceptRequest: 'Accept',
      declineRequest: 'Decline',
      cancelRequest: 'Cancel Request',
      mutualFriends: 'Mutual Friends',
      suggestedFriends: 'Suggested Friends',
      searchFriends: 'Search friends...',
      onlineNow: 'Online Now',
      lastSeen: 'Last seen',
    },
    settings: {
      accountSettings: 'Account Settings',
      profileSettings: 'Profile Settings',
      privacySettings: 'Privacy Settings',
      notificationSettings: 'Notification Settings',
      securitySettings: 'Security Settings',
      languageSettings: 'Language Settings',
      themeSettings: 'Theme Settings',
      changePassword: 'Change Password',
      twoFactorAuth: 'Two-Factor Authentication',
      deleteAccount: 'Delete Account',
      exportData: 'Export My Data',
      blockedUsers: 'Blocked Users',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      languageChanged: 'Language Changed',
      languageChangedDesc: 'Interface language changed to {{language}}',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      more: 'More',
      less: 'Less',
      all: 'All',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      viewAll: 'View All',
      seeMore: 'See More',
      seeLess: 'See Less',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      week: 'Week',
      month: 'Month',
      year: 'Year',
      am: 'AM',
      pm: 'PM',
    },
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      clearAll: 'Clear all',
      noNotifications: 'No notifications',
      newMessage: 'New message from {{user}}',
      friendRequest: '{{user}} sent you a friend request',
      eventInvite: 'You are invited to {{event}}',
      eventReminder: 'Reminder: {{event}} starts in {{time}}',
      groupInvite: '{{user}} invited you to join {{group}}',
      postLike: '{{user}} liked your post',
      postComment: '{{user}} commented on your post',
      postShare: '{{user}} shared your post',
      eventUpdate: '{{event}} has been updated',
      systemUpdate: 'System update: {{message}}',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      username: 'Username',
      firstName: 'First Name',
      lastName: 'Last Name',
      rememberMe: 'Remember Me',
      signInWith: 'Sign in with',
      signUpWith: 'Sign up with',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      termsAndConditions: 'Terms and Conditions',
      privacyPolicy: 'Privacy Policy',
      agreeToTerms: 'I agree to the Terms and Privacy Policy',
      verifyEmail: 'Verify your email',
      checkEmail: 'Check your email for verification link',
    },
    profile: {
      myProfile: 'My Profile',
      editProfile: 'Edit Profile',
      viewProfile: 'View Profile',
      bio: 'Bio',
      location: 'Location',
      website: 'Website',
      joined: 'Joined',
      followers: 'Followers',
      following: 'Following',
      posts: 'Posts',
      photos: 'Photos',
      videos: 'Videos',
      about: 'About',
      interests: 'Interests',
      achievements: 'Achievements',
      dancingStyle: 'Dancing Style',
      experienceLevel: 'Experience Level',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      professional: 'Professional',
      teacher: 'Teacher',
      performer: 'Performer',
      socialDancer: 'Social Dancer',
    },
    admin: {
      dashboard: 'Admin Dashboard',
      userManagement: 'User Management',
      contentModeration: 'Content Moderation',
      systemSettings: 'System Settings',
      analytics: 'Analytics',
      reports: 'Reports',
      logs: 'System Logs',
      backups: 'Backups',
      maintenance: 'Maintenance',
      announcements: 'Announcements',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      newUsers: 'New Users',
      reportedContent: 'Reported Content',
      pendingReviews: 'Pending Reviews',
      systemStatus: 'System Status',
      serverHealth: 'Server Health',
      databaseStatus: 'Database Status',
      cacheStatus: 'Cache Status',
      apiUsage: 'API Usage',
    },
    errors: {
      pageNotFound: 'Page Not Found',
      unauthorized: 'Unauthorized Access',
      serverError: 'Server Error',
      networkError: 'Network Error',
      validationError: 'Validation Error',
      requiredField: 'This field is required',
      invalidEmail: 'Invalid email address',
      passwordTooShort: 'Password must be at least 8 characters',
      passwordMismatch: 'Passwords do not match',
      userNotFound: 'User not found',
      incorrectPassword: 'Incorrect password',
      emailAlreadyExists: 'Email already exists',
      usernameAlreadyExists: 'Username already exists',
      sessionExpired: 'Session expired, please login again',
      accessDenied: 'Access denied',
      rateLimitExceeded: 'Too many requests, please try again later',
      fileUploadError: 'File upload failed',
      fileTooLarge: 'File size exceeds limit',
      invalidFileType: 'Invalid file type',
      somethingWentWrong: 'Something went wrong, please try again',
    },
  };
}

// Generate translations for all UI strings
export async function generateUITranslations(
  targetLanguages?: string[],
  progressCallback?: (current: number, total: number, language: string) => void
): Promise<UITranslations> {
  const baseStrings = getDefaultUIStrings();
  const languages = targetLanguages || getSupportedLanguages();
  const translations: UITranslations = {};
  
  // Always include English as base
  translations['en'] = {
    translation: baseStrings,
  };
  
  // Priority languages first
  const priorityLangs = ['es-AR-lunfardo', 'it', 'fr', 'ko', 'zh'];
  const otherLangs = languages.filter(l => l !== 'en' && !priorityLangs.includes(l));
  const orderedLanguages = [...priorityLangs, ...otherLangs];
  
  let current = 0;
  const total = orderedLanguages.length;
  
  for (const language of orderedLanguages) {
    current++;
    
    if (progressCallback) {
      progressCallback(current, total, language);
    }
    
    console.log(`Generating UI translations for ${language}...`);
    
    try {
      // Translate the entire object structure
      const translatedContent = await translateObject(baseStrings, language, 'Mundo Tango UI');
      
      translations[language] = {
        translation: translatedContent,
      };
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error translating UI for ${language}:`, error);
      // Use English as fallback
      translations[language] = {
        translation: baseStrings,
      };
    }
  }
  
  return translations;
}

// Write translations to i18n config file
export async function updateI18nConfig(translations: UITranslations): Promise<void> {
  const configPath = path.join(process.cwd(), 'client/src/i18n/translations.json');
  
  try {
    // Write translations as JSON for easy import
    await fs.writeFile(
      configPath,
      JSON.stringify(translations, null, 2),
      'utf-8'
    );
    
    console.log(`Translations written to ${configPath}`);
    
    // Also update the i18n config to import these translations
    await updateI18nConfigImport();
  } catch (error) {
    console.error('Error updating i18n config:', error);
    throw error;
  }
}

// Update the i18n config to use the new translations
async function updateI18nConfigImport(): Promise<void> {
  const configPath = path.join(process.cwd(), 'client/src/i18n/config.ts');
  
  try {
    let content = await fs.readFile(configPath, 'utf-8');
    
    // Add import for translations if not present
    if (!content.includes('import translations from')) {
      const importStatement = "import translations from './translations.json';\n";
      content = importStatement + content;
    }
    
    // Replace the resources object to use imported translations
    const resourcesRegex = /const resources = {[\s\S]*?^};/m;
    
    if (resourcesRegex.test(content)) {
      content = content.replace(resourcesRegex, 'const resources = translations;');
    }
    
    await fs.writeFile(configPath, content, 'utf-8');
    
    console.log('Updated i18n config to use generated translations');
  } catch (error) {
    console.error('Error updating i18n config import:', error);
    throw error;
  }
}

// Generate translations for specific sections only
export async function generateSectionTranslations(
  sections: string[],
  targetLanguages: string[]
): Promise<any> {
  const baseStrings = getDefaultUIStrings();
  const sectionTranslations: any = {};
  
  for (const section of sections) {
    if (!(section in baseStrings)) {
      console.warn(`Section ${section} not found in UI strings`);
      continue;
    }
    
    sectionTranslations[section] = {};
    
    for (const language of targetLanguages) {
      const translated = await translateObject(
        baseStrings[section as keyof TranslationContent],
        language,
        `Mundo Tango ${section} section`
      );
      
      sectionTranslations[section][language] = translated;
    }
  }
  
  return sectionTranslations;
}

// Extract translatable strings from React components
export async function extractStringsFromComponents(
  componentsDir: string
): Promise<Set<string>> {
  const strings = new Set<string>();
  
  async function scanDirectory(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Extract t() and i18n.t() calls
        const tMatches = content.matchAll(/t\(['"`]([^'"`]+)['"`]\)/g);
        const i18nMatches = content.matchAll(/i18n\.t\(['"`]([^'"`]+)['"`]\)/g);
        
        for (const match of tMatches) {
          strings.add(match[1]);
        }
        
        for (const match of i18nMatches) {
          strings.add(match[1]);
        }
      }
    }
  }
  
  await scanDirectory(componentsDir);
  return strings;
}