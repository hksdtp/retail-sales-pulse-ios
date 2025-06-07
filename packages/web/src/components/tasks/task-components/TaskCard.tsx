import { Briefcase, Calendar, Clock, FilePen, FileText, UserRound, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { Task } from '../types/TaskTypes';
import TaskActionMenu from './TaskActionMenu';

// Import sẽ được khai báo khi TaskEditDialog đã được tạo và hoàn thiện
// import TaskEditDialog from './TaskEditDialog';

interface TaskCardProps {
  task: Task;
  getTeamName?: (teamId: string) => string;
  getAssigneeName?: (userId: string) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  getTeamName = () => 'Không xác định',
  getAssigneeName = () => 'Không xác định',
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Xử lý hiển thị loại công việc với màu sắc khác nhau
  const getTaskTypeBadge = () => {
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
  };

  // Triển khai hiển thị trạng thái công việc với màu sắc đặc trưng
  const getTaskStatusBadge = () => {
    switch (task.status) {
      case 'todo':
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300 font-medium"
          >
            Cần làm
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300 font-medium"
          >
            Đang làm
          </Badge>
        );
      case 'on-hold':
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-300 font-medium"
          >
            Tạm hoãn
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium"
          >
            Hoàn thành
          </Badge>
        );
      default:
        return <Badge variant="outline">{task.status}</Badge>;
    }
  };

  // Hiển thị nhãn công việc mới
  const getNewBadge = () => {
    if (task.isNew) {
      return <Badge className="bg-red-500 hover:bg-red-600 text-white">Mới</Badge>;
    }
    return null;
  };

  // Mở chức năng chỉnh sửa (sẽ được hoàn thiện sau)
  const handleEdit = () => {
    // Hiện tại chỉ hiển thị thông báo đơn giản
    alert(`Chỉnh sửa công việc: ${task.title}`);
    // setEditDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
      <div className="absolute top-3 right-3">
        <TaskActionMenu task={task} onEdit={handleEdit} />
      </div>

      <div className="flex flex-col h-full">
        {/* Phần header với tiêu đề */}
        <div className="mb-3 pr-8">
          <h3 className="text-sm font-semibold text-gray-800 flex-1">{task.title}</h3>
        </div>

        {/* Phần trạng thái */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {task.isNew && <Badge className="bg-green-500 text-white">Mới</Badge>}
        </div>

        {/* Phần mô tả */}
        <div className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</div>

        {/* Phần thông tin về ngày, nhóm, người thực hiện */}
        <div className="mt-auto space-y-2 text-xs">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">{getTaskTypeBadge()}</span>
            <div className="flex space-x-2">
              {getTaskStatusBadge()}
              {task.isNew && <Badge className="bg-green-500">Mới</Badge>}
            </div>
          </div>
          <div className="flex items-center text-gray-500">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>{task.date}</span>
            {task.time && (
              <>
                <Clock className="h-3.5 w-3.5 mx-1.5" />
                <span>{task.time}</span>
              </>
            )}
          </div>

          <div className="flex items-center text-gray-500">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            <span>{getTeamName(task.teamId)}</span>
          </div>

          <div className="flex items-center text-gray-500">
            <UserRound className="h-3.5 w-3.5 mr-1.5" />
            <span>{getAssigneeName(task.assignedTo)}</span>
          </div>

          {/* Hiển thị tiến độ */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Tiến độ:</span>
              <span className="text-xs font-medium">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-1.5" />
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
