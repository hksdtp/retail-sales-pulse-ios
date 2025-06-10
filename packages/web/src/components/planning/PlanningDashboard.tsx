import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/user';
import { personalPlanService, PersonalPlan, PersonalPlanStats } from '@/services/PersonalPlanService';

interface PlanningDashboardProps {
  currentUser: User | null;
}

const PlanningDashboard: React.FC<PlanningDashboardProps> = ({ currentUser }) => {
  const [dashboardData, setDashboardData] = useState<PersonalPlanStats>({
    totalPlans: 0,
    completedPlans: 0,
    inProgressPlans: 0,
    overduePlans: 0,
    thisWeekPlans: 0,
    completionRate: 0
  });
  const [upcomingPlans, setUpcomingPlans] = useState<PersonalPlan[]>([]);

  // Load dữ liệu cá nhân của user
  useEffect(() => {
    if (!currentUser?.id) return;

    // Lấy thống kê cá nhân
    const stats = personalPlanService.getUserStats(currentUser.id);
    setDashboardData(stats);

    // Lấy kế hoạch sắp tới (7 ngày tới)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcoming = personalPlanService.getPlansInRange(
      currentUser.id,
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0]
    ).filter(plan => plan.status !== 'completed')
     .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
     .slice(0, 5); // Chỉ lấy 5 kế hoạch gần nhất

    setUpcomingPlans(upcoming);

    console.log(`📊 Loaded personal dashboard for ${currentUser.name}:`, {
      stats,
      upcomingPlans: upcoming.length
    });
  }, [currentUser?.id]);

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

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tổng kế hoạch</p>
                <p className="text-2xl font-bold text-blue-900">{dashboardData.totalPlans}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-900">{dashboardData.completedPlans}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Đang thực hiện</p>
                <p className="text-2xl font-bold text-yellow-900">{dashboardData.inProgressPlans}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Quá hạn</p>
                <p className="text-2xl font-bold text-red-900">{dashboardData.overduePlans}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Overview */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Tiến độ hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tỷ lệ hoàn thành</span>
                <span className="text-lg font-bold text-blue-600">{dashboardData.completionRate}%</span>
              </div>
              <Progress value={dashboardData.completionRate} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-green-600">{dashboardData.completedPlans}</p>
                  <p className="text-gray-500">Hoàn thành</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-yellow-600">{dashboardData.inProgressPlans}</p>
                  <p className="text-gray-500">Đang làm</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-red-600">{dashboardData.overduePlans}</p>
                  <p className="text-gray-500">Quá hạn</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Thống kê tuần này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Kế hoạch tuần này</span>
                <span className="text-lg font-bold text-purple-600">{dashboardData.thisWeekPlans}</span>
              </div>
              <div className="pt-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Users className="w-3 h-3 mr-1" />
                  Không gian cá nhân
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Kế hoạch sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getTypeIcon(plan.type)}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{plan.title}</h4>
                      <p className="text-sm text-gray-500">
                        {plan.startDate} • {plan.startTime}
                        {plan.location && ` • ${plan.location}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(plan.priority)}>
                    {plan.priority === 'high' ? 'Cao' : plan.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PlanningDashboard;
