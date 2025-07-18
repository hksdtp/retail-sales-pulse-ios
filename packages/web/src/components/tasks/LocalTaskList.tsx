import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Task } from '@/components/tasks/types/TaskTypes';

// Local task service
class LocalTaskService {
  private static instance: LocalTaskService;
  
  public static getInstance(): LocalTaskService {
    if (!LocalTaskService.instance) {
      LocalTaskService.instance = new LocalTaskService();
    }
    return LocalTaskService.instance;
  }

  private getTaskStorageKey(userId: string): string {
    return `user_tasks_${userId}`;
  }

  public getUserTasks(userId: string): Task[] {
    try {
      const storageKey = this.getTaskStorageKey(userId);
      const storedTasks = localStorage.getItem(storageKey);
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error('Lỗi khi lấy tasks của user:', error);
      return [];
    }
  }

  public deleteTask(userId: string, taskId: string): boolean {
    try {
      const tasks = this.getUserTasks(userId);
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      
      if (filteredTasks.length === tasks.length) {
        console.error('Không tìm thấy task để xóa với ID:', taskId);
        return false;
      }

      this.saveUserTasks(userId, filteredTasks);
      
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa task:', error);
      return false;
    }
  }

  private saveUserTasks(userId: string, tasks: Task[]): void {
    try {
      const storageKey = this.getTaskStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      console.log(`Đã lưu ${tasks.length} tasks cho user ${userId}`);
    } catch (error) {
      console.error('Lỗi khi lưu tasks:', error);
    }
  }
}

const localTaskService = LocalTaskService.getInstance();

const LocalTaskList: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage
  const loadTasks = useCallback(() => {
    if (!currentUser?.id) return;

    console.log('🔄 Loading tasks for user:', currentUser.id);
    const userTasks = localTaskService.getUserTasks(currentUser.id);
    setTasks(userTasks);

  }, [currentUser?.id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Expose loadTasks for external refresh
  useEffect(() => {
    (window as any).refreshLocalTasks = loadTasks;
    console.log('🔄 Exposed refreshLocalTasks function');
    return () => {
      delete (window as any).refreshLocalTasks;
    };
  }, [loadTasks]);

  const handleDeleteTask = (taskId: string) => {
    if (!currentUser?.id) return;

    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      const success = localTaskService.deleteTask(currentUser.id, taskId);
      if (success) {
        loadTasks(); // Refresh list
        alert('Đã xóa công việc thành công!');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'XONG';
      case 'in-progress': return 'LÀMM';
      case 'todo': return 'CHỜ';
      case 'on-hold': return 'DỪNG';
      default: return 'CHỜ';
    }
  };

  const getStatusFullText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang thực hiện';
      case 'todo': return 'Chờ thực hiện';
      case 'on-hold': return 'Tạm dừng';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-200 text-red-900 border-red-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'normal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '🤝';
      case 'site_visit': return '🏗️';
      case 'report': return '📊';
      case 'training': return '📚';
      default: return '📋';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'meeting': return 'Họp';
      case 'site_visit': return 'Khảo sát';
      case 'report': return 'Báo cáo';
      case 'training': return 'Đào tạo';
      default: return 'Khác';
    }
  };

  if (!currentUser) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa đăng nhập</h3>
          <p className="text-gray-500">Vui lòng đăng nhập để xem công việc</p>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có công việc</h3>
          <p className="text-gray-500">
            Chưa có công việc nào được đồng bộ từ kế hoạch. 
            Hãy tạo kế hoạch và đồng bộ để xem công việc ở đây.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        📋 Hiển thị {tasks.length} công việc được đồng bộ từ kế hoạch
      </div>

      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(task.type)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <Badge className={getStatusColor(task.status)}>
                      <span className="text-xs font-bold mr-1">{getStatusText(task.status)}</span>
                      <span>{getStatusFullText(task.status)}</span>
                    </Badge>
                    {task.priority && (
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{task.date}</span>
                    </div>
                    {task.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{task.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{getTypeText(task.type)}</span>
                    </div>
                  </div>

                  {task.location && (
                    <div className="mt-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {task.location}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log('Edit task:', task.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default LocalTaskList;
