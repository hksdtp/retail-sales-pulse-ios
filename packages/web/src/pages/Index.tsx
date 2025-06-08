import React from 'react';

import KpiDashboard from '@/components/dashboard/KpiDashboard';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTaskData } from '@/hooks/use-task-data';
import { getDashboardSubtitle, getKpiDataForUser } from '@/utils/kpiUtils';

const Index = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTaskData();

  // Lấy dữ liệu KPI dựa trên người dùng hiện tại và tasks
  const kpiData = getKpiDataForUser(currentUser, tasks);

  // Lấy tiêu đề phụ dựa trên loại người dùng
  const subtitle = getDashboardSubtitle(currentUser);

  return (
    <AppLayout>
      <PageHeader title="Dashboard" subtitle={subtitle} actions={<Button>Xuất báo cáo</Button>} />

      <KpiDashboard kpiData={kpiData} currentUser={currentUser} />
    </AppLayout>
  );
};

export default Index;
