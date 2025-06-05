import { getApiUrl, API_ENDPOINTS, HTTP_METHODS, HTTP_STATUS } from '@/config/api';

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
  type: string;
  status: 'todo' | 'in-progress' | 'completed';
  date: string;
  time: string;
  progress: number;
  user_id: string;
  user_name: string;
  team_id: string;
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
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      
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

  // Tasks API
  async getTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>(API_ENDPOINTS.TASKS);
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

  // Teams API
  async getTeams(): Promise<ApiResponse<Team[]>> {
    return this.request<Team[]>(API_ENDPOINTS.TEAMS);
  }

  async getTeamById(id: string): Promise<ApiResponse<Team>> {
    return this.request<Team>(API_ENDPOINTS.TEAM_BY_ID(id));
  }

  // Authentication API
  async login(email: string, password: string): Promise<ApiResponse<{user: User, token: string}>> {
    return this.request<{user: User, token: string}>(API_ENDPOINTS.AUTH_LOGIN, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyToken(token: string): Promise<ApiResponse<{user: User}>> {
    return this.request<{user: User}>(API_ENDPOINTS.AUTH_VERIFY, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({ token }),
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
export const getTasks = () => apiClient.getTasks();
export const getTaskById = (id: string) => apiClient.getTaskById(id);
export const createTask = (task: Omit<Task, 'id'>) => apiClient.createTask(task);
export const updateTask = (id: string, task: Partial<Task>) => apiClient.updateTask(id, task);
export const deleteTask = (id: string) => apiClient.deleteTask(id);
export const updateTaskProgress = (id: string, progress: number) => apiClient.updateTaskProgress(id, progress);
export const updateTaskStatus = (id: string, status: Task['status']) => apiClient.updateTaskStatus(id, status);
export const getUsers = () => apiClient.getUsers();
export const getUserById = (id: string) => apiClient.getUserById(id);
export const getTeams = () => apiClient.getTeams();
export const getTeamById = (id: string) => apiClient.getTeamById(id);
export const login = (email: string, password: string) => apiClient.login(email, password);
export const verifyToken = (token: string) => apiClient.verifyToken(token);
export const exportCSV = () => apiClient.exportCSV();
export const syncGoogleSheets = () => apiClient.syncGoogleSheets();
