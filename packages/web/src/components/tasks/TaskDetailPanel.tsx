import {
  Calendar,
  Check,
  Clock,
  Edit,
  FileText,
  Minus,
  Plus,
  Save,
  Tag,
  Trash2,
  User,
  UserPlus,
  UserMinus,
  X,
  Briefcase,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useTaskData } from '@/hooks/use-task-data';
import notificationService from '@/services/notificationService';

interface TaskDetailPanelProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { currentUser, users } = useAuth();
  const { updateTask } = useTaskData();
  const [checklist, setChecklist] = useState<
    Array<{ id: number; text: string; completed: boolean }>
  >([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [editedTask, setEditedTask] = useState(task);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);

  // Hàm lấy tên loại công việc
  const getTaskTypeName = (type: string) => {
    const typeMapping = {
      'partner_new': 'Đối tác mới',
      'partner_old': 'Đối tác cũ',
      'architect_new': 'KTS mới',
      'architect_old': 'KTS cũ',
      'client_new': 'Khách hàng mới',
      'client_old': 'Khách hàng cũ',
      'quote_new': 'Báo giá mới',
      'quote_old': 'Báo giá cũ',
      'other': 'Công việc khác'
    };
    return typeMapping[type as keyof typeof typeMapping] || type;
  };

  // Hàm lấy màu cho loại công việc
  const getTaskTypeColor = (type: string) => {
    const colorMapping = {
      'partner_new': 'bg-orange-500',
      'partner_old': 'bg-orange-400',
      'architect_new': 'bg-indigo-500',
      'architect_old': 'bg-indigo-400',
      'client_new': 'bg-blue-500',
      'client_old': 'bg-blue-400',
      'quote_new': 'bg-purple-500',
      'quote_old': 'bg-purple-400',
      'other': 'bg-gray-500'
    };
    return colorMapping[type as keyof typeof colorMapping] || 'bg-gray-500';
  };

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

  // Kiểm tra quyền edit task
  const canEditTask = (task: any) => {
    if (!currentUser) return false;

    // Directors có thể edit tất cả tasks
    if (currentUser.role === 'retail_director' || currentUser.role === 'project_director') {
      return true;
    }

    // Team leaders có thể edit tasks của team members
    if (currentUser.role === 'team_leader') {
      // Có thể edit nếu là người tạo hoặc task được assign cho team member
      const isCreator = task.user_id === currentUser.id;
      const isTeamTask = users.some(user =>
        user.team_id === currentUser.team_id &&
        (user.id === task.assignedTo || user.id === task.user_id)
      );
      return isCreator || isTeamTask;
    }

    // Employees chỉ có thể edit tasks của mình
    return task.user_id === currentUser.id || task.assignedTo === currentUser.id;
  };

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      // Khởi tạo checklist từ task data hoặc để trống
      if (task.checklist && Array.isArray(task.checklist)) {
        setChecklist(task.checklist);
      } else {
        setChecklist([]); // Bắt đầu với checklist trống
      }
      // Khởi tạo assigned users
      if (task.assignedUsers && Array.isArray(task.assignedUsers)) {
        setAssignedUsers(task.assignedUsers);
      } else {
        setAssignedUsers([task.userId]); // Creator mặc định được assign
      }
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const statusMapping = {
    'todo': 'Chưa bắt đầu',
    'in-progress': 'Đang thực hiện',
    'on-hold': 'Đang chờ',
    'completed': 'Đã hoàn thành',
  };

  const priorityMapping = {
    urgent: 'Khẩn cấp',
    high: 'Cao',
    normal: 'Bình thường',
    low: 'Thấp',
  };

  const typeMapping = {
    partner_new: 'Đối tác mới',
    partner_old: 'Đối tác cũ',
    architect_new: 'KTS mới',
    architect_old: 'KTS cũ',
    client_new: 'Khách hàng mới',
    client_old: 'Khách hàng cũ',
    quote_new: 'Báo giá mới',
    quote_old: 'Báo giá cũ',
    other: 'Khác',
  };

  const statusColors = {
    'todo': 'bg-gray-400 dark:bg-gray-500',
    'in-progress': 'bg-blue-500 dark:bg-blue-400',
    'on-hold': 'bg-amber-400 dark:bg-amber-500',
    'completed': 'bg-green-500 dark:bg-green-400',
  };

  const priorityColors = {
    urgent: 'bg-red-600 dark:bg-red-500',
    high: 'bg-orange-500 dark:bg-orange-400',
    normal: 'bg-blue-500 dark:bg-blue-400',
    low: 'bg-green-500 dark:bg-green-400',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getProgressFromChecklist = () => {
    if (checklist.length === 0) return 0;
    const completedItems = checklist.filter((item) => item.completed).length;
    return Math.round((completedItems / checklist.length) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="task-detail-panel w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white shadow-2xl border-0 rounded-2xl p-0 flex flex-col"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          zIndex: 10000,
          background: 'white',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: 'min(95vw, 800px)',
          height: 'min(85vh, 650px)',
        }}
      >
        {/* Header - compact */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Chi tiết công việc</h2>
              <p className="text-blue-100 text-xs opacity-90">Chỉnh sửa và quản lý</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 group"
          >
            <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Title & Status Section - compact */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="relative mb-3">
              <input
                type="text"
                value={editedTask?.title || ''}
                onChange={(e) => setEditedTask((prev) => ({ ...prev, title: e.target.value }))}
                disabled={!canEditTask(task)}
                className={`text-lg font-bold text-gray-900 w-full border-0 border-b bg-transparent px-0 py-2 focus:outline-none transition-colors duration-200 placeholder-gray-400 ${
                  canEditTask(task)
                    ? 'border-gray-200 focus:border-blue-500 cursor-text'
                    : 'border-gray-100 cursor-not-allowed opacity-60'
                }`}
                placeholder={canEditTask(task) ? "Nhập tiêu đề công việc..." : "Bạn không có quyền chỉnh sửa"}
              />
            </div>

            {/* Meta Info - compact */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-md border border-gray-200">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {canEditTask(task) ? (
                    <input
                      type="date"
                      value={editedTask?.date || ''}
                      onChange={(e) => setEditedTask((prev) => ({ ...prev, date: e.target.value }))}
                      className="text-gray-700 font-medium text-xs bg-transparent border-none focus:outline-none"
                    />
                  ) : (
                    <span className="text-gray-700 font-medium text-xs">{formatDate(task.date)}</span>
                  )}
                </div>
                <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-md border border-gray-200">
                  <Clock className="w-3.5 h-3.5 text-green-500" />
                  {canEditTask(task) ? (
                    <input
                      type="time"
                      value={editedTask?.time || ''}
                      onChange={(e) => setEditedTask((prev) => ({ ...prev, time: e.target.value }))}
                      className="text-gray-700 font-medium text-xs bg-transparent border-none focus:outline-none"
                    />
                  ) : (
                    <span className="text-gray-700 font-medium text-xs">{task.time || 'Chưa đặt'}</span>
                  )}
                </div>
                <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-md border border-gray-200">
                  <User className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-gray-700 font-medium text-xs">{getUserName(task)}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-md border border-gray-200">
                  <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-gray-700 font-medium text-xs">{getTaskTypeName(task.type)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Task Type Badge */}
                <div
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full text-white ${getTaskTypeColor(task.type)}`}
                >
                  {getTaskTypeName(task.type)}
                </div>

                {canEditTask(task) ? (
                  <>
                    <div className="relative">
                      <select
                        value={editedTask?.status || task.status}
                        onChange={(e) => setEditedTask((prev) => ({ ...prev, status: e.target.value }))}
                        className={`pl-3 pr-8 py-1.5 text-xs font-semibold rounded-full text-white border-none focus:outline-none cursor-pointer appearance-none ${statusColors[editedTask?.status || task.status]}`}
                      >
                        <option value="todo">Chờ làm</option>
                        <option value="in-progress">Đang làm</option>
                        <option value="on-hold">Tạm dừng</option>
                        <option value="completed">Hoàn thành</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="relative">
                      <select
                        value={editedTask?.priority || task.priority || 'normal'}
                        onChange={(e) => setEditedTask((prev) => ({ ...prev, priority: e.target.value }))}
                        className={`pl-3 pr-8 py-1.5 text-xs font-semibold rounded-full text-white border-none focus:outline-none cursor-pointer appearance-none ${priorityColors[editedTask?.priority || task.priority || 'normal']}`}
                      >
                        <option value="urgent">Khẩn cấp</option>
                        <option value="high">Cao</option>
                        <option value="normal">Bình thường</option>
                        <option value="low">Thấp</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full text-white ${statusColors[task.status]}`}
                    >
                      {statusMapping[task.status]}
                    </div>
                    <div
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full text-white ${priorityColors[task.priority || 'normal']}`}
                    >
                      {priorityMapping[task.priority || 'normal']}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar - compact */}
            <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-800">Tiến độ hoàn thành</span>
                <span className="text-xs font-bold text-blue-600">
                  {getProgressFromChecklist()}%
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressFromChecklist()}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-gray-600">
                  {checklist.filter((item) => item.completed).length} / {checklist.length} hoàn thành
                </span>
              </div>
            </div>
          </div>

          {/* Description Section - compact */}
          <div className="p-4 flex-1">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Nội dung công việc</h4>
                <p className="text-xs text-gray-500">Mô tả chi tiết về công việc</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 min-h-[120px]">
              <textarea
                value={editedTask?.description || ''}
                onChange={(e) =>
                  setEditedTask((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={!canEditTask(task)}
                className={`w-full h-28 leading-relaxed text-sm resize-none border-none bg-transparent focus:outline-none placeholder-gray-400 ${
                  canEditTask(task)
                    ? 'text-gray-700 cursor-text'
                    : 'text-gray-500 cursor-not-allowed opacity-60'
                }`}
                placeholder={canEditTask(task) ? "Nhập mô tả chi tiết về công việc..." : "Bạn không có quyền chỉnh sửa nội dung"}
              />
            </div>

            {/* Assigned Users Section */}
            <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Người tham gia</h4>
                    <p className="text-xs text-gray-500">Quản lý người được giao việc</p>
                  </div>
                </div>
                {canEditTask(task) && (
                  <button
                    onClick={() => setShowUserSelector(!showUserSelector)}
                    className="p-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  >
                    <UserPlus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Assigned Users List */}
              <div className="flex flex-wrap gap-2 mb-2">
                {assignedUsers.map((userId) => {
                  const user = users.find(u => u.id === userId);
                  return user ? (
                    <div key={userId} className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
                      <span className="text-xs font-medium text-purple-800">{user.name}</span>
                      {canEditTask(task) && userId !== task.userId && (
                        <button
                          onClick={() => {
                            const updatedUsers = assignedUsers.filter(id => id !== userId);
                            setAssignedUsers(updatedUsers);
                            setEditedTask((prev) => ({ ...prev, assignedUsers: updatedUsers }));
                          }}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <UserMinus className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ) : null;
                })}
              </div>

              {/* User Selector */}
              {showUserSelector && canEditTask(task) && (
                <div className="border-t border-gray-200 pt-2">
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {users
                      .filter(user => !assignedUsers.includes(user.id))
                      .map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            const updatedUsers = [...assignedUsers, user.id];
                            setAssignedUsers(updatedUsers);
                            setEditedTask((prev) => ({ ...prev, assignedUsers: updatedUsers }));
                            setShowUserSelector(false);
                          }}
                          className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                        >
                          {user.name} - {user.role}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Checklist Section - compact */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Checklist công việc</h4>
                    <p className="text-xs text-gray-500">Theo dõi tiến độ từng bước</p>
                  </div>
                </div>
                <div className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                  {checklist.filter((item) => item.completed).length}/{checklist.length}
                </div>
              </div>

              {/* Checklist Items - compact */}
              <div className="space-y-1.5 mb-3">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center group bg-white rounded-lg p-2.5 border border-gray-200 hover:shadow-sm transition-all duration-200">
                    <button
                      onClick={() => {
                        const updatedChecklist = checklist.map((i) =>
                          i.id === item.id ? { ...i, completed: !i.completed } : i,
                        );
                        setChecklist(updatedChecklist);
                        // Cập nhật task với checklist mới
                        setEditedTask((prev) => ({ ...prev, checklist: updatedChecklist }));
                      }}
                      className={`w-4 h-4 rounded border-2 mr-2.5 flex items-center justify-center transition-all duration-200 ${
                        item.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      {item.completed && <Check className="w-2.5 h-2.5" />}
                    </button>
                    <span
                      className={`flex-1 text-xs transition-all duration-200 ${
                        item.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-700'
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => {
                        const updatedChecklist = checklist.filter((i) => i.id !== item.id);
                        setChecklist(updatedChecklist);
                        setEditedTask((prev) => ({ ...prev, checklist: updatedChecklist }));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all duration-200"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Item - compact */}
              <div className="flex items-center space-x-2 bg-white rounded-lg p-2.5 border border-gray-200">
                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                  <Plus className="w-2.5 h-2.5 text-white" />
                </div>
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Thêm mục mới..."
                  className="flex-1 bg-transparent border-none text-xs focus:outline-none placeholder-gray-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newChecklistItem.trim()) {
                      const newItem = {
                        id: Date.now(),
                        text: newChecklistItem.trim(),
                        completed: false,
                      };
                      const updatedChecklist = [...checklist, newItem];
                      setChecklist(updatedChecklist);
                      setEditedTask((prev) => ({ ...prev, checklist: updatedChecklist }));
                      setNewChecklistItem('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newChecklistItem.trim()) {
                      const newItem = {
                        id: Date.now(),
                        text: newChecklistItem.trim(),
                        completed: false,
                      };
                      const updatedChecklist = [...checklist, newItem];
                      setChecklist(updatedChecklist);
                      setEditedTask((prev) => ({ ...prev, checklist: updatedChecklist }));
                      setNewChecklistItem('');
                    }
                  }}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-200 text-xs"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - compact */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-2">
            <Button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!canEditTask(task)) {
                  alert('Bạn không có quyền chỉnh sửa công việc này!');
                  return;
                }

                try {
                  console.log('💾 SAVING TASK WITH FULL DATA!', editedTask);

                  // Validate dữ liệu trước khi lưu
                  if (!editedTask.title?.trim()) {
                    alert('Vui lòng nhập tiêu đề công việc!');
                    return;
                  }

                  if (!editedTask.date) {
                    alert('Vui lòng chọn ngày thực hiện!');
                    return;
                  }

                  // Cập nhật task với tất cả dữ liệu
                  const taskWithFullData = {
                    ...editedTask,
                    checklist: checklist,
                    progress: getProgressFromChecklist(),
                    assignedUsers: assignedUsers,
                    updated_at: new Date().toISOString(),
                  };

                  // Sử dụng updateTask từ context để lưu vào Firebase
                  await updateTask(task.id, taskWithFullData);

                  if (currentUser && task) {
                    const changes = [];
                    if (editedTask.title !== task.title) changes.push('tiêu đề');
                    if (editedTask.description !== task.description) changes.push('mô tả');
                    if (editedTask.date !== task.date) changes.push('ngày thực hiện');
                    if (editedTask.time !== task.time) changes.push('thời gian');
                    if (editedTask.status !== task.status) changes.push('trạng thái');
                    if (editedTask.priority !== task.priority) changes.push('mức độ ưu tiên');
                    if (JSON.stringify(checklist) !== JSON.stringify(task.checklist)) changes.push('checklist');
                    if (JSON.stringify(assignedUsers) !== JSON.stringify(task.assignedUsers)) changes.push('người tham gia');

                    if (changes.length > 0) {
                      notificationService.updateTaskNotification(
                        task.id,
                        editedTask.title || task.title || 'Công việc không có tiêu đề',
                        currentUser.id,
                        currentUser.name,
                        changes.join(', '),
                      );
                    }
                  }

                  // Gọi callback để cập nhật UI ngay lập tức
                  if (onEdit) {
                    onEdit(taskWithFullData);
                  }
                  alert('Đã lưu công việc thành công!');
                  onClose();
                } catch (error) {
                  console.error('Lỗi khi lưu task:', error);
                  alert('Có lỗi xảy ra khi lưu công việc!');
                }
              }}
              disabled={!canEditTask(task)}
              className={`flex-1 h-8 text-xs font-semibold rounded-lg ${
                canEditTask(task)
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
              }`}
              type="button"
            >
              <Save className="w-3 h-3 mr-1.5" />
              {canEditTask(task) ? 'Lưu' : 'Không có quyền'}
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!canEditTask(task)) {
                  alert('Bạn không có quyền xóa công việc này!');
                  return;
                }

                if (confirm(`Bạn có chắc muốn xóa công việc "${task.title}"?\n\nHành động này không thể hoàn tác.`)) {
                  console.log('🔴 DETAIL PANEL DELETE CLICKED!', task.id);
                  // Gọi callback delete để xử lý xóa task
                  if (onDelete) {
                    onDelete(task.id);
                  } else {
                    console.error('❌ onDelete callback not provided');
                    alert('Lỗi: Không thể xóa công việc. Vui lòng thử lại!');
                  }
                }
              }}
              disabled={!canEditTask(task)}
              variant="outline"
              className={`flex-1 h-8 text-xs font-semibold rounded-lg ${
                canEditTask(task)
                  ? 'border border-red-300 text-red-600 hover:bg-red-50'
                  : 'border border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
              }`}
              type="button"
            >
              <Trash2 className="w-3 h-3 mr-1.5" />
              {canEditTask(task) ? 'Xóa' : 'Không có quyền'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailPanel;
