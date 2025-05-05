
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CalendarTask {
  id: string;
  title: string;
  type: 'partner' | 'architect' | 'client' | 'quote';
  time: string;
}

// Sample data for demonstration
const tasksByDate: Record<string, CalendarTask[]> = {
  '2025-05-05': [
    { id: '1', title: 'Gặp đối tác ABC', type: 'partner', time: '10:30' },
    { id: '3', title: 'Khảo sát công trình Y', type: 'client', time: '14:00' },
  ],
  '2025-05-06': [
    { id: '4', title: 'Làm việc với KTS Nguyễn', type: 'architect', time: '09:00' },
  ],
  '2025-05-07': [
    { id: '5', title: 'Chờ phản hồi báo giá', type: 'quote', time: '15:00' },
  ],
  '2025-05-12': [
    { id: '2', title: 'Báo giá dự án X', type: 'quote', time: '11:00' },
  ],
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'partner': return 'bg-ios-blue text-white';
    case 'architect': return 'bg-ios-green text-white';
    case 'client': return 'bg-ios-orange text-white';
    case 'quote': return 'bg-ios-yellow text-black';
    default: return 'bg-gray-200 text-gray-800';
  }
};

const formatDateKey = (date: Date | undefined): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TaskCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date('2025-05-05'));
  
  // Function to determine if a date has tasks
  const isDayWithTask = (day: Date) => {
    const dateKey = formatDateKey(day);
    return !!tasksByDate[dateKey];
  };

  // Get tasks for selected date
  const selectedDateTasks = date ? tasksByDate[formatDateKey(date)] || [] : [];
  
  // Format date for display
  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-3"
              modifiers={{
                hasTasks: isDayWithTask,
              }}
              modifiersStyles={{
                hasTasks: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: '#0A84FF'
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        <h3 className="font-medium mb-4">{formatDisplayDate(date)}</h3>
        
        {selectedDateTasks.length > 0 ? (
          <div className="space-y-3">
            {selectedDateTasks.map(task => (
              <Card key={task.id} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-lg mr-3">{task.time}</span>
                        <h4 className="font-medium">{task.title}</h4>
                      </div>
                      <Badge className={`${getTypeColor(task.type)} mt-2`}>
                        {task.type === 'partner' ? 'Đối tác' : 
                         task.type === 'architect' ? 'KTS' :
                         task.type === 'client' ? 'Khách hàng' : 'Báo giá'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-dashed shadow-none">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">Không có công việc nào vào ngày này</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TaskCalendar;
