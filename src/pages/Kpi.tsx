
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import KpiOverview from '@/components/kpi/KpiOverview';

const Kpi = () => {
  return (
    <AppLayout>
      <PageHeader 
        title="KPI" 
        subtitle="Theo dõi chỉ số hiệu suất chính của đội ngũ kinh doanh"
        actions={
          <Button>Xuất báo cáo KPI</Button>
        }
      />
      
      <div className="p-4 md:p-6">
        <KpiOverview />
      </div>
    </AppLayout>
  );
};

export default Kpi;
