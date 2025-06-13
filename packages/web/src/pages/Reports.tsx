import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import SalesReports from '@/components/reports/SalesReports';

const Reports = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Báo cáo doanh số"
        subtitle="Phân tích hiệu suất kinh doanh và doanh thu"
      />
      <div className="p-4 md:p-6">
        <SalesReports />
      </div>
    </AppLayout>
  );
};

export default Reports;
