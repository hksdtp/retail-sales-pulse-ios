import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SalesReports from '@/components/reports/SalesReports';

const Reports = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <SalesReports />
      </div>
    </AppLayout>
  );
};

export default Reports;
