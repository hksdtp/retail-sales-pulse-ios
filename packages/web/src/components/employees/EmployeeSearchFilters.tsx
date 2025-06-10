import React from 'react';
import { Search, Filter, Users, Download } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Team } from '@/types/user';

interface EmployeeSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  selectedTeam: string;
  onTeamChange: (value: string) => void;
  teams: Team[];
  resultCount: number;
  totalCount: number;
  onExport: () => void;
  canExport: boolean;
}

const EmployeeSearchFilters: React.FC<EmployeeSearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  selectedRole,
  onRoleChange,
  selectedTeam,
  onTeamChange,
  teams,
  resultCount,
  totalCount,
  onExport,
  canExport
}) => {
  const clearFilters = () => {
    onSearchChange('');
    onLocationChange('all');
    onRoleChange('all');
    onTeamChange('all');
  };

  const hasActiveFilters = searchTerm || selectedLocation !== 'all' || selectedRole !== 'all' || selectedTeam !== 'all';

  return (
    <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Bộ lọc và tìm kiếm
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )}
            {canExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Xuất dữ liệu
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Location Filter */}
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Địa điểm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả địa điểm</SelectItem>
              <SelectItem value="hanoi">Hà Nội</SelectItem>
              <SelectItem value="hcm">Hồ Chí Minh</SelectItem>
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select value={selectedRole} onValueChange={onRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="retail_director">Trưởng phòng</SelectItem>
              <SelectItem value="team_leader">Trưởng nhóm</SelectItem>
              <SelectItem value="employee">Nhân viên</SelectItem>
            </SelectContent>
          </Select>

          {/* Team Filter */}
          <Select value={selectedTeam} onValueChange={onTeamChange}>
            <SelectTrigger>
              <SelectValue placeholder="Nhóm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhóm</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {resultCount} / {totalCount} nhân viên
            </span>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Tìm kiếm: "{searchTerm}"
              </span>
            )}
            {selectedLocation !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Địa điểm: {selectedLocation === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'}
              </span>
            )}
            {selectedRole !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Vai trò: {selectedRole === 'retail_director' ? 'Trưởng phòng' : selectedRole === 'team_leader' ? 'Trưởng nhóm' : 'Nhân viên'}
              </span>
            )}
            {selectedTeam !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Nhóm: {teams.find(t => t.id === selectedTeam)?.name || 'Không xác định'}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeSearchFilters;
