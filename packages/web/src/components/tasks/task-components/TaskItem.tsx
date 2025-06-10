import { Check, MapPin, User, Users } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';

import {
  getLocationName,
  getStatusColor,
  getTypeColor,
  getTypeName,
} from '../task-utils/TaskFormatters';
import { Task } from '../types/TaskTypes';

interface TaskItemProps {
  task: Task;
  getTeamName: (teamId: string) => string;
  getAssigneeName: (userId: string) => string;
}

const TaskItem = ({ task, getTeamName, getAssigneeName }: TaskItemProps) => {
  const { users } = useAuth();

  // Function để lấy tên người dùng từ nhiều nguồn
  const getUserName = (task: any) => {
    // Ưu tiên: user_name -> tìm trong users array -> assignedTo -> fallback
    if (task.user_name && task.user_name !== 'Không xác định') {
      return task.user_name;
    }

    // Tìm trong users array bằng user_id
    if (task.user_id && users && users.length > 0) {
      const user = users.find(u => u.id === task.user_id);
      if (user && user.name) {
        return user.name;
      }
    }

    // Tìm trong users array bằng assignedTo
    if (task.assignedTo && users && users.length > 0) {
      const user = users.find(u => u.id === task.assignedTo);
      if (user && user.name) {
        return user.name;
      }
    }

    // Fallback về assignedTo nếu không phải ID
    if (task.assignedTo && task.assignedTo !== 'Không xác định' && !task.assignedTo.includes('-')) {
      return task.assignedTo;
    }

    return 'Chưa xác định';
  };

  return (
    <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${task.status === 'completed' ? 'bg-ios-green' : 'border border-gray-300'}`}
          >
            {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {task.title}
              {task.isNew && (
                <Badge variant="default" className="bg-ios-red text-white">
                  Mới
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full ${getStatusColor(task.status)}`}
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${getTypeColor(task.type)}`}>{getTypeName(task.type)}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <MapPin size={14} />
          <span>{getLocationName(task.location)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span>{getTeamName(task.teamId)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <User size={14} />
          <span>{getUserName(task)}</span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskItem;
