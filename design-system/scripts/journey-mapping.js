#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const JOURNEY_OUTPUT = path.join(process.cwd(), 'design-system', 'customer-journeys.json');

// Katie Dill's 15 Essential Journeys for Housing Platform
const journeys = {
  'guest-booking-flow': {
    name: 'Guest Booking Flow',
    steps: [
      { step: 1, action: 'Browse housing marketplace', screen: '/housing', friction: 'None' },
      { step: 2, action: 'Filter by city/dates', screen: '/housing', friction: 'None' },
      { step: 3, action: 'View property details', screen: '/housing/:id', friction: 'None' },
      { step: 4, action: 'Check host friendship level', screen: '/housing/:id', friction: 'Connection-based access' },
      { step: 5, action: 'Initiate booking request', screen: '/housing/:id/book', friction: 'Requires authentication' },
      { step: 6, action: 'Complete guest onboarding', screen: '/onboarding/guest', friction: 'Multi-step form' },
      { step: 7, action: 'Submit booking request', screen: '/housing/:id/book', friction: 'Await host approval' },
      { step: 8, action: 'Receive confirmation', screen: '/bookings/:id', friction: 'None' }
    ],
    totalFriction: 3,
    avgStepTime: '8 minutes'
  },
  'host-onboarding': {
    name: 'Host Property Listing',
    steps: [
      { step: 1, action: 'Navigate to hosting dashboard', screen: '/hosting', friction: 'None' },
      { step: 2, action: 'Start host onboarding', screen: '/onboarding/host', friction: 'Multi-step wizard' },
      { step: 3, action: 'Upload property photos', screen: '/onboarding/host', friction: 'Media upload complexity' },
      { step: 4, action: 'Set property details', screen: '/onboarding/host', friction: 'Form validation' },
      { step: 5, action: 'Configure friendship access', screen: '/onboarding/host', friction: 'Complex permissions' },
      { step: 6, action: 'Publish listing', screen: '/hosting', friction: 'None' }
    ],
    totalFriction: 3,
    avgStepTime: '12 minutes'
  },
  'trip-planning': {
    name: 'Trip Planning with AI',
    steps: [
      { step: 1, action: 'Open city group page', screen: '/city/lisbon', friction: 'None' },
      { step: 2, action: 'Access trip planner', screen: '/city/lisbon/trip-planner', friction: 'None' },
      { step: 3, action: 'Ask AI Life CEO for suggestions', screen: '/city/lisbon/trip-planner', friction: 'None' },
      { step: 4, action: 'Review AI recommendations', screen: '/city/lisbon/trip-planner', friction: 'None' },
      { step: 5, action: 'Add items to itinerary', screen: '/city/lisbon/trip-planner', friction: 'None' },
      { step: 6, action: 'Save and share trip', screen: '/city/lisbon/trip-planner', friction: 'None' }
    ],
    totalFriction: 0,
    avgStepTime: '5 minutes'
  },
  'ai-life-ceo-interaction': {
    name: 'AI Life CEO Conversation',
    steps: [
      { step: 1, action: 'Open AI chat interface', screen: '/life-ceo', friction: 'None' },
      { step: 2, action: 'Select agent (health/finance/etc)', screen: '/life-ceo', friction: 'Agent selection complexity' },
      { step: 3, action: 'Type or voice input message', screen: '/life-ceo', friction: 'None' },
      { step: 4, action: 'Receive streaming response', screen: '/life-ceo', friction: 'None' },
      { step: 5, action: 'View suggested actions', screen: '/life-ceo', friction: 'None' }
    ],
    totalFriction: 1,
    avgStepTime: '3 minutes'
  },
  'event-rsvp': {
    name: 'Event Discovery & RSVP',
    steps: [
      { step: 1, action: 'Browse city events', screen: '/city/lisbon', friction: 'None' },
      { step: 2, action: 'View event details', screen: '/events/:id', friction: 'None' },
      { step: 3, action: 'RSVP to event', screen: '/events/:id', friction: 'Requires authentication' },
      { step: 4, action: 'Add to calendar', screen: '/events/:id', friction: 'None' },
      { step: 5, action: 'Share with friends', screen: '/events/:id', friction: 'None' }
    ],
    totalFriction: 1,
    avgStepTime: '2 minutes'
  },
  'recommendation-creation': {
    name: 'Create Recommendation',
    steps: [
      { step: 1, action: 'Navigate to recommendations', screen: '/recommendations', friction: 'None' },
      { step: 2, action: 'Click "Add Recommendation"', screen: '/recommendations/create', friction: 'None' },
      { step: 3, action: 'Fill recommendation form', screen: '/recommendations/create', friction: 'Form complexity' },
      { step: 4, action: 'Upload photos', screen: '/recommendations/create', friction: 'Media upload' },
      { step: 5, action: 'Select city & category', screen: '/recommendations/create', friction: 'None' },
      { step: 6, action: 'Publish recommendation', screen: '/recommendations', friction: 'None' }
    ],
    totalFriction: 2,
    avgStepTime: '6 minutes'
  },
  'marketplace-browsing': {
    name: 'Marketplace Browsing',
    steps: [
      { step: 1, action: 'Open marketplace', screen: '/housing', friction: 'None' },
      { step: 2, action: 'View map with pins', screen: '/housing', friction: 'Map loading time' },
      { step: 3, action: 'Apply 3-layer filters', screen: '/housing', friction: 'Complex filtering' },
      { step: 4, action: 'View property cards', screen: '/housing', friction: 'None' },
      { step: 5, action: 'Compare properties', screen: '/housing', friction: 'No comparison UI' }
    ],
    totalFriction: 3,
    avgStepTime: '10 minutes'
  },
  'language-switching': {
    name: 'Language Switching (i18n)',
    steps: [
      { step: 1, action: 'Click language selector', screen: 'Any page', friction: 'None' },
      { step: 2, action: 'Select from 6 languages', screen: 'Any page', friction: 'None' },
      { step: 3, action: 'Page re-renders with translations', screen: 'Any page', friction: 'Brief loading' }
    ],
    totalFriction: 1,
    avgStepTime: '10 seconds'
  },
  'dark-mode-toggle': {
    name: 'Dark Mode Toggle',
    steps: [
      { step: 1, action: 'Click theme toggle', screen: 'Any page', friction: 'None' },
      { step: 2, action: 'Theme switches instantly', screen: 'Any page', friction: 'None' }
    ],
    totalFriction: 0,
    avgStepTime: '2 seconds'
  },
  'media-upload': {
    name: 'Media Upload Flow',
    steps: [
      { step: 1, action: 'Select upload method', screen: 'Upload modal', friction: 'Multiple options confusion' },
      { step: 2, action: 'Choose file/URL/YouTube', screen: 'Upload modal', friction: 'None' },
      { step: 3, action: 'Client-side compression', screen: 'Upload modal', friction: 'Processing time' },
      { step: 4, action: 'Upload to server/Cloudinary', screen: 'Upload modal', friction: 'Network speed' },
      { step: 5, action: 'Preview uploaded media', screen: 'Upload modal', friction: 'None' }
    ],
    totalFriction: 3,
    avgStepTime: '4 minutes'
  },
  'profile-management': {
    name: 'User Profile Management',
    steps: [
      { step: 1, action: 'Navigate to profile', screen: '/profile', friction: 'None' },
      { step: 2, action: 'Edit profile information', screen: '/profile/edit', friction: 'Complex form' },
      { step: 3, action: 'Update travel details', screen: '/profile/edit', friction: 'None' },
      { step: 4, action: 'Set community roles', screen: '/profile/edit', friction: 'Role complexity' },
      { step: 5, action: 'Save changes', screen: '/profile', friction: 'None' }
    ],
    totalFriction: 2,
    avgStepTime: '7 minutes'
  },
  'admin-analytics': {
    name: 'Admin Analytics Dashboard',
    steps: [
      { step: 1, action: 'Login as admin', screen: '/login', friction: '2FA authentication' },
      { step: 2, action: 'Access admin center', screen: '/admin', friction: 'None' },
      { step: 3, action: 'View analytics dashboard', screen: '/admin/analytics', friction: 'Chart loading time' },
      { step: 4, action: 'Filter by date/metric', screen: '/admin/analytics', friction: 'None' },
      { step: 5, action: 'Export reports', screen: '/admin/analytics', friction: 'Export processing' }
    ],
    totalFriction: 3,
    avgStepTime: '8 minutes'
  },
  'content-reporting': {
    name: 'Content Reporting & Moderation',
    steps: [
      { step: 1, action: 'Click report button', screen: 'Content page', friction: 'None' },
      { step: 2, action: 'Select report reason', screen: 'Report modal', friction: 'None' },
      { step: 3, action: 'Add description', screen: 'Report modal', friction: 'Optional field' },
      { step: 4, action: 'Submit report', screen: 'Report modal', friction: 'None' },
      { step: 5, action: 'Admin reviews in queue', screen: '/admin/reports', friction: 'Moderation delay' }
    ],
    totalFriction: 1,
    avgStepTime: '3 minutes'
  },
  'user-onboarding': {
    name: 'New User Onboarding',
    steps: [
      { step: 1, action: 'Create account', screen: '/signup', friction: 'Form validation' },
      { step: 2, action: 'Verify email', screen: 'Email', friction: 'Email delivery delay' },
      { step: 3, action: 'Complete profile wizard', screen: '/onboarding', friction: 'Multi-step process' },
      { step: 4, action: 'Join communities', screen: '/onboarding', friction: 'Selection complexity' },
      { step: 5, action: 'Tour platform features', screen: '/dashboard', friction: 'Tutorial length' }
    ],
    totalFriction: 5,
    avgStepTime: '15 minutes'
  },
  'community-joining': {
    name: 'Community Discovery & Joining',
    steps: [
      { step: 1, action: 'Browse communities', screen: '/communities', friction: 'None' },
      { step: 2, action: 'View city group details', screen: '/city/lisbon', friction: 'None' },
      { step: 3, action: 'Join city group', screen: '/city/lisbon', friction: 'None' },
      { step: 4, action: 'See updated feed', screen: '/city/lisbon', friction: 'Feed refresh delay' }
    ],
    totalFriction: 1,
    avgStepTime: '3 minutes'
  }
};

