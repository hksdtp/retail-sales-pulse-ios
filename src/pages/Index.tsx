
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

  // Dữ liệu KPI sẽ khác nhau tùy theo người dùng
  const getKpiData = () => {
    // Giả sử là dữ liệu cho Lê Khánh Duy (id: '3')
    if (currentUser?.id === '3') {
      return [
        {
          title: 'Đối tác mới',
          value: '12',
          oldValue: '34',
          change: 8.2,
          data: Array(10).fill(0).map((_, i) => ({ value: 10 + Math.random() * 15 }))
        },
        {
          title: 'KTS mới',
          value: '8',
          oldValue: '21',
          change: 6.1,
          data: Array(10).fill(0).map((_, i) => ({ value: 7 + Math.random() * 10 }))
        },
        {
          title: 'SBG mới',
          value: '15',
          oldValue: '25',
          change: -3.5,
          data: Array(10).fill(0).map((_, i) => ({ value: 12 + Math.random() * 15 }))
        },
        {
          title: 'Doanh số',
          value: '185tr',
          oldValue: '320tr',
          change: 12.3,
          data: Array(10).fill(0).map((_, i) => ({ value: 150 + Math.random() * 100 }))
        }
      ];
    }
    // Dữ liệu cho Việt Anh (Trưởng nhóm, id: '2')
    else if (currentUser?.id === '2') {
      return [
        {
          title: 'Đối tác mới',
          value: '18',
          oldValue: '42',
          change: 10.5,
          data: Array(10).fill(0).map((_, i) => ({ value: 16 + Math.random() * 18 }))
        },
        {
          title: 'KTS mới',
          value: '12',
          oldValue: '28',
          change: 7.2,
          data: Array(10).fill(0).map((_, i) => ({ value: 10 + Math.random() * 12 }))
        },
        {
          title: 'SBG mới',
          value: '25',
          oldValue: '38',
          change: 5.8,
          data: Array(10).fill(0).map((_, i) => ({ value: 22 + Math.random() * 20 }))
        },
        {
          title: 'Doanh số',
          value: '275tr',
          oldValue: '380tr',
          change: 14.2,
          data: Array(10).fill(0).map((_, i) => ({ value: 250 + Math.random() * 150 }))
        }
      ];
    }
    // Dữ liệu mặc định (cho Giám đốc và các vai trò khác)
    else {
      return [
        {
          title: 'Đối tác mới',
          value: '28',
          oldValue: '76',
          change: 12.5,
          data: Array(10).fill(0).map((_, i) => ({ value: 15 + Math.random() * 20 }))
        },
        {
          title: 'KTS mới',
          value: '15',
          oldValue: '42',
          change: 8.3,
          data: Array(10).fill(0).map((_, i) => ({ value: 10 + Math.random() * 15 }))
        },
        {
          title: 'SBG mới',
          value: '42',
          oldValue: '65',
          change: -5.2,
          data: Array(10).fill(0).map((_, i) => ({ value: 30 + Math.random() * 25 }))
        },
        {
          title: 'Doanh số',
          value: '480tr',
          oldValue: '720tr',
          change: 15.8,
          data: Array(10).fill(0).map((_, i) => ({ value: 300 + Math.random() * 200 }))
        }
      ];
    }
  };

  const kpiData = getKpiData();

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
              oldValue={kpi.oldValue}
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
