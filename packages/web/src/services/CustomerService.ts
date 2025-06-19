import { FirebaseService } from './FirebaseService';
import { Customer, CustomerFormData, CustomerFilters, CustomerPermissions } from '@/types/customer';
import { User } from '@/types/user';
import { isAdmin, isDirector, isTeamLeader } from '@/config/permissions';

export class CustomerService {
  private static instance: CustomerService;
  private firebaseService: FirebaseService;

  private constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  public static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService();
    }
    return CustomerService.instance;
  }

  /**
   * Tạo khách hàng mới
   */
  async createCustomer(customerData: CustomerFormData, currentUser: User): Promise<Customer | null> {
    try {
      console.log('🔍 Creating customer with data:', customerData);
      console.log('🔍 Current user:', currentUser);
      console.log('🔍 Current user ID:', currentUser?.id);

      // Validate currentUser
      if (!currentUser || !currentUser.id) {
        throw new Error('Invalid currentUser or missing ID');
      }

      const now = new Date().toISOString();

      // Clean data - remove undefined values
      const cleanedData = {
        name: customerData.name,
        type: customerData.type,
        phone: customerData.phone,
        email: customerData.email || '', // Ensure email is never undefined
        address: customerData.address || '',
        notes: customerData.notes || '',
        assignedTo: customerData.assignedTo || currentUser.id,
      };

      const customer: Omit<Customer, 'id'> = {
        ...cleanedData,
        assignedToName: customerData.assignedTo ?
          await this.getUserName(customerData.assignedTo) : currentUser.name,
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        createdAt: now,
        updatedAt: now,
        teamId: currentUser.team_id || '',
        location: currentUser.location || '',
        status: 'active',
      };

      const customerId = await this.firebaseService.addDocument('customers', customer);
      
      if (customerId) {
        const newCustomer: Customer = {
          ...customer,
          id: customerId,
        };

        console.log('✅ Customer created successfully:', newCustomer.name);
        return newCustomer;
      }

      return null;
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin khách hàng
   */
  async updateCustomer(customerId: string, customerData: Partial<CustomerFormData>, currentUser: User): Promise<boolean> {
    try {
      // Clean data - remove undefined values
      const cleanedData = {
        name: customerData.name,
        type: customerData.type,
        phone: customerData.phone,
        email: customerData.email || '', // Ensure email is never undefined
        address: customerData.address || '',
        notes: customerData.notes || '',
        assignedTo: customerData.assignedTo || currentUser.id,
      };

      const updateData: any = {
        ...cleanedData,
        updatedAt: new Date().toISOString(),
      };

      // Cập nhật tên người phụ trách nếu có thay đổi assignedTo
      if (customerData.assignedTo) {
        updateData.assignedToName = await this.getUserName(customerData.assignedTo);
      }

      const success = await this.firebaseService.updateDocument('customers', customerId, updateData);
      
      if (success) {
        console.log('✅ Customer updated successfully:', customerId);
      }

      return success;
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Xóa khách hàng
   */
  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      const success = await this.firebaseService.deleteDocument('customers', customerId);
      
      if (success) {
        console.log('✅ Customer deleted successfully:', customerId);
      }

      return success;
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách khách hàng theo phân quyền
   */
  async getCustomers(currentUser: User, filters?: CustomerFilters): Promise<Customer[]> {
    try {
      const permissions = this.getCustomerPermissions(currentUser);
      let customers = await this.firebaseService.getDocuments('customers') as Customer[];

      // Áp dụng phân quyền
      customers = this.filterCustomersByPermissions(customers, currentUser, permissions);

      // Áp dụng filters
      if (filters) {
        customers = this.applyFilters(customers, filters);
      }

      return customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('❌ Error getting customers:', error);
      return [];
    }
  }

  /**
   * Lấy khách hàng theo ID
   */
  async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      const customers = await this.firebaseService.queryDocuments('customers', 'id', '==', customerId) as Customer[];
      return customers.length > 0 ? customers[0] : null;
    } catch (error) {
      console.error('❌ Error getting customer by ID:', error);
      return null;
    }
  }

  /**
   * Xác định quyền hạn của user đối với khách hàng
   */
  getCustomerPermissions(user: User): CustomerPermissions {
    const isUserAdmin = user.name === 'Khổng Đức Mạnh' || isAdmin(user.role);
    const isUserDirector = isDirector(user.role);
    const isUserTeamLeader = isTeamLeader(user.role);

    return {
      canViewAll: isUserAdmin,
      canViewTeam: isUserAdmin || isUserDirector || isUserTeamLeader,
      canViewPersonal: true,
      canCreate: true,
      canEdit: true,
      canDelete: isUserAdmin || isUserDirector,
      canAssign: isUserAdmin || isUserDirector || isUserTeamLeader,
    };
  }

  /**
   * Lọc khách hàng theo phân quyền
   */
  private filterCustomersByPermissions(customers: Customer[], user: User, permissions: CustomerPermissions): Customer[] {
    if (permissions.canViewAll) {
      return customers;
    }

    if (permissions.canViewTeam) {
      // Trưởng nhóm: xem khách hàng của nhóm mình + cá nhân
      return customers.filter(customer => 
        customer.teamId === user.team_id || 
        customer.assignedTo === user.id ||
        customer.createdBy === user.id
      );
    }

    // Nhân viên: chỉ xem khách hàng của mình
    return customers.filter(customer => 
      customer.assignedTo === user.id || 
      customer.createdBy === user.id
    );
  }

  /**
   * Áp dụng filters
   */
  private applyFilters(customers: Customer[], filters: CustomerFilters): Customer[] {
    let filtered = customers;

    if (filters.type) {
      filtered = filtered.filter(customer => customer.type === filters.type);
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(customer => customer.assignedTo === filters.assignedTo);
    }

    if (filters.teamId) {
      filtered = filtered.filter(customer => customer.teamId === filters.teamId);
    }

    if (filters.location) {
      filtered = filtered.filter(customer => customer.location === filters.location);
    }

    if (filters.status) {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.address?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  /**
   * Lấy tên user theo ID
   */
  private async getUserName(userId: string): Promise<string> {
    try {
      const users = await this.firebaseService.queryDocuments('users', 'id', '==', userId);
      return users.length > 0 ? users[0].name : 'Unknown User';
    } catch (error) {
      console.error('❌ Error getting user name:', error);
      return 'Unknown User';
    }
  }

  /**
   * Lấy khách hàng có thể truy cập cho dropdown
   */
  async getAccessibleCustomers(currentUser: User): Promise<Customer[]> {
    const customers = await this.getCustomers(currentUser);
    return customers.filter(customer => customer.status === 'active');
  }
}

export const customerService = CustomerService.getInstance();
