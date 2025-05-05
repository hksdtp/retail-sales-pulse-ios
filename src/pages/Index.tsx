
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import KpiCard from '@/components/dashboard/KpiCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import TopPerformers from '@/components/dashboard/TopPerformers';
import RegionDistribution from '@/components/dashboard/RegionDistribution';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { currentUser } = useAuth();
  const isDirector = currentUser?.role === 'director';

  const kpiData = [
    {
      title: 'Đối tác mới',
      value: '28',
      change: 12.5,
      data: Array(10).fill(0).map((_, i) => ({ value: 15 + Math.random() * 20 }))
    },
    {
      title: 'KTS mới',
      value: '15',
      change: 8.3,
      data: Array(10).fill(0).map((_, i) => ({ value: 10 + Math.random() * 15 }))
    },
    {
      title: 'SBG mới',
      value: '42',
      change: -5.2,
      data: Array(10).fill(0).map((_, i) => ({ value: 30 + Math.random() * 25 }))
    },
    {
      title: 'Doanh số',
      value: '480tr',
      change: 15.8,
      data: Array(10).fill(0).map((_, i) => ({ value: 300 + Math.random() * 200 }))
    }
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="Dashboard" 
        subtitle="Xem tổng quan về hiệu suất kinh doanh"
        actions={
          <Button>Xuất báo cáo</Button>
        }
      />
      
      <div className="p-4 md:p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <KpiCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              data={kpi.data}
            />
          ))}
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="lg:col-span-1">
            <TopPerformers />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RegionDistribution />
          </div>
          <div className="lg:col-span-2">
            {isDirector && (
              <div className="bg-white rounded-xl p-6 shadow-sm h-full">
                <h3 className="font-medium text-lg mb-4">Tỷ lệ chuyển đổi</h3>
                <div className="flex flex-col space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Báo giá → Đơn hàng</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-ios-green h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>KH tiềm năng → KH thực tế</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-ios-blue h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>KTS tiềm năng → Dự án</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-ios-orange h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
