import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TaskFilters } from '@/context/TaskContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FilterIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface TaskFilterProps {
  onFilterChange: (filters: TaskFilters) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<TaskFilters>({
    dateRange: 'all',
    status: '',
    progress: null,
    startDate: null,
    endDate: null
  });
  
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Danh sách trạng thái
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'todo', label: 'Cần làm' },
    { value: 'in-progress', label: 'Đang thực hiện' },
    { value: 'on-hold', label: 'Tạm hoãn' },
    { value: 'completed', label: 'Đã hoàn thành' }
  ];
  
  // Danh sách tiến độ
  const progressOptions = [
    { value: null, label: 'Tất cả tiến độ' },
    { value: 25, label: 'Từ 25%' },
    { value: 50, label: 'Từ 50%' },
    { value: 75, label: 'Từ 75%' }
  ];
  
  // Danh sách thời gian
  const dateRangeOptions = [
    { value: 'all', label: 'Tất cả thời gian' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'custom', label: 'Tùy chỉnh' }
  ];

  // Xử lý thay đổi phạm vi ngày
  const handleDateRangeChange = (value: string) => {
    const newIsCustom = value === 'custom';
    setIsCustomDateRange(newIsCustom);
    
    // Nếu không phải tùy chỉnh, cập nhật bộ lọc ngay
    if (!newIsCustom) {
      const newFilters = { 
        ...filters, 
        dateRange: value as 'today' | 'week' | 'month' | 'all',
        startDate: null,
        endDate: null
      };
      setFilters(newFilters);
      updateActiveFilters(newFilters);
      onFilterChange(newFilters);
    } else {
      // Nếu là tùy chỉnh, chỉ cập nhật UI
      setFilters({ ...filters, dateRange: 'custom' });
    }
  };
  
  // Xử lý thay đổi ngày bắt đầu
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const newFilters = { ...filters, startDate: date.toISOString() };
      setFilters(newFilters);
      
      // Nếu đã có ngày kết thúc, áp dụng bộ lọc
      if (filters.endDate) {
        updateActiveFilters(newFilters);
        onFilterChange(newFilters);
      }
    }
  };
  
  // Xử lý thay đổi ngày kết thúc
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const newFilters = { ...filters, endDate: date.toISOString() };
      setFilters(newFilters);
      
      // Nếu đã có ngày bắt đầu, áp dụng bộ lọc
      if (filters.startDate) {
        updateActiveFilters(newFilters);
        onFilterChange(newFilters);
      }
    }
  };
  
  // Xử lý thay đổi trạng thái
  const handleStatusChange = (value: string) => {
    const newFilters = { ...filters, status: value };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Xử lý thay đổi tiến độ
  const handleProgressChange = (value: string) => {
    const progress = value ? parseInt(value) : null;
    const newFilters = { ...filters, progress };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Cập nhật danh sách bộ lọc đang hoạt động
  const updateActiveFilters = (currentFilters: TaskFilters) => {
    const active: string[] = [];
    
    if (currentFilters.dateRange && currentFilters.dateRange !== 'all') {
      if (currentFilters.dateRange === 'custom' && currentFilters.startDate && currentFilters.endDate) {
        active.push(`Từ ${format(new Date(currentFilters.startDate), 'dd/MM/yyyy', { locale: vi })} đến ${format(new Date(currentFilters.endDate), 'dd/MM/yyyy', { locale: vi })}`);
      } else {
        const dateLabel = dateRangeOptions.find(opt => opt.value === currentFilters.dateRange)?.label;
        if (dateLabel) active.push(dateLabel);
      }
    }
    
    if (currentFilters.status) {
      const statusLabel = statusOptions.find(opt => opt.value === currentFilters.status)?.label;
      if (statusLabel) active.push(statusLabel);
    }
    
    if (currentFilters.progress !== null && currentFilters.progress !== undefined) {
      const progressLabel = progressOptions.find(opt => opt.value === currentFilters.progress)?.label;
      if (progressLabel) active.push(progressLabel);
    }
    
    setActiveFilters(active);
  };
  
  // Xóa tất cả bộ lọc
  const clearAllFilters = () => {
    const defaultFilters: TaskFilters = {
      dateRange: 'all',
      status: '',
      progress: null,
      startDate: null,
      endDate: null
    };
    setFilters(defaultFilters);
    setIsCustomDateRange(false);
    setActiveFilters([]);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Bộ lọc theo thời gian */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Thời gian</label>
          <Select 
            value={filters.dateRange || 'all'} 
            onValueChange={handleDateRangeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Bộ lọc ngày tùy chỉnh */}
        {isCustomDateRange && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Từ ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? (
                      format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: vi })
                    ) : (
                      <span>Chọn ngày bắt đầu</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate ? new Date(filters.startDate) : undefined}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Đến ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? (
                      format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: vi })
                    ) : (
                      <span>Chọn ngày kết thúc</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate ? new Date(filters.endDate) : undefined}
                    onSelect={handleEndDateChange}
                    initialFocus
                    disabled={(date) => 
                      filters.startDate ? date < new Date(filters.startDate) : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
        
        {/* Bộ lọc trạng thái */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Trạng thái</label>
          <Select 
            value={filters.status} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Bộ lọc tiến độ */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Tiến độ</label>
          <Select 
            value={filters.progress !== null ? filters.progress.toString() : ''} 
            onValueChange={handleProgressChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn tiến độ" />
            </SelectTrigger>
            <SelectContent>
              {progressOptions.map(option => (
                <SelectItem key={option.value?.toString() || 'null'} value={option.value?.toString() || ''}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Hiển thị các bộ lọc đang hoạt động */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center">
            <FilterIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-700">Bộ lọc đang áp dụng:</span>
          </div>
          
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="py-1">
              {filter}
            </Badge>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-sm flex items-center gap-1 text-gray-500 hover:text-gray-700"
            onClick={clearAllFilters}
          >
            <X className="h-3 w-3" />
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilter;
