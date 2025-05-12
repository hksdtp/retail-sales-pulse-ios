
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import KpiDashboard from '@/components/dashboard/KpiDashboard';
import { getKpiDataForUser, getDashboardSubtitle } from '@/utils/kpiUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KpiOverview from '@/components/kpi/KpiOverview';
import TaskKpiOverview from '@/components/kpi/TaskKpiOverview';

const Index = () => {
  const { currentUser } = useAuth();
  
  // Lấy dữ liệu KPI dựa trên người dùng hiện tại
  const kpiData = getKpiDataForUser(currentUser);
  
  // Lấy tiêu đề phụ dựa trên loại người dùng
  const subtitle = getDashboardSubtitle(currentUser);

  return (
    <AppLayout>
      <PageHeader 
        title="Dashboard & KPI" 
        subtitle={subtitle}
        actions={
          <Button>Xuất báo cáo</Button>
        }
      />
      
      <div className="p-4 md:p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Tổng quan</TabsTrigger>
            <TabsTrigger value="kpi-overview">Chỉ số doanh số</TabsTrigger>
            <TabsTrigger value="kpi-tasks">Chỉ số công việc</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <KpiDashboard 
              kpiData={kpiData}
              currentUser={currentUser}
            />
          </TabsContent>
          
          <TabsContent value="kpi-overview" className="space-y-6">
            <KpiOverview />
          </TabsContent>
          
          <TabsContent value="kpi-tasks" className="space-y-6">
            <TaskKpiOverview />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Index;
