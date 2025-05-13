
import React from 'react';
import { UserLocation } from '@/types/user';
import { motion } from 'framer-motion';

interface LocationSelectorProps {
  selectedLocation: UserLocation | 'all';
  onLocationChange: (location: UserLocation | 'all') => void;
}

const locationNames = {
  all: 'Toàn quốc',
  hanoi: 'Hà Nội',
  hcm: 'Hồ Chí Minh'
};

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  selectedLocation, 
  onLocationChange 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="text-lg font-medium mb-3">Chọn khu vực</div>
      
      <div className="space-y-3">
        {Object.entries(locationNames).map(([value, label]) => (
          <div key={value} className="relative flex items-center">
            <input 
              type="radio" 
              id={`location-${value}`} 
              name="location"
              checked={selectedLocation === value}
              onChange={() => onLocationChange(value as UserLocation | 'all')}
              className="absolute opacity-0 cursor-pointer h-0 w-0"
            />
            <div className={`
              h-5 w-5 rounded-full border-2 flex-shrink-0
              ${selectedLocation === value 
                ? 'border-[#6c5ce7] bg-[#6c5ce7] shadow-[0_0_0_3px_rgba(108,92,231,0.2)]' 
                : 'border-[#dfe6e9] bg-white'}
            `}>
              {selectedLocation === value && (
                <div className="h-[10px] w-[10px] bg-white rounded-full absolute top-[5px] left-[5px]"></div>
              )}
            </div>
            <label 
              htmlFor={`location-${value}`} 
              className="ml-3 text-[#2d3436] cursor-pointer select-none block w-full"
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default LocationSelector;
