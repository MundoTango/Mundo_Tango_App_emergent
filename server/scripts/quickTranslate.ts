#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';
import { translateText } from '../services/translationService';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Priority languages
const PRIORITY_LANGUAGES = ['es-AR-lunfardo', 'it', 'fr', 'ko', 'zh'];

// Core UI translations to generate
const CORE_UI = {
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    ok: "OK",
    close: "Close",
    back: "Back",
    home: "Home",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    signup: "Sign Up",
    language: "Language",
    theme: "Theme",
    notifications: "Notifications",
    messages: "Messages",
    friends: "Friends",
    groups: "Groups",
    events: "Events",
    posts: "Posts",
    photos: "Photos",
    videos: "Videos",
    share: "Share",
    like: "Like",
    comment: "Comment",
    follow: "Follow",
    unfollow: "Unfollow",
    online: "Online",
    offline: "Offline",
    preferred: "Preferred",
    popular: "Popular",
    new: "New",
    trending: "Trending",
    featured: "Featured",
  },
  navigation: {
    feed: "Feed",
    discover: "Discover",
    explore: "Explore",
    community: "Community",
    marketplace: "Marketplace",
    resources: "Resources",
    help: "Help",
    about: "About",
    contact: "Contact",
    dashboard: "Dashboard",
    admin: "Admin",
    moderator: "Moderator",
  },
  tango: {
    milonga: "Milonga",
    practica: "Practice",
    workshop: "Workshop",
    festival: "Festival",
    teacher: "Teacher",
    student: "Student",
    dancer: "Dancer",
    musician: "Musician",
    dj: "DJ",
    organizer: "Organizer",
    venue: "Venue",
    tangoPartner: "Tango Partner",
    cabeceo: "Cabeceo",
    tanda: "Tanda",
    cortina: "Cortina",
    embrace: "Embrace",
    tangoShoes: "Tango Shoes",
    tangoMusic: "Tango Music",
    tangoHistory: "Tango History",
    buenosAires: "Buenos Aires",
    argentina: "Argentina",
    porteño: "Porteño",
    lunfardo: "Lunfardo",
  },
  lifeceo: {
    aiAgents: "AI Agents",
    lifeManagement: "Life Management",
    personalGrowth: "Personal Growth",
    goals: "Goals",
    habits: "Habits",
    productivity: "Productivity",
    wellness: "Wellness",
    finance: "Finance",
    relationships: "Relationships",
    career: "Career",
    learning: "Learning",
    creativity: "Creativity",
    timeManagement: "Time Management",
    taskManager: "Task Manager",
    calendar: "Calendar",
    journal: "Journal",
    insights: "Insights",
    recommendations: "Recommendations",
    progress: "Progress",
    achievements: "Achievements",
    challenges: "Challenges",
    opportunities: "Opportunities",
    esaFramework: "ESA Framework",
  },
  auth: {
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    rememberMe: "Remember Me",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    signInWith: "Sign in with",
    or: "Or",
    termsAndConditions: "Terms and Conditions",
    privacyPolicy: "Privacy Policy",
    agreeToTerms: "I agree to the terms and conditions",
    verifyEmail: "Verify Email",
    emailVerified: "Email Verified",
    resendVerification: "Resend Verification",
    accountCreated: "Account Created Successfully",
    welcomeBack: "Welcome Back",
  },
  messages: {
    noMessages: "No messages",
    newMessage: "New message",
    typeMessage: "Type a message...",
    sendMessage: "Send message",
    messageDeleted: "Message deleted",
    messageSent: "Message sent",
    markAsRead: "Mark as read",
    markAsUnread: "Mark as unread",
    reply: "Reply",
    forward: "Forward",
    archive: "Archive",
    unarchive: "Unarchive",
    conversation: "Conversation",
    startConversation: "Start a conversation",
  },
  errors: {
    somethingWentWrong: "Something went wrong",
    tryAgain: "Please try again",
    networkError: "Network error",
    serverError: "Server error",
    invalidCredentials: "Invalid credentials",
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    notFound: "Not found",
    validationError: "Validation error",
    requiredField: "This field is required",
    invalidEmail: "Invalid email address",
    passwordTooShort: "Password too short",
    passwordMismatch: "Passwords do not match",
    userNotFound: "User not found",
    accountLocked: "Account locked",
    sessionExpired: "Session expired",
    tooManyRequests: "Too many requests",
  },
  success: {
    dataSaved: "Data saved successfully",
    profileUpdated: "Profile updated",
    passwordChanged: "Password changed",
    emailSent: "Email sent",
    accountCreated: "Account created",
    loginSuccessful: "Login successful",
    logoutSuccessful: "Logout successful",
    operationCompleted: "Operation completed",
    fileUploaded: "File uploaded",
    postCreated: "Post created",
    commentAdded: "Comment added",
    friendRequestSent: "Friend request sent",
    friendRequestAccepted: "Friend request accepted",
    groupJoined: "Group joined",
    eventCreated: "Event created",
    registrationComplete: "Registration complete",
  },
  settings: {
    accountSettings: "Account Settings",
    profileSettings: "Profile Settings",
    privacySettings: "Privacy Settings",
    notificationSettings: "Notification Settings",
    securitySettings: "Security Settings",
    languageSettings: "Language Settings",
    themeSettings: "Theme Settings",
    dataAndStorage: "Data & Storage",
    helpAndSupport: "Help & Support",
    aboutApp: "About App",
    version: "Version",
    checkUpdates: "Check for Updates",
    exportData: "Export Data",
    deleteAccount: "Delete Account",
    twoFactorAuth: "Two-Factor Authentication",
    changePassword: "Change Password",
    connectedAccounts: "Connected Accounts",
    blockedUsers: "Blocked Users",
    selectLanguage: "Select Language",
    chooseLanguage: "Choose Language",
  },
};

