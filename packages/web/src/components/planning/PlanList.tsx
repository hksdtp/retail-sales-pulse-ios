import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User } from '@/types/user';
import { personalPlanService, PersonalPlan } from '@/services/PersonalPlanService';
import { planTaskSyncService } from '@/services/PlanTaskSyncService';
import PlanSearchBar from './PlanSearchBar';

interface PlanListProps {
  currentUser: User | null;
}

const PlanList: React.FC<PlanListProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [plans, setPlans] = useState<PersonalPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<PersonalPlan[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load dữ liệu cá nhân của user
  const loadPlans = useCallback(() => {
    if (!currentUser?.id) return;

    console.log('🔄 Loading plans for user:', currentUser.id);
    const userPlans = personalPlanService.getUserPlans(currentUser.id);
    setPlans(userPlans);

    console.log(`📋 Loaded ${userPlans.length} personal plans for ${currentUser.name}`, userPlans);
  }, [currentUser?.id]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Expose loadPlans for external refresh - always available
  useEffect(() => {
    (window as any).refreshPlanList = loadPlans;
    console.log('🔄 Exposed refreshPlanList function');
    return () => {
      delete (window as any).refreshPlanList;
    };
  }, [loadPlans]);

  // Lọc kế hoạch khi có thay đổi
  useEffect(() => {
    if (!currentUser?.id) return;

    let filtered = plans;

    // Filter by search query
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(plan =>
        plan.title.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query) ||
        plan.location?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(plan => plan.status === filters.status);
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(plan => plan.type === filters.type);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(plan => plan.priority === filters.priority);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      filtered = filtered.filter(plan => {
        const planDate = new Date(plan.startDate);

        switch (filters.dateRange) {
          case 'today':
            return planDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return planDate.toDateString() === tomorrow.toDateString();
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return planDate >= weekStart && planDate <= weekEnd;
          case 'month':
            return planDate.getMonth() === today.getMonth() &&
                   planDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredPlans(filtered);
  }, [currentUser?.id, searchQuery, filters, plans]);

  // Sync plans to tasks
  const handleSyncPlansToTasks = async () => {
    if (!currentUser?.id) return;

    setIsSyncing(true);
    try {
      const result = await planTaskSyncService.syncBidirectional(currentUser.id);

      if (result.plansToTasks > 0) {
        alert(`✅ Đã đồng bộ ${result.plansToTasks} kế hoạch thành công việc!`);
      } else {
        alert('ℹ️ Không có kế hoạch nào cần đồng bộ.');
      }

      if (result.errors.length > 0) {
        console.error('Sync errors:', result.errors);
        alert(`⚠️ Có ${result.errors.length} lỗi trong quá trình đồng bộ. Xem console để biết chi tiết.`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Lỗi khi đồng bộ kế hoạch. Vui lòng thử lại!');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync individual plan to task
  const handleSyncPlanToTask = async (plan: PersonalPlan) => {
    if (!currentUser?.id) return;

    try {
      const success = await planTaskSyncService.syncPlanToTask(plan, currentUser.id);
      if (success) {
        alert(`✅ Đã đồng bộ kế hoạch "${plan.title}" thành công việc!`);
      } else {
        alert('❌ Lỗi khi đồng bộ kế hoạch. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Sync plan error:', error);
      alert('❌ Lỗi khi đồng bộ kế hoạch. Vui lòng thử lại!');
    }
  };

  // Xử lý actions cho kế hoạch
  const handlePlanAction = (planId: string, action: 'view' | 'edit' | 'delete' | 'sync') => {
    if (!currentUser?.id) return;

    switch (action) {
      case 'view':
        console.log('View plan:', planId);
        // TODO: Implement view plan modal
        break;
      case 'edit':
        console.log('Edit plan:', planId);
        // TODO: Implement edit plan modal
        break;
      case 'delete':
        if (confirm('Bạn có chắc chắn muốn xóa kế hoạch này?')) {
          const success = personalPlanService.deletePlan(currentUser.id, planId);
          if (success) {
            console.log('✅ Đã xóa kế hoạch:', planId);
            // Reload plans
            loadPlans();
            alert('Đã xóa kế hoạch thành công!');
          }
        }
        break;
      case 'sync':
        const plan = plans.find(p => p.id === planId);
        if (plan) {
          handleSyncPlanToTask(plan);
        }
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <PlayCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in_progress': return 'Đang thực hiện';
      case 'pending': return 'Chờ thực hiện';
      case 'overdue': return 'Quá hạn';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'partner_new': return '🤝';
      case 'partner_old': return '🤝';
      case 'architect_new': return '🏗️';
      case 'architect_old': return '🏗️';
      case 'client_new': return '👥';
      case 'client_old': return '👥';
      case 'quote_new': return '💰';
      case 'quote_old': return '💰';
      default: return '📋';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'partner_new': return 'Đối tác mới';
      case 'partner_old': return 'Đối tác cũ';
      case 'architect_new': return 'KTS mới';
      case 'architect_old': return 'KTS cũ';
      case 'client_new': return 'Khách hàng mới';
      case 'client_old': return 'Khách hàng cũ';
      case 'quote_new': return 'Báo giá mới';
      case 'quote_old': return 'Báo giá cũ';
      default: return 'Công việc khác';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <PlanSearchBar
        onSearch={setSearchQuery}
        onFilterChange={setFilters}
        placeholder="Tìm kiếm kế hoạch theo tiêu đề, mô tả, địa điểm..."
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 flex items-center gap-4">
          <span>📊 Hiển thị {filteredPlans.length} / {plans.length} kế hoạch</span>
          {filteredPlans.length !== plans.length && (
            <span className="text-blue-600">🔍 Đã lọc</span>
          )}
        </div>

        <div className="text-sm text-gray-500">
          ⏰ Kế hoạch sẽ tự động chuyển thành công việc khi đến hạn
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {filteredPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(plan.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                      <Badge className={getStatusColor(plan.status)}>
                        {getStatusIcon(plan.status)}
                        <span className="ml-1">{getStatusText(plan.status)}</span>
                      </Badge>
                      <Badge className={getPriorityColor(plan.priority)}>
                        {plan.priority === 'high' ? 'Cao' : plan.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{plan.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{plan.startDate} - {plan.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{plan.startTime} - {plan.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{plan.participants.length} người tham gia</span>
                      </div>
                    </div>

                    {plan.location && (
                      <div className="mt-2 text-sm text-gray-500">
                        📍 {plan.location}
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePlanAction(plan.id, 'view')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePlanAction(plan.id, 'edit')}>
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handlePlanAction(plan.id, 'delete')}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kế hoạch</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tạo kế hoạch mới</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanList;
