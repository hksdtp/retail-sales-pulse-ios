import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subDays, subWeeks, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { 
  Search, Filter, CheckCircle, Clock, AlertCircle, 
  CheckCircle2, ArrowUpDown, X, RefreshCw, Calendar
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTaskData } from '@/hooks/use-task-data';
import { Task } from '@/components/tasks/types/TaskTypes';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";


const TaskList = () => {
  const navigate = useNavigate();
  const { tasks, isLoading, filterTasks, updateTaskStatus, refreshTasks, currentUser } = useTaskData();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Hàm kiểm tra dữ liệu công việc để debug
  const debugTasks = useCallback(() => {
    console.log('Số lượng công việc từ context:', tasks.length);
    console.log('Dữ liệu công việc gốc:', tasks);
    
    // Đọc dữ liệu từ local storage để kiểm tra
    const storedTasks = localStorage.getItem('tasks');
    const localTasks = storedTasks ? JSON.parse(storedTasks) : [];
    console.log('Số lượng công việc trong localStorage:', localTasks.length);
    console.log('Dữ liệu từ localStorage:', localTasks);
    
    // Hiển thị thông tin user để kiểm tra phân quyền
    console.log('Thông tin người dùng hiện tại:', currentUser);
  }, [tasks, currentUser]);

  // Xử lý làm mới dữ liệu
  const handleRefresh = async () => {
    debugTasks();
    await refreshTasks();
    debugTasks();
  };

  // Xử lý lọc và sắp xếp tasks
  useEffect(() => {
    let result = [...tasks];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      result = result.filter(
        task => task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Lọc theo trạng thái
    if (statusFilter.length > 0) {
      result = result.filter(task => statusFilter.includes(task.status));
    }
    
    // Lọc theo loại
    if (typeFilter.length > 0) {
      result = result.filter(task => typeFilter.includes(task.type));
    }
    
    // Tạm thời tắt bộ lọc ngày tháng
    // Bỏ qua lọc theo khoảng thời gian để kiểm tra lỗi
    console.log('DEBUG: Đã tắt bộ lọc ngày tháng');
    console.log('DEBUG: Trước khi lọc: Số task =', result.length);
    // Reset giá trị của các bộ lọc ngày tháng để tránh ảnh hưởng
    
    // Sắp xếp theo ngày
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredTasks(result);
    console.log('Số lượng công việc sau khi lọc:', result.length);
  }, [tasks, searchQuery, statusFilter, typeFilter, sortOrder, dateFilter, dateRange]);
  
  // Debug khi component mount
  useEffect(() => {
    debugTasks();
  }, [debugTasks]);

  // Xử lý thay đổi trạng thái
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTaskStatus(taskId, newStatus);
  };

  // Hàm hiển thị loại công việc tiếng Việt
  const getTaskTypeLabel = (type: string): string => {
    const typeMapping: Record<string, string> = {
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
    return typeMapping[type] || 'Không xác định';
  };

  // Hàm hiển thị trạng thái công việc tiếng Việt
  const getStatusLabel = (status: string): string => {
    const statusMapping: Record<string, string> = {
      'todo': 'Chưa thực hiện',
      'in-progress': 'Đang thực hiện',
      'on-hold': 'Tạm hoãn',
      'completed': 'Hoàn thành'
    };
    return statusMapping[status] || 'Không xác định';
  };

  // Hàm lấy màu cho badge trạng thái
  const getStatusColor = (status: string): string => {
    const colorMapping: Record<string, string> = {
      'todo': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'on-hold': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    };
    return colorMapping[status] || '';
  };

  // Hàm lấy biểu tượng cho trạng thái
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'todo':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'on-hold':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Hàm hiển thị thời gian đẹp
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return 'Không xác định';
    }
  };

  // Xử lý toggle status filter
  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  // Xử lý toggle type filter
  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Xử lý chọn khoảng thời gian tùy chỉnh
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setDateFilter('custom');
    }
  };

  // Xóa tất cả bộ lọc
  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter([]);
    setTypeFilter([]);
    setDateFilter('all');
    setDateRange(undefined);
  };

  return (
    <div className="container mx-auto px-0 sm:px-4">
      {/* Header với tìm kiếm và bộ lọc */}
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
            {/* Lọc thời gian */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/80 dark:bg-gray-700/80">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateFilter === 'all' ? 'Thời gian' : 
                   dateFilter === 'today' ? 'Hôm nay' :
                   dateFilter === 'yesterday' ? 'Hôm qua' :
                   dateFilter === 'this-week' ? 'Tuần này' :
                   dateFilter === 'last-week' ? 'Tuần trước' :
                   dateFilter === 'next-week' ? 'Tuần sau' :
                   dateFilter === 'this-month' ? 'Tháng này' :
                   dateFilter === 'last-month' ? 'Tháng trước' :
                   dateFilter === 'next-month' ? 'Tháng sau' :
                   dateFilter === 'custom' ? 'Tùy chỉnh' : 'Thời gian'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5 text-sm font-semibold">Thời gian</div>
                  <Separator className="my-1" />
                  <DropdownMenuItem onClick={() => {
                    setDateFilter('all');
                    setDateRange(undefined);
                  }}>
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
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                        defaultMonth={dateRange.from}
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

            {/* Lọc trạng thái và loại */}
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
                  <DropdownMenuItem className="flex items-center gap-2" onSelect={(e) => e.preventDefault()}>
                    <Checkbox 
                      id="status-todo" 
                      checked={statusFilter.includes('todo')} 
                      onCheckedChange={() => toggleStatusFilter('todo')}
                    />
                    <label htmlFor="status-todo" className="cursor-pointer flex-1 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Chưa thực hiện
                    </label>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center gap-2" onSelect={(e) => e.preventDefault()}>
                    <Checkbox 
                      id="status-in-progress" 
                      checked={statusFilter.includes('in-progress')} 
                      onCheckedChange={() => toggleStatusFilter('in-progress')}
                    />
                    <label htmlFor="status-in-progress" className="cursor-pointer flex-1 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      Đang thực hiện
                    </label>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center gap-2" onSelect={(e) => e.preventDefault()}>
                    <Checkbox 
                      id="status-on-hold" 
                      checked={statusFilter.includes('on-hold')} 
                      onCheckedChange={() => toggleStatusFilter('on-hold')}
                    />
                    <label htmlFor="status-on-hold" className="cursor-pointer flex-1 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Tạm hoãn
                    </label>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center gap-2" onSelect={(e) => e.preventDefault()}>
                    <Checkbox 
                      id="status-completed" 
                      checked={statusFilter.includes('completed')} 
                      onCheckedChange={() => toggleStatusFilter('completed')}
                    />
                    <label htmlFor="status-completed" className="cursor-pointer flex-1 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Hoàn thành
                    </label>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <Separator className="my-1" />
                
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5 text-sm font-semibold">Loại công việc</div>
                  <Separator className="my-1" />
                  {['partner_new', 'partner_old', 'architect_new', 'architect_old', 
                    'client_new', 'client_old', 'quote_new', 'quote_old', 'other'].map((type) => (
                    <DropdownMenuItem key={type} className="flex items-center gap-2" onSelect={(e) => e.preventDefault()}>
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
                  <Button variant="secondary" size="sm" className="w-full" onClick={clearAllFilters}>
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Sắp xếp */}
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
        
        {/* Hiển thị các bộ lọc đang áp dụng */}
        {(statusFilter.length > 0 || typeFilter.length > 0 || dateFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-3">
            {statusFilter.map(status => (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                {getStatusLabel(status)}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleStatusFilter(status)}
                />
              </Badge>
            ))}
            
            {typeFilter.map(type => (
              <Badge key={type} variant="secondary" className="flex items-center gap-1">
                {getTaskTypeLabel(type)}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleTypeFilter(type)}
                />
              </Badge>
            ))}
            
            {dateFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {dateFilter === 'today' ? 'Hôm nay' :
                 dateFilter === 'yesterday' ? 'Hôm qua' :
                 dateFilter === 'this-week' ? 'Tuần này' :
                 dateFilter === 'last-week' ? 'Tuần trước' :
                 dateFilter === 'next-week' ? 'Tuần sau' :
                 dateFilter === 'this-month' ? 'Tháng này' :
                 dateFilter === 'last-month' ? 'Tháng trước' :
                 dateFilter === 'next-month' ? 'Tháng sau' :
                 dateFilter === 'custom' && dateRange?.from && dateRange?.to ?
                  `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}` :
                  'Khoảng thời gian tùy chỉnh'}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => {
                    setDateFilter('all');
                    setDateRange(undefined);
                  }}
                />
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs" 
              onClick={clearAllFilters}
            >
              Xóa tất cả
            </Button>
          </div>
        )}
      </div>

      {/* Danh sách công việc */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="flex justify-center mb-4">
                <Search className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Không tìm thấy công việc nào</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              {(searchQuery || statusFilter.length > 0 || typeFilter.length > 0) && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={clearAllFilters}
                >
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
                <Button 
                  onClick={handleRefresh} 
                  size="sm" 
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Làm mới
                </Button>
                <Button onClick={() => navigate("/tasks/new")} size="sm">
                  Thêm công việc
                </Button>
              </div>
            </div>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(task.status)}
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

      {/* Dialog chi tiết công việc */}
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
                    <Badge variant="outline">
                      {getTaskTypeLabel(selectedTask.type)}
                    </Badge>
                    {selectedTask.location && (
                      <Badge variant="outline">
                        {selectedTask.location}
                      </Badge>
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
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mô tả</h4>
                      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
                        {selectedTask.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ngày tạo</h4>
                        <p className="text-gray-900 dark:text-gray-100">
                          {formatDateTime(selectedTask.created_at)}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Người tạo</h4>
                        <p className="text-gray-900 dark:text-gray-100">
                          {selectedTask.user_name || 'Không xác định'}
                        </p>
                      </div>
                      
                      {selectedTask.progress > 0 && (
                        <div className="col-span-2">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tiến độ</h4>
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
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Thay đổi trạng thái</h4>
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
    </div>
  );
};

export default TaskList;
