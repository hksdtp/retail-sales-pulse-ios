import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';

export type TimeFilterType = 
  | 'today' 
  | 'tomorrow' 
  | 'this-week' 
  | 'next-week' 
  | 'this-month' 
  | 'past-week' 
  | 'past-month' 
  | 'custom' 
  | 'all';

interface TaskFilterProps {
  onFilterChange: (filterType: TimeFilterType, startDate?: Date, endDate?: Date) => void;
  currentFilter: TimeFilterType;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ onFilterChange, currentFilter }) => {
  const [customDate, setCustomDate] = React.useState<Date | undefined>(new Date());

  const handleFilterChange = (value: string) => {
    const filterType = value as TimeFilterType;
    
    switch(filterType) {
      case 'today':
        onFilterChange('today');
        break;
      case 'tomorrow':
        onFilterChange('tomorrow');
        break;
      case 'this-week': {
        const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Tuần bắt đầu từ thứ Hai
        const end = endOfWeek(new Date(), { weekStartsOn: 1 });
        onFilterChange('this-week', start, end);
        break;
      }
      case 'next-week': {
        const currentDate = new Date();
        const nextWeekStart = startOfWeek(addDays(currentDate, 7), { weekStartsOn: 1 });
        const nextWeekEnd = endOfWeek(addDays(currentDate, 7), { weekStartsOn: 1 });
        onFilterChange('next-week', nextWeekStart, nextWeekEnd);
        break;
      }
      case 'this-month': {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        onFilterChange('this-month', start, end);
        break;
      }
      case 'past-week': {
        const end = new Date();
        const start = subDays(end, 7);
        onFilterChange('past-week', start, end);
        break;
      }
      case 'past-month': {
        const end = new Date();
        const start = subDays(end, 30);
        onFilterChange('past-month', start, end);
        break;
      }
      case 'custom':
        if (customDate) {
          onFilterChange('custom', customDate, customDate);
        }
        break;
      case 'all':
      default:
        onFilterChange('all');
        break;
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCustomDate(date);
      onFilterChange('custom', date, date);
    }
  }

  // Hiển thị nhãn của bộ lọc hiện tại
  const getFilterLabel = () => {
    switch(currentFilter) {
      case 'today': return 'Hôm nay';
      case 'tomorrow': return 'Ngày mai';
      case 'this-week': return 'Tuần này';
      case 'next-week': return 'Tuần tới';
      case 'this-month': return 'Tháng này';
      case 'past-week': return '7 ngày qua';
      case 'past-month': return '30 ngày qua';
      case 'custom': return customDate ? `Ngày ${format(customDate, 'dd/MM/yyyy')}` : 'Tùy chọn';
      case 'all': return 'Tất cả';
      default: return 'Chọn thời gian';
    }
  }

  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 my-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium">Lọc theo thời gian:</span>
      </div>
      
      <div className="flex space-x-2">
        <Select defaultValue={currentFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder={getFilterLabel()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="today">Hôm nay</SelectItem>
            <SelectItem value="tomorrow">Ngày mai</SelectItem>
            <SelectItem value="this-week">Tuần này</SelectItem>
            <SelectItem value="next-week">Tuần tới</SelectItem>
            <SelectItem value="this-month">Tháng này</SelectItem>
            <SelectItem value="past-week">7 ngày qua</SelectItem>
            <SelectItem value="past-month">30 ngày qua</SelectItem>
            <SelectItem value="custom">Chọn ngày cụ thể</SelectItem>
          </SelectContent>
        </Select>

        {currentFilter === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-[180px] h-9 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDate ? format(customDate, 'dd/MM/yyyy') : 'Chọn ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default TaskFilter;
