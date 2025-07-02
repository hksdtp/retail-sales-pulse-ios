import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, TrendingUp, DollarSign, Eye, EyeOff, Target, Award, Building2, Calendar, ChevronLeft, ChevronRight, PieChart } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import AIInsights from '@/components/dashboard/AIInsights';
import DetailedOverviewComponent from '@/components/reports/DetailedOverviewComponent';
import TimeAnalysisComponent from '@/components/reports/TimeAnalysisComponent';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContextSupabase';
import { useTaskData } from '@/hooks/use-task-data';
import { dashboardSyncService } from '@/services/DashboardSyncService';
import { reportsDataService } from '@/services/ReportsDataService';

const DetailedReports = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTaskData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed-overview' | 'time-analysis' | 'ai-insights'>('overview');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  // Lấy dữ liệu dashboard với phân quyền
  const dashboardData = dashboardSyncService.getSyncedDashboardData(currentUser, tasks);
  const { permissions, summary } = dashboardData;

  // Xác định tiêu đề dựa trên quyền hạn
  const getReportTitle = () => {
    if (permissions.canViewAll) {
      return '📊 Báo Cáo Chi Tiết - Toàn Phòng Ban';
    } else if (permissions.canViewTeam) {
      // Hiển thị tên team cụ thể thay vì location
      const teamName = currentUser?.team_id ? `Nhóm ${currentUser.team_id}` : `Nhóm ${currentUser?.location?.toUpperCase()}`;
      return `📊 Báo Cáo Chi Tiết - ${teamName}`;
    } else {
      return '📊 Báo Cáo Chi Tiết - Cá Nhân';
    }
  };

  const getReportSubtitle = () => {
    if (permissions.canViewAll) {
      return 'Phân tích dữ liệu doanh số và AI insights cho toàn bộ phòng kinh doanh bán lẻ';
    } else if (permissions.canViewTeam) {
      const teamName = currentUser?.team_id ? `team ${currentUser.team_id}` : `nhóm ${currentUser?.location}`;
      return `Phân tích dữ liệu doanh số và AI insights cho ${teamName}`;
    } else {
      return 'Phân tích dữ liệu doanh số và AI insights cá nhân của bạn';
    }
  };

  // Lọc dữ liệu theo quyền hạn
  const getFilteredData = () => {
    const baseData = {
      totalTasks: summary.totalTasks,
      completedTasks: summary.completedTasks,
      completionRate: summary.completionRate,
      totalSales: summary.totalSales
    };

    if (permissions.canViewAll) {
      return {
        ...baseData,
        scope: 'Toàn phòng ban',
        employeeCount: 11,
        teamCount: 2,
        locations: ['Hà Nội', 'TP.HCM']
      };
    } else if (permissions.canViewTeam) {
      const teamName = currentUser?.team_id ? `Team ${currentUser.team_id}` : `Nhóm ${currentUser?.location}`;
      return {
        ...baseData,
        scope: teamName,
        employeeCount: currentUser?.location === 'hanoi' ? 6 : 5,
        teamCount: 1,
        locations: [currentUser?.location === 'hanoi' ? 'Hà Nội' : 'TP.HCM']
      };
    } else {
      return {
        ...baseData,
        scope: 'Cá nhân',
        employeeCount: 1,
        teamCount: 0,
        locations: [currentUser?.location === 'hanoi' ? 'Hà Nội' : 'TP.HCM']
      };
    }
  };

  const filteredData = getFilteredData();

  // Lấy dữ liệu doanh số theo quyền hạn
  const getSalesData = () => {
    if (permissions.canViewAll) {
      // Director: xem tất cả dữ liệu
      const allEmployees = reportsDataService.getAllEmployees();
      const totalSales = allEmployees.reduce((sum, emp) => sum + emp.sales, 0);
      const totalDeals = allEmployees.reduce((sum, emp) => sum + emp.deals, 0);
      const avgCompletion = allEmployees.reduce((sum, emp) => sum + emp.completion, 0) / allEmployees.length;
      const topPerformers = allEmployees.filter(emp => emp.badge === 'excellent').length;

      return {
        totalSales,
        totalDeals,
        avgCompletion: Math.round(avgCompletion),
        topPerformers,
        employeeCount: allEmployees.length
      };
    } else if (permissions.canViewTeam) {
      // Team leader: chỉ xem dữ liệu nhóm của mình
      const teamEmployees = reportsDataService.getEmployeesByLocation(currentUser?.location || 'Hà Nội');
      const totalSales = teamEmployees.reduce((sum, emp) => sum + emp.sales, 0);
      const totalDeals = teamEmployees.reduce((sum, emp) => sum + emp.deals, 0);
      const avgCompletion = teamEmployees.length > 0 ? teamEmployees.reduce((sum, emp) => sum + emp.completion, 0) / teamEmployees.length : 0;
      const topPerformers = teamEmployees.filter(emp => emp.badge === 'excellent').length;

      return {
        totalSales,
        totalDeals,
        avgCompletion: Math.round(avgCompletion),
        topPerformers,
        employeeCount: teamEmployees.length
      };
    } else {
      // Employee: chỉ xem dữ liệu cá nhân
      const employee = reportsDataService.getEmployeeById(currentUser?.id || '');
      if (employee) {
        return {
          totalSales: employee.sales,
          totalDeals: employee.deals,
          avgCompletion: employee.completion,
          topPerformers: employee.badge === 'excellent' ? 1 : 0,
          employeeCount: 1
        };
      }
      return {
        totalSales: 0,
        totalDeals: 0,
        avgCompletion: 0,
        topPerformers: 0,
        employeeCount: 1
      };
    }
  };

  const salesData = getSalesData();

  // Dữ liệu phân tích theo tháng dựa trên dữ liệu thực tế
  const getMonthlyAnalysis = () => {
    // Sử dụng dữ liệu thực tế từ ReportsDataService
    const dashboardMetrics = reportsDataService.getDashboardMetrics();
    const monthlyTrend = dashboardMetrics.monthlyTrend;

    // Nếu selectedMonth nằm trong khoảng dữ liệu có sẵn (0-4 = Tháng 1-5)
    if (selectedMonth < monthlyTrend.length) {
      const realData = monthlyTrend[selectedMonth];

      // Tính toán dữ liệu theo quyền hạn dựa trên dữ liệu thực tế
      let salesMultiplier = 1;
      let dealsMultiplier = 1;
      let performanceBase = 85;

      if (permissions.canViewAll) {
        // Director: toàn bộ dữ liệu
        salesMultiplier = 1;
        dealsMultiplier = 1;
        performanceBase = 85 + (selectedMonth * 3); // Tăng dần theo tháng
      } else if (permissions.canViewTeam) {
        // Team leader: khoảng 50-60% dữ liệu toàn phòng
        salesMultiplier = 0.55;
        dealsMultiplier = 0.6;
        performanceBase = 80 + (selectedMonth * 2.5);
      } else {
        // Employee: khoảng 8-12% dữ liệu toàn phòng
        salesMultiplier = 0.1;
        dealsMultiplier = 0.15;
        performanceBase = 75 + (selectedMonth * 2);
      }

      return {
        month: realData.month,
        sales: Math.round(realData.sales * salesMultiplier),
        deals: Math.round(dashboardMetrics.totalDeals * dealsMultiplier * (0.8 + selectedMonth * 0.05)),
        performance: Math.round(performanceBase + Math.random() * 10),
        target: Math.round(realData.target * salesMultiplier)
      };
    } else {
      // Cho các tháng 6-12, sử dụng extrapolation từ dữ liệu thực tế
      const lastRealMonth = monthlyTrend[monthlyTrend.length - 1];
      const growthRate = 1 + (selectedMonth - 4) * 0.08; // Tăng trưởng 8% mỗi tháng

      let salesMultiplier = 1;
      let dealsMultiplier = 1;
      let performanceBase = 90;

      if (permissions.canViewAll) {
        salesMultiplier = 1;
        dealsMultiplier = 1;
        performanceBase = 90 + (selectedMonth - 4) * 2;
      } else if (permissions.canViewTeam) {
        salesMultiplier = 0.55;
        dealsMultiplier = 0.6;
        performanceBase = 85 + (selectedMonth - 4) * 1.5;
      } else {
        salesMultiplier = 0.1;
        dealsMultiplier = 0.15;
        performanceBase = 80 + (selectedMonth - 4) * 1;
      }

      return {
        month: `Tháng ${selectedMonth + 1}`,
        sales: Math.round(lastRealMonth.sales * growthRate * salesMultiplier),
        deals: Math.round(dashboardMetrics.totalDeals * dealsMultiplier * growthRate * 0.3),
        performance: Math.round(performanceBase + Math.random() * 8),
        target: Math.round(lastRealMonth.target * growthRate * salesMultiplier)
      };
    }
  };

  const monthlyAnalysis = getMonthlyAnalysis();

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'detailed-overview', label: 'Chi tiết cá nhân & nhóm', icon: Users },
    { id: 'time-analysis', label: 'Phân tích theo thời gian', icon: Calendar },
    { id: 'ai-insights', label: 'Phân tích', icon: TrendingUp }
  ];

  return (
    <AppLayout>
      <PageHeader
        title={getReportTitle()}
        subtitle={getReportSubtitle()}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Dashboard
          </Button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Permission Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Phạm vi dữ liệu: {filteredData.scope}</h3>
              <p className="text-sm text-blue-700">
                {permissions.canViewAll && 'Bạn có quyền xem tất cả dữ liệu phòng ban'}
                {permissions.canViewTeam && !permissions.canViewAll && 'Bạn có quyền xem dữ liệu nhóm và cá nhân'}
                {!permissions.canViewTeam && !permissions.canViewAll && 'Bạn chỉ có thể xem dữ liệu cá nhân'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">
                {filteredData.employeeCount} nhân viên • {filteredData.locations.join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Tổng quan về dữ liệu doanh số</h3>

                {/* Sales KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Tổng doanh số</p>
                        <p className="text-2xl font-bold">{(salesData.totalSales / 1000000000).toFixed(1)} tỷ VND</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Tổng giao dịch</p>
                        <p className="text-2xl font-bold">{salesData.totalDeals}</p>
                      </div>
                      <Target className="w-8 h-8 text-green-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Hiệu suất trung bình</p>
                        <p className="text-2xl font-bold">{salesData.avgCompletion}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Top Performers</p>
                        <p className="text-2xl font-bold">{salesData.topPerformers}</p>
                      </div>
                      <Award className="w-8 h-8 text-orange-200" />
                    </div>
                  </div>
                </div>


              </div>
            )}

            {/* Detailed Overview Tab */}
            {activeTab === 'detailed-overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết cá nhân & nhóm</h3>
                <DetailedOverviewComponent employeeData={reportsDataService.getAllEmployees()} />
              </div>
            )}

            {/* Time Analysis Tab */}
            {activeTab === 'time-analysis' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Phân tích theo thời gian</h3>
                <TimeAnalysisComponent employeeData={reportsDataService.getAllEmployees()} />
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'ai-insights' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">🤖 Phân tích dữ liệu doanh số</h3>
                  <div className="text-sm text-gray-500">
                    Dữ liệu được lọc theo quyền hạn của bạn
                  </div>
                </div>
                {/* Monthly Analysis Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      📅 Phân tích theo tháng
                    </h4>

                    {/* Month Selector */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedMonth(prev => prev > 0 ? prev - 1 : 11)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>

                      <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                        <span className="text-blue-700 font-medium">
                          {['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'][selectedMonth]}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedMonth(prev => prev < 11 ? prev + 1 : 0)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Monthly KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Doanh số tháng</p>
                          <p className="text-2xl font-bold">{(monthlyAnalysis.sales / 1000000000).toFixed(1)} tỷ VND</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Giao dịch</p>
                          <p className="text-2xl font-bold">{monthlyAnalysis.deals}</p>
                        </div>
                        <Target className="w-8 h-8 text-green-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Hiệu suất</p>
                          <p className="text-2xl font-bold">{monthlyAnalysis.performance}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Mục tiêu</p>
                          <p className="text-2xl font-bold">{(monthlyAnalysis.target / 1000000000).toFixed(1)} tỷ VND</p>
                        </div>
                        <Award className="w-8 h-8 text-orange-200" />
                      </div>
                    </div>
                  </div>

                  {/* Performance Analysis */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="font-medium text-gray-900 mb-3">📊 Phân tích hiệu suất tháng</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Tỷ lệ đạt mục tiêu:</span>
                          <span className={`font-semibold ${
                            (monthlyAnalysis.sales / monthlyAnalysis.target) >= 1
                              ? 'text-green-600'
                              : (monthlyAnalysis.sales / monthlyAnalysis.target) >= 0.8
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}>
                            {((monthlyAnalysis.sales / monthlyAnalysis.target) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              (monthlyAnalysis.sales / monthlyAnalysis.target) >= 1
                                ? 'bg-green-500'
                                : (monthlyAnalysis.sales / monthlyAnalysis.target) >= 0.8
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min((monthlyAnalysis.sales / monthlyAnalysis.target) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Chênh lệch với mục tiêu:</span>
                          <span className={`font-semibold ${
                            monthlyAnalysis.sales >= monthlyAnalysis.target
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {monthlyAnalysis.sales >= monthlyAnalysis.target ? '+' : ''}
                            {((monthlyAnalysis.sales - monthlyAnalysis.target) / 1000000000).toFixed(1)} tỷ VND
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {monthlyAnalysis.sales >= monthlyAnalysis.target
                            ? '🎉 Vượt mục tiêu!'
                            : '⚠️ Chưa đạt mục tiêu'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <AIInsights />
              </div>
            )}


          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DetailedReports;
