import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Customer, CUSTOMER_TYPE_LABELS } from '@/types/customer';
import { customerService } from '@/services/CustomerService';
import { Plus, User, Phone, RefreshCw, Loader2 } from 'lucide-react';

interface CustomerSelectorProps {
  value?: string;
  onValueChange: (customerId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
  onCreateNew?: () => void;
  className?: string;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Chọn khách hàng",
  disabled = false,
  allowEmpty = true,
  onCreateNew,
  className = "",
}) => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Load accessible customers
  const loadCustomers = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const accessibleCustomers = await customerService.getAccessibleCustomers(currentUser);
      setCustomers(accessibleCustomers);
      
      // Find selected customer if value is provided
      if (value) {
        const customer = accessibleCustomers.find(c => c.id === value);
        setSelectedCustomer(customer || null);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (value && customers.length > 0) {
      const customer = customers.find(c => c.id === value);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [value, customers]);

  const handleValueChange = (customerId: string) => {
    if (customerId === 'empty' && allowEmpty) {
      onValueChange(undefined);
      setSelectedCustomer(null);
    } else {
      onValueChange(customerId);
      const customer = customers.find(c => c.id === customerId);
      setSelectedCustomer(customer || null);
    }
  };

  const handleRefresh = () => {
    loadCustomers();
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Select disabled>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tải...</span>
            </div>
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Select
          value={value || (allowEmpty ? 'empty' : '')}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {allowEmpty && (
              <SelectItem value="empty">
                <span className="text-gray-500">-- Không chọn khách hàng --</span>
              </SelectItem>
            )}
            
            {customers.length === 0 ? (
              <SelectItem value="no-customers" disabled>
                <span className="text-gray-500">Chưa có khách hàng nào</span>
              </SelectItem>
            ) : (
              customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex items-center gap-2 w-full">
                    <User className="w-4 h-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{customer.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {CUSTOMER_TYPE_LABELS[customer.type]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={disabled || isLoading}
          className="px-3"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        {onCreateNew && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCreateNew}
            disabled={disabled}
            className="px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Selected Customer Info */}
      {selectedCustomer && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-blue-900">{selectedCustomer.name}</h4>
                <Badge variant="outline" className="bg-white">
                  {CUSTOMER_TYPE_LABELS[selectedCustomer.type]}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                
                {selectedCustomer.address && (
                  <div className="flex items-start gap-2">
                    <span>📍</span>
                    <span className="line-clamp-2">{selectedCustomer.address}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-1 border-t border-blue-200">
                  <span>👤</span>
                  <span>Phụ trách: {selectedCustomer.assignedToName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No customers message */}
      {customers.length === 0 && !isLoading && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Chưa có khách hàng nào có thể truy cập
          </p>
          {onCreateNew && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreateNew}
              disabled={disabled}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo khách hàng mới
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
