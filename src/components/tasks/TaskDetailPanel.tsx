import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Tag, FileText, Edit, Trash2, Plus, Check, Minus, Save } from 'lucide-react';
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
  onDelete
}) => {
  const { currentUser } = useAuth();
  const [checklist, setChecklist] = useState<Array<{id: number, text: string, completed: boolean}>>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isEditing, setIsEditing] = useState(true); // Mặc định là edit mode
  const [editedTask, setEditedTask] = useState(task);

  // Cập nhật editedTask khi task thay đổi
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
    'completed': 'Đã hoàn thành'
  };

  const priorityMapping = {
    'high': 'Cao',
    'normal': 'Bình thường',
    'low': 'Thấp'
  };

  const typeMapping = {
    'partner_new': 'Đối tác mới',
    'partner_old': 'Đối tác cũ',
    'architect_new': 'KTS mới',
    'architect_old': 'KTS cũ',
    'client_new': 'Khách hàng mới',
    'client_old': 'Khách hàng cũ',
    'quote_new': 'Báo giá mới',
    'quote_old': 'Báo giá cũ',
    'other': 'Khác'
  };

  const statusColors = {
    'todo': 'bg-gray-400',
    'in-progress': 'bg-blue-500', 
    'on-hold': 'bg-amber-400',
    'completed': 'bg-green-500'
  };

  const priorityColors = {
    'high': 'bg-red-500',
    'normal': 'bg-yellow-500',
    'low': 'bg-green-500'
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Tính progress dựa trên checklist
  const getProgressFromChecklist = () => {
    if (checklist.length === 0) return 0;
    const completedItems = checklist.filter(item => item.completed).length;
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
            zIndex: '2147483646',
            position: 'fixed !important',
            top: '0 !important',
            left: '0 !important',
            right: '0 !important',
            bottom: '0 !important'
          }}
        />
      )}

      {/* Panel - responsive */}
      <div
        className={`fixed top-0 right-0 w-full sm:w-[500px] lg:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          zIndex: '2147483647',
          position: 'fixed !important',
          top: '0 !important',
          right: '0 !important',
          height: 'calc(100vh - 80px)',
          bottom: '80px',
          isolation: 'isolate'
        }}
      >
      {/* Header - responsive */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h2 className="text-base sm:text-lg font-semibold text-white">Chi tiết công việc</h2>
        <button
          onClick={onClose}
          className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Title & Status Section - responsive */}
        <div className="p-3 sm:p-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <input
            type="text"
            value={editedTask?.title || ''}
            onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
            className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Nhập tiêu đề công việc..."
          />

          {/* Meta Info - responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-gray-600">📅 {formatDate(task.date)}</span>
              {task.time && <span className="text-gray-600">🕐 {task.time}</span>}
              <span className="text-gray-600">👤 {task.user_name || 'Chưa xác định'}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className={`px-2 py-1 text-xs rounded-full text-white ${statusColors[task.status]}`}>
                {statusMapping[task.status]}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full text-white ${priorityColors[task.priority || 'normal']}`}>
                {priorityMapping[task.priority || 'normal']}
              </span>
            </div>
          </div>

          {/* Progress Bar - Dựa trên checklist */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Tiến độ hoàn thành</span>
              <span className="text-xs font-bold text-blue-600">{getProgressFromChecklist()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressFromChecklist()}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Dựa trên checklist: {checklist.filter(item => item.completed).length}/{checklist.length} hoàn thành
            </div>
          </div>
        </div>

        {/* Description Section - responsive */}
        <div className="p-3 sm:p-4 flex-1">
          <div className="flex items-center mb-2 sm:mb-3">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-1 sm:mr-2" />
            <h4 className="text-sm sm:text-base font-bold text-gray-900">Nội dung công việc</h4>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm mb-3 sm:mb-4 min-h-[120px] sm:min-h-[180px]">
            <textarea
              value={editedTask?.description || ''}
              onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-24 sm:h-40 text-gray-700 leading-relaxed text-xs sm:text-sm resize-none border-none bg-transparent focus:outline-none"
              placeholder="Nhập mô tả công việc..."
            />
          </div>

          {/* Checklist Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-bold text-gray-900 flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Checklist công việc
              </h4>
              <span className="text-xs text-gray-500">
                {checklist.filter(item => item.completed).length}/{checklist.length} hoàn thành
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 mb-4">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center group">
                  <button
                    onClick={() => {
                      setChecklist(prev => prev.map(i =>
                        i.id === item.id ? { ...i, completed: !i.completed } : i
                      ));
                    }}
                    className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3" />}
                  </button>
                  <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => {
                      setChecklist(prev => prev.filter(i => i.id !== item.id));
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Item */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Thêm mục mới..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newChecklistItem.trim()) {
                    setChecklist(prev => [...prev, {
                      id: Date.now(),
                      text: newChecklistItem.trim(),
                      completed: false
                    }]);
                    setNewChecklistItem('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newChecklistItem.trim()) {
                    setChecklist(prev => [...prev, {
                      id: Date.now(),
                      text: newChecklistItem.trim(),
                      completed: false
                    }]);
                    setNewChecklistItem('');
                  }
                }}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>


      </div>

      {/* Actions - responsive */}
      <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4 bg-white">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('💾 SAVING TASK!', editedTask);

              // Tạo thông báo cập nhật task
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
                    changes.join(', ')
                  );
                }
              }

              onEdit && onEdit(editedTask);
              // Thông báo và đóng panel
              alert('Đã lưu công việc thành công!');
              onClose();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-colors h-9 sm:h-10 text-xs sm:text-sm"
            type="button"
          >
            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 transition-colors h-9 sm:h-10 text-xs sm:text-sm"
            type="button"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Xóa
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};

export default TaskDetailPanel;
