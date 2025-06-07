import React from 'react';

import KpiOverview from '@/components/kpi/KpiOverview';
import TaskKpiOverview from '@/components/kpi/TaskKpiOverview';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Kpi = () => {
  return (
    <AppLayout>
      <PageHeader
        title="KPI"
        subtitle="Theo dõi chỉ số hiệu suất chính của đội ngũ kinh doanh"
        actions={<Button>Xuất báo cáo KPI</Button>}
      />

      <div className="p-4 md:p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan doanh số</TabsTrigger>
            <TabsTrigger value="tasks">KPI theo công việc</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <KpiOverview />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskKpiOverview />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Kpi;