async function generateQuickTranslations() {
  console.log('🚀 ESA Layer 53: Quick Translation Generator\n');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found');
    process.exit(1);
  }
  
  const translations: any = {
    en: { translation: CORE_UI }
  };
  
  console.log(`📊 Translating ${Object.keys(CORE_UI).length} sections with ${
    Object.values(CORE_UI).reduce((acc, section) => 
      acc + Object.keys(section as any).length, 0
    )
  } total strings\n`);
  
  for (const lang of PRIORITY_LANGUAGES) {
    console.log(`\n🌐 Translating to ${lang}...`);
    translations[lang] = { translation: {} };
    
    for (const [section, strings] of Object.entries(CORE_UI)) {
      console.log(`  📁 Section: ${section}`);
      translations[lang].translation[section] = {};
      
      // Batch translate strings for efficiency
      const entries = Object.entries(strings);
      const batchSize = 10;
      
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, Math.min(i + batchSize, entries.length));
        const promises = batch.map(async ([key, value]) => {
          try {
            const translated = await translateText(value, lang, 'en');
            return { key, translated };
          } catch (error) {
            console.error(`    ⚠️  Failed to translate "${key}"`);
            return { key, translated: value }; // Fallback to English
          }
        });
        
        const results = await Promise.all(promises);
        
        for (const { key, translated } of results) {
          translations[lang].translation[section][key] = translated;
        }
        
        // Progress indicator
        const progress = Math.min(i + batchSize, entries.length);
        console.log(`    ✓ ${progress}/${entries.length} strings`);
      }
    }
    
    console.log(`  ✅ Completed ${lang}`);
  }
  
  // Save translations
  const outputPath = path.join(process.cwd(), 'client/src/i18n/translations.json');
  await fs.writeFile(outputPath, JSON.stringify(translations, null, 2), 'utf-8');
  
  console.log(`\n✅ Translations saved to ${outputPath}`);
  console.log('\n📋 Summary:');
  console.log(`  - Languages: ${PRIORITY_LANGUAGES.length + 1} (including English)`);
  console.log(`  - Sections: ${Object.keys(CORE_UI).length}`);
  console.log(`  - Total translations: ${
    PRIORITY_LANGUAGES.length * Object.values(CORE_UI).reduce((acc, section) => 
      acc + Object.keys(section as any).length, 0
    )
  }`);
}

// Run the generator
generateQuickTranslations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});