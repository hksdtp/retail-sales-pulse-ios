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
  label
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  // Quick date options
  const quickDateOptions = [
    {
      label: 'Hôm nay',
      value: new Date(),
      shortLabel: 'Hôm nay'
    },
    {
      label: 'Ngày mai',
      value: addDays(new Date(), 1),
      shortLabel: 'Ngày mai'
    },
    {
      label: 'Tuần sau',
      value: addDays(new Date(), 7),
      shortLabel: '7 ngày'
    },
    {
      label: '2 tuần sau',
      value: addDays(new Date(), 14),
      shortLabel: '14 ngày'
    }
  ];

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

  // Handle quick date selection
  const handleQuickDateSelect = (selectedDate: Date) => {
    onDateChange(selectedDate);
    setIsCalendarOpen(false);
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
                  "w-full justify-between text-left font-normal h-10",
                  !date && "text-muted-foreground",
                  "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="truncate">
                    {formatDateDisplay(date)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {date && !disabled && (
                    <button
                      type="button"
                      onClick={handleClearDate}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex">
                {/* Quick Options */}
                <div className="border-r border-gray-200 dark:border-gray-700 p-2 space-y-1 min-w-[120px]">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                    Nhanh
                  </div>
                  {quickDateOptions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuickDateSelect(option.value)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded transition-colors",
                        date && startOfDay(date).getTime() === startOfDay(option.value).getTime()
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {option.shortLabel}
                    </button>
                  ))}
                </div>

                {/* Calendar */}
                <div className="p-3">
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
                    className="rounded-md"
                  />
                </div>
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
