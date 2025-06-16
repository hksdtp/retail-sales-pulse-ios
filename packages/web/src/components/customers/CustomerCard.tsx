import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Customer, CUSTOMER_TYPE_LABELS } from '@/types/customer';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CustomerCardProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  className?: string;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  className = '',
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'architect':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {customer.name}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className={getTypeColor(customer.type)}
              >
                {CUSTOMER_TYPE_LABELS[customer.type]}
              </Badge>
              
              <Badge 
                variant="outline" 
                className={getStatusColor(customer.status)}
              >
                {customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
              </Badge>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <div className="flex gap-1 ml-2">
              {canEdit && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(customer)}
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </Button>
              )}
              
              {canDelete && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(customer)}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900 font-medium">{customer.phone}</span>
            </div>
            
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{customer.email}</span>
              </div>
            )}
            
            {customer.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="text-gray-600 line-clamp-2">{customer.address}</span>
              </div>
            )}
          </div>

          {/* Assignment Info */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                Phụ trách: <span className="font-medium text-gray-900">{customer.assignedToName}</span>
              </span>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-3">
                <span className="font-medium">Ghi chú:</span> {customer.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Tạo: {formatDate(customer.createdAt)}</span>
              </div>
              
              {customer.createdByName && (
                <span>bởi {customer.createdByName}</span>
              )}
            </div>
            
            {customer.updatedAt && customer.updatedAt !== customer.createdAt && (
              <div className="mt-1 text-right">
                <span>Cập nhật: {formatDate(customer.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
