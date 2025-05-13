
import React from 'react';
import { UserLocation } from '@/types/user';
import { MapPin, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    <div className="space-y-2">
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
        <SelectContent 
          position="popper" 
          sideOffset={5} 
          className="bg-white z-[200] shadow-xl border border-gray-200 w-full min-w-[300px]"
          align="start"
        >
          <div className="p-1">
            <SelectItem value="all" className="text-base py-3 px-4 rounded-md">
              <div className="flex items-center w-full gap-3">
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-ios-blue flex items-center justify-center">
                  <Briefcase color="white" size={16} />
                </div>
                <span className="flex-1 truncate">Toàn quốc</span>
              </div>
            </SelectItem>
            <SelectItem value="hanoi" className="text-base py-3 px-4 rounded-md">
              <div className="flex items-center w-full gap-3">
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center">
                  <MapPin color="white" size={16} />
                </div>
                <span className="flex-1 truncate">Hà Nội</span>
              </div>
            </SelectItem>
            <SelectItem value="hcm" className="text-base py-3 px-4 rounded-md">
              <div className="flex items-center w-full gap-3">
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-orange-500 flex items-center justify-center">
                  <MapPin color="white" size={16} />
                </div>
                <span className="flex-1 truncate">Hồ Chí Minh</span>
              </div>
            </SelectItem>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationSelector;
