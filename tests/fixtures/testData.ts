export const testUsers = {
  superAdmin: {
    email: 'admin@test.com',
    password: 'Test123!@#',
    role: 'super_admin',
    username: 'testadmin',
    name: 'Test Admin'
  },
  regularUser: {
    email: 'user@test.com',
    password: 'Test123!@#',
    role: 'user',
    username: 'testuser',
    name: 'Test User'
  },
  moderator: {
    email: 'mod@test.com',
    password: 'Test123!@#',
    role: 'moderator',
    username: 'testmod',
    name: 'Test Moderator'
  }
};

export const testPosts = [
  {
    content: 'This is a test post for E2E testing',
    authorId: 1
  },
  {
    content: 'Another test post with #hashtag',
    authorId: 1
  }
];

export const testGroups = [
  {
    name: 'Test Group',
    description: 'A group for testing purposes',
    city: 'Test City',
    isPublic: true
  }
];

export const testEvents = [
  {
    title: 'Test Event',
    description: 'An event for testing',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: 'Test Location',
    city: 'Test City'
  }
];

export const phase9TestData = {
  agents: [
    { id: 110, name: 'Code Intelligence', status: 'operational' },
    { id: 111, name: 'Visual Preview', status: 'operational' },
    { id: 112, name: 'Design-to-Code', status: 'operational' },
    { id: 113, name: 'Cross-Phase Coordinator', status: 'operational' },
    { id: 114, name: 'Predictive Planner', status: 'operational' },
    { id: 115, name: 'Dynamic Priority Manager', status: 'operational' },
    { id: 116, name: 'Dependency Mapper', status: 'operational' }
  ],
  testCode: {
    react: 'const Button = () => <button>Click me</button>;',
    typescript: 'const add = (a: number, b: number): number => a + b;',
    html: '<div class="container"><h1>Hello</h1></div>'
  }
};
