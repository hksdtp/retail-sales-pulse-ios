import { API_ENDPOINTS, HTTP_METHODS, HTTP_STATUS, getApiUrl } from '@/config/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  type:
    | 'partner_new'
    | 'partner_old'
    | 'architect_new'
    | 'architect_old'
    | 'client_new'
    | 'client_old'
    | 'quote_new'
    | 'quote_old'
    | 'report'
    | 'training'
    | 'meeting'
    | 'inventory'
    | 'other';
  status: 'todo' | 'in-progress' | 'on-hold' | 'completed';
  priority?: 'high' | 'normal' | 'low';
  date: string;
  time: string;
  progress: number;
  user_id: string;
  user_name: string;
  team_id: string;
  teamId: string;
  location: string;
  assignedTo: string;
  isNew?: boolean;
  created_at?: any;
  updated_at?: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  team_id: string;
  location: string;
  department: string;
  department_type: string;
  position: string;
  status: string;
  password_changed: boolean;
  avatar?: string;
  created_at?: any;
  updated_at?: any;
}

export interface Team {
  id: string;
  name: string;
  leader_id: string;
  location: string;
  description: string;
  department: string;
  department_type: string;
  created_at?: any;
  updated_at?: any;
}

// API Client class
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl();
  }

  // Generic request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      const defaultOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error ${response.status}:`, errorText);

        // Try to parse JSON error response to get clean error message
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            throw new Error(errorData.error);
          }
        } catch (parseError) {
          // If not JSON, fall back to original error format
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log(`📄 Raw response:`, responseText.substring(0, 500));

      let data;
      try {
        // Check if response is HTML (common error case)
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          console.error(`❌ Server returned HTML instead of JSON. This usually means:
            1. API endpoint not found (404)
            2. Server error (500)
            3. CORS issues
            4. Wrong API URL`);
          throw new Error(`Server returned HTML instead of JSON. Check API endpoint and server status.`);
        }

        // Check if response is empty
        if (!responseText.trim()) {
          console.error(`❌ Empty response from server`);
          throw new Error(`Empty response from server`);
        }

        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ JSON Parse Error:`, parseError);
        console.error(`📄 Response text that failed to parse:`, responseText.substring(0, 500));

        // Provide more helpful error message
        if (responseText.includes('<script type="module">import { injectIntoGlobalHook }')) {
          throw new Error(`Server returned React development page instead of API response. Check if API server is running correctly.`);
        }

        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.HEALTH);
  }

  // Tasks API với phân quyền
  async getTasks(currentUser?: any): Promise<ApiResponse<Task[]>> {
    // Check if using test server (development mode)
    const isTestServer = import.meta.env.DEV && window.location.hostname === 'localhost';

    if (isTestServer) {
      // Use test server endpoint with /api/ prefix for Vite proxy
      let url = '/api/tasks/manager-view';

      if (currentUser) {
        const params = new URLSearchParams();
        params.append('role', currentUser.role);
        params.append('view_level', 'department');

        if (currentUser.department_type) {
          params.append('department', currentUser.department_type);
        }

        url += `?${params.toString()}`;
      }

      return this.request<Task[]>(url);
    } else {
      // Use production API endpoint - fallback to /tasks if manager-view doesn't exist
      let url = API_ENDPOINTS.TASKS;

      if (currentUser) {
        const params = new URLSearchParams();
        params.append('user_id', currentUser.id);
        params.append('role', currentUser.role);

        if (currentUser.team_id) {
          params.append('team_id', currentUser.team_id);
        }

        if (currentUser.department_type) {
          params.append('department', currentUser.department_type);
        }

        url += `?${params.toString()}`;
      }

      return this.request<Task[]>(url);
    }
  }

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASK_BY_ID(id));
  }

  async createTask(task: Omit<Task, 'id'>): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASK_BY_ID(id), {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.TASK_BY_ID(id), {
      method: HTTP_METHODS.DELETE,
    });
  }

  // Update task progress
  async updateTaskProgress(id: string, progress: number): Promise<ApiResponse<Task>> {
    return this.updateTask(id, { progress });
  }

  // Update task status
  async updateTaskStatus(id: string, status: Task['status']): Promise<ApiResponse<Task>> {
    return this.updateTask(id, { status });
  }

  // Users API
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(API_ENDPOINTS.USERS);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER_BY_ID(id));
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.UPDATE_USER(id), {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(userData),
    });
  }

  // Teams API
  async getTeams(): Promise<ApiResponse<Team[]>> {
    return this.request<Team[]>(API_ENDPOINTS.TEAMS);
  }

  async getTeamById(id: string): Promise<ApiResponse<Team>> {
    return this.request<Team>(API_ENDPOINTS.TEAM_BY_ID(id));
  }

  // Authentication API
  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request<{ user: User; token: string }>(API_ENDPOINTS.AUTH_LOGIN, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyToken(token: string): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(API_ENDPOINTS.AUTH_VERIFY, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({ token }),
    });
  }

  async changePassword(userId: string, newPassword: string, currentPassword?: string): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({ userId, newPassword, currentPassword }),
    });
  }

  // Export & Sync API
  async exportCSV(): Promise<Response> {
    const url = `${this.baseUrl}${API_ENDPOINTS.EXPORT_CSV}`;
    return fetch(url);
  }

  async syncGoogleSheets(): Promise<ApiResponse<any>> {
    return this.request(API_ENDPOINTS.SYNC_SHEETS, {
      method: HTTP_METHODS.POST,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience with proper binding
export const healthCheck = () => apiClient.healthCheck();
export const getTasks = (currentUser?: any) => apiClient.getTasks(currentUser);
export const getTaskById = (id: string) => apiClient.getTaskById(id);
export const createTask = (task: Omit<Task, 'id'>) => apiClient.createTask(task);
export const updateTask = (id: string, task: Partial<Task>) => apiClient.updateTask(id, task);
export const deleteTask = (id: string) => apiClient.deleteTask(id);
export const updateTaskProgress = (id: string, progress: number) =>
  apiClient.updateTaskProgress(id, progress);
export const updateTaskStatus = (id: string, status: Task['status']) =>
  apiClient.updateTaskStatus(id, status);
export const getUsers = () => apiClient.getUsers();
export const getUserById = (id: string) => apiClient.getUserById(id);
export const updateUser = (id: string, userData: Partial<User>) => apiClient.updateUser(id, userData);
export const getTeams = () => apiClient.getTeams();
export const getTeamById = (id: string) => apiClient.getTeamById(id);
export const login = (email: string, password: string) => apiClient.login(email, password);
export const verifyToken = (token: string) => apiClient.verifyToken(token);
export const changePassword = (userId: string, newPassword: string, currentPassword?: string) =>
  apiClient.changePassword(userId, newPassword, currentPassword);
export const exportCSV = () => apiClient.exportCSV();
export const syncGoogleSheets = () => apiClient.syncGoogleSheets();
