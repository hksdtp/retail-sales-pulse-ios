import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { User } from '@/types/user';
import { personalPlanService, PersonalPlan } from '@/services/PersonalPlanService';

interface PlanListProps {
  currentUser: User | null;
}

const PlanList: React.FC<PlanListProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [plans, setPlans] = useState<PersonalPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<PersonalPlan[]>([]);

  // Load dữ liệu cá nhân của user
  useEffect(() => {
    if (!currentUser?.id) return;

    const userPlans = personalPlanService.getUserPlans(currentUser.id);
    setPlans(userPlans);

    console.log(`📋 Loaded ${userPlans.length} personal plans for ${currentUser.name}`);
  }, [currentUser?.id]);

  // Lọc kế hoạch khi có thay đổi
  useEffect(() => {
    if (!currentUser?.id) return;

    const filtered = personalPlanService.filterPlans(currentUser.id, {
      status: statusFilter,
      type: typeFilter,
      priority: priorityFilter,
      search: searchTerm
    });

    setFilteredPlans(filtered);
  }, [currentUser?.id, searchTerm, statusFilter, typeFilter, priorityFilter, plans]);

  // Xử lý actions cho kế hoạch
  const handlePlanAction = (planId: string, action: 'view' | 'edit' | 'delete') => {
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
            // Reload plans
            const updatedPlans = personalPlanService.getUserPlans(currentUser.id);
            setPlans(updatedPlans);
          }
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
      case 'meeting': return '🤝';
      case 'site_visit': return '🏗️';
      case 'report': return '📊';
      case 'training': return '📚';
      default: return '📋';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'meeting': return 'Họp';
      case 'site_visit': return 'Khảo sát';
      case 'report': return 'Báo cáo';
      case 'training': return 'Đào tạo';
      default: return 'Khác';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Bộ lọc và tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm kế hoạch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ thực hiện</SelectItem>
                <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Loại kế hoạch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="meeting">Họp</SelectItem>
                <SelectItem value="site_visit">Khảo sát</SelectItem>
                <SelectItem value="report">Báo cáo</SelectItem>
                <SelectItem value="training">Đào tạo</SelectItem>
                <SelectItem value="client_meeting">Gặp khách hàng</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="low">Thấp</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              📊 Hiển thị {filteredPlans.length} / {plans.length} kế hoạch
            </div>
          </div>
        </CardContent>
      </Card>

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
