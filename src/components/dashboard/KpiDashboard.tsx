
import React from 'react';
import KpiCard from '@/components/dashboard/KpiCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import TopPerformers from '@/components/dashboard/TopPerformers';
import RegionDistribution from '@/components/dashboard/RegionDistribution';
import ConversionRates from '@/components/dashboard/ConversionRates';
import { KpiItem } from '@/utils/kpiUtils';
import { User } from '@/types/user';
import { motion } from 'framer-motion';

interface KpiDashboardProps {
  kpiData: KpiItem[];
  currentUser: User | null;
}

const KpiDashboard: React.FC<KpiDashboardProps> = ({ kpiData, currentUser }) => {
  const isDirector = currentUser?.role === 'retail_director' || currentUser?.role === 'project_director';
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {kpiData.map((kpi, index) => (
          <motion.div
            key={index}
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
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Charts - Chỉ hiển thị RevenueChart cho tất cả người dùng */}
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
      
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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
            <ConversionRates visible={isDirector} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default KpiDashboard;
