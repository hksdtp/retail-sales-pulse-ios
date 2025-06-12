import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { personalPlanService } from '@/services/PersonalPlanService';
import { useAuth } from '@/context/AuthContext';

interface CalendarTask {
  id: string;
  title: string;
  type: 'partner' | 'architect' | 'client' | 'quote' | 'meeting' | 'site_visit' | 'report' | 'training';
  time: string;
  endTime?: string;
  location?: string;
  participants?: string[];
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'in_progress' | 'completed';
}



const getTypeColor = (type: string) => {
  switch (type) {
    case 'meeting':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'partner':
      return 'bg-ios-blue text-white';
    case 'architect':
      return 'bg-ios-green text-white';
    case 'client':
      return 'bg-ios-orange text-white';
    case 'quote':
      return 'bg-ios-yellow text-black';
    case 'site_visit':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'report':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'training':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'meeting': return '🤝';
    case 'partner': return '🤝';
    case 'architect': return '🏗️';
    case 'client': return '👥';
    case 'quote': return '💰';
    case 'site_visit': return '🏗️';
    case 'report': return '📊';
    case 'training': return '📚';
    default: return '📋';
  }
};

const getTypeText = (type: string) => {
  switch (type) {
    case 'meeting': return 'Họp';
    case 'partner': return 'Đối tác';
    case 'architect': return 'KTS';
    case 'client': return 'Khách hàng';
    case 'quote': return 'Báo giá';
    case 'site_visit': return 'Khảo sát';
    case 'report': return 'Báo cáo';
    case 'training': return 'Đào tạo';
    default: return 'Khác';
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDateKey = (date: Date | undefined): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface TaskCalendarProps {
  onCreatePlan?: () => void;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ onCreatePlan }) => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [plans, setPlans] = useState<any[]>([]);

  // Migrate old plans to current date (only for very old plans)
  const migrateOldPlansToToday = (plans: any[]) => {
    const today = new Date();
    const todayString = formatDateKey(today);
    const currentYear = today.getFullYear();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return plans.map(plan => {
      const planDate = new Date(plan.startDate);
      const planYear = planDate.getFullYear();

      // Only migrate plans that are more than 1 month old or from previous years
      if (planYear < currentYear || planDate < oneMonthAgo) {
        console.log(`🔄 Migrating old plan "${plan.title}" from ${plan.startDate} to ${todayString}`);
        return {
          ...plan,
          startDate: todayString,
          endDate: plan.endDate ? todayString : plan.endDate
        };
      }

      return plan;
    });
  };

  // Load plans from service
  const loadPlans = useCallback(() => {
    if (currentUser) {
      console.log('🔄 Loading plans for user:', currentUser.id);
      const userPlans = personalPlanService.getUserPlans(currentUser.id);
      console.log('📋 Found plans:', userPlans.length, userPlans);

      const migratedPlans = migrateOldPlansToToday(userPlans);

      // Save migrated plans back if there were changes
      if (JSON.stringify(userPlans) !== JSON.stringify(migratedPlans)) {
        console.log('🔄 Plans need migration, saving migrated data...');
        // Clear old data and save migrated data
        personalPlanService.clearUserData(currentUser.id);
        migratedPlans.forEach(plan => {
          personalPlanService.addPlan(currentUser.id, {
            title: plan.title,
            description: plan.description,
            type: plan.type,
            status: plan.status,
            priority: plan.priority,
            startDate: plan.startDate,
            endDate: plan.endDate,
            startTime: plan.startTime,
            endTime: plan.endTime,
            location: plan.location,
            notes: plan.notes,
            participants: plan.participants,
            creator: plan.creator
          });
        });
        console.log('✅ Đã migrate kế hoạch cũ về ngày hiện tại');
      }

      console.log(`📋 Setting ${migratedPlans.length} plans in TaskCalendar state`);
      setPlans(migratedPlans);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Expose loadPlans for external refresh - always available
  useEffect(() => {
    (window as any).refreshCalendarPlans = loadPlans;
    console.log('🔄 Exposed refreshCalendarPlans function');
    return () => {
      delete (window as any).refreshCalendarPlans;
    };
  }, [loadPlans]);

  // Convert plans to tasks by date format
  const tasksByDate: Record<string, CalendarTask[]> = {};

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayKey = formatDateKey(today);

  // Không thêm dữ liệu mẫu - sẵn sàng cho dữ liệu thật

  // Add plans from service
  console.log(`📅 Converting ${plans.length} plans to calendar tasks`);
  plans.forEach((plan) => {
    const dateKey = plan.startDate;
    console.log(`📅 Adding plan "${plan.title}" to date ${dateKey}`);
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }

    tasksByDate[dateKey].push({
      id: plan.id,
      title: plan.title,
      type: plan.type,
      time: plan.startTime,
      endTime: plan.endTime,
      location: plan.location,
      participants: plan.participants,
      priority: plan.priority,
      status: plan.status
    });
  });

  console.log('📅 Tasks by date:', Object.keys(tasksByDate).length, 'dates with tasks');

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
      day: 'numeric',
    });
  };

  const handleTaskAction = (taskId: string, action: 'edit' | 'delete') => {
    console.log(`${action} task:`, taskId);
    // Implement task actions here
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-1">
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800">Lịch kế hoạch</CardTitle>
          </CardHeader>
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
                  textDecorationColor: '#3b82f6',
                  backgroundColor: '#dbeafe',
                  borderRadius: '6px',
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tasks for selected date */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{formatDisplayDate(date)}</h3>
        </div>

        {selectedDateTasks.length > 0 ? (
          <div className="space-y-4">
            {selectedDateTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{getTypeIcon(task.type)}</span>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {task.time} {task.endTime && `- ${task.endTime}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getTypeColor(task.type)}>
                            {getTypeText(task.type)}
                          </Badge>
                          {task.priority && (
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </Badge>
                          )}
                          {task.status && (
                            <Badge className={getStatusColor(task.status)}>
                              {task.status === 'completed' ? 'Hoàn thành' :
                               task.status === 'in_progress' ? 'Đang thực hiện' : 'Chờ thực hiện'}
                            </Badge>
                          )}
                        </div>

                        {task.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{task.location}</span>
                          </div>
                        )}

                        {task.participants && task.participants.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{task.participants.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTaskAction(task.id, 'edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTaskAction(task.id, 'delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có kế hoạch</h3>
              <p className="text-gray-500 mb-4">Chưa có kế hoạch nào được lên lịch cho ngày này</p>
              <Button
                onClick={onCreatePlan}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo kế hoạch mới
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TaskCalendar;
