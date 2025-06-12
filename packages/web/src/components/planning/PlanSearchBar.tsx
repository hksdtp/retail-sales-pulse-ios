import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PlanFilters {
  status: string;
  type: string;
  priority: string;
  dateRange: string;
  startDate?: Date;
  endDate?: Date;
}

interface PlanSearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: PlanFilters) => void;
  placeholder?: string;
}

const PlanSearchBar: React.FC<PlanSearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = "Tìm kiếm kế hoạch..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PlanFilters>({
    status: 'all',
    type: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  // Notify parent when filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof PlanFilters, value: string | Date) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      priority: 'all',
      dateRange: 'all'
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  const handleDateRangeSelect = (range: string) => {
    if (range === 'custom') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
      handleFilterChange('dateRange', range);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Bộ lọc
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        {getActiveFilterCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ thực hiện</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại kế hoạch</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="meeting">Họp</option>
              <option value="site_visit">Khảo sát</option>
              <option value="report">Báo cáo</option>
              <option value="training">Đào tạo</option>
              <option value="client_meeting">Gặp khách hàng</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Độ ưu tiên</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="tomorrow">Ngày mai</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="custom">Tùy chọn</option>
            </select>
          </div>
        </div>
      )}

      {/* Custom Date Picker */}
      {showDatePicker && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => handleFilterChange('startDate', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => handleFilterChange('endDate', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Trạng thái: {filters.status}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleFilterChange('status', 'all')}
              />
            </Badge>
          )}
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Loại: {filters.type}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleFilterChange('type', 'all')}
              />
            </Badge>
          )}
          {filters.priority !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Ưu tiên: {filters.priority}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleFilterChange('priority', 'all')}
              />
            </Badge>
          )}
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Thời gian: {filters.dateRange}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleFilterChange('dateRange', 'all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanSearchBar;
