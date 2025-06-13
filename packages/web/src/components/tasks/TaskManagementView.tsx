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
import { useIsMobile } from '@/hooks/use-mobile';
import notificationService from '@/services/notificationService';

import LoadingScreen from '@/components/ui/LoadingScreen';
import MemberTaskSelector from './MemberTaskSelector';
import MemberViewFilters from './MemberViewFilters';
import TaskDetailPanel from './TaskDetailPanel';
import TaskSearchBar from './TaskSearchBar';
import { getStatusColor, getTypeName } from './task-utils/TaskFormatters';
import { sortTasks } from './task-utils/TaskFilters';
import { Task } from './types/TaskTypes';

// Mapping trạng thái theo form nhập công việc
const statusMapping = {
  'todo': 'Chưa bắt đầu',
  'in-progress': 'Đang thực hiện',
  'on-hold': 'Đang chờ',
  'completed': 'Đã hoàn thành',
};

const statusColors = {
  'todo': 'bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-400 dark:hover:bg-gray-500',
  'in-progress': 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500',
  'on-hold': 'bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-400 dark:hover:bg-amber-500',
  'completed': 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-400 dark:hover:bg-green-500',
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
  urgent: 'Khẩn cấp',
  high: 'Cao',
  normal: 'Bình thường',
  low: 'Thấp',
};

const priorityColors = {
  urgent: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600',
  high: 'bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-400 dark:hover:bg-orange-500',
  normal: 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500',
  low: 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-400 dark:hover:bg-green-500',
};

// Thứ tự chuyển mức độ ưu tiên
const priorityFlow = {
  low: 'normal',
  normal: 'high',
  high: 'urgent',
  urgent: 'low',
};

// Mapping text cho trạng thái (thay thế icon)
const statusText = {
  'todo': 'CHỜ',
  'in-progress': 'LÀMM',
  'on-hold': 'DỪNG',
  'completed': 'XONG',
};

