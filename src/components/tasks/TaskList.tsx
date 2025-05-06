
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import TaskEmptyState from './task-components/TaskEmptyState';
import TaskGroup from './task-components/TaskGroup';
import { filterTasksByUserRole, groupTasks } from './task-utils/TaskFilters';
import { tasks } from './data/TasksData';
import { TaskListProps } from './types/TaskTypes';

const TaskList = ({ location, teamId }: TaskListProps) => {
  const { teams, users, currentUser } = useAuth();
  
  // Lọc công việc dựa trên vai trò người dùng và các tham số lọc
  const filteredTasks = filterTasksByUserRole(tasks, currentUser, teams, location, teamId);
  
  // Nhóm công việc theo thời gian
  const groupedTasks = groupTasks(filteredTasks);
  
  // Tìm thông tin nhóm và người được giao
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Không xác định';
  };
  
  const getAssigneeName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Không xác định';
  };

  // Hiển thị thông báo nếu không có công việc nào thỏa mãn điều kiện lọc
  if (Object.keys(groupedTasks).length === 0) {
    return <TaskEmptyState />;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([group, tasks]) => (
        <TaskGroup
          key={group}
          title={group}
          tasks={tasks}
          getTeamName={getTeamName}
          getAssigneeName={getAssigneeName}
        />
      ))}
    </div>
  );
};

export default TaskList;
