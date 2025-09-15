/**
 * Central export file for all page objects
 * Organize imports by feature areas for better maintainability
 */

// Base Page
export { BasePage } from './BasePage';

// Auth Pages
export { LoginPage } from './auth/LoginPage';
export { RegisterPage } from './auth/RegisterPage';

// Social Pages
export { ProfilePage } from './social/ProfilePage';
export { CommunityPage } from './social/CommunityPage';
export { TimelinePage } from './social/TimelinePage';
export { MessagesPage } from './social/MessagesPage';

// Event Pages
export { EventsPage } from './events/EventsPage';

// Housing Pages
export { HousingMarketplacePage } from './housing/HousingMarketplacePage';

// LifeCEO Pages
export { LifeCEODashboardPage } from './lifeceo/LifeCEODashboardPage';

// Admin Pages
export { AdminDashboardPage } from './admin/AdminDashboardPage';

// Billing Pages
export { BillingPage } from './billing/BillingPage';

// Group Pages
export { GroupsPage } from './groups/GroupsPage';

// Search Pages
export { SearchPage } from './search/SearchPage';

// Onboarding Pages
export { OnboardingPage } from './onboarding/OnboardingPage';

// Guest Onboarding Pages (existing)
export { AccommodationPreferencesPage } from './guest/AccommodationPreferencesPage';
export { DietaryPreferencesPage } from './guest/DietaryPreferencesPage';
export { LanguagesInterestsPage } from './guest/LanguagesInterestsPage';
export { LocationDurationPage } from './guest/LocationDurationPage';

// Guest Onboarding Steps (existing)
export { AccommodationStep } from './guest-onboarding/AccommodationStep';
export { BudgetStep } from './guest-onboarding/BudgetStep';
export { DietaryStep } from './guest-onboarding/DietaryStep';
export { EmergencyContactStep } from './guest-onboarding/EmergencyContactStep';
export { LanguagesInterestsStep } from './guest-onboarding/LanguagesInterestsStep';
export { LocationDurationStep } from './guest-onboarding/LocationDurationStep';

// Registration Pages (existing)
export { CreateAccountPage } from './registration/CreateAccountPage';
export { DancePreferencesPage } from './registration/DancePreferencesPage';
export { LocationSetupPage } from './registration/LocationSetupPage';
export { ProfileDetailsPage } from './registration/ProfileDetailsPage';
export { WelcomeTutorialPage } from './registration/WelcomeTutorialPage';

/**
 * Convenience function to get all page objects
 */
export function getAllPageObjects() {
  const { BasePage } = require('./BasePage');
  const { LoginPage } = require('./auth/LoginPage');
  const { RegisterPage } = require('./auth/RegisterPage');
  const { ProfilePage } = require('./social/ProfilePage');
  const { CommunityPage } = require('./social/CommunityPage');
  const { TimelinePage } = require('./social/TimelinePage');
  const { MessagesPage } = require('./social/MessagesPage');
  const { EventsPage } = require('./events/EventsPage');
  const { HousingMarketplacePage } = require('./housing/HousingMarketplacePage');
  const { LifeCEODashboardPage } = require('./lifeceo/LifeCEODashboardPage');
  const { AdminDashboardPage } = require('./admin/AdminDashboardPage');
  const { BillingPage } = require('./billing/BillingPage');
  const { GroupsPage } = require('./groups/GroupsPage');
  const { SearchPage } = require('./search/SearchPage');
  const { OnboardingPage } = require('./onboarding/OnboardingPage');
  const { AccommodationPreferencesPage } = require('./guest/AccommodationPreferencesPage');
  const { DietaryPreferencesPage } = require('./guest/DietaryPreferencesPage');
  const { LanguagesInterestsPage } = require('./guest/LanguagesInterestsPage');
  const { LocationDurationPage } = require('./guest/LocationDurationPage');
  const { AccommodationStep } = require('./guest-onboarding/AccommodationStep');
  const { BudgetStep } = require('./guest-onboarding/BudgetStep');
  const { DietaryStep } = require('./guest-onboarding/DietaryStep');
  const { EmergencyContactStep } = require('./guest-onboarding/EmergencyContactStep');
  const { LanguagesInterestsStep } = require('./guest-onboarding/LanguagesInterestsStep');
  const { LocationDurationStep } = require('./guest-onboarding/LocationDurationStep');
  const { CreateAccountPage } = require('./registration/CreateAccountPage');
  const { DancePreferencesPage } = require('./registration/DancePreferencesPage');
  const { LocationSetupPage } = require('./registration/LocationSetupPage');
  const { ProfileDetailsPage } = require('./registration/ProfileDetailsPage');
  const { WelcomeTutorialPage } = require('./registration/WelcomeTutorialPage');

  return {
    // Base
    BasePage,
    
    // Auth
    LoginPage,
    RegisterPage,
    
    // Social
    ProfilePage,
    CommunityPage,
    TimelinePage,
    MessagesPage,
    
    // Events
    EventsPage,
    
    // Housing
    HousingMarketplacePage,
    
    // LifeCEO
    LifeCEODashboardPage,
    
    // Admin
    AdminDashboardPage,
    
    // Billing
    BillingPage,
    
    // Groups
    GroupsPage,
    
    // Search
    SearchPage,
    
    // Onboarding
    OnboardingPage,
    
    // Guest Onboarding
    AccommodationPreferencesPage,
    DietaryPreferencesPage,
    LanguagesInterestsPage,
    LocationDurationPage,
    AccommodationStep,
    BudgetStep,
    DietaryStep,
    EmergencyContactStep,
    LanguagesInterestsStep,
    LocationDurationStep,
    
    // Registration
    CreateAccountPage,
    DancePreferencesPage,
    LocationSetupPage,
    ProfileDetailsPage,
    WelcomeTutorialPage,
  };
}

/**
 * Type definitions for page objects
 */
export type PageObjects = ReturnType<typeof getAllPageObjects>;