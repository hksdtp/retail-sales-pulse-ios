import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Grid3X3,
  List,
  Download,
  Search,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building,
  UserCheck,
  MoreHorizontal,
  Users
} from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/context/AuthContext';
import { User as UserType } from '@/types/user';
import OrganizationChart from '@/components/organization/OrganizationChart';

const Employees = () => {
  const { users, teams, currentUser } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'hanoi' | 'hcm'>('all');
  const [selectedRole, setSelectedRole] = useState<'all' | 'retail_director' | 'team_leader' | 'employee'>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEmployee, setSelectedEmployee] = useState<UserType | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Permissions check
  const canManageEmployees = currentUser?.name === 'Khổng Đức Mạnh' || currentUser?.role === 'team_leader';

  // Advanced filtering with useMemo for performance
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Location filter
      if (selectedLocation !== 'all') {
        if (selectedLocation === 'hanoi') {
          if (!(user.location === 'Hà Nội' || user.location === 'hanoi')) return false;
        } else if (selectedLocation === 'hcm') {
          if (!(user.location === 'Hồ Chí Minh' || user.location === 'hcm')) return false;
        } else {
          if (user.location !== selectedLocation) return false;
        }
      }

      // Role filter
      if (selectedRole !== 'all' && user.role !== selectedRole) return false;

      // Team filter
      if (selectedTeam !== 'all' && user.team_id !== selectedTeam) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.position && user.position.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [users, selectedLocation, selectedRole, selectedTeam, searchTerm]);

  // Tìm tên nhóm theo team_id
  const getTeamName = (teamId: string) => {
    if (teamId === '0' || !teamId) return 'Chưa có nhóm';
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : 'Chưa có nhóm';
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'retail_director':
        return 'Trưởng phòng';
      case 'team_leader':
        return 'Trưởng nhóm';
      case 'employee':
        return 'Nhân viên';
      default:
        return role;
    }
  };

  const getLocationName = (location: string) => {
    if (location === 'hanoi' || location === 'Hà Nội') return 'Hà Nội';
    if (location === 'hcm' || location === 'Hồ Chí Minh') return 'Hồ Chí Minh';
    return location;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Tạm nghỉ';
      default: return 'Không xác định';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'retail_director': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'team_leader': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employee': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEmployeeAction = (employee: UserType, action: 'view' | 'edit' | 'contact') => {
    switch (action) {
      case 'view':
      case 'edit':
        setSelectedEmployee(employee);
        setShowDetailModal(true);
        break;
      case 'contact':
        if (employee.email) {
          window.open(`mailto:${employee.email}`, '_blank');
        }
        break;
    }
  };

  const handleExportData = () => {
    const exportData = filteredUsers.map(user => ({
      name: user.name,
      email: user.email,
      role: getRoleName(user.role),
      team: getTeamName(user.team_id || ''),
      location: getLocationName(user.location),
      status: getStatusText(user.status)
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `employees-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Quản lý nhân viên"
        subtitle={`${filteredUsers.length} nhân viên trong hệ thống`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Xuất dữ liệu
            </Button>
            {canManageEmployees && (
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm nhân viên
              </Button>
            )}
          </div>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Statistics Cards */}
        {/* <EmployeeStatsCards users={users} teams={teams} /> */}

        {/* Filters and Search */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={(value: any) => setSelectedLocation(value)}>
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
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
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
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
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
            </div>

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{filteredUsers.length} nhân viên</span>
                {filteredUsers.filter(u => u.role === 'retail_director').length > 0 && (
                  <span className="text-purple-600">• {filteredUsers.filter(u => u.role === 'retail_director').length} trưởng phòng</span>
                )}
                {filteredUsers.filter(u => u.role === 'team_leader').length > 0 && (
                  <span className="text-blue-600">• {filteredUsers.filter(u => u.role === 'team_leader').length} trưởng nhóm</span>
                )}
                {filteredUsers.filter(u => u.role === 'employee').length > 0 && (
                  <span className="text-gray-600">• {filteredUsers.filter(u => u.role === 'employee').length} nhân viên</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Organizational Chart Display */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cấu trúc tổ chức</h2>
              <p className="text-gray-600">Sơ đồ tổ chức phòng kinh doanh bán lẻ</p>
            </div>

            {filteredUsers.length > 0 ? (
              <OrganizationChart
                users={filteredUsers}
                teams={teams}
                onEmployeeAction={handleEmployeeAction}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Không có nhân viên nào phù hợp với bộ lọc</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy nhân viên</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedLocation !== 'all' || selectedRole !== 'all' || selectedTeam !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Chưa có nhân viên nào trong hệ thống'}
              </p>
              {canManageEmployees && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm nhân viên đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Employee Detail Modal */}
        {/* <EmployeeDetailModal
          employee={selectedEmployee}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmployee(null);
          }}
          canEdit={canManageEmployees}
        /> */}
      </div>
    </AppLayout>
  );
};

export default Employees;
