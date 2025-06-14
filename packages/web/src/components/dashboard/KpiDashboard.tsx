import { motion } from 'framer-motion';
import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';


import ConversionRates from '@/components/dashboard/ConversionRates';
import KpiCard from '@/components/dashboard/KpiCard';
import RegionDistribution from '@/components/dashboard/RegionDistribution';
import RevenueChart from '@/components/dashboard/RevenueChart';
import TopPerformers from '@/components/dashboard/TopPerformers';
import { User } from '@/types/user';
import { SyncedKpiData, DashboardData } from '@/services/DashboardSyncService';

interface KpiDashboardProps {
  kpiData?: SyncedKpiData[];
  currentUser: User | null;
  dashboardData?: DashboardData;
  isLoading?: boolean;
}

const KpiDashboard: React.FC<KpiDashboardProps> = ({
  kpiData = [],
  currentUser,
  dashboardData,
  isLoading = false
}) => {
  // Comprehensive error boundary và fallback
  try {
    const permissions = dashboardData?.permissions || {
      canViewAll: currentUser?.name === 'Khổng Đức Mạnh' || false,
      canViewTeam: currentUser?.role === 'team_leader' || false,
      canViewPersonal: true
    };

    const summary = dashboardData?.summary || {
      totalTasks: 0,
      completedTasks: 0,
      totalSales: 0,
      completionRate: 0
    };

    // Debug logging
    console.log('🎨 KpiDashboard render:', {
      kpiDataLength: kpiData?.length || 0,
      permissions,
      summary,
      isLoading,
      currentUser: currentUser?.name,
      hasData: !!dashboardData
    });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[20px] border border-blue-100 p-6 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/95 backdrop-blur-lg rounded-[20px] border border-white/30 shadow-xl p-8 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

    // Nếu không có dữ liệu, hiển thị empty state
    if (!kpiData || kpiData.length === 0) {
      return (
        <div className="p-4 md:p-6 space-y-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-[20px] border border-gray-200 p-8 text-center">
            <div className="text-gray-500 mb-4">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Chưa có dữ liệu</h3>
              <p className="text-sm">Dashboard sẽ hiển thị dữ liệu khi có công việc và báo cáo.</p>
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Summary Stats */}
      <motion.div
        className="bg-gradient-to-br from-slate-50/80 via-white/90 to-blue-50/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-lg shadow-black/5 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: permissions.canViewAll ? 0.1 : 0 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center group">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 rounded-xl bg-blue-100/80 group-hover:bg-blue-200/80 transition-colors duration-300">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng công việc</span>
              <div className="text-2xl font-bold text-slate-800">{summary.totalTasks}</div>
            </div>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 rounded-xl bg-emerald-100/80 group-hover:bg-emerald-200/80 transition-colors duration-300">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hoàn thành</span>
              <div className="text-2xl font-bold text-slate-800">{summary.completedTasks}</div>
            </div>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 rounded-xl bg-purple-100/80 group-hover:bg-purple-200/80 transition-colors duration-300">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ hoàn thành</span>
              <div className="text-2xl font-bold text-slate-800">{summary.completionRate}%</div>
            </div>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 rounded-xl bg-amber-100/80 group-hover:bg-amber-200/80 transition-colors duration-300">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doanh số</span>
              <div className="text-2xl font-bold text-slate-800">
                {summary.totalSales >= 1000000000
                  ? `${(summary.totalSales / 1000000000).toFixed(1)} tỷ VND`
                  : summary.totalSales >= 1000000
                  ? `${(summary.totalSales / 1000000).toFixed(1)} triệu VND`
                  : `${(summary.totalSales / 1000).toFixed(0)}K VND`}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        data-testid="kpi-cards-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {kpiData.map((kpi, index) => (
          <motion.div
            key={`${kpi.title}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ translateY: -5, transition: { duration: 0.4 } }}
            className="overflow-hidden"
          >
            <KpiCard
              title={kpi.title}
              value={kpi.value}
              oldValue={kpi.oldValue}
              change={kpi.change}
              data={kpi.data}
              category={kpi.category}
              className=""
            />
            {kpi.details && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Mới: {kpi.details.new} | Cũ: {kpi.details.old}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Charts - Hiển thị theo quyền hạn */}
      {(permissions.canViewAll || permissions.canViewTeam) && (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="lg:col-span-2"
            whileHover={{ translateY: -5, transition: { duration: 0.4 } }}
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-[20px] border border-white/30 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <RevenueChart />
            </div>
          </motion.div>
          <motion.div
            className="lg:col-span-1"
            whileHover={{ translateY: -5, transition: { duration: 0.4 } }}
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-[20px] border border-white/30 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <TopPerformers />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Additional charts - Chỉ cho Director */}
      {permissions.canViewAll && (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="lg:col-span-1"
            whileHover={{ translateY: -5, transition: { duration: 0.4 } }}
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-[20px] border border-white/30 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <RegionDistribution />
            </div>
          </motion.div>
          <motion.div
            className="lg:col-span-2"
            whileHover={{ translateY: -5, transition: { duration: 0.4 } }}
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-[20px] border border-white/30 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <ConversionRates visible={permissions.canViewAll} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
  } catch (error) {
    console.error('❌ KpiDashboard render error:', error);

    // Error fallback UI
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-[20px] p-8 text-center">
          <div className="text-red-600 mb-4">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">Lỗi hiển thị Dashboard</h3>
            <p className="text-sm">Đang khắc phục sự cố. Vui lòng thử lại sau.</p>
          </div>
        </div>
      </div>
    );
  }
};

export default KpiDashboard;
