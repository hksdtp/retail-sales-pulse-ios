import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar, 
  Edit, 
  Save,
  UserCheck,
  Shield,
  Users,
  Star
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User as UserType } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import { getTeamsWithLeaderNames } from '@/utils/teamUtils';

interface EmployeeDetailModalProps {
  employee: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ 
  employee, 
  isOpen, 
  onClose, 
  canEdit 
}) => {
  const { teams, users, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Lấy teams với tên trưởng nhóm
  const teamsWithLeaders = getTeamsWithLeaderNames(teams, users);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        role: employee.role,
        location: employee.location,
        team_id: employee.team_id,
        status: employee.status
      });
    }
  }, [employee]);

  if (!employee) return null;

  const getRoleName = (role: string) => {
    switch (role) {
      case 'retail_director': return 'Trưởng phòng';
      case 'team_leader': return 'Trưởng nhóm';
      case 'employee': return 'Nhân viên';
      default: return role;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId || teamId === '0') return 'Chưa có nhóm';
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Chưa có nhóm';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!employee.id) return;

    setIsLoading(true);
    try {
      await updateUser({
        ...employee,
        ...formData
      });
      setIsEditing(false);
      console.log('✅ Employee updated successfully');
    } catch (error) {
      console.error('❌ Error updating employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      role: employee.role,
      location: employee.location,
      team_id: employee.team_id,
      status: employee.status
    });
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{employee.name}</h2>
                  <p className="text-gray-600">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canEdit && !isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Họ và tên</Label>
                    {isEditing ? (
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 font-medium">{employee.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{employee.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Số điện thoại</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{employee.phone || 'Chưa cập nhật'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Chức vụ</Label>
                    {isEditing ? (
                      <Input
                        value={formData.position || ''}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        className="mt-1"
                        placeholder="Nhập chức vụ"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{employee.position || 'Chưa cập nhật'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Vai trò</Label>
                    {isEditing ? (
                      <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail_director">Trưởng phòng</SelectItem>
                          <SelectItem value="team_leader">Trưởng nhóm</SelectItem>
                          <SelectItem value="employee">Nhân viên</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <Badge className={getRoleColor(employee.role)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {getRoleName(employee.role)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Địa điểm</Label>
                    {isEditing ? (
                      <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                          <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{employee.location}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nhóm</Label>
                    {isEditing ? (
                      <Select value={formData.team_id} onValueChange={(value) => handleInputChange('team_id', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Chưa có nhóm</SelectItem>
                          {teamsWithLeaders.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{getTeamName(employee.team_id)}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                    {isEditing ? (
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <Badge className={getStatusColor(employee.status)}>
                          <UserCheck className="w-3 h-3 mr-1" />
                          {employee.status === 'active' ? 'Hoạt động' : 'Tạm nghỉ'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EmployeeDetailModal;
