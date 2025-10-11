// ESA Agent #2: Project Tracker Route Constants
// Centralized route definitions to prevent typos and ensure consistency

export const PROJECT_TRACKER_ROUTES = {
  // Base routes
  PROJECTS: '/admin/projects',
  EPICS_LIST: '/admin/projects/epics',
  STORIES_LIST: '/admin/projects/stories',
  SPRINTS: '/admin/sprints',
  
  // Detail pages (use functions for dynamic routes)
  epicDetail: (id: number | string) => `/admin/projects/epic/${id}`,
  storyDetail: (id: number | string) => `/admin/projects/story/${id}`,
  
  // Query params
  createEpic: () => '/admin/projects?create=epic',
  createStory: () => '/admin/projects?create=story',
} as const;

// API endpoints
export const PROJECT_TRACKER_API = {
  EPICS: '/api/tracker/epics',
  STORIES: '/api/tracker/stories',
  TASKS: '/api/tracker/tasks',
  SPRINTS: '/api/tracker/sprints',
  DASHBOARD: '/api/tracker/dashboard',
  
  // Detail endpoints
  epicById: (id: number | string) => `/api/tracker/epics/${id}`,
  storyById: (id: number | string) => `/api/tracker/stories/${id}`,
  taskById: (id: number | string) => `/api/tracker/tasks/${id}`,
  
  // GitHub integration
  syncGitHub: (storyId: number | string) => `/api/tracker/stories/${storyId}/sync-github`,
  linkPR: (taskId: number | string) => `/api/tracker/tasks/${taskId}/link-pr`,
  githubWebhook: () => '/api/tracker/github/webhook',
} as const;

// Route validation helper
export function isValidProjectTrackerRoute(path: string): boolean {
  const routes = Object.values(PROJECT_TRACKER_ROUTES);
  return routes.some(route => 
    typeof route === 'string' ? path === route : false
  );
}