// Mapping text cho mức độ ưu tiên (thay thế icon)
const priorityText = {
  urgent: 'KHẨN',
  high: 'CAO',
  normal: 'BT',
  low: 'THẤP',
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
  other: { code: 'KC', icon: Square },
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
  const isMobile = useIsMobile();
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
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force refresh trigger
  const [filters, setFilters] = useState({
    timeRange: 'all',
    status: 'all',
    type: 'all',
    priority: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // States cho Member View Filters
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Early return nếu chưa có currentUser
  if (!currentUser) {
    return <LoadingScreen message="Đang khởi tạo dữ liệu người dùng..." />;
  }

  // Sử dụng hook phù hợp dựa trên role
  const isManager =
    currentUser?.role === 'team_leader' ||
    currentUser?.role === 'retail_director' ||
    currentUser?.role === 'project_director';

  // Mock data để test individual member view với real user IDs
  const mockTasks: any[] = [
    {
      id: 'task-1',
      title: 'Công việc của Phạm Thị Hương',
      description: 'Test task for Phạm Thị Hương',
      assignedTo: '7', // Real ID của Phạm Thị Hương
      user_id: 'Ve7sGRnMoRvT1E0VL5Ds', // Manager ID
      status: 'in-progress',
      priority: 'high',
      type: 'customer_new',
      team_id: '5',
      department_type: 'retail',
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'task-2',
      title: 'Công việc khác của Phạm Thị Hương',
      description: 'Another test task',
      assignedTo: '7', // Real ID của Phạm Thị Hương
      user_id: '7', // Created by Phạm Thị Hương
      status: 'todo',
      priority: 'normal',
      type: 'partner_new',
      team_id: '5',
      department_type: 'retail',
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'task-3',
      title: 'Lê Khánh Duy - Báo giá khách hàng ABC',
      description: 'Chuẩn bị báo giá cho khách hàng ABC',
      assignedTo: 'abtSSmK0p0oeOyy5YWGZ', // Real ID của Lê Khánh Duy
      user_id: 'Ue4vzSj1KDg4vZyXwlHJ', // Assigned by Lương Việt Anh
      status: 'in-progress',
      priority: 'high',
      type: 'quote_new',
      team_id: '1',
      department_type: 'retail',
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'task-4',
      title: 'Nguyễn Mạnh Linh - Chăm sóc khách hàng VIP',
      description: 'Follow up khách hàng VIP tháng này',
      assignedTo: '76ui8I1vw3wiJLyvwFjq', // Real ID của Nguyễn Mạnh Linh
      user_id: 'MO7N4Trk6mASlHpIcjME', // Assigned by Nguyễn Thị Thảo
      status: 'todo',
      priority: 'normal',
      type: 'customer_care',
      team_id: '2',
      department_type: 'retail',
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Xác định member ID để truyền cho hook
  const getSelectedMemberForHook = () => {
    if (currentUser?.role === 'retail_director' || currentUser?.role === 'project_director') {
      return selectedMember; // Directors sử dụng selectedMember từ filters
    } else {
      return selectedMemberId; // Team leaders sử dụng selectedMemberId từ props
    }
  };

  let regularTaskData, managerTaskData;
  try {
    regularTaskData = useTaskData();
    managerTaskData = useManagerTaskData(viewLevel as any, getSelectedMemberForHook());
  } catch (error) {
    console.error('Error with hooks, using mock data:', error);
    regularTaskData = { tasks: mockTasks };
    managerTaskData = { tasks: mockTasks };
  }

  // Chọn data source dựa trên viewLevel (selectedView)
  const getTasksForView = (view: string) => {
    const regularTasks = regularTaskData?.tasks || [];
    const managerTasks = managerTaskData?.tasks || [];

    // Combine với mock data để test
    const allRegularTasks = [...regularTasks, ...mockTasks];
    const allManagerTasks = [...managerTasks, ...mockTasks];

    console.log('🔍 Data sources:', {
      regularTasks: regularTasks.length,
      managerTasks: managerTasks.length,
      mockTasks: mockTasks.length,
      allRegularTasks: allRegularTasks.length,
      allManagerTasks: allManagerTasks.length
    });

    switch (view) {
      case 'personal':
        // Công việc cá nhân: được giao trực tiếp cho user hoặc do user tạo
        console.log('🔍 Personal view filtering:');
        console.log('  - currentUser.id:', currentUser?.id);
        console.log('  - regularTasks count:', regularTasks.length);
        console.log('  - regularTasks:', regularTasks);

        const personalTasks = allRegularTasks.filter((task) => {
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
        console.log('👥 Getting team tasks for user:', currentUser?.name, 'role:', currentUser?.role, 'team_id:', currentUser?.team_id);
        console.log('👥 Available data sources - managerTasks:', managerTasks.length, 'regularTasks:', regularTasks.length);

        // Sử dụng managerTasks nếu có (từ API team view), fallback về regularTasks, bao gồm mock data
        const sourceData = allManagerTasks.length > allRegularTasks.length ? allManagerTasks : allRegularTasks;
        console.log('👥 Using data source:', allManagerTasks.length > allRegularTasks.length ? 'allManagerTasks' : 'allRegularTasks', 'with', sourceData.length, 'tasks');

        if (isManager) {
          // Manager: xem công việc của nhóm
          const teamTasks = sourceData.filter((task) => {
            const isSharedWithTeam = task.isSharedWithTeam || false;

            // Directors xem tất cả tasks (vì có thể quản lý nhiều team)
            const isDirector = (currentUser?.role === 'retail_director' || currentUser?.role === 'project_director' || currentUser?.role === 'director');

            // Team Leaders chỉ xem tasks của team mình
            const isFromTeamMember = currentUser?.team_id && users && users.length > 0 && users.some(user =>
              user.team_id === currentUser.team_id &&
              (user.id === task.user_id || user.id === task.assignedTo)
            );

            // Hiển thị tasks có team_id (thuộc về một team nào đó)
            const hasTeamId = task.team_id && task.team_id !== '';

            // Directors hiển thị tất cả tasks có team_id hoặc shared
            // Đơn giản hóa: Directors xem tất cả tasks trong team view
            const shouldShow = isSharedWithTeam || (isDirector ? true : (hasTeamId || isFromTeamMember));

            console.log(`  📋 Task "${task.title}": isSharedWithTeam=${isSharedWithTeam}, isDirector=${isDirector}, hasTeamId=${hasTeamId}, isFromTeamMember=${isFromTeamMember}, shouldShow=${shouldShow}`);

            return shouldShow;
          });
          console.log('👥 Final team tasks for manager:', teamTasks.length);
          return teamTasks;
        } else {
          // Nhân viên: xem công việc của nhóm mình
          const teamTasks = sourceData.filter((task) => {
            const isSharedWithTeam = task.isSharedWithTeam;
            const isFromSameTeam = currentUser?.team_id && (
              task.team_id === currentUser.team_id ||
              users.some(user =>
                user.team_id === currentUser.team_id &&
                (user.id === task.user_id || user.id === task.assignedTo)
              )
            );

            const shouldShow = isSharedWithTeam || isFromSameTeam;

            console.log(`  📋 Task "${task.title}": isSharedWithTeam=${isSharedWithTeam}, isFromSameTeam=${isFromSameTeam}, shouldShow=${shouldShow}`);

            return shouldShow;
          });
          console.log('👥 Final team tasks for employee:', teamTasks.length);
          return teamTasks;
        }
      case 'individual':
        console.log('👤 Individual view - Debug info:');
        console.log('  - isManager:', isManager);
        console.log('  - currentUser role:', currentUser?.role);
        console.log('  - selectedMemberId:', selectedMemberId);
        console.log('  - selectedMember:', selectedMember);
        console.log('  - users count:', users.length);
        console.log('  - regularTasks count:', regularTasks.length);

        if (isManager) {
          // Manager: xem công việc của thành viên với filters
          let filteredUsers = users.filter((user) => {
            if (currentUser?.role === 'retail_director' || currentUser?.role === 'project_director') {
              const match = user.department_type === currentUser.department_type && user.id !== currentUser.id;
              console.log(`  - User ${user.name}: department_type=${user.department_type}, match=${match}`);
              return match;
            } else if (currentUser?.role === 'team_leader') {
              const match = user.team_id === currentUser.team_id && user.id !== currentUser.id;
              console.log(`  - User ${user.name}: team_id=${user.team_id}, match=${match}`);
              return match;
            }
            return false;
          });

          console.log('  - Initial filtered users:', filteredUsers.map(u => u.name));

          // Áp dụng filters cho directors
          if (currentUser?.role === 'retail_director' || currentUser?.role === 'project_director') {
            // Filter theo location
            if (selectedLocation !== 'all') {
              filteredUsers = filteredUsers.filter(user => user.location === selectedLocation);
              console.log(`  - After location filter (${selectedLocation}):`, filteredUsers.map(u => u.name));
            }

            // Filter theo team
            if (selectedTeam !== 'all') {
              filteredUsers = filteredUsers.filter(user => user.team_id === selectedTeam);
              console.log(`  - After team filter (${selectedTeam}):`, filteredUsers.map(u => u.name));
            }

            // Filter theo member cụ thể
            if (selectedMember) {
              filteredUsers = filteredUsers.filter(user => user.id === selectedMember);
              console.log(`  - After member filter (${selectedMember}):`, filteredUsers.map(u => u.name));
            }
          } else {
            // Team leader: sử dụng selectedMemberId từ props
            if (selectedMemberId) {
              filteredUsers = filteredUsers.filter(user => user.id === selectedMemberId);
              console.log(`  - After selectedMemberId filter (${selectedMemberId}):`, filteredUsers.map(u => u.name));
            }
          }

          const memberIds = filteredUsers.map(user => user.id);
          console.log('  - Final member IDs to search for:', memberIds);

          // Lấy tất cả công việc của các thành viên được filter
          const memberTasks = allRegularTasks.filter((task) => {
            const isAssignedToMember = memberIds.includes(task.assignedTo || '');
            const isCreatedByMember = memberIds.includes(task.user_id || '');
            const shouldInclude = isAssignedToMember || isCreatedByMember;

            console.log(`  📋 Task "${task.title}":`, {
              assignedTo: task.assignedTo,
              user_id: task.user_id,
              memberIds,
              isAssignedToMember,
              isCreatedByMember,
              shouldInclude
            });

            return shouldInclude;
          });

          console.log('  - Final member tasks count:', memberTasks.length);
          console.log('  - Member tasks:', memberTasks.map(t => ({ title: t.title, assignedTo: t.assignedTo, user_id: t.user_id })));
          return memberTasks;
        }
        console.log('  - Not a manager, returning empty array');
        return [];
      case 'department':
        // Công việc chung của cả phòng - chỉ hiển thị shared/department tasks
        console.log('🏢 Department view - Available data:');
        console.log('  - managerTasks:', managerTasks.length);
        console.log('  - regularTasks:', regularTasks.length);
        console.log('  - currentUser department:', currentUser?.department_type);

        // Ưu tiên sử dụng managerTasks nếu có
        const sourceTasksForDept = managerTasks.length > 0 ? managerTasks : regularTasks;
        console.log('🏢 Using source:', managerTasks.length > 0 ? 'managerTasks' : 'regularTasks');

        // Lọc công việc chung của phòng - chỉ hiển thị tasks được đánh dấu là shared/department
        const departmentTasks = sourceTasksForDept.filter((task) => {
          // Kiểm tra các điều kiện để xác định task là department-wide
          const isSharedWithDepartment = task.isShared === true || task.isSharedWithTeam === true;
          const isDepartmentTask = task.department === currentUser?.department_type ||
                                   task.department_type === currentUser?.department_type;
          const isPublicVisibility = task.visibility === 'public';
          const hasSharedFlag = task.shared === true || task.department_wide === true;

          // Task được coi là department task nếu:
          // 1. Được đánh dấu là shared hoặc public
          // 2. Thuộc về department hiện tại
          // 3. Có flag shared/department_wide
          const shouldShow = isSharedWithDepartment || isPublicVisibility || hasSharedFlag ||
                           (isDepartmentTask && (task.visibility === 'public' || task.isShared));

          console.log(`  📋 Task "${task.title}":`, {
            isShared: task.isShared,
            isSharedWithTeam: task.isSharedWithTeam,
            department: task.department,
            department_type: task.department_type,
            visibility: task.visibility,
            shared: task.shared,
            department_wide: task.department_wide,
            shouldShow
          });

          if (shouldShow) {
            console.log(`  ✅ Including department task: "${task.title}"`);
          } else {
            console.log(`  ❌ Excluding non-department task: "${task.title}"`);
          }

          return shouldShow;
        });

        console.log('🏢 Final department tasks count:', departmentTasks.length);
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
    console.log('🔄 Updating localTasks with baseTasks:', baseTasks.length);
    console.log('🔍 Current selectedView:', selectedView);
    console.log('🔍 regularTaskData tasks:', regularTaskData?.tasks?.length || 0);
    console.log('🔍 managerTaskData tasks:', managerTaskData?.tasks?.length || 0);

    // Cập nhật localTasks với baseTasks mới
    // Chỉ dựa vào length và selectedView để tránh infinite loop
    if (localTasks.length === 0 || localTasks.length !== baseTasks.length) {
      console.log('🔄 Setting localTasks to baseTasks:', baseTasks.length);
      setLocalTasks([...baseTasks]);
    }
  }, [baseTasks.length, selectedView, regularTaskData?.tasks?.length, managerTaskData?.tasks?.length, refreshTrigger]);

  // Sẽ được định nghĩa sau khi filterTasks được khai báo

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

  // Cập nhật selectedView dựa trên viewLevel và reset filters
  useEffect(() => {
    setSelectedView(viewLevel);

    // Reset filters khi chuyển view
    if (viewLevel !== 'individual') {
      setSelectedLocation('all');
      setSelectedTeam('all');
      setSelectedMember(null);
    }
  }, [viewLevel]);

  // Listen for auto-sync events và refresh tasks
  useEffect(() => {
    const handleTasksUpdated = (event: CustomEvent) => {
      console.log('📡 TaskManagementView received tasks-updated event:', event.detail);

      // Force refresh both regular and manager task data
      console.log('🔄 TaskManagementView refreshing due to auto-sync...');
      if (regularTaskData?.refreshTasks) {
        regularTaskData.refreshTasks().then(() => {
          console.log('✅ Regular tasks refreshed in TaskManagementView');

          // Force update localTasks after refresh
          setTimeout(() => {
            console.log('🔄 Force refresh triggered by auto-sync');
            // Trigger re-render by updating refreshTrigger
            setRefreshTrigger(prev => prev + 1);
          }, 200);
        }).catch(error => {
          console.error('❌ Error refreshing regular tasks:', error);
        });
      }

      if (managerTaskData?.refreshTasks) {
        managerTaskData.refreshTasks().then(() => {
          console.log('✅ Manager tasks refreshed in TaskManagementView');

          // Force update localTasks after refresh
          setTimeout(() => {
            console.log('🔄 Force refresh triggered by manager auto-sync');
            // Trigger re-render by updating refreshTrigger
            setRefreshTrigger(prev => prev + 1);
          }, 200);
        }).catch(error => {
          console.error('❌ Error refreshing manager tasks:', error);
        });
      }
    };

    const handleTasksRefreshed = (event: CustomEvent) => {
      console.log('📡 TaskManagementView received tasks-refreshed event:', event.detail);

      // Additional refresh for UI consistency
      console.log('🔄 TaskManagementView additional refresh due to tasks-refreshed event...');
      setTimeout(() => {
        if (regularTaskData?.refreshTasks) {
          regularTaskData.refreshTasks();
        }
        if (managerTaskData?.refreshTasks) {
          managerTaskData.refreshTasks();
        }

        // Force update localTasks immediately
        console.log('🔄 Force refresh triggered by tasks-refreshed event');
        // Trigger re-render by updating refreshTrigger
        setRefreshTrigger(prev => prev + 1);
      }, 100);
    };

    // Add event listeners
    window.addEventListener('tasks-updated', handleTasksUpdated as EventListener);
    window.addEventListener('tasks-refreshed', handleTasksRefreshed as EventListener);
    console.log('📡 TaskManagementView added auto-sync event listeners');

    // Cleanup
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated as EventListener);
      window.removeEventListener('tasks-refreshed', handleTasksRefreshed as EventListener);
      console.log('📡 TaskManagementView removed auto-sync event listeners');
    };
  }, [regularTaskData, managerTaskData]);

  // Hàm lấy tên người dùng từ nhiều nguồn
  const getUserName = (task: any) => {
    // Ưu tiên: user_name -> tìm trong users array bằng user_id -> assignedTo -> fallback
    if (task.user_name && task.user_name !== 'Không xác định') {
      return task.user_name;
    }

    // Tìm trong users array bằng user_id (người tạo task)
    if (task.user_id && users && users.length > 0) {
      const user = users.find(u => u.id === task.user_id);
      if (user && user.name) {
        return user.name;
      }
    }

    // Tìm trong users array bằng assignedTo (người được giao)
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

  // Hàm filter tasks theo các tiêu chí
  const filterTasks = (tasks: any[]) => {
    return tasks.filter(task => {
      // Filter theo search query
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = task.title?.toLowerCase().includes(query);
        const descriptionMatch = task.description?.toLowerCase().includes(query);
        const userMatch = getUserName(task).toLowerCase().includes(query);

        if (!titleMatch && !descriptionMatch && !userMatch) {
          return false;
        }
      }

      // Filter theo thời gian
      if (filters.timeRange !== 'all') {
        const taskDate = new Date(task.date);
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        switch (filters.timeRange) {
          case 'week':
            if (taskDate < startOfWeek) return false;
            break;
          case 'month':
            if (taskDate < startOfMonth) return false;
            break;
          case 'quarter':
            if (taskDate < startOfQuarter) return false;
            break;
          case 'year':
            if (taskDate < startOfYear) return false;
            break;
        }
      }

      // Filter theo trạng thái - map values từ TaskSearchBar
      if (filters.status !== 'all') {
        const statusMap = {
          'todo': 'todo',
          'in-progress': 'in-progress',
          'on-hold': 'on-hold',
          'completed': 'completed'
        };
        const mappedStatus = statusMap[filters.status as keyof typeof statusMap];
        if (mappedStatus && task.status !== mappedStatus) {
          return false;
        }
      }

      // Filter theo loại công việc - map values từ TaskSearchBar
      if (filters.type !== 'all') {
        const typeMap = {
          'architect_new': 'architect_new',
          'architect_old': 'architect_old',
          'client_new': 'client_new',
          'client_old': 'client_old',
          'quote_new': 'quote_new',
          'quote_old': 'quote_old',
          'partner_new': 'partner_new',
          'partner_old': 'partner_old',
          'other': 'other'
        };
        const mappedType = typeMap[filters.type as keyof typeof typeMap];
        if (mappedType && task.type !== mappedType) {
          return false;
        }
      }

      // Filter theo mức độ ưu tiên
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      return true;
    });
  };

  // Áp dụng filters cho tasks và sắp xếp
  const filteredTasks = filterTasks(localTasks);
  const tasks = sortTasks(filteredTasks);

  // Hàm lấy initials từ tên
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Hàm refresh cho pull-to-refresh
  const handleRefresh = async () => {
    try {
      if (regularTaskData?.refreshTasks) {
        await regularTaskData.refreshTasks();
      }
      if (managerTaskData?.refreshTasks) {
        await managerTaskData.refreshTasks();
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      throw error; // Re-throw để PullToRefresh có thể handle error
    }
  };

  // Format ngày
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
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

  // Hàm chuyển trạng thái công việc với API sync
  const handleStatusChange = async (e: React.MouseEvent, taskId: string, currentStatus: string) => {
    e.preventDefault();
    e.stopPropagation();

    const nextStatus = statusFlow[currentStatus as keyof typeof statusFlow];
    if (!nextStatus) return;

    // Tìm task để kiểm tra quyền
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Kiểm tra quyền edit
    if (!canEditTask(task)) {
      console.log('❌ Không có quyền thay đổi trạng thái task này');
      return;
    }

    try {
      console.log(`🔄 Chuyển trạng thái task ${taskId} từ ${currentStatus} sang ${nextStatus}`);

      // Cập nhật trạng thái trong localTasks trước (optimistic update)
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)),
      );

      // Gọi API để sync với server
      const response = await fetch(`https://us-central1-appqlgd.cloudfunctions.net/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert nếu API call thất bại
        console.error('❌ API call failed, reverting status change');
        setLocalTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? { ...task, status: currentStatus } : task)),
        );
        return;
      }

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

      console.log(`✅ Đã cập nhật trạng thái task ${taskId} và sync với API`);
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái:', error);
      // Revert nếu có lỗi
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, status: currentStatus } : task)),
      );
    }
  };

  // Hàm chuyển mức độ ưu tiên với API sync
  const handlePriorityChange = async (
    e: React.MouseEvent,
    taskId: string,
    currentPriority: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const nextPriority = priorityFlow[currentPriority as keyof typeof priorityFlow];
    if (!nextPriority) return;

    // Tìm task để kiểm tra quyền
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Kiểm tra quyền edit
    if (!canEditTask(task)) {
      console.log('❌ Không có quyền thay đổi ưu tiên task này');
      return;
    }

    try {
      console.log(
        `🎯 Chuyển mức độ ưu tiên task ${taskId} từ ${currentPriority} sang ${nextPriority}`,
      );

      // Cập nhật mức độ ưu tiên trong localTasks trước (optimistic update)
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, priority: nextPriority } : task)),
      );

      // Gọi API để sync với server
      const response = await fetch(`https://us-central1-appqlgd.cloudfunctions.net/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priority: nextPriority,
          updated_at: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert nếu API call thất bại
        console.error('❌ API call failed, reverting priority change');
        setLocalTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? { ...task, priority: currentPriority } : task)),
        );
        return;
      }

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

      console.log(`✅ Đã cập nhật ưu tiên task ${taskId} và sync với API`);
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật mức độ ưu tiên:', error);
      // Revert nếu có lỗi
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, priority: currentPriority } : task)),
      );
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
      <div className="bg-white dark:bg-gray-900 rounded-none sm:rounded-2xl shadow-lg border-0 sm:border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header với view buttons - responsive */}
        <div className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
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
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'
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

              </div>
            </div>

            {/* Member Filters cho Individual view - chỉ cho Directors */}
            {(currentUser?.role === 'retail_director' || currentUser?.role === 'project_director') &&
             viewLevel === 'individual' && (
              <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
                <MemberViewFilters
                  selectedLocation={selectedLocation}
                  selectedTeam={selectedTeam}
                  selectedMember={selectedMember}
                  onLocationChange={setSelectedLocation}
                  onTeamChange={setSelectedTeam}
                  onMemberChange={setSelectedMember}
                />
              </div>
            )}



            {/* Member Selector cho Team Leaders */}
            {currentUser?.role === 'team_leader' && viewLevel === 'individual' && (
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

        {/* Task Search Bar */}
        <div className="px-4 py-3 border-b border-gray-100">
          <TaskSearchBar
            onSearch={setSearchQuery}
            onFilterChange={(taskFilters) => {
              setFilters({
                timeRange: taskFilters.dateRange,
                status: taskFilters.status,
                type: taskFilters.type,
                priority: taskFilters.priority
              });
            }}
            placeholder="Tìm kiếm công việc theo tiêu đề, mô tả..."
          />
        </div>

        {/* Content - responsive */}
        <div className="relative z-10">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Đang tải...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <p>Chưa có công việc nào</p>
              </div>
            ) : (
              tasks.map((task) => (
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
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canEditTask(task)) {
                          handleStatusChange(e, task.id, task.status);
                        }
                      }}
                      disabled={!canEditTask(task)}
                      className={`p-1 rounded-full text-white transition-all duration-200 ${statusColors[task.status]} ${
                        canEditTask(task)
                          ? 'cursor-pointer hover:scale-105'
                          : 'cursor-not-allowed'
                      }`}
                    >
                      <span className="text-[10px] font-bold">
                        {statusText[task.status] || 'CHỜ'}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canEditTask(task)) {
                          handlePriorityChange(e, task.id, task.priority || 'normal');
                        }
                      }}
                      disabled={!canEditTask(task)}
                      className={`px-2 py-1 rounded-full transition-all duration-200 ${priorityColors[task.priority || 'normal']} ${
                        canEditTask(task)
                          ? 'cursor-pointer hover:scale-105'
                          : 'cursor-not-allowed'
                      }`}
                    >
                      <span className="text-[9px] font-bold">
                        {priorityText[task.priority || 'normal'] || 'BT'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate">{getUserName(task)}</span>
                    <span className="flex-shrink-0">{formatDate(task.date)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full table-fixed" data-testid="tasks-table">
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
                            if (canEditTask(task)) {
                              handleStatusChange(e, task.id, task.status);
                            }
                          }}
                          disabled={!canEditTask(task)}
                          className={`inline-flex p-1.5 rounded-full text-white transition-all duration-200 ${statusColors[task.status]} ${
                            canEditTask(task)
                              ? 'cursor-pointer transform hover:scale-105 active:scale-95'
                              : 'cursor-not-allowed'
                          }`}
                          title={canEditTask(task) ? `${statusMapping[task.status]} - Click để chuyển sang: ${statusMapping[statusFlow[task.status as keyof typeof statusFlow]] || 'Không thể chuyển'}` : 'Bạn không có quyền thay đổi trạng thái'}
                        >
                          <span className="text-xs font-bold">
                            {statusText[task.status] || 'CHỜ'}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            console.log('🟡 Priority button clicked!', task.id, task.priority);
                            if (canEditTask(task)) {
                              handlePriorityChange(e, task.id, task.priority || 'normal');
                            }
                          }}
                          disabled={!canEditTask(task)}
                          className={`inline-flex p-1.5 rounded-full transition-all duration-200 ${priorityColors[task.priority || 'normal']} ${
                            canEditTask(task)
                              ? 'cursor-pointer transform hover:scale-105 active:scale-95'
                              : 'cursor-not-allowed'
                          }`}
                          title={canEditTask(task) ? `${priorityMapping[task.priority || 'normal']} - Click để chuyển sang: ${priorityMapping[priorityFlow[(task.priority || 'normal') as keyof typeof priorityFlow]] || 'Không thể chuyển'}` : 'Bạn không có quyền thay đổi ưu tiên'}
                        >
                          <span className="text-xs font-bold">
                            {priorityText[task.priority || 'normal'] || 'BT'}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-900 truncate" title={getUserName(task)}>
                        {getUserName(task)}
                      </span>
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
                            setSelectedTask(task);
                            setShowTaskDetail(true);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            console.log('🔵 EDIT BUTTON MOUSE DOWN!');
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                          title="Chỉnh sửa"
                          data-testid="task-edit-button"
                          type="button"
                        >
                          <Edit className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔴 DELETE BUTTON CLICKED!', task.id);

                            if (!canEditTask(task)) {
                              alert('Bạn không có quyền xóa công việc này!');
                              return;
                            }

                            if (confirm(`Bạn có chắc muốn xóa công việc "${task.title}"?\n\nHành động này không thể hoàn tác.`)) {
                              // Cập nhật UI ngay lập tức để responsive
                              setLocalTasks((prev) => prev.filter((t) => t.id !== task.id));

                              try {
                                // Gọi API để sync với server (background)
                                const response = await fetch(`https://us-central1-appqlgd.cloudfunctions.net/api/tasks/${task.id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                });

                                const result = await response.json();
                                console.log('🔄 Delete API response:', result);

                                if (result.success) {
                                  console.log('✅ Task deleted successfully from server');
                                  alert('Đã xóa công việc thành công!');
                                } else {
                                  console.error('❌ Delete API failed, but UI already updated');
                                  // UI đã được cập nhật, chỉ log lỗi
                                }
                              } catch (error) {
                                console.error('❌ Error deleting task from server:', error);
                                // UI đã được cập nhật, chỉ log lỗi
                              }
                            }
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            console.log('🔴 DELETE BUTTON MOUSE DOWN!');
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                          title="Xóa"
                          data-testid="task-delete-button"
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
        onEdit={async (updatedTask) => {
          console.log('💾 Saving task from detail panel:', updatedTask);

          // Kiểm tra quyền edit
          if (!canEditTask(selectedTask)) {
            console.log('❌ Không có quyền edit task này');
            return;
          }

          try {
            // Gọi API để sync với server
            const response = await fetch(`https://us-central1-appqlgd.cloudfunctions.net/api/tasks/${updatedTask.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...updatedTask,
                updated_at: new Date().toISOString(),
              }),
            });

            const result = await response.json();

            if (!result.success) {
              console.error('❌ API call failed for task update');
              alert('Lỗi khi lưu công việc. Vui lòng thử lại!');
              return;
            }

            // Cập nhật task trong localTasks ngay lập tức
            setLocalTasks((prev) =>
              prev.map((task) =>
                task.id === updatedTask.id
                  ? {
                      ...task,
                      ...updatedTask,
                      updated_at: new Date().toISOString(),
                      // Đảm bảo progress được cập nhật từ checklist
                      progress: updatedTask.progress || task.progress
                    }
                  : task,
              ),
            );
            // Cập nhật selectedTask để reflect changes trong modal
            setSelectedTask({
              ...updatedTask,
              updated_at: new Date().toISOString()
            });
            console.log('✅ Task updated successfully and synced with API!');
          } catch (error) {
            console.error('❌ Error updating task:', error);
            alert('Lỗi khi lưu công việc. Vui lòng thử lại!');
          }
        }}
        onDelete={async (taskId) => {
          console.log('Delete task from detail panel:', taskId);

          const taskToDelete = localTasks.find(t => t.id === taskId);
          if (!taskToDelete) return;

          if (!canEditTask(taskToDelete)) {
            alert('Bạn không có quyền xóa công việc này!');
            return;
          }

          // Cập nhật UI ngay lập tức để responsive
          setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
          setShowTaskDetail(false);
          setSelectedTask(null);

          try {
            console.log('🔄 Starting delete process for task:', taskId);

            // Gọi API để sync với server (background)
            const response = await fetch(`https://us-central1-appqlgd.cloudfunctions.net/api/tasks/${taskId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const result = await response.json();
            console.log('🔄 Delete API response:', result);

            if (result.success) {
              console.log('✅ Task deleted successfully from server');
              alert('Đã xóa công việc thành công!');
            } else {
              console.error('❌ Delete API failed, but UI already updated');
              // UI đã được cập nhật, chỉ log lỗi
            }
          } catch (error) {
            console.error('❌ Error deleting task from server:', error);
            // UI đã được cập nhật, chỉ log lỗi
          }
        }}
      />
    </>
  );
}
