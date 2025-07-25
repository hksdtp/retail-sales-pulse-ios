import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Filter, Calendar, Clock, User, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TaskSearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: TaskFilters) => void;
  placeholder?: string;
  showDateFilter?: boolean;
  currentDateFilter?: string;
}

interface TaskFilters {
  search: string;
  status: string;
  type: string;
  priority: string;
  dateRange: string;
  startDate?: Date;
  endDate?: Date;
  assignedTo: string;
}

const TaskSearchBar: React.FC<TaskSearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = "Tìm kiếm công việc...",
  showDateFilter = false,
  currentDateFilter = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    type: 'all',
    priority: 'all',
    dateRange: currentDateFilter,
    assignedTo: 'all'
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Đồng bộ currentDateFilter với filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, dateRange: currentDateFilter }));
  }, [currentDateFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  // Notify parent when filters change - use ref to prevent infinite loop
  const prevFiltersRef = useRef<TaskFilters>();

  useEffect(() => {
    // Only call onFilterChange if filters actually changed
    if (prevFiltersRef.current && JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)) {
      onFilterChange(filters);
    }
    prevFiltersRef.current = filters;
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof TaskFilters, value: string | Date) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      priority: 'all',
      dateRange: 'all',
      assignedTo: 'all'
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    // Nếu showDateFilter = true, không tính dateRange trong hasActiveFilters vì nó hiển thị ngoài
    if (showDateFilter && key === 'dateRange') {
      return false;
    }
    return value !== 'all' && value !== '' && value !== undefined;
  });

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-11 pr-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-900 dark:text-gray-100"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-150"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Date Filter ngoài - hiển thị khi showDateFilter = true */}
      {showDateFilter && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Lọc theo thời gian
          </label>
          <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
            <SelectTrigger className="w-full h-10 bg-white border-gray-200 rounded-lg">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="yesterday">Hôm qua</SelectItem>
              <SelectItem value="tomorrow">Ngày mai</SelectItem>
              <SelectItem value="this-week">Tuần này</SelectItem>
              <SelectItem value="this-month">Tháng này</SelectItem>
              <SelectItem value="past-week">7 ngày qua</SelectItem>
              <SelectItem value="past-month">30 ngày qua</SelectItem>
              <SelectItem value="custom">Chọn ngày cụ thể</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200
            ${hasActiveFilters
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Bộ lọc</span>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${showDateFilter ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full h-10 bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="todo">Chưa bắt đầu</SelectItem>
                  <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                  <SelectItem value="on-hold">Tạm hoãn</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ưu tiên
              </label>
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger className="w-full h-10 bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="normal">Bình thường</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại công việc
              </label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="w-full h-10 bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="architect_new">KTS mới</SelectItem>
                  <SelectItem value="architect_old">KTS cũ</SelectItem>
                  <SelectItem value="client_new">KH/CĐT mới</SelectItem>
                  <SelectItem value="client_old">KH/CĐT cũ</SelectItem>
                  <SelectItem value="quote_new">SBG mới</SelectItem>
                  <SelectItem value="quote_old">SBG cũ</SelectItem>
                  <SelectItem value="partner_new">Đối tác mới</SelectItem>
                  <SelectItem value="partner_old">Đối tác cũ</SelectItem>
                  <SelectItem value="other">Công việc khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter - chỉ hiển thị khi showDateFilter = false */}
            {!showDateFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian
                </label>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger className="w-full h-10 bg-white border-gray-200 rounded-lg">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="today">Hôm nay</SelectItem>
                    <SelectItem value="yesterday">Hôm qua</SelectItem>
                    <SelectItem value="tomorrow">Ngày mai</SelectItem>
                    <SelectItem value="this-week">Tuần này</SelectItem>
                    <SelectItem value="this-month">Tháng này</SelectItem>
                    <SelectItem value="past-week">7 ngày qua</SelectItem>
                    <SelectItem value="past-month">30 ngày qua</SelectItem>
                    <SelectItem value="custom">Chọn ngày cụ thể</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 bg-white border-gray-200 rounded-lg justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.startDate ? (
                        format(filters.startDate, 'dd/MM/yyyy', { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => handleFilterChange('startDate', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 bg-white border-gray-200 rounded-lg justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.endDate ? (
                        format(filters.endDate, 'dd/MM/yyyy', { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => handleFilterChange('endDate', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskSearchBar;
