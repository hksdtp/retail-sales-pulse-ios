import { motion } from 'framer-motion';
import React from 'react';

import { DashboardIcon, TrendingUpIcon, UsersIcon, DollarSignIcon } from '@/components/ui/sf-symbol';


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
          <div className="ios-card rounded-ios-2xl border border-ios-gray-4 p-ios-8 text-center">
            <div className="text-ios-label-secondary mb-ios-4">
              <DashboardIcon size="2xl" className="mx-auto mb-ios-4 text-ios-gray" />
              <h3 className="ios-headline mb-ios-2">Chưa có dữ liệu</h3>
              <p className="ios-subhead">Dashboard sẽ hiển thị dữ liệu khi có công việc và báo cáo.</p>
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className="p-ios-3 md:p-ios-6 space-y-ios-4 md:space-y-ios-6 mobile-content">

      {/* iOS-Optimized Summary Stats */}
      <motion.div
        className="ios-card bg-gradient-to-br from-ios-bg-secondary/80 via-white/95 to-ios-blue/5 ios-vibrancy-ultra-thin rounded-ios-2xl border border-ios-gray-4/50 shadow-ios-lg p-ios-3 md:p-ios-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: permissions.canViewAll ? 0.1 : 0, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* iOS-style responsive grid with 8px spacing system */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-ios-2 md:gap-ios-6">
          <div className="text-center group">
            <div className="flex items-center justify-center mb-ios-2 md:mb-ios-3">
              <div className="p-ios-2 md:p-ios-3 rounded-ios-xl bg-ios-blue/10 group-hover:bg-ios-blue/15 transition-colors duration-300 ios-touch-feedback">
                <DashboardIcon size="sm" className="md:w-5 md:h-5" color="#007AFF" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="ios-caption-1 uppercase tracking-wider text-ios-label-secondary">Tổng công việc</span>
              <div className="ios-title-2 md:ios-title-1 font-bold text-ios-label-primary">{summary.totalTasks}</div>
            </div>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center mb-ios-2 md:mb-ios-3">
              <div className="p-ios-2 md:p-ios-3 rounded-ios-xl bg-ios-green/10 group-hover:bg-ios-green/15 transition-colors duration-300 ios-touch-feedback">
                <TrendingUpIcon size="sm" className="md:w-5 md:h-5" color="#34C759" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="ios-caption-1 uppercase tracking-wider text-ios-label-secondary">Hoàn thành</span>
              <div className="ios-title-2 md:ios-title-1 font-bold text-ios-label-primary">{summary.completedTasks}</div>
            </div>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center mb-ios-2 md:mb-ios-3">
              <div className="p-ios-2 md:p-ios-3 rounded-ios-xl bg-ios-purple/10 group-hover:bg-ios-purple/15 transition-colors duration-300 ios-touch-feedback">
                <UsersIcon size="sm" className="md:w-5 md:h-5" color="#AF52DE" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="ios-caption-1 uppercase tracking-wider text-ios-label-secondary">Tỷ lệ hoàn thành</span>
              <div className="ios-title-2 md:ios-title-1 font-bold text-ios-label-primary">{summary.completionRate}%</div>
            </div>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center mb-ios-2 md:mb-ios-3">
              <div className="p-ios-2 md:p-ios-3 rounded-ios-xl bg-ios-orange/10 group-hover:bg-ios-orange/15 transition-colors duration-300 ios-touch-feedback">
                <DollarSignIcon size="sm" className="md:w-5 md:h-5" color="#FF9500" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="ios-caption-1 uppercase tracking-wider text-ios-label-secondary">Doanh số</span>
              <div className="ios-title-2 md:ios-title-1 font-bold text-ios-label-primary">
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

      {/* iOS-Optimized KPI Cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-ios-2 md:gap-ios-6"
        data-testid="kpi-cards-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {kpiData.map((kpi, index) => (
          <motion.div
            key={`${kpi.title}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ translateY: -4, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } }}
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

      {/* Enhanced Mobile-Optimized Charts - Hiển thị theo quyền hạn */}
      {(permissions.canViewAll || permissions.canViewTeam) && (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
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
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
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
