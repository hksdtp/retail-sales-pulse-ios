import { Briefcase, Calendar, Clock, FilePen, FileText, UserRound, Users } from 'lucide-react';
import React, { useState, memo, useMemo, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';

import { Task } from '../types/TaskTypes';
import TaskActionMenu from './TaskActionMenu';

// Import sẽ được khai báo khi TaskEditDialog đã được tạo và hoàn thiện
// import TaskEditDialog from './TaskEditDialog';

interface TaskCardProps {
  task: Task;
  getTeamName?: (teamId: string) => string;
  getAssigneeName?: (userId: string) => string;
  onTaskClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = memo(({
  task,
  getTeamName = () => 'Không xác định',
  getAssigneeName = () => 'Không xác định',
  onTaskClick,
}) => {
  const { users } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Memoized function để lấy tên người dùng từ nhiều nguồn
  const userName = useMemo(() => {
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
  }, [task.user_name, task.user_id, task.assignedTo, users]);


  // Memoized task type badge
  const taskTypeBadge = useMemo(() => {
    let label = '';
    let className = '';

    switch (task.type) {
      case 'partner_new':
        label = 'KH: Đối tác mới';
        className = 'bg-purple-100 text-purple-800 border-purple-300';
        break;
      case 'partner_old':
        label = 'KH: Đối tác cũ';
        className = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'architect_new':
        label = 'KH: KTS mới';
        className = 'bg-indigo-100 text-indigo-800 border-indigo-300';
        break;
      case 'architect_old':
        label = 'KH: KTS cũ';
        className = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'client_new':
        label = 'KH: Khách hàng mới';
        className = 'bg-blue-100 text-blue-800 border-blue-300';
        break;
      case 'client_old':
        label = 'KH: Khách hàng cũ';
        className = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'quote_new':
        label = 'Báo giá mới';
        className = 'bg-pink-100 text-pink-800 border-pink-300';
        break;
      case 'quote_old':
        label = 'Báo giá cũ';
        className = 'bg-pink-50 text-pink-700 border-pink-200';
        break;
      default:
        label = 'Khác';
        className = 'bg-gray-100 text-gray-800 border-gray-300';
        break;
    }

    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    );
  }, [task.type]);

  // Memoized task status badge
  const taskStatusBadge = useMemo(() => {
    switch (task.status) {
      case 'todo':
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300 font-medium dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            Cần làm
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300 font-medium dark:bg-blue-800 dark:text-blue-200 dark:border-blue-600"
          >
            Đang làm
          </Badge>
        );
      case 'on-hold':
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-300 font-medium dark:bg-amber-800 dark:text-amber-200 dark:border-amber-600"
          >
            Tạm hoãn
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium dark:bg-emerald-800 dark:text-emerald-200 dark:border-emerald-600"
          >
            Hoàn thành
          </Badge>
        );
      default:
        return <Badge variant="outline">{task.status}</Badge>;
    }
  }, [task.status]);

  // Hiển thị nhãn công việc mới
  const getNewBadge = () => {
    if (task.isNew) {
      return <Badge className="bg-red-500 hover:bg-red-600 text-white">Mới</Badge>;
    }
    return null;
  };

  // Memoized callbacks
  const handleEdit = useCallback(() => {
    // Hiện tại chỉ hiển thị thông báo đơn giản
    alert(`Chỉnh sửa công việc: ${task.title}`);
    // setEditDialogOpen(true);
  }, [task.title]);

  const handleCardClick = useCallback(() => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  }, [onTaskClick, task]);

  const handleActionMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="bg-white rounded-xl p-5 shadow-md border border-gray-200/50 relative hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer macos-card"
      onClick={handleCardClick}
    >
      <div className="absolute top-4 right-4" onClick={handleActionMenuClick}>
        <TaskActionMenu task={task} onEdit={handleEdit} />
      </div>

      <div className="flex flex-col h-full">
        {/* Phần header với tiêu đề */}
        <div className="mb-4 pr-8">
          <h3 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2">{task.title}</h3>
        </div>

        {/* Phần trạng thái */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {task.isNew && <Badge className="bg-green-500 text-white">Mới</Badge>}
        </div>

        {/* Phần mô tả */}
        <div className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{task.description}</div>

        {/* Phần thông tin về ngày, nhóm, người thực hiện */}
        <div className="mt-auto space-y-3 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">{taskTypeBadge}</span>
            <div className="flex space-x-2">
              {taskStatusBadge}
              {task.isNew && <Badge className="bg-green-500">Mới</Badge>}
            </div>
          </div>
          <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{task.date}</span>
            {task.time && (
              <>
                <Clock className="h-4 w-4 mx-2 text-green-500" />
                <span className="font-medium">{task.time}</span>
              </>
            )}
          </div>

          <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <Users className="h-4 w-4 mr-2 text-purple-500" />
            <span className="font-medium">{getTeamName(task.teamId)}</span>
          </div>

          <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <UserRound className="h-4 w-4 mr-2 text-orange-500" />
            <span className="font-medium">{userName}</span>
          </div>

          {/* Hiển thị tiến độ */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 font-medium">Tiến độ:</span>
              <span className="text-sm font-bold text-blue-600">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Dialog chỉnh sửa công việc (sẽ được cập nhật sau) */}
      {/* {editDialogOpen && (
        <TaskEditDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen} 
          task={task} 
        />
      )} */}
    </div>
  );
};

export default TaskCard;
