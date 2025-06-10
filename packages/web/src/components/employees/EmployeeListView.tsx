import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Eye, Edit, Mail, Phone } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types/user';

interface EmployeeListViewProps {
  employees: User[];
  onAction: (employee: User, action: 'view' | 'edit' | 'contact') => void;
  canEdit: boolean;
  getTeamName: (teamId?: string) => string;
  getRoleName: (role: string) => string;
  getRoleColor: (role: string) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getLocationName: (location: string) => string;
}

const EmployeeListView: React.FC<EmployeeListViewProps> = ({
  employees,
  onAction,
  canEdit,
  getTeamName,
  getRoleName,
  getRoleColor,
  getStatusColor,
  getStatusText,
  getLocationName
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">Nhân viên</th>
                <th className="text-left p-4 font-semibold text-gray-900">Vai trò</th>
                <th className="text-left p-4 font-semibold text-gray-900">Nhóm</th>
                <th className="text-left p-4 font-semibold text-gray-900">Địa điểm</th>
                <th className="text-left p-4 font-semibold text-gray-900">Trạng thái</th>
                <th className="text-left p-4 font-semibold text-gray-900">Liên hệ</th>
                <th className="text-left p-4 font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <motion.tr
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {/* Employee Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                        {employee.position && (
                          <p className="text-xs text-gray-400 italic">{employee.position}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-4">
                    <Badge className={getRoleColor(employee.role)}>
                      {getRoleName(employee.role)}
                    </Badge>
                  </td>

                  {/* Team */}
                  <td className="p-4 text-gray-700">{getTeamName(employee.team_id)}</td>

                  {/* Location */}
                  <td className="p-4 text-gray-700">{getLocationName(employee.location)}</td>

                  {/* Status */}
                  <td className="p-4">
                    <Badge className={getStatusColor(employee.status)}>
                      {getStatusText(employee.status)}
                    </Badge>
                  </td>

                  {/* Contact */}
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAction(employee, 'contact')}
                        className="hover:bg-blue-50"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      {employee.phone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`tel:${employee.phone}`, '_blank')}
                          className="hover:bg-green-50"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAction(employee, 'view')}>
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onAction(employee, 'edit')}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onAction(employee, 'contact')}>
                          <Mail className="w-4 h-4 mr-2" />
                          Gửi email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeListView;
