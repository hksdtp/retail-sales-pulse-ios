import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  Edit,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useNavigate } from 'react-router-dom';

import { sortTasks } from '../components/tasks/task-utils/TaskFilters';
import { Task, TaskFilters } from '../components/tasks/types/TaskTypes';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Checkbox } from '../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTaskData } from '../hooks/use-task-data';

interface TaskListProps {
  tasks?: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks: propTasks }) => {
  const navigate = useNavigate();

  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [localFilteredTasks, setLocalFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const taskData = useTaskData();

  // Sử dụng propTasks nếu có, nếu không thì dùng từ context
  const tasks = useMemo(() => propTasks || taskData?.tasks || [], [propTasks, taskData?.tasks]);
  const isLoading = useMemo(() => taskData?.isLoading || false, [taskData?.isLoading]);
  const currentUser = useMemo(() => taskData?.currentUser, [taskData?.currentUser]);

  const filterTasksSafe = useCallback(
    (filters: TaskFilters) => {
      if (taskData?.filterTasks) {
        return taskData.filterTasks(filters);
      }
    },
    [taskData],
  );

  const updateTaskStatusSafe = useCallback(
    (id: string, status: Task['status']) => {
      if (taskData?.updateTaskStatus) {
        return taskData.updateTaskStatus(id, status);
      }
    },
    [taskData],
  );

  const refreshTasksSafe = useCallback(async () => {
    if (taskData?.refreshTasks) {
      return await taskData.refreshTasks();
    }
    return Promise.resolve();
  }, [taskData]);

  useEffect(() => {
    if (!taskData) {
      console.error('Lỗi: Không thể tải dữ liệu từ TaskDataContext');
      setHasError(true);
      setErrorMessage('Không thể tải dữ liệu công việc. Vui lòng thử lại sau.');
    }
  }, [taskData]);

  const debugTasks = useCallback(() => {
    console.log('DEBUG: TaskList Component');
    console.log('Tasks from Context:', tasks?.length || 0);
    console.log('Is Loading:', isLoading);
    if (tasks?.length > 0) {
      console.log('First Task:', tasks[0]);
    }
  }, [tasks, isLoading]);

  const handleRefresh = useCallback(async () => {
    debugTasks();
    await refreshTasksSafe();
  }, [debugTasks, refreshTasksSafe]);

  const filterTasksByDate = useCallback(
    (task: Task): boolean => {
      if (dateFilter === 'all') return true;

      const taskDate = new Date(task.created_at || task.date);
      const now = new Date();

      switch (dateFilter) {
        case 'today':
          return taskDate.toDateString() === now.toDateString();
        case 'yesterday':
          const yesterday = subDays(now, 1);
          return taskDate.toDateString() === yesterday.toDateString();
        case 'this-week':
          return isWithinInterval(taskDate, { start: startOfWeek(now), end: endOfWeek(now) });
        case 'last-week':
          const lastWeekStart = startOfWeek(subWeeks(now, 1));
          const lastWeekEnd = endOfWeek(subWeeks(now, 1));
          return isWithinInterval(taskDate, { start: lastWeekStart, end: lastWeekEnd });
        case 'next-week':
          const nextWeekStart = startOfWeek(addDays(now, 7));
          const nextWeekEnd = endOfWeek(addDays(now, 7));
          return isWithinInterval(taskDate, { start: nextWeekStart, end: nextWeekEnd });
        case 'this-month':
          return isWithinInterval(taskDate, { start: startOfMonth(now), end: endOfMonth(now) });
        case 'last-month':
          const lastMonthStart = startOfMonth(subMonths(now, 1));
          const lastMonthEnd = endOfMonth(subMonths(now, 1));
          return isWithinInterval(taskDate, { start: lastMonthStart, end: lastMonthEnd });
        case 'next-month':
          const nextMonthStart = startOfMonth(addDays(now, 31));
          const nextMonthEnd = endOfMonth(addDays(now, 31));
          return isWithinInterval(taskDate, { start: nextMonthStart, end: nextMonthEnd });
        case 'custom':
          if (dateRange?.from && dateRange?.to) {
            return isWithinInterval(taskDate, { start: dateRange.from, end: dateRange.to });
          }
          return true;
        default:
          return true;
      }
    },
    [dateFilter, dateRange],
  );

  useEffect(() => {
    try {
      console.log('DEBUG: Bắt đầu lọc tasks');
      console.log('DEBUG: tasks:', tasks?.length || 0);

      let result = [...(tasks || [])];

      if (searchQuery) {
        result = result.filter(
          (task) =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      if (statusFilter.length > 0) {
        result = result.filter((task) => statusFilter.includes(task.status));
      }

      if (typeFilter.length > 0) {
        result = result.filter((task) => typeFilter.includes(task.type));
      }

      result = result.filter(filterTasksByDate);

      console.log('DEBUG: Trước khi sắp xếp: Số task =', result.length);

      // Áp dụng logic sắp xếp mới: thời gian + priority
      const sortedResult = sortTasks(result);

      // Nếu user muốn đảo ngược thứ tự, thì reverse
      if (sortOrder === 'asc') {
        sortedResult.reverse();
      }

      setLocalFilteredTasks(sortedResult);
      console.log('Số lượng công việc sau khi lọc:', result.length);
    } catch (error) {
      console.error('Lỗi khi lọc tasks:', error);
      setLocalFilteredTasks([]);
    }
  }, [tasks, searchQuery, statusFilter, typeFilter, sortOrder, filterTasksByDate]);

  // Sử dụng useEffect để khởi tạo dữ liệu ban đầu
  useEffect(() => {
    try {
      if (Array.isArray(tasks) && tasks.length > 0) {
        setLocalFilteredTasks([...tasks]);
      }
    } catch (error) {
      console.error('Lỗi khi khởi tạo:', error);
    }
  }, [tasks]);

  const handleStatusChange = useCallback(
    (taskId: string, newStatus: Task['status']) => {
      updateTaskStatusSafe(taskId, newStatus);
    },
    [updateTaskStatusSafe],
  );

  const handleEditTask = useCallback((task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement edit functionality
    console.log('Edit task:', task.id);
    // For now, just show an alert
    alert(`Chức năng sửa công việc "${task.title}" sẽ được triển khai sau.`);
  }, []);

  const handleDeleteTask = useCallback(async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(task);
  }, []);

  const confirmDeleteTask = useCallback(async () => {
    if (!taskToDelete || !taskData?.deleteTask) return;

    setIsDeleting(true);
    try {
      await taskData.deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      // Refresh tasks after deletion
      await refreshTasksSafe();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Có lỗi xảy ra khi xóa công việc. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  }, [taskToDelete, taskData, refreshTasksSafe]);

  const getTaskTypeLabel = (type: string): string => {
    const typeMapping: Record<string, string> = {
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
    return typeMapping[type] || 'Không xác định';
  };

  const getStatusLabel = (status: string): string => {
    const statusMapping: Record<string, string> = {
      'todo': 'Chưa thực hiện',
      'in-progress': 'Đang thực hiện',
      'on-hold': 'Tạm hoãn',
      'completed': 'Hoàn thành',
    };
    return statusMapping[status] || 'Không xác định';
  };



  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return 'CHỜ';
      case 'in-progress':
        return 'LÀMM';
      case 'on-hold':
        return 'DỪNG';
      case 'completed':
        return 'XONG';
      default:
        return 'CHỜ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'text-gray-500 bg-gray-100';
      case 'in-progress':
        return 'text-blue-500 bg-blue-100';
      case 'on-hold':
        return 'text-red-500 bg-red-100';
      case 'completed':
        return 'text-green-500 bg-green-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return 'Không xác định';
    }
  };

  const toggleStatusFilter = useCallback((status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  }, []);

  const toggleTypeFilter = useCallback((type: string) => {
    setTypeFilter((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setDateFilter('custom');
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter([]);
    setTypeFilter([]);
    setDateFilter('all');
    setDateRange(undefined);
  }, []);

  const getDateFilterLabel = (): string => {
    switch (dateFilter) {
      case 'today':
        return 'Hôm nay';
      case 'yesterday':
        return 'Hôm qua';
      case 'this-week':
        return 'Tuần này';
      case 'last-week':
        return 'Tuần trước';
      case 'next-week':
        return 'Tuần sau';
      case 'this-month':
        return 'Tháng này';
      case 'last-month':
        return 'Tháng trước';
      case 'next-month':
        return 'Tháng sau';
      case 'custom':
        return dateRange?.from && dateRange?.to
          ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
          : 'Tùy chỉnh';
      default:
        return 'Thời gian';
    }
  };

  if (hasError) {
    return (
      <div className="container mx-auto px-4 pb-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-700 font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-red-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 sm:px-4">
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm công việc..."
              className="pl-10 bg-white/80 dark:bg-gray-700/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/80 dark:bg-gray-700/80">
                  <Calendar className="h-4 w-4 mr-2" />
                  {getDateFilterLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5 text-sm font-semibold">Thời gian</div>
                  <Separator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => {
                      setDateFilter('all');
                      setDateRange(undefined);
                    }}
                  >
                    Tất cả
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('today')}>
                    Hôm nay
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('yesterday')}>
                    Hôm qua
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('this-week')}>
                    Tuần này
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('last-week')}>
                    Tuần trước
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('next-week')}>
                    Tuần sau
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('this-month')}>
                    Tháng này
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('last-month')}>
                    Tháng trước
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('next-month')}>
                    Tháng sau
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <Separator className="my-1" />

                <div className="p-2">
                  <div className="text-sm font-semibold mb-2">Tùy chỉnh khoảng thời gian</div>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange?.to ? (
                            <>
                              {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                              {format(dateRange.to, 'dd/MM/yyyy')}
                            </>
                          ) : (
                            format(dateRange.from, 'dd/MM/yyyy')
                          )
                        ) : (
                          <span>Chọn khoảng thời gian</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range: DateRange | undefined) => {
                          handleDateRangeChange(range);
                          setCalendarOpen(false);
                        }}
                        numberOfMonths={2}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/80 dark:bg-gray-700/80">
                  <Filter className="h-4 w-4 mr-2" />
                  Lọc
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5 text-sm font-semibold">Trạng thái</div>
                  <Separator className="my-1" />
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      id="status-todo"
                      checked={statusFilter.includes('todo')}
                      onCheckedChange={() => toggleStatusFilter('todo')}
                    />
                    <label
                      htmlFor="status-todo"
                      className="cursor-pointer flex-1 flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4 text-gray-500" />
                      Chưa thực hiện
                    </label>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      id="status-in-progress"
                      checked={statusFilter.includes('in-progress')}
                      onCheckedChange={() => toggleStatusFilter('in-progress')}
                    />
                    <label
                      htmlFor="status-in-progress"
                      className="cursor-pointer flex-1 flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4 text-yellow-500" />
                      Đang thực hiện
                    </label>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      id="status-on-hold"
                      checked={statusFilter.includes('on-hold')}
                      onCheckedChange={() => toggleStatusFilter('on-hold')}
                    />
                    <label
                      htmlFor="status-on-hold"
                      className="cursor-pointer flex-1 flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Tạm hoãn
                    </label>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      id="status-completed"
                      checked={statusFilter.includes('completed')}
                      onCheckedChange={() => toggleStatusFilter('completed')}
                    />
                    <label
                      htmlFor="status-completed"
                      className="cursor-pointer flex-1 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Hoàn thành
                    </label>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <Separator className="my-1" />

                <DropdownMenuGroup>
                  <div className="px-2 py-1.5 text-sm font-semibold">Loại công việc</div>
                  <Separator className="my-1" />
                  {[
                    'partner_new',
                    'partner_old',
                    'architect_new',
                    'architect_old',
                    'client_new',
                    'client_old',
                    'quote_new',
                    'quote_old',
                    'other',
                  ].map((type) => (
                    <DropdownMenuItem
                      key={type}
                      className="flex items-center gap-2"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Checkbox
                        id={`type-${type}`}
                        checked={typeFilter.includes(type)}
                        onCheckedChange={() => toggleTypeFilter(type)}
                      />
                      <label htmlFor={`type-${type}`} className="cursor-pointer flex-1">
                        {getTaskTypeLabel(type)}
                      </label>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                <Separator className="my-1" />

                <div className="p-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={clearAllFilters}
                  >
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="bg-white/80 dark:bg-gray-700/80"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Cũ nhất' : 'Mới nhất'}
            </Button>
          </div>
        </div>

        {(statusFilter.length > 0 || typeFilter.length > 0 || dateFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-3">
            {statusFilter.map((status) => (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                {getStatusLabel(status)}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => toggleStatusFilter(status)}
                />
              </Badge>
            ))}

            {typeFilter.map((type) => (
              <Badge key={type} variant="secondary" className="flex items-center gap-1">
                {getTaskTypeLabel(type)}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleTypeFilter(type)} />
              </Badge>
            ))}

            {dateFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {getDateFilterLabel()}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => {
                    setDateFilter('all');
                    setDateRange(undefined);
                  }}
                />
              </Badge>
            )}

            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearAllFilters}>
              Xóa tất cả
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : localFilteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="flex justify-center mb-4">
                <Search className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Không tìm thấy công việc nào</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              {(searchQuery || statusFilter.length > 0 || typeFilter.length > 0) && (
                <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                  Xóa tất cả bộ lọc
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="flex justify-between items-center p-4">
              <h1 className="text-2xl font-bold">Danh sách công việc</h1>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Làm mới
                </Button>
                <Button onClick={() => navigate('/tasks/new')} size="sm">
                  Thêm công việc
                </Button>
              </div>
            </div>
            {localFilteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <span className={`inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-bold ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(task.created_at)}
                        </span>
                        <Badge className={`${getStatusColor(task.status)} text-xs`}>
                          {getStatusLabel(task.status)}
                        </Badge>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                            onClick={(e) => handleEditTask(task, e)}
                            title="Sửa công việc"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                            onClick={(e) => handleDeleteTask(task, e)}
                            title="Xóa công việc"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {task.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getTaskTypeLabel(task.type)}
                      </Badge>
                      {task.location && (
                        <Badge variant="outline" className="text-xs">
                          {task.location}
                        </Badge>
                      )}
                      {task.progress > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Progress value={task.progress} className="h-1.5 w-24" />
                          <span>{task.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getStatusColor(selectedTask.status)}>
                      {getStatusLabel(selectedTask.status)}
                    </Badge>
                    <Badge variant="outline">{getTaskTypeLabel(selectedTask.type)}</Badge>
                    {selectedTask.location && (
                      <Badge variant="outline">{selectedTask.location}</Badge>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="details">Chi tiết</TabsTrigger>
                    <TabsTrigger value="actions">Thao tác</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Mô tả
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
                        {selectedTask.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Ngày tạo
                        </h4>
                        <p className="text-gray-900 dark:text-gray-100">
                          {formatDateTime(selectedTask.created_at)}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Người tạo
                        </h4>
                        <p className="text-gray-900 dark:text-gray-100">
                          {selectedTask.user_name || 'Không xác định'}
                        </p>
                      </div>

                      {selectedTask.progress > 0 && (
                        <div className="col-span-2">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Tiến độ
                          </h4>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedTask.progress} className="h-2 flex-1" />
                            <span className="text-sm font-medium">{selectedTask.progress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Thay đổi trạng thái
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={selectedTask.status === 'todo' ? 'default' : 'outline'}
                          className="justify-start"
                          onClick={() => handleStatusChange(selectedTask.id, 'todo')}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Chưa thực hiện
                        </Button>

                        <Button
                          variant={selectedTask.status === 'in-progress' ? 'default' : 'outline'}
                          className="justify-start"
                          onClick={() => handleStatusChange(selectedTask.id, 'in-progress')}
                        >
                          <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                          Đang thực hiện
                        </Button>

                        <Button
                          variant={selectedTask.status === 'on-hold' ? 'default' : 'outline'}
                          className="justify-start"
                          onClick={() => handleStatusChange(selectedTask.id, 'on-hold')}
                        >
                          <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                          Tạm hoãn
                        </Button>

                        <Button
                          variant={selectedTask.status === 'completed' ? 'default' : 'outline'}
                          className="justify-start"
                          onClick={() => handleStatusChange(selectedTask.id, 'completed')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          Hoàn thành
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Xác nhận xóa công việc
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa công việc này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          {taskToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {taskToDelete.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {taskToDelete.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(taskToDelete.status)}>
                    {getStatusLabel(taskToDelete.status)}
                  </Badge>
                  <Badge variant="outline">{getTaskTypeLabel(taskToDelete.type)}</Badge>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setTaskToDelete(null)}
                  disabled={isDeleting}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteTask}
                  disabled={isDeleting}
                  className="flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Xóa công việc
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
