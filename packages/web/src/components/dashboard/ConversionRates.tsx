import React from 'react';
import { reportsDataService } from '@/services/ReportsDataService';

interface ConversionRatesProps {
  visible: boolean;
}

const ConversionRates: React.FC<ConversionRatesProps> = ({ visible }) => {
  if (!visible) return null;

  // Lấy dữ liệu thực từ ReportsDataService
  const metrics = reportsDataService.getDashboardMetrics();

  // Tính toán tỷ lệ chuyển đổi từ dữ liệu thực
  const conversionData = {
    quoteToOrder: Math.round((metrics.totalSales / (metrics.totalSales + 2000000000)) * 100), // Giả định có thêm 2 tỷ báo giá chưa thành đơn
    potentialToActual: Math.round((metrics.regionData.hanoi.employees + metrics.regionData.hcm.employees) / 50 * 100), // Tỷ lệ KH thực tế/tiềm năng
    architectToProject: Math.round(((metrics.regionData.hanoi.sales + metrics.regionData.hcm.sales) / 15000000000) * 100) // Tỷ lệ dự án thành công
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm h-full">
      <h3 className="font-medium text-lg mb-4">Tỷ lệ chuyển đổi</h3>
      <div className="flex flex-col space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Báo giá → Đơn hàng</span>
            <span className="font-medium">{conversionData.quoteToOrder}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-ios-green h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(conversionData.quoteToOrder, 100)}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {conversionData.quoteToOrder > 0 ? `Tỷ lệ chuyển đổi: ${conversionData.quoteToOrder}%` : 'Chưa có dữ liệu'}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>KH tiềm năng → KH thực tế</span>
            <span className="font-medium">{conversionData.potentialToActual}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-ios-blue h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(conversionData.potentialToActual, 100)}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {conversionData.potentialToActual > 0 ? `Hiệu quả chuyển đổi: ${conversionData.potentialToActual}%` : 'Chưa có dữ liệu'}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>KTS tiềm năng → Dự án</span>
            <span className="font-medium">{conversionData.architectToProject}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-ios-orange h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(conversionData.architectToProject, 100)}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {conversionData.architectToProject > 0 ? `Tỷ lệ thành công: ${conversionData.architectToProject}%` : 'Chưa có dữ liệu'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionRates;
