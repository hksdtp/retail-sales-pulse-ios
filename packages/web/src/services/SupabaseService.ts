import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task } from '@/components/tasks/types/TaskTypes';
import { User, Team } from '@/types/user';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export class SupabaseService {
  private static instance: SupabaseService | null = null;
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig | null = null;

  private constructor() {}

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public initialize(config: SupabaseConfig): boolean {
    try {
      // Prevent multiple initialization with same config
      if (this.client && this.config &&
          this.config.url === config.url &&
          this.config.anonKey === config.anonKey) {
        console.log('ℹ️ Supabase already initialized with same config, skipping...');
        return true;
      }

      // If different config, warn about re-initialization
      if (this.client && this.config) {
        console.warn('⚠️ Re-initializing Supabase with different config');
      }

      this.config = config;
      this.client = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          storageKey: 'supabase-auth-token', // Use consistent storage key
        }
      });

      // Save config to localStorage
      localStorage.setItem('supabaseConfig', JSON.stringify(config));

      return true;
    } catch (error) {
      console.error('❌ Error initializing Supabase:', error);
      return false;
    }
  }

  public static initializeFromLocalStorage(): SupabaseService | null {
    try {
      const instance = SupabaseService.getInstance();

      // If already initialized, return existing instance
      if (instance.isInitialized()) {
        console.log('ℹ️ Supabase already initialized, returning existing instance');
        return instance;
      }

      const storedConfig = localStorage.getItem('supabaseConfig');
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        if (instance.initialize(config)) {
          
          return instance;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error initializing Supabase from localStorage:', error);
      return null;
    }
  }

  public static isConfigured(): boolean {
    const storedConfig = localStorage.getItem('supabaseConfig');
    return !!storedConfig;
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  // ===== TASKS OPERATIONS =====

  public async getTasks(): Promise<Task[]> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return [];
    }

    try {
      const { data, error } = await this.client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  public async addTask(task: Omit<Task, 'id'>): Promise<Task | null> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return null;
    }

    try {
      // Generate unique ID for task
      const taskWithId = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const { data, error } = await this.client
        .from('tasks')
        .insert([taskWithId])
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return null;
    }

    try {
      const { data, error } = await this.client
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  }

  public async deleteTask(id: string): Promise<boolean> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return false;
    }

    try {
      const { error } = await this.client
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // ===== USERS OPERATIONS =====

  public async getUsers(): Promise<User[]> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return [];
    }

    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // ===== TEAMS OPERATIONS =====

  public async getTeams(): Promise<Team[]> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return [];
    }

    try {
      const { data, error } = await this.client
        .from('teams')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching teams:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  // ===== GENERIC DOCUMENT OPERATIONS (Firebase compatibility) =====

  public async addDocument(
    tableName: string,
    data: Record<string, unknown>,
  ): Promise<string | null> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return null;
    }

    try {
      const { data: result, error } = await this.client
        .from(tableName)
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error(`Error adding document to ${tableName}:`, error);
        return null;
      }

      return result.id;
    } catch (error) {
      console.error(`Error adding document to ${tableName}:`, error);
      return null;
    }
  }

  public async updateDocument(
    tableName: string,
    docId: string,
    data: Record<string, unknown>,
  ): Promise<boolean> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return false;
    }

    try {
      const { error } = await this.client
        .from(tableName)
        .update(data)
        .eq('id', docId);

      if (error) {
        console.error(`Error updating document ${docId} in ${tableName}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error updating document ${docId} in ${tableName}:`, error);
      return false;
    }
  }

  public async deleteDocument(tableName: string, docId: string): Promise<boolean> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return false;
    }

    try {
      const { error } = await this.client
        .from(tableName)
        .delete()
        .eq('id', docId);

      if (error) {
        console.error(`Error deleting document ${docId} from ${tableName}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting document ${docId} from ${tableName}:`, error);
      return false;
    }
  }

  public async getDocuments(tableName: string): Promise<any[]> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return [];
    }

    try {
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching documents from ${tableName}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Error fetching documents from ${tableName}:`, error);
      return [];
    }
  }

  public async queryDocuments(
    tableName: string,
    fieldPath: string,
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte',
    value: unknown,
  ): Promise<any[]> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return [];
    }

    try {
      let query = this.client.from(tableName).select('*');

      // Apply filter based on operator
      switch (operator) {
        case 'eq':
          query = query.eq(fieldPath, value);
          break;
        case 'neq':
          query = query.neq(fieldPath, value);
          break;
        case 'gt':
          query = query.gt(fieldPath, value);
          break;
        case 'gte':
          query = query.gte(fieldPath, value);
          break;
        case 'lt':
          query = query.lt(fieldPath, value);
          break;
        case 'lte':
          query = query.lte(fieldPath, value);
          break;
        default:
          query = query.eq(fieldPath, value);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error querying documents from ${tableName}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Error querying documents from ${tableName}:`, error);
      return [];
    }
  }

  public async getUserByEmail(email: string): Promise<any | null> {
    const users = await this.queryDocuments('users', 'email', 'eq', email);
    return users.length > 0 ? users[0] : null;
  }

  // ===== STORAGE OPERATIONS =====

  public async uploadFile(path: string, file: File): Promise<string | null> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return null;
    }

    try {
      const { data, error } = await this.client.storage
        .from('files') // Default bucket name
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`Error uploading file ${path}:`, error);
        return null;
      }

      // Get public URL
      const { data: urlData } = this.client.storage
        .from('files')
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading file ${path}:`, error);
      return null;
    }
  }

  // ===== AUTHENTICATION =====

  public async signIn(email: string, password: string) {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return { data: null, error: 'Client not initialized' };
    }

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error: 'Sign in failed' };
    }
  }

  public async signOut() {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return { error: 'Client not initialized' };
    }

    try {
      const { error } = await this.client.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: 'Sign out failed' };
    }
  }

  public async getCurrentUser() {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return null;
    }

    try {
      const { data: { user }, error } = await this.client.auth.getUser();

      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  public onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return { data: { subscription: null } };
    }

    return this.client.auth.onAuthStateChange(callback);
  }

  // ===== UTILITY METHODS =====

  public async testConnection(): Promise<boolean> {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return false;
    }

    try {
      // Test connection by trying to access a simple table or auth
      const { data, error } = await this.client.auth.getSession();

      if (error && error.message !== 'Auth session missing!') {
        console.error('Connection test failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  public isInitialized(): boolean {
    return this.client !== null && this.config !== null;
  }

  public getConfig(): SupabaseConfig | null {
    return this.config;
  }

  // ===== STATIC UTILITY METHODS (Firebase compatibility) =====

  public static initializeApp(config: SupabaseConfig): SupabaseService {
    const instance = SupabaseService.getInstance();

    // Only initialize if not already initialized or config is different
    if (!instance.isInitialized()) {
      instance.initialize(config);
    } else {
      console.log('ℹ️ Supabase already initialized via initializeApp');
    }

    return instance;
  }

  public static isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development' ||
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  public static isUsingLocalSupabase(): boolean {
    const instance = SupabaseService.getInstance();
    const config = instance.getConfig();
    return config?.url.includes('localhost') || config?.url.includes('127.0.0.1') || false;
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====

  public subscribeToTable(
    tableName: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    if (!this.client) {
      console.error('Supabase client not initialized');
      return null;
    }

    try {
      let subscription = this.client
        .channel(`${tableName}_changes`)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: filter
          },
          callback
        )
        .subscribe();

      return subscription;
    } catch (error) {
      console.error(`Error subscribing to ${tableName}:`, error);
      return null;
    }
  }

  public unsubscribe(subscription: any) {
    if (subscription && this.client) {
      this.client.removeChannel(subscription);
      
    }
  }
}

export default SupabaseService;