// Calculate friction log (Katie Dill methodology)
const frictionLog = Object.entries(journeys).map(([id, journey]) => ({
  journeyId: id,
  name: journey.name,
  totalSteps: journey.steps.length,
  frictionPoints: journey.totalFriction,
  avgCompletionTime: journey.avgStepTime,
  frictionScore: (journey.totalFriction / journey.steps.length * 100).toFixed(1),
  criticalIssues: journey.steps.filter(s => s.friction !== 'None').map(s => ({
    step: s.step,
    issue: s.friction
  }))
})).sort((a, b) => parseFloat(b.frictionScore) - parseFloat(a.frictionScore));

const report = {
  timestamp: new Date().toISOString(),
  totalJourneys: Object.keys(journeys).length,
  journeyDetails: journeys,
  frictionAnalysis: frictionLog,
  summary: {
    highestFriction: frictionLog[0],
    lowestFriction: frictionLog[frictionLog.length - 1],
    avgFrictionScore: (frictionLog.reduce((sum, j) => sum + parseFloat(j.frictionScore), 0) / frictionLog.length).toFixed(1)
  }
};

fs.writeFileSync(JOURNEY_OUTPUT, JSON.stringify(report, null, 2));

console.log('🗺️ Customer Journey Mapping Complete!\n');
console.log(`Total Journeys Mapped: ${Object.keys(journeys).length}`);
console.log(`\nFriction Analysis (Highest to Lowest):`);
frictionLog.forEach((journey, index) => {
  console.log(`  ${index + 1}. ${journey.name}: ${journey.frictionScore}% friction (${journey.frictionPoints}/${journey.totalSteps} steps)`);
});
console.log(`\nAverage Friction Score: ${report.summary.avgFrictionScore}%`);
console.log(`\n📄 Full journey map saved to: ${JOURNEY_OUTPUT}\n`);

process.exit(0);
