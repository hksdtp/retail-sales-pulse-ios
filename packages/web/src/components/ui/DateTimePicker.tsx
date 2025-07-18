import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronDown, X } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, addDays, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  time?: string;
  onTimeChange?: (time: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showTime?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
  id?: string;
  name?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  date,
  onDateChange,
  time,
  onTimeChange,
  placeholder = "Chọn ngày",
  className,
  disabled = false,
  showTime = false,
  required = false,
  minDate,
  maxDate,
  label,
  id,
  name
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  // Removed quick date options for cleaner interface

  // Time options (every 30 minutes)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return {
      value: timeString,
      label: timeString
    };
  });

  // Format date display
  const formatDateDisplay = (selectedDate: Date | undefined) => {
    if (!selectedDate) return placeholder;

    if (isToday(selectedDate)) {
      return 'Hôm nay';
    } else if (isTomorrow(selectedDate)) {
      return 'Ngày mai';
    } else if (isYesterday(selectedDate)) {
      return 'Hôm qua';
    } else {
      return format(selectedDate, 'EEEE, dd/MM', { locale: vi });
    }
  };

  // Handle time selection
  const handleTimeSelect = (selectedTime: string) => {
    if (onTimeChange) {
      onTimeChange(selectedTime);
    }
    setIsTimeOpen(false);
  };

  // Clear date
  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(undefined);
    if (onTimeChange) {
      onTimeChange('');
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex gap-2">
        {/* Date Picker */}
        <div className="flex-1">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={disabled}
                className={cn(
                  "w-full justify-between text-left font-normal h-12 px-4 rounded-xl",
                  "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
                  "border-gray-200 dark:border-gray-600",
                  "hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  "transition-all duration-200",
                  !date && "text-gray-500 dark:text-gray-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {formatDateDisplay(date)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {date && !disabled && (
                    <div
                      onClick={handleClearDate}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </Button>
            </PopoverTrigger>
            
            <PopoverContent className="w-auto p-0 border-0 shadow-2xl rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" align="start">
              <div className="p-4">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    onDateChange(selectedDate);
                    setIsCalendarOpen(false);
                  }}
                  disabled={(date) => {
                    if (minDate && date < minDate) return true;
                    if (maxDate && date > maxDate) return true;
                    return false;
                  }}
                  locale={vi}
                  className="rounded-xl border-0 shadow-none"
                  classNames={{
                    months: "space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center text-sm font-medium",
                    caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-8 font-normal text-xs",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-100 dark:[&:has([aria-selected])]:bg-blue-900/30 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20 rounded-lg",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white rounded-lg",
                    day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium rounded-lg",
                    day_outside: "text-gray-400 dark:text-gray-600 opacity-50",
                    day_disabled: "text-gray-400 dark:text-gray-600 opacity-50",
                    day_range_middle: "aria-selected:bg-blue-100 dark:aria-selected:bg-blue-900/30 aria-selected:text-blue-900 dark:aria-selected:text-blue-100",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker */}
        {showTime && (
          <div className="w-24">
            <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-between text-left font-normal h-10",
                    !time && "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {time || '12:00'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              
              <PopoverContent className="w-auto p-0" align="end">
                <div className="max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                      Chọn giờ
                    </div>
                    <div className="space-y-1">
                      {timeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleTimeSelect(option.value)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 text-sm rounded transition-colors",
                            time === option.value
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Selected Date/Time Display */}
      {date && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded px-2 py-1"
        >
          <span className="font-medium">Đã chọn:</span>{' '}
          {format(date, 'EEEE, dd MMMM yyyy', { locale: vi })}
          {showTime && time && (
            <span> lúc {time}</span>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DateTimePicker;
