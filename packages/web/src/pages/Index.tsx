import React from 'react';
import { useNavigate } from 'react-router-dom';

import KpiDashboard from '@/components/dashboard/KpiDashboard';
import SimpleDashboard from '@/components/dashboard/SimpleDashboard';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/ui/ActionButton';
import { useAuth } from '@/context/AuthContextSupabase';
import { useTaskData } from '@/hooks/use-task-data';
import { getDashboardSubtitle } from '@/utils/kpiUtils';
import { dashboardSyncService } from '@/services/DashboardSyncService';

const Index = () => {
  const { currentUser } = useAuth();
  const { tasks, isLoading } = useTaskData();
  const navigate = useNavigate();

  // Fallback để tránh màn hình trắng
  let dashboardData;
  let subtitle = 'Tổng quan hiệu suất kinh doanh';

  // Handlers cho các button actions
  const handleViewDetailedReports = () => {
    // Kiểm tra quyền truy cập reports với AI insights
    if (currentUser?.name === 'Khổng Đức Mạnh' || currentUser?.role === 'team_leader' || currentUser?.role === 'employee') {
      // Tất cả người dùng đều có thể xem báo cáo chi tiết, nhưng dữ liệu sẽ được lọc theo quyền hạn
      navigate('/detailed-reports');
    } else {
      alert('Bạn không có quyền truy cập báo cáo chi tiết.');
    }
  };

  const handleExportReport = () => {
    // Tạo dữ liệu export
    const exportData = {
      timestamp: new Date().toLocaleString('vi-VN'),
      user: currentUser?.name,
      summary: dashboardData?.summary || {},
      kpiData: dashboardData?.kpiCards || []
    };

    // Tạo file JSON để download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  try {
    // Lấy dữ liệu dashboard đồng bộ từ tasks và reports
    dashboardData = dashboardSyncService.getSyncedDashboardData(currentUser, tasks);

    // Lấy tiêu đề phụ dựa trên loại người dùng và quyền hạn
    subtitle = getDashboardSubtitle(currentUser);
    const enhancedSubtitle = dashboardData.permissions.canViewAll
      ? `${subtitle} - Toàn phòng ban`
      : dashboardData.permissions.canViewTeam
      ? `${subtitle} - Nhóm ${currentUser?.location}`
      : subtitle;
    subtitle = enhancedSubtitle;

    // Debug logging
    console.log('📊 Dashboard Index - Synced data:', {
      user: currentUser?.name,
      role: currentUser?.role,
      tasksCount: tasks.length,
      kpiCardsCount: dashboardData.kpiCards.length,
      permissions: dashboardData.permissions,
      summary: dashboardData.summary,
      isLoading
    });
  } catch (error) {
    console.error('❌ Dashboard sync error:', error);

    // Fallback data để tránh crash
    dashboardData = {
      kpiCards: [
        {
          title: 'Tổng KTS',
          value: '0',
          oldValue: '0',
          change: 0,
          data: Array(10).fill({ value: 0 }),
          category: 'task' as const
        },
        {
          title: 'Tổng KH/CĐT',
          value: '0',
          oldValue: '0',
          change: 0,
          data: Array(10).fill({ value: 0 }),
          category: 'task' as const
        },
        {
          title: 'Tổng SBG',
          value: '0',
          oldValue: '0',
          change: 0,
          data: Array(10).fill({ value: 0 }),
          category: 'task' as const
        },
        {
          title: 'Tổng Doanh Số',
          value: '0',
          oldValue: '0',
          change: 0,
          data: Array(10).fill({ value: 0 }),
          category: 'sales' as const
        }
      ],
      summary: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        totalSales: 0,
        completionRate: 0
      },
      permissions: {
        canViewAll: currentUser?.name === 'Khổng Đức Mạnh',
        canViewTeam: currentUser?.role === 'team_leader',
        canViewPersonal: true
      }
    };
  }

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetailedReports}
              className="hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center gap-2"
              title="Xem báo cáo chi tiết với AI insights"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
              Báo cáo chi tiết
            </Button>
            <ExportButton
              size="sm"
              onClick={handleExportReport}
              className="hover:bg-blue-600 transition-colors"
              title="Xuất báo cáo dashboard dạng JSON"
            >
              Xuất báo cáo
            </ExportButton>
          </div>
        }
      />

      <ErrorBoundary
        fallback={<SimpleDashboard currentUser={currentUser} isLoading={isLoading} />}
      >
        <KpiDashboard
          kpiData={dashboardData.kpiCards}
          currentUser={currentUser}
          dashboardData={dashboardData}
          isLoading={isLoading}
        />
      </ErrorBoundary>
    </AppLayout>
  );
};

export default Index;
