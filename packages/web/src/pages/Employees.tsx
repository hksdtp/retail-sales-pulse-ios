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
import EmployeeDetailModal from '@/components/employees/EmployeeDetailModal';
import EmployeeSearchFilters from '@/components/employees/EmployeeSearchFilters';
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
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={handleExportData} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Xuất dữ liệu</span>
              <span className="sm:hidden">Xuất</span>
            </Button>
            {canManageEmployees && (
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Thêm nhân viên</span>
                <span className="sm:hidden">Thêm</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Statistics Cards */}
        {/* <EmployeeStatsCards users={users} teams={teams} /> */}

        {/* Filters and Search */}
        <EmployeeSearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedLocation={selectedLocation}
          onLocationChange={(value: any) => setSelectedLocation(value)}
          selectedRole={selectedRole}
          onRoleChange={(value: any) => setSelectedRole(value)}
          selectedTeam={selectedTeam}
          onTeamChange={setSelectedTeam}
          teams={teams}
          users={users}
          resultCount={filteredUsers.length}
          totalCount={users.length}
          onExport={handleExportData}
          canExport={canManageEmployees}
        />
        {/* Organizational Chart Display */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg">
          <CardContent className="p-4 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Cấu trúc tổ chức</h2>
              <p className="text-sm md:text-base text-gray-600">Sơ đồ tổ chức phòng kinh doanh bán lẻ</p>
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
            <CardContent className="p-6 md:p-12 text-center">
              <div className="text-4xl md:text-6xl mb-4">👥</div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">Không tìm thấy nhân viên</h3>
              <p className="text-sm md:text-base text-gray-500 mb-4">
                {searchTerm || selectedLocation !== 'all' || selectedRole !== 'all' || selectedTeam !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Chưa có nhân viên nào trong hệ thống'}
              </p>
              {canManageEmployees && (
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm nhân viên đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Employee Detail Modal */}
        <EmployeeDetailModal
          employee={selectedEmployee}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmployee(null);
          }}
          canEdit={canManageEmployees}
        />
      </div>
    </AppLayout>
  );
};

export default Employees;
