import {
  Activity,
  Bell,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Download,
  Edit,
  FileStack,
  FileText,
  Filter,
  Folder,
  FolderClosed,
  FolderOpen,
  Gauge,
  Globe,
  Grid3X3,
  Home,
  Image,
  Link2,
  List,
  Mail,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Package,
  PieChart,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Square,
  Star,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useManagerTaskData } from '@/hooks/use-manager-task-data';
import { useTaskData } from '@/hooks/use-task-data';
import notificationService from '@/services/notificationService';

import LoadingScreen from '@/components/ui/LoadingScreen';
import MemberTaskSelector from './MemberTaskSelector';
import TaskDetailPanel from './TaskDetailPanel';
import { getStatusColor, getTypeName } from './task-utils/TaskFormatters';
import { Task } from './types/TaskTypes';

// Mapping trạng thái theo form nhập công việc
const statusMapping = {
  'todo': 'Chưa bắt đầu',
  'in-progress': 'Đang thực hiện',
  'on-hold': 'Đang chờ',
  'completed': 'Đã hoàn thành',
};

const statusColors = {
  'todo': 'bg-gray-400 hover:bg-gray-500',
  'in-progress': 'bg-blue-500 hover:bg-blue-600',
  'on-hold': 'bg-amber-400 hover:bg-amber-500',
  'completed': 'bg-green-500 hover:bg-green-600',
};

// Thứ tự chuyển trạng thái
const statusFlow = {
  'todo': 'in-progress',
  'in-progress': 'completed',
  'on-hold': 'in-progress',
  'completed': 'todo',
};

// Mapping mức độ ưu tiên
const priorityMapping = {
  high: 'Cao',
  normal: 'Bình thường',
  low: 'Thấp',
};

const priorityColors = {
  high: 'bg-red-500 hover:bg-red-600 text-white',
  normal: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  low: 'bg-green-500 hover:bg-green-600 text-white',
};

// Thứ tự chuyển mức độ ưu tiên
const priorityFlow = {
  low: 'normal',
  normal: 'high',
  high: 'low',
};

// Mapping loại công việc với icon
const typeMapping = {
  partner_new: { code: 'ĐT', icon: Users },
  partner_old: { code: 'ĐT', icon: Users },
  architect_new: { code: 'KTS', icon: UserCheck },
  architect_old: { code: 'KTS', icon: UserCheck },
  client_new: { code: 'KH', icon: User },
  client_old: { code: 'KH', icon: User },
  quote_new: { code: 'BG', icon: Package },
  quote_old: { code: 'BG', icon: Package },
  report: { code: 'BC', icon: FileText },
  training: { code: 'DT', icon: Users },
  meeting: { code: 'HỌP', icon: MessageCircle },
  inventory: { code: 'TK', icon: Package },
  other: { code: 'KC', icon: Circle },
};

const typeColors = {
  ĐT: 'bg-green-100 text-green-700',
  KTS: 'bg-blue-100 text-blue-700',
  KH: 'bg-green-100 text-green-700',
  BG: 'bg-red-100 text-red-700',
  BC: 'bg-yellow-100 text-yellow-700',
  DT: 'bg-green-100 text-green-700',
  HỌP: 'bg-purple-100 text-purple-700',
  TK: 'bg-yellow-100 text-yellow-700',
  KC: 'bg-gray-100 text-gray-700',
};

interface TaskManagementViewProps {
  viewLevel?: string;
  selectedMemberId?: string | null;
  onViewLevelChange?: (viewLevel: string) => void;
  onSelectedMemberChange?: (memberId: string | null) => void;
  onCreateTask?: () => void;
}

