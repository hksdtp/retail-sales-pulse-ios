import React from 'react';

import { useIsMobile } from '@/hooks/use-mobile';
import { Task } from '../types/TaskTypes';
import TaskCard from './TaskCard';
import SwipeableTaskCard from './SwipeableTaskCard';

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  getTeamName: (teamId: string) => string;
  getAssigneeName: (userId: string) => string;
  onTaskClick?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  onTaskComplete?: (task: Task) => void;
}

const TaskGroup = ({
  title,
  tasks,
  getTeamName,
  getAssigneeName,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onTaskComplete
}: TaskGroupProps) => {
  const isMobile = useIsMobile();
  // Tính toán thông tin tiến độ
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress').length;
  const progressPercentage =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4 bg-white/80 p-6 rounded-2xl shadow-lg border border-gray-200/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-xl text-gray-800">
            {title}{' '}
            <span className="text-base font-normal text-gray-500">({tasks.length} công việc)</span>
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              Hoàn thành: {completedTasks}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Đang làm: {inProgressTasks}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              Còn lại: {tasks.length - completedTasks - inProgressTasks}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-2 font-medium">Tiến độ: {progressPercentage}%</div>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}>
        {tasks.map((task) => (
          <div key={task.id} className="h-full">
            {isMobile ? (
              <SwipeableTaskCard
                task={task}
                getTeamName={getTeamName}
                getAssigneeName={getAssigneeName}
                onTaskClick={onTaskClick}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                onComplete={onTaskComplete}
              />
            ) : (
              <TaskCard
                task={task}
                getTeamName={getTeamName}
                getAssigneeName={getAssigneeName}
                onTaskClick={onTaskClick}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskGroup;
