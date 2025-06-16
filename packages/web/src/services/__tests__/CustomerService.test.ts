import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerService } from '../CustomerService';
import { FirebaseService } from '../FirebaseService';
import { User } from '@/types/user';
import { Customer, CustomerFormData } from '@/types/customer';

// Mock FirebaseService
vi.mock('../FirebaseService', () => ({
  FirebaseService: {
    getInstance: vi.fn(() => ({
      addDocument: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn(),
      getDocuments: vi.fn(),
      queryDocuments: vi.fn(),
    })),
  },
}));

describe('CustomerService', () => {
  let customerService: CustomerService;
  let mockFirebaseService: any;
  let mockUser: User;

  beforeEach(() => {
    customerService = CustomerService.getInstance();
    mockFirebaseService = FirebaseService.getInstance();
    
    mockUser = {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'employee',
      location: 'hanoi',
      team_id: 'team1',
      status: 'active',
      password_changed: true,
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('getCustomerPermissions', () => {
    it('should return admin permissions for Khổng Đức Mạnh', () => {
      const adminUser: User = {
        ...mockUser,
        name: 'Khổng Đức Mạnh',
        role: 'retail_director',
      };

      const permissions = customerService.getCustomerPermissions(adminUser);

      expect(permissions.canViewAll).toBe(true);
      expect(permissions.canViewTeam).toBe(true);
      expect(permissions.canCreate).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canDelete).toBe(true);
      expect(permissions.canAssign).toBe(true);
    });

    it('should return team leader permissions', () => {
      const teamLeaderUser: User = {
        ...mockUser,
        role: 'team_leader',
      };

      const permissions = customerService.getCustomerPermissions(teamLeaderUser);

      expect(permissions.canViewAll).toBe(false);
      expect(permissions.canViewTeam).toBe(true);
      expect(permissions.canCreate).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canAssign).toBe(true);
    });

    it('should return employee permissions', () => {
      const permissions = customerService.getCustomerPermissions(mockUser);

      expect(permissions.canViewAll).toBe(false);
      expect(permissions.canViewTeam).toBe(false);
      expect(permissions.canViewPersonal).toBe(true);
      expect(permissions.canCreate).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canAssign).toBe(false);
    });
  });

  describe('createCustomer', () => {
    it('should create customer successfully', async () => {
      const customerData: CustomerFormData = {
        name: 'Test Customer',
        type: 'customer',
        phone: '0123456789',
        email: 'customer@example.com',
        address: 'Test Address',
        notes: 'Test notes',
      };

      const mockCustomerId = 'customer1';
      mockFirebaseService.addDocument.mockResolvedValue(mockCustomerId);

      const result = await customerService.createCustomer(customerData, mockUser);

      expect(mockFirebaseService.addDocument).toHaveBeenCalledWith('customers', expect.objectContaining({
        name: customerData.name,
        type: customerData.type,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        notes: customerData.notes,
        assignedTo: mockUser.id,
        createdBy: mockUser.id,
        createdByName: mockUser.name,
        teamId: mockUser.team_id,
        location: mockUser.location,
        status: 'active',
      }));

      expect(result).toEqual(expect.objectContaining({
        id: mockCustomerId,
        name: customerData.name,
        type: customerData.type,
        phone: customerData.phone,
      }));
    });

    it('should handle creation failure', async () => {
      const customerData: CustomerFormData = {
        name: 'Test Customer',
        type: 'customer',
        phone: '0123456789',
      };

      mockFirebaseService.addDocument.mockResolvedValue(null);

      const result = await customerService.createCustomer(customerData, mockUser);

      expect(result).toBeNull();
    });
  });

  describe('updateCustomer', () => {
    it('should update customer successfully', async () => {
      const customerId = 'customer1';
      const updateData: Partial<CustomerFormData> = {
        name: 'Updated Customer',
        phone: '0987654321',
      };

      mockFirebaseService.updateDocument.mockResolvedValue(true);

      const result = await customerService.updateCustomer(customerId, updateData, mockUser);

      expect(mockFirebaseService.updateDocument).toHaveBeenCalledWith('customers', customerId, expect.objectContaining({
        name: updateData.name,
        phone: updateData.phone,
        updatedAt: expect.any(String),
      }));

      expect(result).toBe(true);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer successfully', async () => {
      const customerId = 'customer1';
      mockFirebaseService.deleteDocument.mockResolvedValue(true);

      const result = await customerService.deleteCustomer(customerId);

      expect(mockFirebaseService.deleteDocument).toHaveBeenCalledWith('customers', customerId);
      expect(result).toBe(true);
    });
  });

  describe('getCustomers', () => {
    it('should return filtered customers for employee', async () => {
      const mockCustomers: Customer[] = [
        {
          id: 'customer1',
          name: 'Customer 1',
          type: 'customer',
          phone: '0123456789',
          assignedTo: mockUser.id,
          createdBy: mockUser.id,
          createdByName: mockUser.name,
          createdAt: '2024-01-01T00:00:00Z',
          teamId: mockUser.team_id,
          location: mockUser.location,
          status: 'active',
        },
        {
          id: 'customer2',
          name: 'Customer 2',
          type: 'customer',
          phone: '0987654321',
          assignedTo: 'other_user',
          createdBy: 'other_user',
          createdByName: 'Other User',
          createdAt: '2024-01-01T00:00:00Z',
          teamId: 'other_team',
          location: 'hcm',
          status: 'active',
        },
      ];

      mockFirebaseService.getDocuments.mockResolvedValue(mockCustomers);

      const result = await customerService.getCustomers(mockUser);

      // Employee should only see their own customers
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('customer1');
    });

    it('should return all customers for admin', async () => {
      const adminUser: User = {
        ...mockUser,
        name: 'Khổng Đức Mạnh',
        role: 'retail_director',
      };

      const mockCustomers: Customer[] = [
        {
          id: 'customer1',
          name: 'Customer 1',
          type: 'customer',
          phone: '0123456789',
          assignedTo: mockUser.id,
          createdBy: mockUser.id,
          createdByName: mockUser.name,
          createdAt: '2024-01-01T00:00:00Z',
          teamId: mockUser.team_id,
          location: mockUser.location,
          status: 'active',
        },
        {
          id: 'customer2',
          name: 'Customer 2',
          type: 'customer',
          phone: '0987654321',
          assignedTo: 'other_user',
          createdBy: 'other_user',
          createdByName: 'Other User',
          createdAt: '2024-01-01T00:00:00Z',
          teamId: 'other_team',
          location: 'hcm',
          status: 'active',
        },
      ];

      mockFirebaseService.getDocuments.mockResolvedValue(mockCustomers);

      const result = await customerService.getCustomers(adminUser);

      // Admin should see all customers
      expect(result).toHaveLength(2);
    });
  });
});
