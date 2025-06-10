/**
 * Augment MCP Client
 * Client for interacting with Augment Model Context Protocol server
 */

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface MCPResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export interface CodeAnalysis {
  language: string;
  analysis_type: string;
  timestamp: string;
  metrics: {
    lines: number;
    complexity: number;
    maintainability: number;
  };
  suggestions: string[];
  score: number;
}

export interface TaskData {
  id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  due_date?: string;
}

export interface ComponentSpec {
  name: string;
  type: 'functional' | 'class' | 'hook';
  styling: 'tailwind' | 'css' | 'styled-components';
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: any;
  }>;
}

export interface PerformanceMetrics {
  metric_type: string;
  duration: number;
  timestamp: string;
  data: {
    load_time: number;
    memory_usage: number;
    network_requests: number;
  };
}

class AugmentMCPClient {
  private baseUrl: string;
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(baseUrl: string = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
  }

  // Connection Management
  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const status = await response.json();
      
      if (status.status === 'running') {
        this.setupEventSource();
        console.log('🔗 Connected to Augment MCP Server');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to connect to Augment MCP Server:', error);
      return false;
    }
  }

  private setupEventSource() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`${this.baseUrl}/sse`);
    
    this.eventSource.onopen = () => {
      console.log('📡 SSE connection established');
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.data || data);
      } catch (error) {
        console.error('❌ SSE message parse error:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('🔌 Disconnected from Augment MCP Server');
    }
  }

  // Event Handling
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Tool Methods
  async analyzeCode(
    code: string, 
    language: string = 'javascript',
    analysisType: 'quality' | 'security' | 'performance' | 'all' = 'all'
  ): Promise<CodeAnalysis> {
    const response = await this.callTool('analyze_code', {
      code,
      language,
      analysis_type: analysisType
    });
    return response.result;
  }

  async createTask(taskData: Omit<TaskData, 'id'>): Promise<MCPResponse> {
    return this.callTool('manage_tasks', {
      action: 'create',
      task_data: taskData
    });
  }

  async updateTask(taskId: string, updates: Partial<TaskData>): Promise<MCPResponse> {
    return this.callTool('manage_tasks', {
      action: 'update',
      task_data: { id: taskId, ...updates }
    });
  }

  async listTasks(filters?: Record<string, any>): Promise<TaskData[]> {
    const response = await this.callTool('manage_tasks', {
      action: 'list',
      filters
    });
    return response.result.tasks || [];
  }

  async deleteTask(taskId: string): Promise<MCPResponse> {
    return this.callTool('manage_tasks', {
      action: 'delete',
      task_data: { id: taskId }
    });
  }

  async generateComponent(spec: ComponentSpec): Promise<{
    name: string;
    code: string;
    type: string;
    styling: string;
  }> {
    const response = await this.callTool('generate_component', {
      component_name: spec.name,
      component_type: spec.type,
      styling: spec.styling,
      props: spec.props
    });
    return response.result;
  }

  async queryDatabase(
    queryType: 'select' | 'insert' | 'update' | 'delete',
    collection: string,
    data?: any,
    filters?: any
  ): Promise<MCPResponse> {
    return this.callTool('query_database', {
      query_type: queryType,
      collection,
      data,
      filters
    });
  }

  async monitorPerformance(
    metricType: 'load_time' | 'memory' | 'network' | 'all' = 'all',
    duration: number = 60,
    format: 'json' | 'html' | 'csv' = 'json'
  ): Promise<PerformanceMetrics> {
    const response = await this.callTool('monitor_performance', {
      metric_type: metricType,
      duration,
      format
    });
    return response.result;
  }

  // Generic tool call method
  async callTool(toolName: string, args: any): Promise<MCPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Tool call error (${toolName}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // MCP Protocol methods
  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await fetch(`${this.baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'tools/list',
          params: {}
        })
      });

      const result = await response.json();
      return result.tools || [];
    } catch (error) {
      console.error('❌ Failed to list tools:', error);
      return [];
    }
  }

  async getServerInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get server info:', error);
      return null;
    }
  }

  // Session Management
  async createSession(clientInfo?: any): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientInfo || {})
      });

      const result = await response.json();
      return result.session_id;
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      return null;
    }
  }

  async getSession(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get session:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('❌ Failed to delete session:', error);
      return false;
    }
  }
}

// Export singleton instance
export const augmentMCP = new AugmentMCPClient();

// Export class for custom instances
export default AugmentMCPClient;