export default function TaskManagementView({
  viewLevel = 'personal',
  selectedMemberId,
  onViewLevelChange,
  onSelectedMemberChange,
  onCreateTask,
}: TaskManagementViewProps) {
  const { currentUser, users, teams } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState('Việc tôi làm');
  const [expandedSections, setExpandedSections] = useState({
    'HỘP TIN': true,
    'MỤC CỦA TÔI': true,
    'MỤC ĐẶC BIỆT': false,
    'MẢNG VIỆC GẦN SAO': false,
    'PHÒNG LÀM VIỆC GẦN SAO': false,
    'BÁO CÁO GẦN SAO': false,
    'BỘ LỌC GẦN SAO': false,
    'THƯ MỤC GẦN SAO': false,
  });
  const [selectedView, setSelectedView] = useState(viewLevel);
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // Early return nếu chưa có currentUser
  if (!currentUser) {
    return <LoadingScreen message="Đang khởi tạo dữ liệu người dùng..." />;
  }

  // Sử dụng hook phù hợp dựa trên role
  const isManager =
    currentUser?.role === 'team_leader' ||
    currentUser?.role === 'retail_director' ||
    currentUser?.role === 'project_director';

  // Dữ liệu trống - sẵn sàng cho dữ liệu thật
  const mockTasks: any[] = [];

  let regularTaskData, managerTaskData;
  try {
    regularTaskData = useTaskData();
    managerTaskData = useManagerTaskData(viewLevel as any, selectedMemberId);
  } catch (error) {
    console.error('Error with hooks, using mock data:', error);
    regularTaskData = { tasks: mockTasks };
    managerTaskData = { tasks: mockTasks };
  }

  // Chọn data source dựa trên viewLevel (selectedView)
  const getTasksForView = (view: string) => {
    const regularTasks = regularTaskData?.tasks || [];
    const managerTasks = managerTaskData?.tasks || [];

    switch (view) {
      case 'personal':
        // Công việc cá nhân: được giao trực tiếp cho user hoặc do user tạo
        console.log('🔍 Personal view filtering:');
        console.log('  - currentUser.id:', currentUser?.id);
        console.log('  - regularTasks count:', regularTasks.length);
        console.log('  - regularTasks:', regularTasks);

        const personalTasks = regularTasks.filter((task) => {
          const currentUserId = currentUser?.id;

          // Kiểm tra nhiều cách match ID
          const isAssignedTo = task.assignedTo === currentUserId;
          const isCreatedBy = task.user_id === currentUserId;

          // Loose comparison
          const isAssignedToLoose = task.assignedTo == currentUserId;
          const isCreatedByLoose = task.user_id == currentUserId;

          // Kiểm tra nếu task được giao cho user này (có thể là retail_director)
          const isForCurrentUser = task.assignedTo === currentUserId ||
                                   task.user_id === currentUserId ||
                                   task.assignedTo == currentUserId ||
                                   task.user_id == currentUserId;

          // Đặc biệt cho retail_director: hiển thị tất cả tasks của phòng
          const isRetailDirector = currentUser?.role === 'retail_director';
          const isDepartmentTask = isRetailDirector && (
            task.isShared || // Công việc chung phòng
            task.department === 'retail' || // Thuộc phòng bán lẻ
            task.department_type === 'retail' // Thuộc loại bán lẻ
          );

          console.log(`  - Task "${task.title}":`);
          console.log(`    assignedTo: ${task.assignedTo} (${typeof task.assignedTo})`);
          console.log(`    user_id: ${task.user_id} (${typeof task.user_id})`);
          console.log(`    currentUser.id: ${currentUserId} (${typeof currentUserId})`);
          console.log(`    isForCurrentUser: ${isForCurrentUser}`);
          console.log(`    isRetailDirector: ${isRetailDirector}`);
          console.log(`    isDepartmentTask: ${isDepartmentTask}`);
          console.log(`    task.isShared: ${task.isShared}`);
          console.log(`    task.department: ${task.department}`);

          return isForCurrentUser || isDepartmentTask;
        });

        console.log('  - Filtered personalTasks:', personalTasks);
        return personalTasks;
      case 'team':
        if (isManager) {
          // Manager: xem công việc cấp nhóm (team-level tasks)
          // Công việc được giao cho cả nhóm, không phải cá nhân
          return regularTasks.filter(
            (task) =>
              task.isSharedWithTeam && // Công việc được chia sẻ với nhóm
              (currentUser?.role === 'retail_director' ||
                currentUser?.role === 'project_director' ||
                task.team_id === currentUser?.team_id), // Director xem tất cả, Team Leader xem nhóm mình
          );
        } else {
          // Nhân viên: xem công việc được giao cho nhóm
          return regularTasks.filter(
            (task) => task.isSharedWithTeam && task.team_id === currentUser?.team_id,
          );
        }
      case 'individual':
        if (isManager) {
          // Manager: xem công việc cá nhân của thành viên
          if (selectedMemberId) {
            // Xem công việc của thành viên được chọn
            return regularTasks.filter(
              (task) =>
                (task.assignedTo === selectedMemberId || task.user_id === selectedMemberId) &&
                !task.isSharedWithTeam && // Không phải công việc nhóm
                !task.isShared, // Không phải công việc chung phòng
            );
          } else {
            // Xem tất cả công việc cá nhân của các thành viên
            const memberIds = users
              .filter((user) => {
                if (
                  currentUser?.role === 'retail_director' ||
                  currentUser?.role === 'project_director'
                ) {
                  return user.department === currentUser.department && user.id !== currentUser.id;
                } else if (currentUser?.role === 'team_leader') {
                  return user.team_id === currentUser.team_id && user.id !== currentUser.id;
                }
                return false;
              })
              .map((user) => user.id);

            return regularTasks.filter(
              (task) =>
                memberIds.includes(task.assignedTo || '') &&
                !task.isSharedWithTeam && // Không phải công việc nhóm
                !task.isShared, // Không phải công việc chung phòng
            );
          }
        }
        return [];
      case 'department':
        // Công việc chung của cả phòng: sử dụng managerTasks nếu có, fallback về regularTasks
        if (managerTasks.length > 0) {
          console.log('🏢 Using managerTasks for department view:', managerTasks);
          return managerTasks;
        }
        // Fallback: Công việc chung của cả phòng từ regularTasks
        console.log('🏢 Filtering department tasks from regularTasks:', regularTasks.length);
        const departmentTasks = regularTasks.filter((task) => {
          const isShared = task.isShared;
          const isSharedWithTeam = task.isSharedWithTeam;

          // Hiển thị tất cả công việc được chia sẻ (cả phòng và nhóm)
          const shouldShow = isShared || isSharedWithTeam;

          console.log(`  📋 Task "${task.title}":`);
          console.log(`    isShared: ${isShared}`);
          console.log(`    isSharedWithTeam: ${isSharedWithTeam}`);
          console.log(`    shouldShow: ${shouldShow}`);

          return shouldShow;
        });
        console.log('🏢 Final department tasks:', departmentTasks.length);
        return departmentTasks;
      default:
        return regularTasks.filter(
          (task) => task.assignedTo === currentUser?.id || task.user_id === currentUser?.id,
        );
    }
  };

  const baseTasks = getTasksForView(selectedView);

  // Cập nhật localTasks khi baseTasks thay đổi, nhưng giữ lại các thay đổi local
  useEffect(() => {
    console.log('🔄 Updating localTasks with baseTasks:', baseTasks);
    console.log('🔍 Current selectedView:', selectedView);
    console.log('🔍 regularTaskData:', regularTaskData);
    console.log('🔍 managerTaskData:', managerTaskData);
    // Chỉ cập nhật nếu localTasks chưa có dữ liệu hoặc khác biệt về số lượng
    if (localTasks.length === 0 || localTasks.length !== baseTasks.length) {
      setLocalTasks([...baseTasks]);
    }
  }, [baseTasks.length, selectedView]);

  const tasks = localTasks;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Cấu hình menu dựa trên role
  const getMenuItems = () => {
    const baseItems = [
      { name: 'HỘP TIN', count: 1, icon: Mail, items: ['Tất cả'] },
      {
        name: 'MỤC CỦA TÔI',
        items: ['Việc tôi làm', 'Tôi giám sát', 'Tôi liên quan', 'Tôi quyền cao'],
      },
    ];

    if (isManager) {
      baseItems[1].items.push('Công việc của nhóm', 'Công việc của thành viên');
    }

    baseItems.push(
      {
        name: 'MỤC ĐẶC BIỆT',
        items: ['Mục gắn sao', 'Tin nhắn gắn sao'],
      },
      {
        name: 'MẢNG VIỆC GẦN SAO',
        count: 0,
        icon: Folder,
      },
      {
        name: 'PHÒNG LÀM VIỆC GẦN SAO',
        count: 0,
        icon: Building,
      },
      {
        name: 'BÁO CÁO GẦN SAO',
        count: 0,
        icon: PieChart,
      },
      {
        name: 'BỘ LỌC GẦN SAO',
        count: 0,
        icon: Filter,
      },
      {
        name: 'THƯ MỤC GẦN SAO',
        count: 0,
        icon: FolderClosed,
      },
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  // Tạo task view buttons dựa trên role với tên ngắn gọn
  const getTaskViewButtons = () => {
    const baseButtons = [{ icon: User, label: 'Của tôi', value: 'personal' }];

    if (isManager) {
      baseButtons.push(
        { icon: Users, label: 'Của nhóm', value: 'team' }, // Công việc cấp nhóm
        { icon: UserCheck, label: 'Thành viên', value: 'individual' }, // Công việc cá nhân của thành viên
      );
    } else {
      // Nhân viên cũng có thể xem công việc của nhóm
      baseButtons.push({ icon: Users, label: 'Của nhóm', value: 'team' });
    }

    // Thêm công việc chung cho tất cả
    baseButtons.push({ icon: Globe, label: 'Chung', value: 'department' });

    return baseButtons;
  };

  const taskViewButtons = getTaskViewButtons();

  // Cập nhật selectedView dựa trên viewLevel
  useEffect(() => {
    setSelectedView(viewLevel);
  }, [viewLevel]);

  // Hàm lấy tên người dùng
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : 'Không xác định';
  };

  // Hàm lấy initials từ tên
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format ngày
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Hàm chuyển trạng thái công việc
  const handleStatusChange = async (e: React.MouseEvent, taskId: string, currentStatus: string) => {
    e.preventDefault();
    e.stopPropagation();

    const nextStatus = statusFlow[currentStatus as keyof typeof statusFlow];
    if (!nextStatus) return;

    try {
      console.log(`🔄 Chuyển trạng thái task ${taskId} từ ${currentStatus} sang ${nextStatus}`);

      // Tìm task để lấy thông tin
      const task = localTasks.find((t) => t.id === taskId);
      if (!task) return;

      // Cập nhật trạng thái trong localTasks
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)),
      );

      // Tạo thông báo cho Trưởng phòng/Trưởng bộ phận
      if (currentUser) {
        notificationService.statusChangeNotification(
          taskId,
          task.title || 'Công việc không có tiêu đề',
          currentUser.id,
          currentUser.name,
          currentStatus,
          nextStatus,
        );
      }

      console.log(`✅ Đã cập nhật trạng thái task ${taskId} và tạo thông báo`);
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái:', error);
    }
  };

  // Hàm chuyển mức độ ưu tiên
  const handlePriorityChange = async (
    e: React.MouseEvent,
    taskId: string,
    currentPriority: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const nextPriority = priorityFlow[currentPriority as keyof typeof priorityFlow];
    if (!nextPriority) return;

    try {
      console.log(
        `🎯 Chuyển mức độ ưu tiên task ${taskId} từ ${currentPriority} sang ${nextPriority}`,
      );

      // Tìm task để lấy thông tin
      const task = localTasks.find((t) => t.id === taskId);
      if (!task) return;

      // Cập nhật mức độ ưu tiên trong localTasks
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, priority: nextPriority } : task)),
      );

      // Tạo thông báo cho Trưởng phòng/Trưởng bộ phận
      if (currentUser) {
        notificationService.priorityChangeNotification(
          taskId,
          task.title || 'Công việc không có tiêu đề',
          currentUser.id,
          currentUser.name,
          currentPriority,
          nextPriority,
        );
      }

      console.log(`✅ Đã cập nhật ưu tiên task ${taskId} và tạo thông báo`);
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật mức độ ưu tiên:', error);
    }
  };

  // Left menu items
  const leftMenuItems = [
    { icon: Bell, label: 'Thông báo', badge: 1 },
    { icon: Home, label: 'Cá nhân', active: true },
    { icon: Users, label: 'Tổ chức' },
    { icon: Building2, label: 'Phòng làm việc' },
    { icon: Gauge, label: 'Mở rộng' },
    { icon: MessageCircle, label: 'Chat riêng', badge: 1 },
    { icon: User, label: 'Người dùng', isAvatar: true },
  ];

  return (
    <>
      <div className="bg-white rounded-none sm:rounded-2xl shadow-lg border-0 sm:border border-gray-100 overflow-hidden">
        {/* Header với view buttons - responsive */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
            {/* View buttons - responsive layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
              <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-3">
                {taskViewButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => {
                      setSelectedView(btn.value);
                      if (onViewLevelChange) {
                        onViewLevelChange(btn.value);
                      }
                    }}
                    className={`flex items-center px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 transform hover:scale-105 ${
                      viewLevel === btn.value
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <btn.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-1.5 lg:mr-2" />
                    <span className="whitespace-nowrap text-xs sm:text-sm lg:text-base">
                      {btn.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Action buttons - responsive */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button className="p-1 sm:p-1.5 lg:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </div>

            {/* Member Selector cho Individual view - di chuyển xuống dưới */}
            {isManager && viewLevel === 'individual' && (
              <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 relative z-[100]">
                <MemberTaskSelector
                  selectedMemberId={selectedMemberId}
                  onMemberChange={onSelectedMemberChange}
                  taskCounts={{}}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content - responsive */}
        <div className="relative z-10">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskDetail(true);
                }}
                className="border-b border-gray-200 p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center flex-1 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg ${typeColors[typeMapping[task.type]?.code || 'KC']} flex items-center justify-center mr-2 flex-shrink-0`}
                    >
                      {React.createElement(typeMapping[task.type]?.icon || Circle, {
                        className: 'w-3 h-3',
                      })}
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm truncate">{task.title}</h3>
                  </div>
                  <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert(`Chỉnh sửa công việc: ${task.title}`);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc muốn xóa công việc "${task.title}"?`)) {
                          setLocalTasks((prev) => prev.filter((t) => t.id !== task.id));
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(e, task.id, task.status);
                    }}
                    className={`px-2 py-1 text-xs rounded-full text-white ${statusColors[task.status]}`}
                  >
                    {statusMapping[task.status]}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePriorityChange(e, task.id, task.priority || 'normal');
                    }}
                    className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority || 'normal']}`}
                  >
                    {priorityMapping[task.priority || 'normal']}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold mr-1">
                      {getInitials(getUserName(task.assignedTo))}
                    </div>
                    <span className="truncate">{getUserName(task.assignedTo)}</span>
                  </div>
                  <span className="flex-shrink-0">{formatDate(task.date)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-3 sm:px-4 lg:px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider w-2/5">
                    Tiêu đề
                  </th>
                  <th className="text-left px-3 sm:px-4 lg:px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider w-1/5">
                    Trạng thái & Ưu tiên
                  </th>
                  <th className="text-left px-3 sm:px-4 lg:px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell w-1/6">
                    Người làm
                  </th>
                  <th className="text-left px-3 sm:px-4 lg:px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider w-1/6">
                    Tới hạn
                  </th>
                  <th className="text-left px-3 sm:px-4 lg:px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider w-24">
                    Tương tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      // Chỉ mở detail nếu không click vào button
                      if (!(e.target as HTMLElement).closest('button')) {
                        setSelectedTask(task);
                        setShowTaskDetail(true);
                      }
                    }}
                  >
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className="flex items-center min-w-0">
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${typeColors[typeMapping[task.type]?.code || 'KC']} flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0`}
                        >
                          {React.createElement(typeMapping[task.type]?.icon || Circle, {
                            className: 'w-3 h-3 sm:w-4 sm:h-4',
                          })}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate" title={task.title}>
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={(e) => {
                            console.log('🔴 Status button clicked!', task.id, task.status);
                            handleStatusChange(e, task.id, task.status);
                          }}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white transition-all duration-200 ${statusColors[task.status]} cursor-pointer transform hover:scale-105 active:scale-95 whitespace-nowrap`}
                          title={`Click để chuyển sang: ${statusMapping[statusFlow[task.status as keyof typeof statusFlow]] || 'Không thể chuyển'}`}
                        >
                          {statusMapping[task.status] || 'Chưa bắt đầu'}
                        </button>
                        <button
                          onClick={(e) => {
                            console.log('🟡 Priority button clicked!', task.id, task.priority);
                            handlePriorityChange(e, task.id, task.priority || 'normal');
                          }}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${priorityColors[task.priority || 'normal']} cursor-pointer transform hover:scale-105 active:scale-95 whitespace-nowrap`}
                          title={`Click để chuyển sang: ${priorityMapping[priorityFlow[(task.priority || 'normal') as keyof typeof priorityFlow]] || 'Không thể chuyển'}`}
                        >
                          {priorityMapping[task.priority || 'normal'] || 'Bình thường'}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <div className="flex items-center min-w-0">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                          {getInitials(getUserName(task.assignedTo))}
                        </div>
                        <span className="text-sm text-gray-900 truncate" title={getUserName(task.assignedTo)}>
                          {getUserName(task.assignedTo)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-900">
                      <span className="whitespace-nowrap">{formatDate(task.date)}</span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1 justify-end">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔵 EDIT BUTTON CLICKED!', task);
                            alert(`Chỉnh sửa công việc: ${task.title}`);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            console.log('🔵 EDIT BUTTON MOUSE DOWN!');
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                          title="Chỉnh sửa"
                          type="button"
                        >
                          <Edit className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔴 DELETE BUTTON CLICKED!', task.id);
                            if (confirm(`Bạn có chắc muốn xóa công việc "${task.title}"?`)) {
                              setLocalTasks((prev) => prev.filter((t) => t.id !== task.id));
                              alert('Đã xóa công việc!');
                            }
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            console.log('🔴 DELETE BUTTON MOUSE DOWN!');
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                          title="Xóa"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Trước
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={showTaskDetail}
        onClose={() => {
          setShowTaskDetail(false);
          setSelectedTask(null);
        }}
        onEdit={(updatedTask) => {
          console.log('💾 Saving task from detail panel:', updatedTask);
          // Cập nhật task trong localTasks
          setLocalTasks((prev) =>
            prev.map((task) =>
              task.id === updatedTask.id
                ? { ...task, ...updatedTask, updated_at: new Date().toISOString() }
                : task,
            ),
          );
          // Cập nhật selectedTask để reflect changes
          setSelectedTask(updatedTask);
          console.log('✅ Task updated successfully!');
        }}
        onDelete={(taskId) => {
          console.log('Delete task from detail panel:', taskId);
          if (confirm(`Bạn có chắc muốn xóa công việc này?`)) {
            setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
            setShowTaskDetail(false);
            setSelectedTask(null);
            alert('Đã xóa công việc!');
          }
        }}
      />
    </>
  );
}
