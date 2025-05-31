import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, subDays, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Search, Filter, CheckCircle, Clock, AlertCircle, 
  ChevronDown, X, RefreshCw, Calendar, Star,
  Loader2, Pencil, Trash, Plus, User, Flag,
  FileText, Home, Users, CheckCircle2, Save,
  Zap, TrendingUp, BarChart3
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from '@/components/ui/progress';
import { useTaskData } from '@/hooks/use-task-data';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/components/tasks/types/TaskTypes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortType = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'priority-high' | 'priority-low';
type DateRangeType = 'today' | '7days' | '30days' | 'month' | 'custom';

interface FilterState {
  status: string[];
  priority: string[];
  assignee: string[];
  type: string[];
}

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tasks, isLoading, refreshTasks, updateTaskStatus, deleteTask, updateTask, currentUser } = useTaskData();
  
  const [searchValue, setSearchValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortType>('newest');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeType | ''>('');
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    assignee: [],
    type: []
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Task> & {collaborators?: string}>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'a-z', label: 'A-Z' },
    { value: 'z-a', label: 'Z-A' },
    { value: 'priority-high', label: 'Ưu tiên cao' },
    { value: 'priority-low', label: 'Ưu tiên thấp' }
  ];
  
  const dateRanges: { value: DateRangeType; label: string }[] = [
    { value: 'today', label: 'Hôm nay' },
    { value: '7days', label: '7 ngày qua' },
    { value: '30days', label: '30 ngày qua' },
    { value: 'month', label: 'Tháng này' },
    { value: 'custom', label: 'Tùy chỉnh' }
  ];
  
  const statusOptions = [
    { value: 'todo', label: 'Chưa làm', icon: Clock, color: 'text-gray-500' },
    { value: 'in-progress', label: 'Đang làm', icon: AlertCircle, color: 'text-blue-500' },
    { value: 'on-hold', label: 'Tạm hoãn', icon: AlertCircle, color: 'text-orange-500' },
    { value: 'completed', label: 'Hoàn thành', icon: CheckCircle, color: 'text-green-500' }
  ];
  
  const priorityOptions = [
    { value: 'high', label: 'Cao', color: 'text-red-500', bgColor: 'bg-red-50' },
    { value: 'medium', label: 'Trung bình', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { value: 'low', label: 'Thấp', color: 'text-green-500', bgColor: 'bg-green-50' }
  ];

  const typeOptions = [
    { value: 'partner_new', label: 'Đối tác mới', icon: Users, color: 'text-blue-500' },
    { value: 'partner_old', label: 'Đối tác cũ', icon: Users, color: 'text-blue-400' },
    { value: 'architect_new', label: 'Kiến trúc sư mới', icon: Home, color: 'text-purple-500' },
    { value: 'architect_old', label: 'Kiến trúc sư cũ', icon: Home, color: 'text-purple-400' },
    { value: 'client_new', label: 'Khách hàng mới', icon: User, color: 'text-green-500' },
    { value: 'client_old', label: 'Khách hàng cũ', icon: User, color: 'text-green-400' },
    { value: 'quote_new', label: 'Báo giá mới', icon: FileText, color: 'text-yellow-500' },
    { value: 'quote_old', label: 'Báo giá cũ', icon: FileText, color: 'text-yellow-400' }
  ];

  const savedPresets = [
    { id: 1, name: 'Việc ưu tiên cao', icon: Zap, filters: { priority: ['high'], status: ['todo', 'in-progress'] } },
    { id: 2, name: 'Việc của tôi', icon: User, filters: { assignee: [currentUser?.id || ''] } },
    { id: 3, name: 'Hoàn thành tuần này', icon: CheckCircle2, filters: { status: ['completed'], dateRange: '7days' } },
    { id: 4, name: 'Cần review', icon: BarChart3, filters: { status: ['on-hold'] } }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchValue.length > 0) {
      const searchSuggestions = tasks
        .filter(task => task.title.toLowerCase().includes(searchValue.toLowerCase()))
        .slice(0, 5)
        .map(task => task.title);
      setSuggestions(searchSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchValue, tasks]);

  const getFilteredTasks = useCallback(() => {
    let filtered = [...tasks];
    
    if (searchValue) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }
    
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority || 'medium'));
    }
    
    if (filters.assignee.length > 0) {
      filtered = filtered.filter(task => task.assignedTo && filters.assignee.includes(task.assignedTo));
    }

    if (filters.type.length > 0) {
      filtered = filtered.filter(task => filters.type.includes(task.type));
    }

    if (selectedDateRange) {
      const today = new Date();
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.created_at);
        switch (selectedDateRange) {
          case 'today':
            return format(taskDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          case '7days':
            return isWithinInterval(taskDate, { 
              start: subDays(today, 7), 
              end: today 
            });
          case '30days':
            return isWithinInterval(taskDate, { 
              start: subDays(today, 30), 
              end: today 
            });
          case 'month':
            return isWithinInterval(taskDate, { 
              start: startOfMonth(today), 
              end: endOfMonth(today) 
            });
          default:
            return true;
        }
      });
    }
    
    filtered = filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        case 'priority-high':
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 999) - 
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 999);
        case 'priority-low':
          const priorityOrderReverse = { high: 3, medium: 2, low: 1 };
          return (priorityOrderReverse[a.priority as keyof typeof priorityOrderReverse] || 999) - 
                 (priorityOrderReverse[b.priority as keyof typeof priorityOrderReverse] || 999);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    return filtered;
  }, [searchValue, filters, selectedSort, selectedDateRange, tasks]);

  const handleReset = () => {
    setSearchValue('');
    setSelectedSort('newest');
    setFilters({ status: [], priority: [], assignee: [], type: [] });
    setSelectedDateRange('');
    setShowAdvancedFilter(false);
  };

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const applyPreset = (preset: any) => {
    setFilters({
      status: preset.filters.status || [],
      priority: preset.filters.priority || [],
      assignee: preset.filters.assignee || [],
      type: preset.filters.type || []
    });
    if (preset.filters.dateRange) {
      setSelectedDateRange(preset.filters.dateRange);
    }
    setShowPresets(false);
    setShowAdvancedFilter(true);
  };

  const activeFilterCount = Object.values(filters).flat().length + (selectedDateRange ? 1 : 0);

  const getStatusText = (status: string) => {
    return statusOptions.find(s => s.value === status)?.label || 'Không xác định';
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'todo': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getTaskTypeInfo = (type: string) => {
    return typeOptions.find(t => t.value === type) || { label: 'Khác', icon: FileText, color: 'text-gray-500' };
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return 'Không xác định';
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast({
        title: "Đã cập nhật trạng thái",
        description: `Trạng thái đã được thay đổi thành ${getStatusText(newStatus)}`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsDeleting(taskId);
      await deleteTask(taskId);
      toast({
        title: "Xóa thành công",
        description: "Nhiệm vụ đã được xóa khỏi hệ thống.",
      });
      await refreshTasks();
    } catch (error) {
      console.error("Delete task error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhiệm vụ.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (task: Task, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingTask(task);
    
    // Tách collaborators từ mô tả nếu có
    let collaborators = '';
    let description = task.description || '';
    
    // Nếu mô tả có phần "Người thực hiện cùng:", tách ra
    const collaboratorsMatch = description.match(/Người thực hiện cùng: (.+)$/m);
    if (collaboratorsMatch) {
      collaborators = collaboratorsMatch[1];
      description = description.replace(/\n\nNgười thực hiện cùng: .+$/m, '');
    }
    
    setEditFormData({
      title: task.title,
      description: description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      assignedTo: task.assignedTo || currentUser?.name,
      collaborators: collaborators
    });
    
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editFormData.title) return;
    
    try {
      setIsSaving(true);
      if (editingTask && editFormData) {
        // Tạo updates với các thông tin đã chỉnh sửa
        const updates: Partial<Task> = {
          title: editFormData.title,
          description: editFormData.description,
          status: editFormData.status,
          priority: editFormData.priority,
          type: editFormData.type,
          assignedTo: editFormData.assignedTo
        };
        
        // Nếu có collaborators, thêm vào mô tả
        if (editFormData.collaborators && editFormData.collaborators.trim() !== '') {
          const collaboratorsText = `\n\nNgười thực hiện cùng: ${editFormData.collaborators}`;
          updates.description = (updates.description || '') + collaboratorsText;
        }
        
        // Gọi API để cập nhật (với ID và các thay đổi)
        await updateTask(editingTask.id, updates);
        await refreshTasks();
        setEditingTask(null);
        setEditDialogOpen(false);
        toast({
          title: "Công việc đã được cập nhật",
          description: "Đã cập nhật thông tin công việc thành công",
        });
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        variant: "destructive",
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật công việc. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    refreshTasks();
    toast({
      title: "Đã làm mới",
      description: "Danh sách công việc đã được cập nhật",
    });
  };

  const getUniqueAssignees = () => {
    const assignees = new Set<string>();
    tasks.forEach(task => {
      if (task.assignedTo) assignees.add(task.assignedTo);
    });
    return Array.from(assignees);
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm kiếm công việc..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-400 focus:bg-white transition-all duration-200"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200/50 py-2 z-50"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchValue(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                selectedDateRange
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">
                {selectedDateRange ? dateRanges.find(d => d.value === selectedDateRange)?.label : 'Ngày'}
              </span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl flex items-center gap-2 hover:border-gray-300 transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">{sortOptions.find(s => s.value === selectedSort)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showSortMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200/50 py-1 z-50"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedSort(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        selectedSort === option.value ? 'text-blue-500 font-medium bg-blue-50' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 relative ${
                activeFilterCount > 0 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Lọc</span>
              {activeFilterCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-md"
                >
                  {activeFilterCount}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => setShowPresets(!showPresets)}
              className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 transition-all duration-200"
              title="Bộ lọc đã lưu"
            >
              <Star className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 transition-all duration-200"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showDatePicker && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 bg-gray-50 rounded-xl"
          >
            <div className="flex flex-wrap gap-2">
              {dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    setSelectedDateRange(range.value);
                    setShowDatePicker(false);
                  }}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    selectedDateRange === range.value
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {showAdvancedFilter && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4"
          >
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Trạng thái
              </h4>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleFilter('status', option.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
                        filters.status.includes(option.value)
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${filters.status.includes(option.value) ? 'text-white' : option.color}`} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Độ ưu tiên
              </h4>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter('priority', option.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      filters.priority.includes(option.value)
                        ? 'bg-blue-500 text-white shadow-md'
                        : `${option.bgColor} hover:opacity-80 border border-gray-200`
                    }`}
                  >
                    <span className={filters.priority.includes(option.value) ? 'text-white' : option.color}>●</span>
                    <span className="ml-1.5">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Loại công việc
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleFilter('type', option.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
                        filters.type.includes(option.value)
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${filters.type.includes(option.value) ? 'text-white' : option.color}`} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Người thực hiện
              </h4>
              <div className="flex flex-wrap gap-2">
                {getUniqueAssignees().map((user) => (
                  <button
                    key={user}
                    onClick={() => toggleFilter('assignee', user)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      filters.assignee.includes(user)
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {user}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                Lưu bộ lọc
              </button>
            </div>
          </motion.div>
        )}

        {showPresets && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 bg-gray-50 rounded-xl"
          >
            <h4 className="text-sm font-medium text-gray-700 mb-3">Bộ lọc đã lưu</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedPresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="w-full px-4 py-3 text-sm bg-white rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all text-left border border-gray-200 flex items-center gap-3"
                  >
                    <Icon className="w-4 h-4 text-blue-500" />
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách công việc ({filteredTasks.length})
          </h3>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} size="sm" variant="outline" className="border-gray-200">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={() => navigate('/tasks/new')} size="sm" className="bg-blue-500 hover:bg-blue-600 shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Thêm công việc
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">Không có công việc nào</p>
            {activeFilterCount > 0 && (
              <button 
                onClick={handleReset}
                className="mt-4 text-blue-500 hover:text-blue-600 text-sm"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map(task => {
              const typeInfo = getTaskTypeInfo(task.type);
              const TypeIcon = typeInfo.icon;
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}
                  className="p-5 cursor-pointer transition-all"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1 truncate">{task.title}</h4>
                      <div className="flex items-center gap-3 text-sm">
                        <DropdownMenu open={statusDropdownOpen === task.id} onOpenChange={(open) => {
                          if (open) {
                            setStatusDropdownOpen(task.id);
                          } else {
                            setStatusDropdownOpen(null);
                          }
                        }}>
                          <DropdownMenuTrigger asChild onClick={(e) => {
                            e.stopPropagation();
                            setStatusDropdownOpen(task.id);
                          }}>
                            <Badge className={`cursor-pointer inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-shadow ${getStatusColor(task.status)}`}>
                              {getStatusText(task.status)}
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                            {statusOptions.map((status) => {
                              const Icon = status.icon;
                              return (
                                <DropdownMenuItem 
                                  key={status.value}
                                  className={`flex items-center gap-2 ${task.status === status.value ? 'bg-gray-100' : ''} hover:bg-gray-200`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(task.id, status.value as Task['status']);
                                    setStatusDropdownOpen(null);
                                  }}
                                >
                                  <Icon className={`h-4 w-4 ${status.color}`} />
                                  {status.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {task.priority && (
                          <span className={`flex items-center gap-1 text-xs ${
                            task.priority === 'high' ? 'text-red-500' :
                            task.priority === 'medium' ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            <span>●</span>
                            {priorityOptions.find(p => p.value === task.priority)?.label}
                          </span>
                        )}
                        <span className={`flex items-center gap-1 text-xs ${typeInfo.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                        {task.assignedTo && (
                          <span className="text-gray-500 flex items-center gap-1 text-xs">
                            <User className="w-3 h-3" />
                            {task.assignedTo}
                          </span>
                        )}
                        <span className="text-gray-400 text-xs">
                          {formatDateTime(task.created_at)}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={(e) => handleEditClick(task, e)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        disabled={isDeleting === task.id}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        {isDeleting === task.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">{selectedTask.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={getStatusColor(selectedTask.status)}>
                      {getStatusText(selectedTask.status)}
                    </Badge>
                    {selectedTask.priority && (
                      <Badge variant="outline" className={priorityOptions.find(p => p.value === selectedTask.priority)?.bgColor}>
                        {priorityOptions.find(p => p.value === selectedTask.priority)?.label}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {getTaskTypeInfo(selectedTask.type).label}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-6 space-y-4">
                {selectedTask.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Mô tả</h4>
                    <p className="text-gray-900 whitespace-pre-line">
                      {selectedTask.description}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Ngày tạo</h4>
                    <p className="text-gray-900">
                      {formatDateTime(selectedTask.created_at)}
                    </p>
                  </div>
                  
                  {selectedTask.assignedTo && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Người thực hiện</h4>
                      <p className="text-gray-900">{selectedTask.assignedTo}</p>
                    </div>
                  )}
                  
                  {/* Đã xóa phần tiến độ theo yêu cầu */}
                </div>

                {/* Đã xóa phần thay đổi trạng thái theo yêu cầu */}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa công việc */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-2xl">
          {editingTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Chỉnh sửa công việc</DialogTitle>
                <DialogDescription>
                  Chỉnh sửa thông tin công việc
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
        {/* Form chính cho dialog chỉnh sửa */}
                <div className="space-y-3">
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">Tiêu đề</label>
                      <input
                        id="title"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tiêu đề công việc"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">Mô tả</label>
                      <textarea
                        id="description"
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        className="w-full p-2 border rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mô tả chi tiết"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium">Trạng thái</label>
                        <select
                          id="status"
                          value={editFormData.status || ''}
                          onChange={(e) => setEditFormData({...editFormData, status: e.target.value as Task['status']})}
                          className={"w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="priority" className="text-sm font-medium">Độ ưu tiên</label>
                        <select
                          id="priority"
                          value={editFormData.priority || 'medium'}
                          onChange={(e) => setEditFormData({...editFormData, priority: e.target.value as 'high' | 'medium' | 'low' | undefined})}
                          className={"w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}
                        >
                          {priorityOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="type" className="text-sm font-medium">Loại công việc</label>
                        <select
                          id="type"
                          value={editFormData.type || ''}
                          onChange={(e) => setEditFormData({...editFormData, type: e.target.value as Task['type']})}
                          className={"w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}
                        >
                          {typeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="assignedTo" className="text-sm font-medium">Người tạo</label>
                        <input
                          id="assignedTo"
                          value={editFormData.assignedTo || currentUser?.name || ''}
                          onChange={(e) => setEditFormData({...editFormData, assignedTo: e.target.value})}
                          className={"w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"}
                          placeholder="Người tạo"
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <label htmlFor="collaborators" className="text-sm font-medium">Người thực hiện cùng (TAG hoặc Nhóm)</label>
                      <input
                        id="collaborators"
                        value={editFormData.collaborators || ''}
                        onChange={(e) => setEditFormData({...editFormData, collaborators: e.target.value})}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: @nguyenvan, @nhom_sale"
                      />
                    </div>
                    
                    {/* Đã xóa phần tiến độ theo yêu cầu */}
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingTask(null)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={handleSaveEdit}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;