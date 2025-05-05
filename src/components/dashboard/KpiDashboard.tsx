
import React from 'react';
import KpiCard from '@/components/dashboard/KpiCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import TopPerformers from '@/components/dashboard/TopPerformers';
import RegionDistribution from '@/components/dashboard/RegionDistribution';
import ConversionRates from '@/components/dashboard/ConversionRates';
import { KpiItem } from '@/utils/kpiUtils';
import { User } from '@/types/user';

interface KpiDashboardProps {
  kpiData: KpiItem[];
  currentUser: User | null;
}

const KpiDashboard: React.FC<KpiDashboardProps> = ({ kpiData, currentUser }) => {
  const isDirector = currentUser?.role === 'director';
  
  return (
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
      
      {/* Charts - Chỉ hiển thị RevenueChart cho tất cả người dùng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          {/* TopPerformers chỉ hiển thị cho giám đốc */}
          <TopPerformers />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* RegionDistribution chỉ hiển thị cho giám đốc */}
          <RegionDistribution />
        </div>
        <div className="lg:col-span-2">
          <ConversionRates visible={isDirector} />
        </div>
      </div>
    </div>
  );
};

export default KpiDashboard;
