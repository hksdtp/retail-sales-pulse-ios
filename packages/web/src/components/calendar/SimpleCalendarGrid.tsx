import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SimpleCalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  getPlansForDate?: (date: Date) => any[];
}

const vietnameseMonths = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const vietnameseDaysShort = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const SimpleCalendarGrid: React.FC<SimpleCalendarGridProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onToday,
  getPlansForDate
}) => {
  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Convert to Monday start (0=Sunday -> 6, 1=Monday -> 0, etc.)
  let startingDayOfWeek = firstDay.getDay();
  startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Generate calendar days
  const calendarDays = [];

  // Previous month days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: prevMonth.getDate() - i,
      isCurrentMonth: false,
      isToday: false,
      fullDate: new Date(year, month - 1, prevMonth.getDate() - i)
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = new Date(year, month, day);
    const isToday = fullDate.toDateString() === today.toDateString();
    
    calendarDays.push({
      date: day,
      isCurrentMonth: true,
      isToday,
      fullDate
    });
  }
  
  // Next month days to fill the grid (6 weeks * 7 days = 42 total)
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: day,
      isCurrentMonth: false,
      isToday: false,
      fullDate: new Date(year, month + 1, day)
    });
  }

  return (
    <Card className="shadow-sm border bg-white dark:bg-gray-800 calendar-container">
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              onClick={onPreviousMonth}
              variant="ghost"
              size="sm"
              className="h-8 w-8 md:h-6 md:w-6 p-0 mobile-touch-target"
            >
              <ChevronLeft className="w-4 h-4 md:w-3 md:h-3" />
            </Button>

            <h2 className="text-sm md:text-sm font-semibold text-gray-900 dark:text-white px-1">
              {vietnameseMonths[month]} {year}
            </h2>

            <Button
              onClick={onNextMonth}
              variant="ghost"
              size="sm"
              className="h-8 w-8 md:h-6 md:w-6 p-0 mobile-touch-target"
            >
              <ChevronRight className="w-4 h-4 md:w-3 md:h-3" />
            </Button>
          </div>

          <Button
            onClick={onToday}
            variant="ghost"
            size="sm"
            className="text-xs px-2 py-1 h-7 md:h-6 mobile-touch-target"
          >
            Hôm nay
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-2 md:p-3 calendar-wrapper">
        {/* Day headers - FORCE HORIZONTAL LAYOUT */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            marginBottom: '8px'
          }}
        >
          {vietnameseDaysShort.map((day, index) => (
            <div
              key={day}
              style={{
                flex: 1,
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: day === 'CN' ? '#dc2626' : '#4b5563'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid - FLEXBOX APPROACH */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minHeight: '240px'
          }}
        >
          {/* Generate 6 rows */}
          {Array.from({ length: 6 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: 'flex',
                flex: 1,
                gap: '2px'
              }}
            >
              {/* Generate 7 columns for each row */}
              {Array.from({ length: 7 }, (_, colIndex) => {
                const dayIndex = rowIndex * 7 + colIndex;
                const day = calendarDays[dayIndex];

                if (!day) return <div key={colIndex} style={{ flex: 1 }} />;

                const dayPlans = getPlansForDate ? getPlansForDate(day.fullDate) : [];
                const hasPlans = dayPlans.length > 0;

                return (
                  <motion.button
                    key={`${rowIndex}-${colIndex}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDateSelect(day.fullDate)}
                    style={{
                      flex: 1,
                      minHeight: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      position: 'relative',
                      backgroundColor: day.isCurrentMonth ? '#ffffff' : '#f9fafb',
                      color: day.isCurrentMonth ? '#111827' : '#9ca3af'
                    }}
                    className={`
                      transition-all duration-200 hover:shadow-sm mobile-touch-target
                      ${day.isToday ? 'ring-2 ring-blue-500 bg-blue-50 text-blue-600 font-bold' : ''}
                      ${selectedDate?.toDateString() === day.fullDate.toDateString()
                        ? 'ring-2 ring-purple-500 bg-purple-50'
                        : ''
                      }
                      ${hasPlans ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                  >
                    <span className="relative z-10">
                      {day.date}
                    </span>

                    {/* Plans indicator */}
                    {hasPlans && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '6px',
                          height: '6px',
                          backgroundColor: '#3b82f6',
                          borderRadius: '50%'
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleCalendarGrid;
