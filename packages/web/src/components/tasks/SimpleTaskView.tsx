import {
  Activity,
  Calendar,
  CheckSquare,
  Clock,
  Download,
  FileText,
  Filter,
  List,
  MoreVertical,
  Package,
  Square,
  Users,
} from 'lucide-react';
import React from 'react';

// Dữ liệu trống - đã xóa mock data, chỉ sử dụng dữ liệu thật từ server
const mockTasks: any[] = [];

const statusMapping = {
  'todo': 'CẦN LÀM',
  'in-progress': 'ĐANG THỰC HIỆN',
  'completed': 'ĐÃ HOÀN THÀNH',
};

const statusColors = {
  'CẦN LÀM': 'bg-gray-500 dark:bg-gray-400',
  'ĐANG THỰC HIỆN': 'bg-blue-500 dark:bg-blue-400',
  'ĐÃ HOÀN THÀNH': 'bg-green-600 dark:bg-green-500',
};

const typeMapping = {
  client_new: { code: 'KH', icon: Users },
  quote_new: { code: 'BG', icon: Package },
  meeting: { code: 'HỌP', icon: FileText },
  other: { code: 'KC', icon: Square },
};

const typeColors = {
  KH: 'bg-green-100 text-green-700',
  BG: 'bg-red-100 text-red-700',
  HỌP: 'bg-purple-100 text-purple-700',
  KC: 'bg-gray-100 text-gray-700',
};

export default function SimpleTaskView() {
  const viewButtons = [
    { icon: List, label: 'DANH SÁCH MỤC', value: 'list' },
    { icon: Activity, label: 'DÒNG HOẠT ĐỘNG', value: 'activity' },
    { icon: Clock, label: 'DÒNG THỜI GIAN', value: 'timeline' },
    { icon: Calendar, label: 'LỊCH', value: 'calendar' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header với view buttons */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex space-x-2">
            {viewButtons.map((btn) => (
              <button
                key={btn.value}
                className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white"
              >
                <btn.icon className="w-4 h-4 mr-1.5" />
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              Lọc nhanh
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              Trạng thái
            </button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người làm
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tới hạn
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tương tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {mockTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-lg ${typeColors[typeMapping[task.type]?.code || 'KC']} flex items-center justify-center mr-3`}
                    >
                      {React.createElement(typeMapping[task.type]?.icon || Square, {
                        className: 'w-4 h-4',
                      })}
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      {task.title}
                      {task.status === 'completed' && (
                        <CheckSquare className="w-4 h-4 ml-2 text-blue-600" />
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${statusColors[statusMapping[task.status] || 'CẦN LÀM']}`}
                  >
                    {statusMapping[task.status] || 'CẦN LÀM'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                      {getInitials(task.assignedTo)}
                    </div>
                    <span className="text-sm text-gray-900">{task.assignedTo}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(task.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị 1-{mockTasks.length} trong {mockTasks.length} kết quả
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Trước
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
