import { motion } from 'framer-motion';
import { ChevronDown, MapPin } from 'lucide-react';
import React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserLocation } from '@/types/user';

interface LocationSelectorProps {
  selectedLocation: UserLocation | 'all';
  onLocationChange: (location: UserLocation | 'all') => void;
  departmentType: string | null;
}

const getLocationNames = (departmentType: string | null) => {
  return {
    all: 'Khổng Đức Mạnh',
    hanoi: 'Hà Nội',
    hcm: 'Hồ Chí Minh',
  };
};

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange,
  departmentType,
}) => {
  const locationNames = getLocationNames(departmentType);

  console.log('🔍 LocationSelector - selectedLocation:', selectedLocation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <div className="text-sm font-medium flex items-center text-[#636e72] mb-1">
        <MapPin className="h-3.5 w-3.5 mr-1.5" />
        <span>Khu vực</span>
      </div>

      <Select
        value={selectedLocation}
        onValueChange={(value) => {
          console.log('🔍 LocationSelector - onValueChange:', value);
          onLocationChange(value as UserLocation | 'all');
        }}
      >
        <SelectTrigger className="h-10 bg-white/80 rounded-lg border border-[#dfe6e9] hover:border-[#6c5ce7] transition-all focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 text-sm">
          <div className="flex items-center">
            <SelectValue placeholder="Chọn khu vực" />
          </div>
        </SelectTrigger>
        <SelectContent
          className="bg-white/95 rounded-lg p-1 border-[#dfe6e9] z-50"
          position="popper"
          sideOffset={4}
        >
          {Object.entries(locationNames).map(([value, label]) => {
            const isSpecial = value === 'all';

            return (
              <SelectItem key={value} value={value} className="py-1.5 text-sm">
                <div className="flex items-center">
                  {isSpecial ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{label}</span>
                      <span className="text-[10px] opacity-80">Trưởng phòng kinh doanh</span>
                    </div>
                  ) : (
                    <span className="font-medium">{label}</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default LocationSelector;
