
import React from 'react';
import { UserLocation } from '@/types/user';
import { MapPin, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="space-y-2"
    >
      <label htmlFor="location" className="text-lg font-medium flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-ios-blue" />
        Chọn khu vực
      </label>
      <Select 
        value={selectedLocation} 
        onValueChange={(value: UserLocation | 'all') => onLocationChange(value)}
      >
        <SelectTrigger className="w-full h-12 text-base">
          <SelectValue placeholder="Chọn khu vực">
            {locationNames[selectedLocation]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <SelectItem value="all" className="text-base py-3 flex items-center">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-ios-blue flex items-center justify-center mr-2">
                  <Briefcase className="h-3 w-3 text-white" />
                </div>
                Toàn quốc
              </div>
            </SelectItem>
            <SelectItem value="hanoi" className="text-base py-3">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                Hà Nội
              </div>
            </SelectItem>
            <SelectItem value="hcm" className="text-base py-3">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center mr-2">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                Hồ Chí Minh
              </div>
            </SelectItem>
          </motion.div>
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default LocationSelector;
