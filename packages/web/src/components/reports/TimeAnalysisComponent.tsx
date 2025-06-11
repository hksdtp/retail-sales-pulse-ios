import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';

interface TimeAnalysisData {
  period: string;
  sales: number;
  target: number;
  growth: number;
  deals: number;
  topPerformer: string;
}

interface TimeAnalysisProps {
  employeeData: any[];
}

const TimeAnalysisComponent: React.FC<TimeAnalysisProps> = ({ employeeData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const getMonthlyData = (): TimeAnalysisData[] => {
    return [
      {
        period: 'Tháng 1/2025',
        sales: 1442500000,
        target: 2650000000,
        growth: -12.5,
        deals: 45,
        topPerformer: 'Nguyễn Thị Nga'
      },
      {
        period: 'Tháng 2/2025',
        sales: 1357800000,
        target: 2100000000,
        growth: -5.9,
        deals: 38,
        topPerformer: 'Nguyễn Ngọc Việt Khanh'
      },
      {
        period: 'Tháng 3/2025',
        sales: 1968100000,
        target: 2750000000,
        growth: 44.9,
        deals: 52,
        topPerformer: 'Nguyễn Thị Nga'
      },
      {
        period: 'Tháng 4/2025',
        sales: 2192700000,
        target: 3570000000,
        growth: 11.4,
        deals: 58,
        topPerformer: 'Phạm Thị Hương'
      },
      {
        period: 'Tháng 5/2025',
        sales: 2690600000,
        target: 4450000000,
        growth: 22.7,
        deals: 67,
        topPerformer: 'Nguyễn Thị Nga'
      },
      {
        period: 'Tháng 6/2025',
        sales: 0,
        target: 5140000000,
        growth: 0,
        deals: 0,
        topPerformer: 'Chưa có dữ liệu'
      }
    ];
  };

  const getQuarterlyData = (): TimeAnalysisData[] => {
    return [
      {
        period: 'Quý 1/2025',
        sales: 4768400000, // T1+T2+T3
        target: 7500000000,
        growth: 8.2,
        deals: 135,
        topPerformer: 'Nguyễn Thị Nga'
      },
      {
        period: 'Quý 2/2025',
        sales: 4883300000, // T4+T5+T6
        target: 13160000000,
        growth: 2.4,
        deals: 125,
        topPerformer: 'Phạm Thị Hương'
      }
    ];
  };

  const getYearlyData = (): TimeAnalysisData[] => {
    return [
      {
        period: '2025 (6 tháng đầu)',
        sales: 9651700000,
        target: 20660000000,
        growth: 5.3,
        deals: 260,
        topPerformer: 'Nguyễn Thị Nga'
      },
      {
        period: '2024 (so sánh)',
        sales: 9150000000,
        target: 18500000000,
        growth: 0,
        deals: 245,
        topPerformer: 'Khổng Đức Mạnh'
      }
    ];
  };

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'month': return getMonthlyData();
      case 'quarter': return getQuarterlyData();
      case 'year': return getYearlyData();
      default: return getMonthlyData();
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ VND`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu VND`;
    }
    return `${amount.toLocaleString()} VND`;
  };

  const getCompletionRate = (sales: number, target: number) => {
    return target > 0 ? ((sales / target) * 100).toFixed(1) : '0';
  };

  const data = getCurrentData();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Phân tích theo thời gian</h3>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'month', label: 'Tháng', icon: Calendar },
            { key: 'quarter', label: 'Quý', icon: BarChart3 },
            { key: 'year', label: 'Năm', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.period}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{item.period}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  item.growth > 0 ? 'text-green-600' : item.growth < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {item.growth > 0 ? '+' : ''}{item.growth}%
                </span>
                {item.growth !== 0 && (
                  <TrendingUp className={`w-4 h-4 ${
                    item.growth > 0 ? 'text-green-600' : 'text-red-600'
                  } ${item.growth < 0 ? 'rotate-180' : ''}`} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Doanh số</p>
                <p className="font-semibold text-gray-900">{formatCurrency(item.sales)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Mục tiêu</p>
                <p className="font-semibold text-gray-900">{formatCurrency(item.target)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tỷ lệ hoàn thành</p>
                <p className={`font-semibold ${
                  parseFloat(getCompletionRate(item.sales, item.target)) >= 100 
                    ? 'text-green-600' 
                    : parseFloat(getCompletionRate(item.sales, item.target)) >= 80 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {getCompletionRate(item.sales, item.target)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Top performer</p>
                <p className="font-semibold text-blue-600 text-sm">{item.topPerformer}</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tiến độ</span>
                <span>{getCompletionRate(item.sales, item.target)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    parseFloat(getCompletionRate(item.sales, item.target)) >= 100 
                      ? 'bg-green-500' 
                      : parseFloat(getCompletionRate(item.sales, item.target)) >= 80 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min(parseFloat(getCompletionRate(item.sales, item.target)), 100)}%` 
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TimeAnalysisComponent;
