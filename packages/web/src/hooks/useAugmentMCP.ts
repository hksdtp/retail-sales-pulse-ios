/**
 * React Hook for Augment MCP Integration
 * Provides easy access to Augment MCP features in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { augmentMCP, type CodeAnalysis, type TaskData, type PerformanceMetrics, type MCPTool } from '../services/augment-mcp-client';

export interface MCPStatus {
  connected: boolean;
  loading: boolean;
  error: string | null;
  serverInfo: any;
}

export interface MCPHookReturn {
  status: MCPStatus;
  tools: MCPTool[];
  
  // Connection methods
  connect: () => Promise<boolean>;
  disconnect: () => void;
  
  // Code analysis
  analyzeCode: (code: string, language?: string) => Promise<CodeAnalysis | null>;
  
  // Task management
  createTask: (task: Omit<TaskData, 'id'>) => Promise<boolean>;
  updateTask: (id: string, updates: Partial<TaskData>) => Promise<boolean>;
  listTasks: (filters?: any) => Promise<TaskData[]>;
  deleteTask: (id: string) => Promise<boolean>;
  
  // Component generation
  generateComponent: (name: string, type?: string, styling?: string) => Promise<string | null>;
  
  // Performance monitoring
  monitorPerformance: (type?: string, duration?: number) => Promise<PerformanceMetrics | null>;
  
  // Event handling
  onEvent: (event: string, callback: Function) => void;
  offEvent: (event: string, callback: Function) => void;
}

export function useAugmentMCP(): MCPHookReturn {
  const [status, setStatus] = useState<MCPStatus>({
    connected: false,
    loading: false,
    error: null,
    serverInfo: null
  });
  
  const [tools, setTools] = useState<MCPTool[]>([]);
  const eventCallbacks = useRef<Map<string, Function[]>>(new Map());

  // Initialize connection
  useEffect(() => {
    const initializeConnection = async () => {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const connected = await augmentMCP.connect();
        const serverInfo = await augmentMCP.getServerInfo();
        const availableTools = await augmentMCP.listTools();
        
        setStatus({
          connected,
          loading: false,
          error: connected ? null : 'Failed to connect to Augment MCP Server',
          serverInfo
        });
        
        setTools(availableTools);
        
        if (connected) {
          console.log('🎉 Augment MCP Hook initialized successfully');
        }
      } catch (error) {
        setStatus({
          connected: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown connection error',
          serverInfo: null
        });
      }
    };

    initializeConnection();

    // Cleanup on unmount
    return () => {
      augmentMCP.disconnect();
    };
  }, []);

  // Connection methods
  const connect = useCallback(async (): Promise<boolean> => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const connected = await augmentMCP.connect();
      const serverInfo = await augmentMCP.getServerInfo();
      
      setStatus(prev => ({
        ...prev,
        connected,
        loading: false,
        error: connected ? null : 'Failed to connect',
        serverInfo
      }));
      
      return connected;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        connected: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    augmentMCP.disconnect();
    setStatus(prev => ({
      ...prev,
      connected: false,
      error: null
    }));
  }, []);

  // Code analysis
  const analyzeCode = useCallback(async (
    code: string, 
    language: string = 'javascript'
  ): Promise<CodeAnalysis | null> => {
    if (!status.connected) {
      console.warn('⚠️ MCP not connected');
      return null;
    }

    try {
      const analysis = await augmentMCP.analyzeCode(code, language);
      console.log('📊 Code analysis completed:', analysis);
      return analysis;
    } catch (error) {
      console.error('❌ Code analysis failed:', error);
      return null;
    }
  }, [status.connected]);

  // Task management
  const createTask = useCallback(async (task: Omit<TaskData, 'id'>): Promise<boolean> => {
    if (!status.connected) return false;

    try {
      const response = await augmentMCP.createTask(task);
      
      return response.success;
    } catch (error) {
      console.error('❌ Task creation failed:', error);
      return false;
    }
  }, [status.connected]);

  const updateTask = useCallback(async (id: string, updates: Partial<TaskData>): Promise<boolean> => {
    if (!status.connected) return false;

    try {
      const response = await augmentMCP.updateTask(id, updates);
      console.log('📝 Task updated:', response);
      return response.success;
    } catch (error) {
      console.error('❌ Task update failed:', error);
      return false;
    }
  }, [status.connected]);

  const listTasks = useCallback(async (filters?: any): Promise<TaskData[]> => {
    if (!status.connected) return [];

    try {
      const tasks = await augmentMCP.listTasks(filters);
      
      return tasks;
    } catch (error) {
      console.error('❌ Task listing failed:', error);
      return [];
    }
  }, [status.connected]);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    if (!status.connected) return false;

    try {
      const response = await augmentMCP.deleteTask(id);
      console.log('🗑️ Task deleted:', response);
      return response.success;
    } catch (error) {
      console.error('❌ Task deletion failed:', error);
      return false;
    }
  }, [status.connected]);

  // Component generation
  const generateComponent = useCallback(async (
    name: string,
    type: string = 'functional',
    styling: string = 'tailwind'
  ): Promise<string | null> => {
    if (!status.connected) return null;

    try {
      const component = await augmentMCP.generateComponent({
        name,
        type: type as any,
        styling: styling as any,
        props: []
      });
      console.log('⚛️ Component generated:', component);
      return component.code;
    } catch (error) {
      console.error('❌ Component generation failed:', error);
      return null;
    }
  }, [status.connected]);

  // Performance monitoring
  const monitorPerformance = useCallback(async (
    type: string = 'all',
    duration: number = 60
  ): Promise<PerformanceMetrics | null> => {
    if (!status.connected) return null;

    try {
      const metrics = await augmentMCP.monitorPerformance(type as any, duration);
      console.log('📊 Performance metrics:', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ Performance monitoring failed:', error);
      return null;
    }
  }, [status.connected]);

  // Event handling
  const onEvent = useCallback((event: string, callback: Function) => {
    if (!eventCallbacks.current.has(event)) {
      eventCallbacks.current.set(event, []);
    }
    eventCallbacks.current.get(event)!.push(callback);
    augmentMCP.on(event, callback);
  }, []);

  const offEvent = useCallback((event: string, callback: Function) => {
    const callbacks = eventCallbacks.current.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
    augmentMCP.off(event, callback);
  }, []);

  return {
    status,
    tools,
    connect,
    disconnect,
    analyzeCode,
    createTask,
    updateTask,
    listTasks,
    deleteTask,
    generateComponent,
    monitorPerformance,
    onEvent,
    offEvent
  };
}

// Custom hooks for specific features
export function useCodeAnalysis() {
  const { analyzeCode, status } = useAugmentMCP();
  
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async (code: string, language?: string) => {
    setLoading(true);
    const result = await analyzeCode(code, language);
    setAnalysis(result);
    setLoading(false);
    return result;
  }, [analyzeCode]);

  return {
    analysis,
    loading,
    connected: status.connected,
    analyze
  };
}

export function useTaskManager() {
  const { createTask, updateTask, listTasks, deleteTask, status } = useAugmentMCP();
  
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshTasks = useCallback(async (filters?: any) => {
    setLoading(true);
    const taskList = await listTasks(filters);
    setTasks(taskList);
    setLoading(false);
    return taskList;
  }, [listTasks]);

  const addTask = useCallback(async (task: Omit<TaskData, 'id'>) => {
    const success = await createTask(task);
    if (success) {
      await refreshTasks();
    }
    return success;
  }, [createTask, refreshTasks]);

  const modifyTask = useCallback(async (id: string, updates: Partial<TaskData>) => {
    const success = await updateTask(id, updates);
    if (success) {
      await refreshTasks();
    }
    return success;
  }, [updateTask, refreshTasks]);

  const removeTask = useCallback(async (id: string) => {
    const success = await deleteTask(id);
    if (success) {
      await refreshTasks();
    }
    return success;
  }, [deleteTask, refreshTasks]);

  return {
    tasks,
    loading,
    connected: status.connected,
    refreshTasks,
    addTask,
    modifyTask,
    removeTask
  };
}

export function usePerformanceMonitor() {
  const { monitorPerformance, status, onEvent, offEvent } = useAugmentMCP();
  
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    const handleMetrics = (data: PerformanceMetrics) => {
      setMetrics(data);
    };

    onEvent('performance_metrics', handleMetrics);
    
    return () => {
      offEvent('performance_metrics', handleMetrics);
    };
  }, [onEvent, offEvent]);

  const startMonitoring = useCallback(async (type?: string, duration?: number) => {
    setMonitoring(true);
    const result = await monitorPerformance(type, duration);
    setMonitoring(false);
    return result;
  }, [monitorPerformance]);

  return {
    metrics,
    monitoring,
    connected: status.connected,
    startMonitoring
  };
}
