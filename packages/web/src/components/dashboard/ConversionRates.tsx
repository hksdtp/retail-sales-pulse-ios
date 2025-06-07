import React from 'react';

interface ConversionRatesProps {
  visible: boolean;
}

const ConversionRates: React.FC<ConversionRatesProps> = ({ visible }) => {
  if (!visible) return null;

  return (
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
  );
};

export default ConversionRates;
