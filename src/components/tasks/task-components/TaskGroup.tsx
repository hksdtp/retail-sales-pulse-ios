
import React from 'react';
import { Task } from '../types/TaskTypes';
import TaskCard from './TaskCard';

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  getTeamName: (teamId: string) => string;
  getAssigneeName: (userId: string) => string;
}

const TaskGroup = ({ title, tasks, getTeamName, getAssigneeName }: TaskGroupProps) => {
  // Tính toán thông tin tiến độ
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  return (
    <div className="space-y-3 bg-white/60 p-6 rounded-2xl shadow-sm border border-white/40 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-medium text-lg">
            {title} <span className="text-sm font-normal text-gray-500">({tasks.length} công việc)</span>
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
              Hoàn thành: {completedTasks}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
              Đang làm: {inProgressTasks}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
              Còn lại: {tasks.length - completedTasks - inProgressTasks}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Tiến độ: {progressPercentage}%</div>
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks.map(task => (
          <div key={task.id} className="h-full">
            <TaskCard 
              task={task} 
              getTeamName={getTeamName} 
              getAssigneeName={getAssigneeName} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskGroup;
