/**
 * Augment MCP Demo Component
 * Showcases Augment MCP capabilities and features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAugmentMCP, useCodeAnalysis, useTaskManager, usePerformanceMonitor } from '../../hooks/useAugmentMCP';
import { 
  Activity, 
  Code, 
  CheckSquare, 
  Zap, 
  Server, 
  Play, 
  Stop, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function AugmentMCPDemo() {
  const { status, tools, connect, disconnect } = useAugmentMCP();
  const { analysis, loading: analysisLoading, analyze } = useCodeAnalysis();
  const { tasks, loading: tasksLoading, refreshTasks, addTask } = useTaskManager();
  const { metrics, monitoring, startMonitoring } = usePerformanceMonitor();

  const [codeInput, setCodeInput] = useState(`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}`);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  useEffect(() => {
    if (status.connected) {
      refreshTasks();
    }
  }, [status.connected, refreshTasks]);

  const handleAnalyzeCode = async () => {
    await analyze(codeInput, 'javascript');
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    const success = await addTask({
      title: newTaskTitle,
      description: newTaskDescription,
      status: 'pending',
      priority: 'medium'
    });

    if (success) {
      setNewTaskTitle('');
      setNewTaskDescription('');
    }
  };

  const handleStartMonitoring = async () => {
    await startMonitoring('all', 30);
  };

  const getStatusIcon = () => {
    if (status.loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (status.connected) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (status.loading) return 'Đang kết nối...';
    if (status.connected) return 'Đã kết nối';
    return status.error || 'Chưa kết nối';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Augment MCP Demo
        </h1>
        <p className="text-gray-600">
          Trải nghiệm các tính năng AI-powered của Augment Model Context Protocol
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Trạng Thái Kết Nối
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
              {status.serverInfo && (
                <Badge variant="outline">
                  v{status.serverInfo.version}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={connect} 
                disabled={status.loading || status.connected}
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                Kết nối
              </Button>
              <Button 
                onClick={disconnect} 
                disabled={!status.connected}
                variant="outline"
                size="sm"
              >
                <Stop className="h-4 w-4 mr-1" />
                Ngắt kết nối
              </Button>
            </div>
          </div>
          
          {status.serverInfo && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Clients:</span>
                <span className="ml-1 font-medium">{status.serverInfo.clients}</span>
              </div>
              <div>
                <span className="text-gray-500">Uptime:</span>
                <span className="ml-1 font-medium">{Math.floor(status.serverInfo.uptime)}s</span>
              </div>
              <div>
                <span className="text-gray-500">Tools:</span>
                <span className="ml-1 font-medium">{tools.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <Badge variant="secondary">{status.serverInfo.status}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Features */}
      <Tabs defaultValue="code-analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="code-analysis" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            Code Analysis
          </TabsTrigger>
          <TabsTrigger value="task-management" className="flex items-center gap-1">
            <CheckSquare className="h-4 w-4" />
            Task Manager
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Tools
          </TabsTrigger>
        </TabsList>

        {/* Code Analysis Tab */}
        <TabsContent value="code-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân Tích Code AI</CardTitle>
              <CardDescription>
                Phân tích chất lượng code, đưa ra gợi ý cải thiện và đánh giá performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">JavaScript Code:</label>
                <Textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Nhập code JavaScript để phân tích..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>
              
              <Button 
                onClick={handleAnalyzeCode}
                disabled={!status.connected || analysisLoading || !codeInput.trim()}
                className="w-full"
              >
                {analysisLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Code className="h-4 w-4 mr-2" />
                )}
                Phân Tích Code
              </Button>

              {analysis && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analysis.metrics.lines}</div>
                      <div className="text-sm text-gray-600">Dòng code</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{analysis.metrics.complexity}</div>
                      <div className="text-sm text-gray-600">Độ phức tạp</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analysis.score}</div>
                      <div className="text-sm text-gray-600">Điểm chất lượng</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Gợi ý cải thiện:</h4>
                    <ul className="space-y-1">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 mt-1">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Management Tab */}
        <TabsContent value="task-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Task AI</CardTitle>
              <CardDescription>
                Tạo và quản lý tasks với AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tiêu đề task:</label>
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nhập tiêu đề task..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Mô tả:</label>
                  <Input
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Mô tả chi tiết..."
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateTask}
                disabled={!status.connected || tasksLoading || !newTaskTitle.trim()}
                className="w-full"
              >
                {tasksLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckSquare className="h-4 w-4 mr-2" />
                )}
                Tạo Task
              </Button>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Tasks hiện tại:</h4>
                  <Button 
                    onClick={refreshTasks}
                    variant="outline"
                    size="sm"
                    disabled={!status.connected}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                {tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map((task, index) => (
                      <div key={task.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-600">{task.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có task nào
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitor</CardTitle>
              <CardDescription>
                Theo dõi hiệu suất ứng dụng real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleStartMonitoring}
                disabled={!status.connected || monitoring}
                className="w-full"
              >
                {monitoring ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-pulse" />
                    Đang theo dõi...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Bắt đầu theo dõi (30s)
                  </>
                )}
              </Button>

              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(metrics.data.load_time)}ms
                    </div>
                    <div className="text-sm text-gray-600">Load Time</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(metrics.data.memory_usage)}MB
                    </div>
                    <div className="text-sm text-gray-600">Memory Usage</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.data.network_requests}
                    </div>
                    <div className="text-sm text-gray-600">Network Requests</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Tools</CardTitle>
              <CardDescription>
                Danh sách các tools có sẵn trong Augment MCP
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tools.map((tool, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="font-medium text-blue-600">{tool.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{tool.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {status.connected ? 'Đang tải tools...' : 'Kết nối để xem tools'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
