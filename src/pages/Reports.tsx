import React from 'react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import ReportsList from '@/components/reports/ReportsList';
import { Button } from '@/components/ui/button';

const Reports = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Báo cáo"
        subtitle="Xem và tạo các báo cáo phân tích chi tiết"
        actions={<Button>Tạo báo cáo mới</Button>}
      />

      <div className="p-4 md:p-6">
        <ReportsList />
      </div>
    </AppLayout>
  );
};

export default Reports;
