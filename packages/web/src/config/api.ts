// API Configuration
export const API_CONFIG = {
  // Production API URL
  BASE_URL: import.meta.env.VITE_API_URL || 'https://api-adwc442mha-uc.a.run.app',

  // Local development API URL (for testing with Firebase emulator)
  LOCAL_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/appqlgd/us-central1/api',

  // Test server URL (for local development - FIXED: was pointing to MCP server)
  TEST_URL: import.meta.env.VITE_API_URL || 'http://localhost:3003',

  // Environment
  IS_DEVELOPMENT: import.meta.env.DEV,

  // Timeout settings
  TIMEOUT: 30000, // 30 seconds

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
  // Check if we have a custom API URL from environment
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 Using custom API URL from environment:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // For development, use proxy path (Vite will proxy /api to localhost:3003)
  if (API_CONFIG.IS_DEVELOPMENT) {
    console.log('🔧 Development mode: Using Vite proxy for API calls');
    return '/api'; // This will be proxied to localhost:3003
  }

  // Use production API for production
  return API_CONFIG.BASE_URL;
};



// API Endpoints
export const API_ENDPOINTS = {
  // Health check
  HEALTH: '/health',

  // Tasks - Fixed endpoint path
  TASKS: '/tasks',
  TASKS_MANAGER_VIEW: '/tasks/manager-view',
  TASK_BY_ID: (id: string) => `/tasks/${id}`,

  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  UPDATE_USER: (id: string) => `/users/${id}`,

  // Teams (will be added later)
  TEAMS: '/teams',
  TEAM_BY_ID: (id: string) => `/teams/${id}`,

  // Reports (will be added later)
  REPORTS: '/reports',
  REPORT_BY_ID: (id: string) => `/reports/${id}`,

  // Authentication
  AUTH_LOGIN: '/auth/login',
  AUTH_VERIFY: '/auth/verify',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',

  // Export & Sync
  EXPORT_CSV: '/export/csv',
  SYNC_SHEETS: '/sync/sheets',


};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
