import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  X, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Flag,
  ChevronDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface UnifiedTaskFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: TaskFilters) => void;
  placeholder?: string;
}

interface TaskFilters {
  search: string;
  status: string;
  type: string;
  priority: string;
  dateRange: string;
}

const UnifiedTaskFilter: React.FC<UnifiedTaskFilterProps> = ({
  onSearch,
  onFilterChange,
  placeholder = "Tìm kiếm công việc..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    type: 'all',
    priority: 'all',
    dateRange: 'all'
  });

  // Đếm số filter đang active
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  // Lấy danh sách filter đang active
  const getActiveFilters = () => {
    const active = [];
    
    if (filters.status !== 'all') {
      const statusLabels = {
        'todo': 'Chưa bắt đầu',
        'in-progress': 'Đang thực hiện',
        'on-hold': 'Tạm hoãn',
        'completed': 'Đã hoàn thành'
      };
      active.push(statusLabels[filters.status as keyof typeof statusLabels] || filters.status);
    }
    
    if (filters.type !== 'all') {
      const typeLabels = {
        'architect_new': 'KTS mới',
        'architect_old': 'KTS cũ',
        'client_new': 'KH/CĐT mới',
        'client_old': 'KH/CĐT cũ',
        'quote_new': 'SBG mới',
        'quote_old': 'SBG cũ',
        'partner_new': 'ĐT mới',
        'partner_old': 'ĐT cũ',
        'other': 'Khác'
      };
      active.push(typeLabels[filters.type as keyof typeof typeLabels] || filters.type);
    }
    
    if (filters.priority !== 'all') {
      const priorityLabels = {
        'low': 'Thấp',
        'normal': 'Bình thường',
        'high': 'Cao',
        'urgent': 'Khẩn cấp'
      };
      active.push(priorityLabels[filters.priority as keyof typeof priorityLabels] || filters.priority);
    }
    
    if (filters.dateRange !== 'all') {
      const dateLabels = {
        'today': 'Hôm nay',
        'yesterday': 'Hôm qua',
        'tomorrow': 'Ngày mai',
        'this-week': 'Tuần này',
        'this-month': 'Tháng này',
        'this-quarter': 'Quý này',
        'this-year': 'Năm này'
      };
      active.push(dateLabels[filters.dateRange as keyof typeof dateLabels] || filters.dateRange);
    }
    
    return active;
  };

  // Xử lý thay đổi search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
    
    const updatedFilters = { ...filters, search: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Xóa tất cả filter
  const clearAllFilters = () => {
    const defaultFilters = {
      search: searchQuery, // Giữ nguyên search
      status: 'all',
      type: 'all',
      priority: 'all',
      dateRange: 'all'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Xóa filter cụ thể
  const removeFilter = (filterKey: keyof TaskFilters) => {
    handleFilterChange(filterKey, 'all');
  };

  const activeFilterCount = getActiveFilterCount();
  const activeFilters = getActiveFilters();

  return (
    <div className="space-y-3">
      {/* Search Bar và Filter Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-10 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`h-10 px-4 border-gray-200 hover:bg-gray-50 w-full sm:w-auto transition-all duration-200 ${
                activeFilterCount > 0 ? 'border-blue-500 bg-blue-50 shadow-sm' : ''
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 sm:w-96 p-4" align="end" side="bottom" sideOffset={8}>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">Bộ lọc công việc</h4>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-[20px] text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Xóa tất cả
                  </Button>
                )}
              </div>

              {/* Filters */}
              <div className="space-y-3">
                {/* Thời gian */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Thời gian
                  </label>
                  <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="today">Hôm nay</SelectItem>
                      <SelectItem value="yesterday">Hôm qua</SelectItem>
                      <SelectItem value="tomorrow">Ngày mai</SelectItem>
                      <SelectItem value="this-week">Tuần này</SelectItem>
                      <SelectItem value="this-month">Tháng này</SelectItem>
                      <SelectItem value="this-quarter">Quý này</SelectItem>
                      <SelectItem value="this-year">Năm này</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CheckCircle className="inline w-4 h-4 mr-1" />
                    Trạng thái
                  </label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="todo">Chưa bắt đầu</SelectItem>
                      <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                      <SelectItem value="on-hold">Tạm hoãn</SelectItem>
                      <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Loại công việc */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <AlertCircle className="inline w-4 h-4 mr-1" />
                    Loại công việc
                  </label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger className="w-full h-9">
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
                      <SelectItem value="partner_new">ĐT mới</SelectItem>
                      <SelectItem value="partner_old">ĐT cũ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mức độ ưu tiên */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Flag className="inline w-4 h-4 mr-1" />
                    Mức độ ưu tiên
                  </label>
                  <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="normal">Bình thường</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="urgent">Khẩn cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 hidden sm:inline">Đang lọc:</span>
          <span className="text-xs text-gray-600 sm:hidden">Lọc:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer text-xs"
              onClick={() => {
                // Tìm và xóa filter tương ứng
                if (filter.includes('Chưa bắt đầu') || filter.includes('Đang thực hiện') || filter.includes('Tạm hoãn') || filter.includes('Đã hoàn thành')) {
                  removeFilter('status');
                } else if (filter.includes('KTS') || filter.includes('KH/CĐT') || filter.includes('SBG') || filter.includes('ĐT') || filter.includes('Khác')) {
                  removeFilter('type');
                } else if (filter.includes('Thấp') || filter.includes('Bình thường') || filter.includes('Cao') || filter.includes('Khẩn cấp')) {
                  removeFilter('priority');
                } else {
                  removeFilter('dateRange');
                }
              }}
            >
              {filter}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Xóa tất cả</span>
            <span className="sm:hidden">Xóa</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default UnifiedTaskFilter;
