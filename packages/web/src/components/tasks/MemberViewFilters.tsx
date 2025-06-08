import { Building2, MapPin, Users, User } from 'lucide-react';
import React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';

interface MemberViewFiltersProps {
  selectedLocation: string;
  selectedTeam: string;
  selectedMember: string | null;
  onLocationChange: (location: string) => void;
  onTeamChange: (teamId: string) => void;
  onMemberChange: (memberId: string | null) => void;
}

export default function MemberViewFilters({
  selectedLocation,
  selectedTeam,
  selectedMember,
  onLocationChange,
  onTeamChange,
  onMemberChange,
}: MemberViewFiltersProps) {
  const { currentUser, users, teams } = useAuth();

  // Chỉ hiển thị cho directors
  if (currentUser?.role !== 'retail_director' && currentUser?.role !== 'project_director') {
    return null;
  }

  // Lấy danh sách locations
  const getLocations = () => {
    const locations = Array.from(new Set(users.map(user => user.location).filter(Boolean)));
    return locations;
  };

  // Lấy danh sách teams theo location
  const getTeamsByLocation = () => {
    if (selectedLocation === 'all') {
      return teams.filter(team => team.department_type === currentUser.department_type);
    }
    return teams.filter(team => 
      team.location === selectedLocation && 
      team.department_type === currentUser.department_type
    );
  };

  // Lấy danh sách members theo team
  const getMembersByTeam = () => {
    let filteredUsers = users.filter(user => 
      user.department_type === currentUser.department_type && 
      user.id !== currentUser.id
    );

    if (selectedLocation !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.location === selectedLocation);
    }

    if (selectedTeam !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.team_id === selectedTeam);
    }

    return filteredUsers;
  };

  const locations = getLocations();
  const teamsByLocation = getTeamsByLocation();
  const membersByTeam = getMembersByTeam();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <Building2 className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Bộ lọc thành viên</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>Địa điểm</span>
          </label>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-lg">
              <SelectValue placeholder="Chọn địa điểm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả địa điểm</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Team Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>Nhóm</span>
          </label>
          <Select value={selectedTeam} onValueChange={onTeamChange}>
            <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-lg">
              <SelectValue placeholder="Chọn nhóm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhóm</SelectItem>
              {teamsByLocation.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Member Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>Thành viên</span>
          </label>
          <Select value={selectedMember || 'all'} onValueChange={(value) => onMemberChange(value === 'all' ? null : value)}>
            <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-lg">
              <SelectValue placeholder="Chọn thành viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thành viên</SelectItem>
              {membersByTeam.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} - {member.position || member.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Hiển thị: {selectedLocation === 'all' ? 'Tất cả địa điểm' : selectedLocation} • {' '}
            {selectedTeam === 'all' ? 'Tất cả nhóm' : teamsByLocation.find(t => t.id === selectedTeam)?.name || 'Nhóm'} • {' '}
            {selectedMember ? users.find(u => u.id === selectedMember)?.name || 'Thành viên' : 'Tất cả thành viên'}
          </span>
          <span className="font-medium">
            {membersByTeam.length} thành viên
          </span>
        </div>
      </div>
    </div>
  );
}
