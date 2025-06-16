// API Configuration
export const API_CONFIG = {
  // Production API URL
  BASE_URL: import.meta.env.VITE_API_URL || 'https://api-adwc442mha-uc.a.run.app',

  // Local development API URL (for testing)
  LOCAL_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/appqlgd/us-central1/api',



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
  // For now, always use production API to avoid 401 errors
  return API_CONFIG.BASE_URL;

  // Uncomment below to use local in development (when local server is running)
  // return API_CONFIG.IS_DEVELOPMENT ? API_CONFIG.LOCAL_URL : API_CONFIG.BASE_URL;
};



// API Endpoints
export const API_ENDPOINTS = {
  // Health check
  HEALTH: '/health',

  // Tasks
  TASKS: '/tasks',
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
