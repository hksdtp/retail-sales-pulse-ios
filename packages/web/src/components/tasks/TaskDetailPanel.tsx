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
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
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
  const { currentUser } = useAuth();
  const [checklist, setChecklist] = useState<
    Array<{ id: number; text: string; completed: boolean }>
  >([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [editedTask, setEditedTask] = useState(task);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
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
    'todo': 'bg-gray-400',
    'in-progress': 'bg-blue-500',
    'on-hold': 'bg-amber-400',
    'completed': 'bg-green-500',
  };

  const priorityColors = {
    high: 'bg-red-500',
    normal: 'bg-yellow-500',
    low: 'bg-green-500',
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
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={onClose}
          style={{
            zIndex: 2147483646,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}

      {/* Panel - responsive */}
      <div
        className={`fixed top-2 right-2 w-full sm:w-[720px] lg:w-[900px] xl:w-[1100px] bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-full scale-95 opacity-0'}`}
        style={{
          zIndex: 2147483647,
          position: 'fixed',
          top: '8px',
          right: '8px',
          height: 'calc(100vh - 64px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          isolation: 'isolate',
        }}
      >
        {/* Header - responsive */}
        <div className="flex-shrink-0 flex items-center justify-between p-8 border-b border-gray-100/50 bg-gradient-to-r from-blue-500/90 to-indigo-600/90 backdrop-blur-sm rounded-t-[24px]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Chi tiết công việc</h2>
              <p className="text-blue-100 text-base opacity-90">Chỉnh sửa và quản lý</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Title & Status Section - responsive */}
          <div className="p-8 bg-gradient-to-br from-gray-50/50 to-white border-b border-gray-100/50">
            <div className="relative">
              <input
                type="text"
                value={editedTask?.title || ''}
                onChange={(e) => setEditedTask((prev) => ({ ...prev, title: e.target.value }))}
                className="text-2xl font-bold text-gray-900 mb-6 w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-4 focus:outline-none focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                placeholder="Nhập tiêu đề công việc..."
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200 w-0 focus-within:w-full"></div>
            </div>

            {/* Meta Info - responsive */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200/50">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 font-medium text-base">{formatDate(task.date)}</span>
                </div>
                {task.time && (
                  <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200/50">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 font-medium text-base">{task.time}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200/50">
                  <User className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700 font-medium text-base">{task.user_name || 'Chưa xác định'}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`px-5 py-3 text-base font-semibold rounded-full text-white shadow-lg ${statusColors[task.status]} backdrop-blur-sm`}
                >
                  {statusMapping[task.status]}
                </div>
                <div
                  className={`px-5 py-3 text-base font-semibold rounded-full text-white shadow-lg ${priorityColors[task.priority || 'normal']} backdrop-blur-sm`}
                >
                  {priorityMapping[task.priority || 'normal']}
                </div>
              </div>
            </div>

            {/* Progress Bar - Dựa trên checklist */}
            <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-800">Tiến độ hoàn thành</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {getProgressFromChecklist()}%
                  </span>
                </div>
              </div>
              <div className="relative w-full bg-gray-200/70 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${getProgressFromChecklist()}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">
                  {checklist.filter((item) => item.completed).length} / {checklist.length} hoàn thành
                </span>
                <span className="text-xs text-gray-500">Dựa trên checklist</span>
              </div>
            </div>
          </div>

          {/* Description Section - responsive */}
          <div className="p-8 flex-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Nội dung công việc</h4>
                <p className="text-base text-gray-500">Mô tả chi tiết về công việc</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-8 min-h-[250px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <textarea
                value={editedTask?.description || ''}
                onChange={(e) =>
                  setEditedTask((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full h-56 text-gray-700 leading-relaxed text-base resize-none border-none bg-transparent focus:outline-none placeholder-gray-400 pt-3"
                placeholder="Nhập mô tả chi tiết về công việc, yêu cầu, mục tiêu..."
              />
            </div>

            {/* Checklist Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Checklist công việc</h4>
                    <p className="text-base text-gray-500">Theo dõi tiến độ từng bước</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-full text-base font-semibold shadow-lg">
                  {checklist.filter((item) => item.completed).length}/{checklist.length}
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3 mb-6">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center group bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 hover:shadow-md transition-all duration-200">
                    <button
                      onClick={() => {
                        setChecklist((prev) =>
                          prev.map((i) =>
                            i.id === item.id ? { ...i, completed: !i.completed } : i,
                          ),
                        );
                      }}
                      className={`w-6 h-6 rounded-xl border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                        item.completed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-500 text-white shadow-lg scale-110'
                          : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      {item.completed && <Check className="w-4 h-4" />}
                    </button>
                    <span
                      className={`flex-1 font-medium transition-all duration-200 ${
                        item.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-700'
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => {
                        setChecklist((prev) => prev.filter((i) => i.id !== item.id));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Item */}
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Thêm mục mới vào checklist..."
                  className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder-gray-400 font-medium"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newChecklistItem.trim()) {
                      setChecklist((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          text: newChecklistItem.trim(),
                          completed: false,
                        },
                      ]);
                      setNewChecklistItem('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newChecklistItem.trim()) {
                      setChecklist((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          text: newChecklistItem.trim(),
                          completed: false,
                        },
                      ]);
                      setNewChecklistItem('');
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium text-sm"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - responsive */}
        <div className="flex-shrink-0 border-t border-gray-100/50 p-8 bg-white/80 backdrop-blur-sm rounded-b-[24px]">
          <div className="flex flex-col lg:flex-row gap-4">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('💾 SAVING TASK!', editedTask);

                if (currentUser && task) {
                  const changes = [];
                  if (editedTask.title !== task.title) changes.push('tiêu đề');
                  if (editedTask.description !== task.description) changes.push('mô tả');

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

                onEdit && onEdit(editedTask);
                alert('Đã lưu công việc thành công!');
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-200 h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
              type="button"
            >
              <Save className="w-5 h-5 mr-3" />
              Lưu công việc
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔴 DETAIL PANEL DELETE CLICKED!', task.id);
                onDelete && onDelete(task.id);
              }}
              variant="outline"
              className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 h-14 text-base font-semibold rounded-xl hover:shadow-lg transform hover:scale-105"
              type="button"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Xóa công việc
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetailPanel;
