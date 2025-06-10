import { RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { TaskFilters } from '@/context/TaskContext';
import { useTaskData } from '@/hooks/use-task-data';

import TaskDetailPanel from './TaskDetailPanel';
import TaskEmptyState from './task-components/TaskEmptyState';
import TaskFilter from './task-components/TaskFilter';
import TaskGroup from './task-components/TaskGroup';
import { TaskSkeletonList } from './task-components/TaskSkeleton';
import { filterTasksByUserRole, groupTasks } from './task-utils/TaskFilters';
import { Task, TaskListProps } from './types/TaskTypes';

const TaskList = ({ location, teamId }: TaskListProps) => {
  const { teams, users, currentUser } = useAuth();
  const { tasks, isLoading, refreshTasks, filterTasks } = useTaskData();
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<TaskFilters>({
    dateRange: 'all',
    status: '',
    progress: null,
  });

  // Xử lý làm mới dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks();
    setIsRefreshing(false);
  };

  // Xử lý lọc dữ liệu
  const handleFilterChange = (newFilters: TaskFilters) => {
    setAppliedFilters(newFilters);
  };

  // Lọc các công việc dựa trên các bộ lọc được áp dụng
  const filteredTasks = filterTasks(appliedFilters);

  // Tạo nhóm công việc đơn giản
  const groupedTasks = {
    'Công việc': filteredTasks,
  };

  // Tìm thông tin nhóm và người được giao
  const getTeamName = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : 'Không xác định';
  };

  const getAssigneeName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : 'Không xác định';
  };

  // Hiển thị skeleton khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled
          >
            Hiển thị bộ lọc
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            Đang tải...
          </Button>
        </div>

        <TaskSkeletonList count={5} />
      </div>
    );
  }

  // Kiểm tra nếu không có công việc nào
  if (filteredTasks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4 mb-4">
            <TaskFilter onFilterChange={handleFilterChange} />
          </Card>
        )}

        <TaskEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
        </Button>
      </div>

      {showFilters && (
        <Card className="p-4 mb-4">
          <TaskFilter onFilterChange={handleFilterChange} />
        </Card>
      )}

      {Object.entries(groupedTasks).map(([type, tasks]) => (
        <TaskGroup
          key={type}
          title={type}
          tasks={tasks}
          getTeamName={getTeamName}
          getAssigneeName={getAssigneeName}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setShowTaskDetail(true);
          }}
        />
      ))}

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={showTaskDetail}
        onClose={() => {
          setShowTaskDetail(false);
          setSelectedTask(null);
        }}
        onEdit={(updatedTask) => {
          console.log('Task updated:', updatedTask);
          // Refresh tasks to get latest data
          refreshTasks();
          setShowTaskDetail(false);
          setSelectedTask(null);
        }}
        onDelete={(taskId) => {
          console.log('Task deleted:', taskId);
          // Refresh tasks to get latest data
          refreshTasks();
          setShowTaskDetail(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
};

export default TaskList;
