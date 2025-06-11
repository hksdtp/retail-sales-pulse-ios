import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  MapPin, 
  Building2,
  Crown,
  Star
} from 'lucide-react';

interface DetailedOverviewProps {
  employeeData: any[];
}

const DetailedOverviewComponent: React.FC<DetailedOverviewProps> = ({ employeeData }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ VND`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu VND`;
    }
    return `${amount.toLocaleString()} VND`;
  };

  const totalSales = employeeData.reduce((sum, emp) => sum + emp.sales, 0);
  const totalDeals = employeeData.reduce((sum, emp) => sum + emp.deals, 0);
  const totalPlan = employeeData.reduce((sum, emp) => sum + emp.plan, 0);
  const averageCompletion = totalPlan > 0 ? ((totalSales / totalPlan) * 100) : 0;

  const hanoiEmployees = employeeData.filter(emp => emp.location === 'Hà Nội');
  const hcmEmployees = employeeData.filter(emp => emp.location === 'HCM');
  
  const hanoiSales = hanoiEmployees.reduce((sum, emp) => sum + emp.sales, 0);
  const hcmSales = hcmEmployees.reduce((sum, emp) => sum + emp.sales, 0);
  
  const hanoiPlan = hanoiEmployees.reduce((sum, emp) => sum + emp.plan, 0);
  const hcmPlan = hcmEmployees.reduce((sum, emp) => sum + emp.plan, 0);

  const topPerformers = employeeData
    .filter(emp => emp.role !== 'Giám đốc')
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  const teamLeaders = employeeData.filter(emp => emp.role === 'Trưởng nhóm');
  const employees = employeeData.filter(emp => emp.role === 'Nhân viên');

  const teamLeadersSales = teamLeaders.reduce((sum, emp) => sum + emp.sales, 0);
  const employeesSales = employees.reduce((sum, emp) => sum + emp.sales, 0);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeText = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'Xuất sắc';
      case 'good': return 'Tốt';
      case 'average': return 'Trung bình';
      case 'poor': return 'Cần cải thiện';
      default: return 'Chưa đánh giá';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tổng quan chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng doanh số</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
              <p className="text-blue-100 text-xs mt-1">
                Đạt {averageCompletion.toFixed(1)}% kế hoạch
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Tổng giao dịch</p>
              <p className="text-2xl font-bold">{totalDeals}</p>
              <p className="text-green-100 text-xs mt-1">
                Trung bình {(totalDeals / employeeData.length).toFixed(1)} giao dịch/người
              </p>
            </div>
            <Target className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Hiệu suất trung bình</p>
              <p className="text-2xl font-bold">{averageCompletion.toFixed(0)}%</p>
              <p className="text-purple-100 text-xs mt-1">
                Kế hoạch {formatCurrency(totalPlan)}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Top Performers</p>
              <p className="text-2xl font-bold">{topPerformers.length}</p>
              <p className="text-orange-100 text-xs mt-1">
                Nhân viên xuất sắc
              </p>
            </div>
            <Crown className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* So sánh khu vực */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Hà Nội</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Doanh số:</span>
              <span className="font-semibold">{formatCurrency(hanoiSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kế hoạch:</span>
              <span className="font-semibold">{formatCurrency(hanoiPlan)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hoàn thành:</span>
              <span className={`font-semibold ${
                (hanoiSales / hanoiPlan * 100) >= 100 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {((hanoiSales / hanoiPlan) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nhân viên:</span>
              <span className="font-semibold">{hanoiEmployees.length} người</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">TP. Hồ Chí Minh</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Doanh số:</span>
              <span className="font-semibold">{formatCurrency(hcmSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kế hoạch:</span>
              <span className="font-semibold">{formatCurrency(hcmPlan)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hoàn thành:</span>
              <span className={`font-semibold ${
                (hcmSales / hcmPlan * 100) >= 100 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {((hcmSales / hcmPlan) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nhân viên:</span>
              <span className="font-semibold">{hcmEmployees.length} người</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top 3 Performers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPerformers.map((performer, index) => (
            <div key={performer.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{performer.name}</p>
                  <p className="text-xs text-gray-500">{performer.location} - {performer.team}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Doanh số:</span>
                  <span className="text-sm font-semibold">{formatCurrency(performer.sales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hiệu suất:</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded ${getBadgeColor(performer.badge)}`}>
                    {getBadgeText(performer.badge)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Phân tích theo vai trò */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Phân tích theo vai trò</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Trưởng nhóm ({teamLeaders.length} người)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng doanh số:</span>
                <span className="font-semibold">{formatCurrency(teamLeadersSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trung bình/người:</span>
                <span className="font-semibold">{formatCurrency(teamLeadersSales / teamLeaders.length)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">% tổng doanh số:</span>
                <span className="font-semibold">{((teamLeadersSales / totalSales) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Nhân viên ({employees.length} người)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng doanh số:</span>
                <span className="font-semibold">{formatCurrency(employeesSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trung bình/người:</span>
                <span className="font-semibold">{formatCurrency(employees.length > 0 ? employeesSales / employees.length : 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">% tổng doanh số:</span>
                <span className="font-semibold">{((employeesSales / totalSales) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DetailedOverviewComponent;
