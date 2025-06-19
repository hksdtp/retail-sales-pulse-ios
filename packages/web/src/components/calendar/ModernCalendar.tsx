import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SimpleCalendarGrid from './SimpleCalendarGrid';
import { personalPlanService, PersonalPlan } from '@/services/PersonalPlanService';
import { useAuth } from '@/context/AuthContext';
import {
  vietnameseMonths,
  vietnameseDaysShort,
  isVietnamHoliday,
  isOfficialHoliday,
  getHolidayName,
  getHolidaysInMonth
} from './VietnamHolidays';

interface ModernCalendarProps {
  onCreatePlan?: () => void;
  onEditPlan?: (plan: PersonalPlan) => void;
  onDeletePlan?: (planId: string) => void;
}

const ModernCalendar: React.FC<ModernCalendarProps> = ({ onCreatePlan, onEditPlan, onDeletePlan }) => {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [plans, setPlans] = useState<PersonalPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<PersonalPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load plans function
  const loadPlans = React.useCallback(() => {
    if (currentUser?.id) {
      console.log('🔄 ModernCalendar: Loading plans for user:', currentUser.id);
      const userPlans = personalPlanService.getUserPlans(currentUser.id);
      console.log('📋 ModernCalendar: Found plans:', userPlans.length);
      console.log('📋 ModernCalendar: Plans data:', userPlans);

      // Debug: Check current month plans
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthlyPlans = userPlans.filter(plan => {
        const planDate = new Date(plan.startDate);
        return planDate.getFullYear() === year && planDate.getMonth() === month;
      });
      console.log(`📅 ModernCalendar: Plans for ${year}-${month + 1}:`, monthlyPlans.length, monthlyPlans);

      setPlans(userPlans);
      setFilteredPlans(userPlans);
    }
  }, [currentUser?.id, currentDate]);

  // Load plans
  useEffect(() => {
    loadPlans();
  }, [loadPlans, refreshTrigger]);

  // Expose refresh function globally
  useEffect(() => {
    (window as any).refreshModernCalendar = () => {
      console.log('🔄 ModernCalendar: External refresh triggered');
      setRefreshTrigger(prev => prev + 1);
    };

    return () => {
      delete (window as any).refreshModernCalendar;
    };
  }, []);

  // Filter plans based on search and status
  useEffect(() => {
    let filtered = plans;

    if (searchQuery) {
      filtered = filtered.filter(plan => 
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(plan => plan.status === filterStatus);
    }

    setFilteredPlans(filtered);
  }, [plans, searchQuery, filterStatus]);

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

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
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: day,
      isCurrentMonth: false,
      isToday: false,
      fullDate: new Date(year, month + 1, day)
    });
  }

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get plans for a specific date
  const getPlansForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredPlans.filter(plan => plan.startDate === dateStr);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mobile-content">
      {/* Compact Calendar */}
      <div className="lg:col-span-1">
        <SimpleCalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
          getPlansForDate={getPlansForDate}
        />

        {/* Quick actions */}
        <div className="mt-4 space-y-2">
          <Button
            onClick={onCreatePlan}
            className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo kế hoạch
          </Button>

          <div className="text-xs text-gray-500 text-center">
            {filteredPlans.length} kế hoạch trong tháng
          </div>
        </div>
      </div>

      {/* Main content area - Plans list */}
      <div className="lg:col-span-3">
        <div className="space-y-4">
          {/* Search and filters */}
          <Card>
            <CardContent className="p-4 mobile-calendar-search">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm kế hoạch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Đang chờ</option>
                  <option value="in-progress">Đang thực hiện</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Selected date info */}
          {selectedDate && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {formatDate(selectedDate)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const selectedPlans = getPlansForDate(selectedDate);
                  const dateStr = selectedDate.toISOString().split('T')[0];
                  const holiday = isVietnamHoliday(dateStr);

                  return (
                    <div className="space-y-3">
                      {holiday && (
                        <div className={`p-3 rounded-lg ${
                          holiday.isOfficial
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : 'bg-orange-50 border border-orange-200 text-orange-800'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              holiday.isOfficial ? 'bg-red-500' : 'bg-orange-500'
                            }`} />
                            <span className="font-medium">{holiday.name}</span>
                          </div>
                        </div>
                      )}

                      {selectedPlans.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">
                            {selectedPlans.length} kế hoạch
                          </h4>
                          {selectedPlans.map((plan) => (
                            <div
                              key={plan.id}
                              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-gray-900 text-sm">
                                  {plan.title}
                                </h5>
                                <Badge className={getStatusColor(plan.status)}>
                                  {plan.status}
                                </Badge>
                              </div>

                              {plan.startTime && (
                                <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{plan.startTime}</span>
                                  {plan.endTime && <span> - {plan.endTime}</span>}
                                </div>
                              )}

                              {plan.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{plan.location}</span>
                                </div>
                              )}

                              {plan.participants && plan.participants.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Users className="w-3 h-3" />
                                  <span>{plan.participants.length} người tham gia</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Không có kế hoạch nào trong ngày này
                        </p>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Monthly plans overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                📋 Kế hoạch tháng {vietnameseMonths[month]} {year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPlans.length > 0 ? (
                  filteredPlans.slice(0, 10).map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(plan.priority)}`} />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-sm truncate">{plan.title}</h5>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{plan.startDate}</span>
                            {plan.startTime && <span>• {plan.startTime}</span>}
                            {plan.location && <span>• {plan.location}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEditPlan && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onEditPlan(plan)}
                              title="Chỉnh sửa kế hoạch"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}

                          {onDeletePlan && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xóa kế hoạch "${plan.title}"?`)) {
                                  onDeletePlan(plan.id);
                                }
                              }}
                              title="Xóa kế hoạch"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Không có kế hoạch nào trong tháng này</p>
                    <p className="text-sm">Tạo kế hoạch mới để bắt đầu</p>
                  </div>
                )}

                {filteredPlans.length > 10 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-gray-500">
                      Và {filteredPlans.length - 10} kế hoạch khác...
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModernCalendar;
