import { Customer } from '@/types/customer';
import { User } from '@/types/user';

export class CustomerGoogleSheetsService {
  private static instance: CustomerGoogleSheetsService;
  private appScriptUrl: string = '';

  private constructor() {
    // Lấy URL từ localStorage hoặc environment
    this.appScriptUrl = localStorage.getItem('googleAppsScriptUrl') || '';
  }

  public static getInstance(): CustomerGoogleSheetsService {
    if (!CustomerGoogleSheetsService.instance) {
      CustomerGoogleSheetsService.instance = new CustomerGoogleSheetsService();
    }
    return CustomerGoogleSheetsService.instance;
  }

  /**
   * Kiểm tra xem service đã được cấu hình chưa
   */
  isConfigured(): boolean {
    return !!this.appScriptUrl;
  }

  /**
   * Cấu hình Google Apps Script URL
   */
  configure(appScriptUrl: string): void {
    this.appScriptUrl = appScriptUrl;
    localStorage.setItem('googleAppsScriptUrl', appScriptUrl);
  }

  /**
   * Lưu khách hàng vào Google Sheets của nhân viên
   */
  async saveCustomerToEmployeeSheet(customer: Customer, employee: User): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Google Sheets service chưa được cấu hình');
      return false;
    }

    try {
      console.log(`📊 Saving customer ${customer.name} to ${employee.name}'s sheet...`);

      const sheetData = this.formatCustomerForSheets(customer);
      
      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'saveCustomer');
      url.searchParams.append('employeeName', employee.name);
      url.searchParams.append('employeeId', employee.id);
      url.searchParams.append('data', JSON.stringify(sheetData));

      console.log('🔗 Calling Apps Script URL:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('✅ Customer saved to Google Sheets:', response);
      return true;
    } catch (error) {
      console.error('❌ Error saving customer to Google Sheets:', error);
      return false;
    }
  }

  /**
   * Cập nhật khách hàng trong Google Sheets
   */
  async updateCustomerInEmployeeSheet(customer: Customer, employee: User): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Google Sheets service chưa được cấu hình');
      return false;
    }

    try {
      console.log(`📊 Updating customer ${customer.name} in ${employee.name}'s sheet...`);

      const sheetData = this.formatCustomerForSheets(customer);
      
      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'updateCustomer');
      url.searchParams.append('employeeName', employee.name);
      url.searchParams.append('employeeId', employee.id);
      url.searchParams.append('customerId', customer.id);
      url.searchParams.append('data', JSON.stringify(sheetData));

      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('✅ Customer updated in Google Sheets:', response);
      return true;
    } catch (error) {
      console.error('❌ Error updating customer in Google Sheets:', error);
      return false;
    }
  }

  /**
   * Xóa khách hàng khỏi Google Sheets
   */
  async deleteCustomerFromEmployeeSheet(customerId: string, employee: User): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Google Sheets service chưa được cấu hình');
      return false;
    }

    try {
      console.log(`📊 Deleting customer ${customerId} from ${employee.name}'s sheet...`);

      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'deleteCustomer');
      url.searchParams.append('employeeName', employee.name);
      url.searchParams.append('employeeId', employee.id);
      url.searchParams.append('customerId', customerId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('✅ Customer deleted from Google Sheets:', response);
      return true;
    } catch (error) {
      console.error('❌ Error deleting customer from Google Sheets:', error);
      return false;
    }
  }

  /**
   * Tạo sheet mới cho nhân viên nếu chưa có
   */
  async createEmployeeCustomerSheet(employee: User): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Google Sheets service chưa được cấu hình');
      return false;
    }

    try {
      console.log(`📊 Creating customer sheet for ${employee.name}...`);

      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'createEmployeeSheet');
      url.searchParams.append('employeeName', employee.name);
      url.searchParams.append('employeeId', employee.id);

      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('✅ Employee customer sheet created:', response);
      return true;
    } catch (error) {
      console.error('❌ Error creating employee customer sheet:', error);
      return false;
    }
  }

  /**
   * Đồng bộ tất cả khách hàng của nhân viên lên Google Sheets
   */
  async syncEmployeeCustomers(customers: Customer[], employee: User): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Google Sheets service chưa được cấu hình');
      return false;
    }

    try {
      console.log(`📊 Syncing ${customers.length} customers for ${employee.name}...`);

      // Tạo sheet nếu chưa có
      await this.createEmployeeCustomerSheet(employee);

      // Chuẩn bị dữ liệu
      const sheetsData = customers.map(customer => this.formatCustomerForSheets(customer));

      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'syncEmployeeCustomers');
      url.searchParams.append('employeeName', employee.name);
      url.searchParams.append('employeeId', employee.id);
      url.searchParams.append('data', JSON.stringify(sheetsData));

      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('✅ Employee customers synced to Google Sheets:', response);
      return true;
    } catch (error) {
      console.error('❌ Error syncing employee customers:', error);
      return false;
    }
  }

  /**
   * Format customer data cho Google Sheets
   */
  private formatCustomerForSheets(customer: Customer): any {
    return {
      id: customer.id,
      name: customer.name,
      type: customer.type,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
      assignedTo: customer.assignedToName || '',
      createdBy: customer.createdByName || '',
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt || '',
      status: customer.status || 'active',
    };
  }

  /**
   * Lấy danh sách khách hàng từ Google Sheets của nhân viên
   */
  async getEmployeeCustomersFromSheets(employee: User): Promise<Customer[]> {
    if (!this.isConfigured()) {
      console.warn('Google Sheets service chưa được cấu hình');
      return [];
    }

    try {
      console.log(`📊 Getting customers from ${employee.name}'s sheet...`);

      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'getEmployeeCustomers');
      url.searchParams.append('employeeName', employee.name);
      url.searchParams.append('employeeId', employee.id);

      // Note: Với no-cors mode, không thể đọc response
      // Đây chỉ là placeholder cho việc gọi API
      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('📊 Called get employee customers API:', response);
      
      // Trong thực tế, cần implement CORS properly để đọc response
      // Hiện tại return empty array
      return [];
    } catch (error) {
      console.error('❌ Error getting employee customers from sheets:', error);
      return [];
    }
  }
}

export const customerGoogleSheetsService = CustomerGoogleSheetsService.getInstance();
