import React from 'react';

interface ConversionRatesProps {
  visible: boolean;
}

const ConversionRates: React.FC<ConversionRatesProps> = ({ visible }) => {
  if (!visible) return null;

  // Dữ liệu thực từ báo cáo - hiện tại chưa có, để 0%
  const conversionData = {
    quoteToOrder: 0, // Chưa có dữ liệu trong báo cáo
    potentialToActual: 0, // Chưa có dữ liệu trong báo cáo
    architectToProject: 0 // Chưa có dữ liệu trong báo cáo
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
            <div className="bg-ios-green h-2 rounded-full" style={{ width: `${conversionData.quoteToOrder}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Chưa có dữ liệu</div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>KH tiềm năng → KH thực tế</span>
            <span className="font-medium">{conversionData.potentialToActual}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-ios-blue h-2 rounded-full" style={{ width: `${conversionData.potentialToActual}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Chưa có dữ liệu</div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>KTS tiềm năng → Dự án</span>
            <span className="font-medium">{conversionData.architectToProject}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-ios-orange h-2 rounded-full" style={{ width: `${conversionData.architectToProject}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Chưa có dữ liệu</div>
        </div>
      </div>
    </div>
  );
};

export default ConversionRates;
