/**
 * ESA LIFE CEO 61×21 - Test Data Fixtures
 * Reusable test data for Playwright tests
 */

export const TEST_IMAGES = {
  small: 'test-image.jpg',
  medium: 'test-image2.jpg',
  large: 'large-image.jpg',
  avatar: 'test-avatar.jpg'
};

export const TEST_VENUES = [
  {
    name: 'Salon Canning',
    address: 'Av. Raúl Scalabrini Ortiz 1331',
    city: 'Buenos Aires',
    country: 'Argentina',
    latitude: -34.5875,
    longitude: -58.4318
  },
  {
    name: 'La Viruta',
    address: 'Armenia 1366',
    city: 'Buenos Aires',
    country: 'Argentina',
    latitude: -34.5934,
    longitude: -58.4238
  },
  {
    name: 'Milonga del Mundo',
    address: 'José Antonio Cabrera 4820',
    city: 'Buenos Aires',
    country: 'Argentina',
    latitude: -34.5896,
    longitude: -58.4289
  }
];

export const TEST_CONTENT = {
  memories: [
    'Beautiful milonga night with amazing dancers! #tango #buenosaires',
    'Learning new steps at the practica today 💃',
    'The orchestra was incredible tonight at Salon Canning!',
    'Sunset tango by the river, magical moments ✨',
    'Workshop with maestros - mind blown! 🤯'
  ],
  events: [
    {
      title: 'Traditional Milonga Night',
      description: 'Join us for a traditional milonga with live orchestra, featuring classic tango music from the golden age.'
    },
    {
      title: 'Beginner Workshop',
      description: 'Perfect for those new to tango! Learn the basics of embrace, walking, and simple figures.'
    },
    {
      title: 'Advanced Seminar',
      description: 'Master complex sequences and musical interpretation with renowned maestros.'
    }
  ],
  comments: [
    'Amazing event! Can\'t wait for the next one!',
    'The music was perfect tonight!',
    'Great dancing, see you next week!',
    'Thanks for organizing this wonderful milonga!',
    'Best tango night in Buenos Aires!'
  ]
};

export const TEST_USER_PROFILES = {
  leader: {
    bio: 'Passionate tango leader with 10 years of experience',
    tangoRoles: ['leader'],
    leaderLevel: 4,
    followerLevel: 2,
    yearsOfDancing: 10,
    languages: ['English', 'Spanish', 'Portuguese']
  },
  follower: {
    bio: 'Love the connection and musicality of tango',
    tangoRoles: ['follower'],
    leaderLevel: 1,
    followerLevel: 5,
    yearsOfDancing: 8,
    languages: ['English', 'French']
  },
  both: {
    bio: 'Dancing both roles to understand the full tango experience',
    tangoRoles: ['leader', 'follower'],
    leaderLevel: 3,
    followerLevel: 3,
    yearsOfDancing: 5,
    languages: ['English', 'Spanish', 'Italian']
  },
  beginner: {
    bio: 'Just started my tango journey and loving every moment!',
    tangoRoles: ['follower'],
    leaderLevel: 0,
    followerLevel: 1,
    yearsOfDancing: 1,
    languages: ['English']
  }
};

export const TEST_CITIES = [
  { city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', stateCode: 'BA' },
  { city: 'Montevideo', country: 'Uruguay', countryCode: 'UY', stateCode: 'MO' },
  { city: 'Santiago', country: 'Chile', countryCode: 'CL', stateCode: 'RM' },
  { city: 'São Paulo', country: 'Brazil', countryCode: 'BR', stateCode: 'SP' },
  { city: 'Paris', country: 'France', countryCode: 'FR', stateCode: 'IDF' },
  { city: 'Berlin', country: 'Germany', countryCode: 'DE', stateCode: 'BE' },
  { city: 'New York', country: 'United States', countryCode: 'US', stateCode: 'NY' }
];

export const TIMESTAMPS = {
  yesterday: () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  },
  tomorrow: () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  },
  nextWeek: () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  },
  lastWeek: () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  },
  nextMonth: () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }
};

// Generate unique test identifiers
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

// Generate test email
export function generateTestEmail(prefix: string = 'user'): string {
  return `${generateTestId(prefix)}@mundotango-test.com`;
}

// Generate test username
export function generateTestUsername(prefix: string = 'tester'): string {
  return generateTestId(prefix);
}

// Random selection helper
export function randomSelect<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Date formatter for event dates
export function formatEventDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Time formatter for events
export function formatEventTime(hours: number = 20, minutes: number = 0): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}