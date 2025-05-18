
import React from 'react';
import { UserLocation } from '@/types/user';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  selectedLocation: UserLocation | 'all';
  onLocationChange: (location: UserLocation | 'all') => void;
  departmentType: string | null;
}

const getLocationNames = (departmentType: string | null) => {
  if (departmentType === 'project') {
    return {
      all: 'Hà Xuân Trường',
      hanoi: 'Hà Nội',
      hcm: 'Hồ Chí Minh'
    };
  } else if (departmentType === 'retail') {
    return {
      all: 'Khổng Đức Mạnh',
      hanoi: 'Hà Nội',
      hcm: 'Hồ Chí Minh'
    };
  } else {
    return {
      all: 'Toàn quốc',
      hanoi: 'Hà Nội',
      hcm: 'Hồ Chí Minh'
    };
  }
};

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  selectedLocation, 
  onLocationChange,
  departmentType
}) => {
  const locationNames = getLocationNames(departmentType);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="text-lg font-medium mb-1">Chọn khu vực</div>
      
      <div className="flex flex-wrap gap-2">
        {Object.entries(locationNames).map(([value, label]) => {
          const isSelected = selectedLocation === value;
          const isSpecial = value === 'all';
          
          return (
            <motion.div 
              key={value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLocationChange(value as UserLocation | 'all')}
              className={`
                relative flex items-center px-4 py-3 rounded-xl cursor-pointer
                transition-all duration-300 flex-grow md:flex-grow-0
                ${isSelected 
                  ? 'bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/25' 
                  : 'border border-gray-200 bg-white/80 hover:border-[#6c5ce7]/40 hover:bg-white/100 hover:shadow-md'}
                ${isSpecial ? 'md:min-w-[200px]' : 'md:min-w-[120px]'}
              `}
            >
              <div className="flex items-center justify-center w-full">
                <MapPin className={`h-4 w-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{label}</span>
                  {value === 'all' && (
                    <span className="text-xs mt-0.5 opacity-80">
                      {departmentType === 'project' 
                        ? 'Trưởng Phòng Kinh Doanh Dự Án'
                        : departmentType === 'retail'
                          ? 'Giám đốc Kinh Doanh'
                          : ''}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default LocationSelector;
