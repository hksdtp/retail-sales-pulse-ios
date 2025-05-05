
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const getIconForStep = (stepNumber: number) => {
    if (currentStep >= stepNumber) {
      return <div className="bg-ios-blue text-white h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium">{stepNumber}</div>;
    }
    return <div className="bg-gray-200 text-gray-500 h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium">{stepNumber}</div>;
  };

  return (
    <div className="flex items-center justify-center mt-4 space-x-10">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex flex-col items-center">
          {getIconForStep(stepNumber)}
          <span className="text-xs mt-1 text-gray-500">
            {stepNumber === 1 ? 'Khu vực' : 
             stepNumber === 2 ? 'Nhóm' : 
             stepNumber === 3 ? 'Người dùng' : 'Mật khẩu'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
