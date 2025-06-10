import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  UserCheck, 
  Shield 
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/user';

interface EmployeeCardProps {
  employee: User;
  index: number;
  onAction: (employee: User, action: 'view' | 'edit' | 'contact') => void;
  canEdit: boolean;
  getTeamName: (teamId?: string) => string;
  getRoleName: (role: string) => string;
  getRoleColor: (role: string) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getLocationName: (location: string) => string;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  index,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <Avatar className="w-16 h-16 mb-4 ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Name and Role */}
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{employee.name}</h3>
            <Badge className={`${getRoleColor(employee.role)} mb-3`}>
              <Shield className="w-3 h-3 mr-1" />
              {getRoleName(employee.role)}
            </Badge>

            {/* Info */}
            <div className="space-y-2 w-full text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Building className="w-4 h-4" />
                <span>{getTeamName(employee.team_id)}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{getLocationName(employee.location)}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="truncate">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="mt-4 w-full">
              <Badge className={`${getStatusColor(employee.status)} w-full justify-center`}>
                <UserCheck className="w-3 h-3 mr-1" />
                {getStatusText(employee.status)}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => onAction(employee, 'view')}
              >
                <Eye className="w-4 h-4 mr-1" />
                Xem
              </Button>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-green-50 hover:border-green-300"
                  onClick={() => onAction(employee, 'edit')}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Sửa
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-purple-50 hover:border-purple-300"
                onClick={() => onAction(employee, 'contact')}
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>

            {/* Additional Info on Hover */}
            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {employee.position && (
                <p className="text-xs text-gray-500 italic">
                  {employee.position}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmployeeCard;
