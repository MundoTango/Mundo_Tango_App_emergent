import { TestUser, TestEvent, TestGroup, TestPost } from '../helpers/types';

/**
 * Test data fixtures for Mundo Tango E2E tests
 */

/**
 * Test users
 */
export const testUsers: Record<string, TestUser> = {
  regularUser: {
    email: 'test.user@mundotango.com',
    password: 'TestPassword123!',
    name: 'Test User',
    role: 'user',
    location: {
      city: 'Buenos Aires',
      country: 'Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
    },
  },
  hostUser: {
    email: 'test.host@mundotango.com',
    password: 'HostPassword123!',
    name: 'Test Host',
    role: 'host',
    location: {
      city: 'Buenos Aires',
      country: 'Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
    },
  },
  adminUser: {
    email: 'test.admin@mundotango.com',
    password: 'AdminPassword123!',
    name: 'Test Admin',
    role: 'admin',
    location: {
      city: 'Buenos Aires',
      country: 'Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
    },
  },
  moderatorUser: {
    email: 'test.moderator@mundotango.com',
    password: 'ModPassword123!',
    name: 'Test Moderator',
    role: 'moderator',
    location: {
      city: 'Buenos Aires',
      country: 'Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
    },
  },
};

/**
 * Test events
 */
export const testEvents: TestEvent[] = [
  {
    title: 'Weekly Milonga at Salon Canning',
    description: 'Traditional milonga with live orchestra every Friday night',
    date: new Date('2025-10-01T22:00:00'),
    location: 'Salon Canning, Buenos Aires',
    capacity: 200,
    price: 500,
    category: 'milonga',
  },
  {
    title: 'Beginner Tango Class',
    description: 'Learn the basics of Argentine Tango',
    date: new Date('2025-10-02T19:00:00'),
    location: 'La Viruta, Buenos Aires',
    capacity: 30,
    price: 300,
    category: 'class',
  },
  {
    title: 'Tango Practice Session',
    description: 'Open practice for all levels',
    date: new Date('2025-10-03T20:00:00'),
    location: 'Centro Cultural Borges',
    capacity: 50,
    price: 0,
    category: 'practica',
  },
  {
    title: 'Advanced Workshop with Maestros',
    description: 'Master class with world-renowned tango dancers',
    date: new Date('2025-10-05T15:00:00'),
    location: 'Teatro Colon',
    capacity: 40,
    price: 1000,
    category: 'workshop',
  },
  {
    title: 'Buenos Aires Tango Festival',
    description: 'Annual tango festival featuring international artists',
    date: new Date('2025-11-15T18:00:00'),
    location: 'Multiple Venues',
    capacity: 5000,
    price: 2000,
    category: 'festival',
  },
];

/**
 * Test groups
 */
export const testGroups: TestGroup[] = [
  {
    name: 'Buenos Aires Tango Community',
    description: 'The main community for tango dancers in Buenos Aires',
    city: 'Buenos Aires',
    type: 'city',
    isPrivate: false,
  },
  {
    name: 'Milonga Lovers',
    description: 'For those who love traditional milongas',
    city: 'Buenos Aires',
    type: 'interest',
    isPrivate: false,
  },
  {
    name: 'Advanced Dancers',
    description: 'Group for experienced dancers to share and practice',
    city: 'Buenos Aires',
    type: 'skill',
    isPrivate: true,
  },
  {
    name: 'Paris Tango Scene',
    description: 'Tango community in Paris',
    city: 'Paris',
    type: 'city',
    isPrivate: false,
  },
];

/**
 * Test posts
 */
export const testPosts: TestPost[] = [
  {
    content: 'Just had an amazing night at Salon Canning! The live orchestra was incredible 🎵',
    type: 'text',
    visibility: 'public',
    tags: ['milonga', 'saloncanning', 'livemusic'],
  },
  {
    content: 'Check out this beautiful moment from last night\'s milonga',
    type: 'image',
    visibility: 'friends',
    media: [
      {
        url: '/test-assets/milonga-photo.jpg',
        type: 'image/jpeg',
      },
    ],
    tags: ['milonga', 'memories'],
  },
  {
    content: 'My tango journey over the past year',
    type: 'video',
    visibility: 'public',
    media: [
      {
        url: '/test-assets/tango-journey.mp4',
        type: 'video/mp4',
      },
    ],
    tags: ['journey', 'progress', 'tango'],
  },
  {
    content: 'Remembering my first milonga in Buenos Aires, 5 years ago today',
    type: 'memory',
    visibility: 'public',
    tags: ['memory', 'milestone', 'buenosaires'],
  },
];

/**
 * Invalid test data for negative testing
 */
export const invalidData = {
  shortPassword: 'Pass1!',
  weakPassword: 'password123',
  invalidEmail: 'notanemail',
  sqlInjection: "'; DROP TABLE users; --",
  xssPayload: '<script>alert("XSS")</script>',
  longString: 'a'.repeat(10000),
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  emptyString: '',
  nullValue: null,
  undefinedValue: undefined,
};

/**
 * API endpoints
 */
export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  users: {
    profile: '/api/users/profile',
    update: '/api/users/update',
    delete: '/api/users/delete',
    list: '/api/users',
  },
  events: {
    list: '/api/events',
    create: '/api/events',
    update: '/api/events/:id',
    delete: '/api/events/:id',
    rsvp: '/api/events/:id/rsvp',
  },
  groups: {
    list: '/api/groups',
    create: '/api/groups',
    join: '/api/groups/:id/join',
    leave: '/api/groups/:id/leave',
  },
  posts: {
    list: '/api/posts',
    create: '/api/posts',
    like: '/api/posts/:id/like',
    comment: '/api/posts/:id/comments',
  },
};

/**
 * Test file paths
 */
export const testFiles = {
  images: {
    profile: 'tests/e2e/fixtures/files/profile-photo.jpg',
    event: 'tests/e2e/fixtures/files/event-banner.jpg',
    post: 'tests/e2e/fixtures/files/post-image.jpg',
  },
  videos: {
    performance: 'tests/e2e/fixtures/files/tango-performance.mp4',
  },
  documents: {
    pdf: 'tests/e2e/fixtures/files/event-details.pdf',
  },
};

/**
 * Wait times
 */
export const waitTimes = {
  short: 1000,
  medium: 3000,
  long: 5000,
  veryLong: 10000,
};

/**
 * Test selectors
 */
export const selectors = {
  common: {
    navbar: '[data-testid="navbar"]',
    sidebar: '[data-testid="sidebar"]',
    footer: '[data-testid="footer"]',
    loading: '[data-testid="loading-spinner"]',
    toast: '[data-testid="toast-container"]',
  },
  auth: {
    emailInput: '[data-testid="input-email"]',
    passwordInput: '[data-testid="input-password"]',
    loginButton: '[data-testid="button-login"]',
    registerButton: '[data-testid="button-register"]',
  },
  profile: {
    avatar: '[data-testid="img-avatar"]',
    name: '[data-testid="text-username"]',
    bio: '[data-testid="text-bio"]',
    editButton: '[data-testid="button-edit-profile"]',
  },
  events: {
    card: '[data-testid^="card-event-"]',
    createButton: '[data-testid="button-create-event"]',
    rsvpButton: '[data-testid="button-rsvp"]',
  },
};

/**
 * Device configurations
 */
export const devices = {
  mobile: {
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  },
  tablet: {
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
  },
  desktop: {
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
};