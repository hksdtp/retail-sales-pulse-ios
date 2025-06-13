import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { personalPlanService, PersonalPlan } from '@/services/PersonalPlanService';
import { useAuth } from '@/context/AuthContext';
import { vietnameseMonths } from './VietnamHolidays';

interface MonthlyPlanListProps {
  currentDate: Date;
  onEditPlan?: (plan: PersonalPlan) => void;
  onDeletePlan?: (planId: string) => void;
  onViewPlan?: (plan: PersonalPlan) => void;
}

const MonthlyPlanList: React.FC<MonthlyPlanListProps> = ({
  currentDate,
  onEditPlan,
  onDeletePlan,
  onViewPlan
}) => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<PersonalPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<PersonalPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  // Load plans for current month
  useEffect(() => {
    if (currentUser?.id) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Get all user plans
      const userPlans = personalPlanService.getUserPlans(currentUser.id);
      
      // Filter plans for current month
      const monthlyPlans = userPlans.filter(plan => {
        const planDate = new Date(plan.startDate);
        return planDate.getFullYear() === year && planDate.getMonth() === month;
      });
      
      setPlans(monthlyPlans);
      setFilteredPlans(monthlyPlans);
    }
  }, [currentUser, currentDate]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...plans];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(plan => 
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(plan => plan.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(plan => plan.priority === filterPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                     (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPlans(filtered);
  }, [plans, searchQuery, filterStatus, filterPriority, sortBy, sortOrder]);

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bgColor: 'bg-green-100', 
          label: 'Đã hoàn thành' 
        };
      case 'in-progress':
        return { 
          icon: PlayCircle, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-100', 
          label: 'Đang thực hiện' 
        };
      case 'pending':
        return { 
          icon: AlertCircle, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100', 
          label: 'Đang chờ' 
        };
      case 'cancelled':
        return { 
          icon: XCircle, 
          color: 'text-red-600', 
          bgColor: 'bg-red-100', 
          label: 'Đã hủy' 
        };
      default:
        return { 
          icon: AlertCircle, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100', 
          label: 'Không xác định' 
        };
    }
  };

  // Get priority info
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { color: 'bg-red-500', label: 'Khẩn cấp' };
      case 'high':
        return { color: 'bg-orange-500', label: 'Cao' };
      case 'normal':
        return { color: 'bg-blue-500', label: 'Bình thường' };
      case 'low':
        return { color: 'bg-gray-500', label: 'Thấp' };
      default:
        return { color: 'bg-gray-500', label: 'Không xác định' };
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Format time
  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // HH:MM
  };

  // Toggle sort order
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📋 Kế hoạch {vietnameseMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tổng cộng {filteredPlans.length} kế hoạch
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Tìm kiếm & Lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm kế hoạch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status filter */}
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
            
            {/* Priority filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="urgent">Khẩn cấp</option>
              <option value="high">Cao</option>
              <option value="normal">Bình thường</option>
              <option value="low">Thấp</option>
            </select>
            
            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date-asc">Ngày (cũ → mới)</option>
              <option value="date-desc">Ngày (mới → cũ)</option>
              <option value="title-asc">Tên (A → Z)</option>
              <option value="title-desc">Tên (Z → A)</option>
              <option value="priority-desc">Ưu tiên (cao → thấp)</option>
              <option value="priority-asc">Ưu tiên (thấp → cao)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có kế hoạch nào
              </h3>
              <p className="text-gray-600">
                {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Không tìm thấy kế hoạch phù hợp với bộ lọc'
                  : 'Chưa có kế hoạch nào trong tháng này'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPlans.map((plan) => {
            const statusInfo = getStatusInfo(plan.status);
            const priorityInfo = getPriorityInfo(plan.priority);
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedPlan === plan.id;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {plan.title}
                              </h3>
                              <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`} 
                                   title={priorityInfo.label} />
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(plan.startDate)}</span>
                              </div>
                              
                              {plan.startTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {formatTime(plan.startTime)}
                                    {plan.endTime && ` - ${formatTime(plan.endTime)}`}
                                  </span>
                                </div>
                              )}
                              
                              {plan.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">{plan.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Status and Priority */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                            {statusInfo.label}
                          </Badge>
                          <Badge variant="outline">
                            {priorityInfo.label}
                          </Badge>
                          {plan.participants && plan.participants.length > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {plan.participants.length}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Description preview */}
                        {plan.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {plan.description}
                          </p>
                        )}
                        
                        {/* Expanded content */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-200 pt-3 mt-3"
                          >
                            {plan.description && (
                              <div className="mb-3">
                                <h4 className="font-medium text-gray-900 mb-1">Mô tả:</h4>
                                <p className="text-gray-600 text-sm">{plan.description}</p>
                              </div>
                            )}
                            
                            {plan.participants && plan.participants.length > 0 && (
                              <div className="mb-3">
                                <h4 className="font-medium text-gray-900 mb-1">Người tham gia:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {plan.participants.map((participant, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {participant}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {plan.notes && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">Ghi chú:</h4>
                                <p className="text-gray-600 text-sm">{plan.notes}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        
                        {onViewPlan && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewPlan(plan)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {onEditPlan && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditPlan(plan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {onDeletePlan && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeletePlan(plan.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MonthlyPlanList;
