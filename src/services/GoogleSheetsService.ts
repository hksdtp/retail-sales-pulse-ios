
// Service để xử lý kết nối và lưu dữ liệu vào Google Sheets
import { mockTasks } from '@/data/mockTasks';
import { Task } from '@/components/tasks/types/TaskTypes';

// Định nghĩa lại Task để sử dụng trong service
export interface TaskData {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  date: string;
  time?: string;
  progress: number;
  user_id?: string;
  user_name?: string;
  isNew?: boolean;
  teamId?: string;
  team_id?: string;
  assignedTo?: string;
  location?: string;
  created_at: string;
}

class GoogleSheetsService {
  private serviceAccountString: string | null = null; 
  private sheetId: string | null = null;
  private accessToken: string | null = null; // Thêm token truy cập
  private tokenExpiry: number = 0; // Thời gian hết hạn của token
  private appScriptUrl: string = "https://script.google.com/macros/s/AKfycbxyy6s0Zoel6ZTfSoS21VnntyQ4JJ0ze4xfjeczj7xKsm3E4Hf5idY92agyvWti6_kq/exec"; // URL Apps Script

  constructor() {
    // Lấy thông tin từ localStorage nếu đã được lưu trước đó
    this.serviceAccountString = localStorage.getItem('googleServiceAccount');
    this.sheetId = localStorage.getItem('googleSheetId');
    
    // Tự động cấu hình nếu chưa được thiết lập
    if (!this.isConfigured()) {
      this.applyDefaultConfig();
    }
  }
  
  // Hàm tự động áp dụng cấu hình mặc định
  private applyDefaultConfig() {
    const defaultSheetId = "1EdU2yxddERUV0QBCApGpsyobxnC4N4J4l-5sH4chUZQ";
    const defaultServiceAccount = JSON.stringify({
      "type": "service_account",
      "project_id": "qlct-anh",
      "private_key_id": "63a25b14c1ee491a40a3e902b24bbe6c2f087195",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC536hqxOxUoocW\n216U4Lda8FLlE0cV8qtpGX8B/a+BTGm1QXimeFWVioVKDCH5/MDomyCn2Z0A9O+J\nXr/qq2CqmG2uggBNZXcMFeYXmo0ELHogcYcAo44JCMaKmNFC4Ek9Sq2miUPuNGwm\ntS9SjOk5d21e4NTy/e01OOv9qGEJnXYS2mji4C+6p1wvAhseI9NTpU4bMxXeubVL\nnzJlalGQisEHlFF8cpxcDbqjqy3w7lzvhFaky4/6jPBAHQwjdjoN09Q0KsFhr7gH\nH1ekXCKCKV7BvP/jT0KnZrjcfyuwqgsftn79uXP40buMGGa8IyqNSSZvBEMwu9ro\nCMMjzaSPAgMBAAECggEADOvGUMqPRZoZJ/abjl/jGLhCGvIj6+h3QywZjyR43qHw\nOA05rnpvZwc+ssh0u2SqbsELgrLDxLBCNcHXarnIU4Bn7eY6afO9IQlYrTItZ8MS\nJ+hpPE5Vh/BxoZ4NiS3/b8cdzfwWzWiDG1tXBp1zDQkHTYqPL+eE/0EnIcMvU7RD\nnfw03nTNCGUnVcQcbNM//K+wRyQGms2tn3PaJNzobfUW1g4lFD7daB+hXPv8sw+P\nN+BWbWLXYtKD+Ti4gmue8gj0s07e9sfv+GbPkbbwqczvKfQbU6MYg+HlXPGC8mXs\nN8oIAfh58ZQRsGkdy35F3FF9rCXZZj5GaH9BJoKQKQKBgQD9o6HdiqhAjWXUG4AX\nNhcN+bIApVHKanXzMbUpcUZliGAS7HrwoK7LXRt9hu+XLfT6x8ZTjM0UQdLaYyc5\nPQEscPzMf8TWmBpe6M7NKxmVEs4DJ3+59WRQFIVTB93sleoIPMlnrbirLY/fSAVf\nvhSJ8ataFmtAsn8DfgtekukAGwKBgQC7mo4N7njmCkhkEqPSKFRWI7iEM4AHfmiH\nYmXWbjWJ5PM4BuHdPu+WTFq6ix6Mu/gki1EvQ9ewmEO+vDTJDCTBrsgy8k/rZDIm\nORjJ6zM/Ousk6VH1ZeL7cS0B37TuX2yTioWefPaYjjtfPsfdTB2LGRiZ2YSdbpnQ\nZD5TZUr8nQKBgQCL09uTWK41z247YIVH65VIiuFJb9U6QKaKWfXLiGNRPxtlJAQO0oziulBZf72qaaO/\nITPGhctqrWK49DBntSxkS/CdwGt+6DRUtvPZ8/tDYpfG8DyNKn6uqKFCJ0oE7YzQ\nv0tuYHewJzrrd7CiKcxPU8o5SZ4FdV0hrMWjhPkKJQKBgHsmdEAVRbcyKc0Svo/x\n+c5NyGcLTv1UQ+AJq0+fOAhBGBGQ+O8M96VWx6oqJYrBKenVdgkyPM/XkS7J4Yrw\nEw5rH3KMDOOdhnc2q7kHjRHGtavKS8bvMhjXW1ON92nkR6I4GlmHu2xKhU5JbyJs\n4qohFC09b3hwOTesRvQ3MBYY\n-----END PRIVATE KEY-----\n",
      "client_email": "qlphongsale@qlct-anh.iam.gserviceaccount.com",
      "client_id": "106723385830446641620",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/qlphongsale%40qlct-anh.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    });
    
    // Lưu vào localStorage và biến cục bộ
    this.setConfig(defaultSheetId, defaultServiceAccount);
    console.log("Đã áp dụng cấu hình Google Sheets mặc định");
  }

  // Thiết lập thông tin cấu hình Google Sheets
  setConfig(sheetId: string, serviceAccountJson: string) {
    try {
      // Kiểm tra xem chuỗi JSON có hợp lệ không
      JSON.parse(serviceAccountJson);
      
      this.sheetId = sheetId;
      this.serviceAccountString = serviceAccountJson;
      
      // Lưu vào localStorage để sử dụng cho các lần sau
      localStorage.setItem('googleSheetId', sheetId);
      localStorage.setItem('googleServiceAccount', serviceAccountJson);
      
      return true;
    } catch (error) {
      console.error("Service Account JSON không hợp lệ:", error);
      throw new Error("Service Account JSON không hợp lệ");
    }
  }

  // Kiểm tra đã cấu hình chưa
  isConfigured() {
    return !!(this.sheetId && this.serviceAccountString);
  }

  // Lấy thông tin cấu hình
  getConfig() {
    return {
      sheetId: this.sheetId,
      serviceAccountJson: this.serviceAccountString
    };
  }

  // Lấy token truy cập sử dụng Service Account - Phương pháp thay thế
  private async getAccessToken(): Promise<string> {
    try {
      // Nếu chưa có cấu hình Service Account
      if (!this.serviceAccountString || !this.sheetId) {
        throw new Error('Service Account chưa được cấu hình');
      }

      // Nếu đã có token và còn hiệu lực, trả về token đó
      if (this.accessToken && this.tokenExpiry > Date.now()) {
        return this.accessToken;
      }
      
      console.log("Bắt đầu lấy token xác thực...");
      
      // Không thể trực tiếp sử dụng Web Crypto API với Service Account trên trình duyệt
      // Sử dụng phương pháp thay thế - gọi một API endpoint riêng hoặc sử dụng thư viện phía máy chủ
      
      // Phương pháp thay thế: Sử dụng API trung gian hoặc mô phỏng xác thực
      // Trong trường hợp này, chúng ta sẽ tạo một token giả lập để demo
      const mockToken = "mocked_access_token_for_development_only";
      this.accessToken = mockToken;
      this.tokenExpiry = Date.now() + 3600 * 1000; // Giả lập token có hạn 1 giờ
      
      console.log("Đã tạo token giả lập thành công");
      return this.accessToken;
      
    } catch (error) {
      console.error('Lỗi khi lấy access token:', error);
      throw error;
    }
  }

  // Lưu dữ liệu công việc vào Google Sheets
  async saveTask(taskData: Record<string, string | number | boolean | undefined | null | object>) {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets chưa được cấu hình');
    }

    try {
      console.log("Bắt đầu lưu dữ liệu công việc...");
      
      // Chuẩn bị dữ liệu để lưu vào Google Sheets
      const formattedData = this.formatTaskDataForSheets(taskData);
      
      // Tạo một id duy nhất cho công việc nếu chưa có
      if (!taskData.id) {
        taskData.id = `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      }
      
      // Gọi đến Google Apps Script Web App URL
      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'save');
      url.searchParams.append('data', JSON.stringify(taskData));
      
      console.log('Gọi đến URL Apps Script:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Kết nối đến Apps Script thất bại: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Lỗi không xác định từ Apps Script');
      }
      
      console.log('Dữ liệu đã được lưu thành công:', result);
      
      // Trả về kết quả từ Apps Script
      return result;
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu vào Google Sheets:', error);
      throw error;
    }
  }
  
  // Cập nhật dữ liệu công việc trong Google Sheets
  async updateTask(taskData: Record<string, string | number | boolean | undefined | null | object>) {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets chưa được cấu hình');
    }

    try {
      console.log("Bắt đầu cập nhật dữ liệu công việc...");
      
      // Gọi đến Google Apps Script Web App URL
      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'update');
      url.searchParams.append('data', JSON.stringify(taskData));
      
      console.log('Gọi đến URL Apps Script để cập nhật:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Kết nối đến Apps Script thất bại: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Lỗi không xác định từ Apps Script');
      }
      
      console.log('Dữ liệu đã được cập nhật thành công:', result);
      
      return result;
    } catch (error) {
      console.error('Lỗi khi cập nhật dữ liệu vào Google Sheets:', error);
      throw error;
    }
  }
  
  // Xóa dữ liệu công việc trong Google Sheets
  async deleteTask(taskId: string) {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets chưa được cấu hình');
    }

    try {
      console.log("Bắt đầu xóa dữ liệu công việc...");
      
      // Gọi đến Google Apps Script Web App URL
      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'delete');
      url.searchParams.append('id', taskId);
      
      console.log('Gọi đến URL Apps Script để xóa:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Kết nối đến Apps Script thất bại: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Lỗi không xác định từ Apps Script');
      }
      
      console.log('Dữ liệu đã được xóa thành công:', result);
      
      return result;
    } catch (error) {
      console.error('Lỗi khi xóa dữ liệu từ Google Sheets:', error);
      throw error;
    }
  }

  // Lấy danh sách công việc từ Google Sheets
  async getTasks(): Promise<Task[]> {
    try {
      // Gọi đến Google Apps Script Web App URL
      const url = new URL(this.appScriptUrl);
      url.searchParams.append('action', 'getTasks');
      url.searchParams.append('sheetId', this.sheetId || '');
      
      // Thêm chi tiết logs để debug
      console.log('%c[CONFIG INFO]', 'background: #4ecdc4; color: #fff;', {
        appScriptUrl: this.appScriptUrl,
        sheetId: this.sheetId,
        isConfigured: this.isConfigured(),
        requestUrl: url.toString()
      });
      
      console.log('%c[Đồng bộ dữ liệu]', 'background: #4ecdc4; color: #fff; padding: 2px 5px; border-radius: 3px;', 'Đang gọi API để lấy danh sách công việc:', url.toString());
      
      // Sử dụng fetch với cấu hình CORS đầy đủ
      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Log chi tiết về response
      console.log('%c[Response Status]', 'background: #4ecdc4; color: #fff;', {
        status: response.status,
        statusText: response.statusText,
        headers: [...response.headers],
        type: response.type
      });
      
      if (!response.ok) {
        console.error('%cAPI Response not OK', 'background: red; color: white;', `Status: ${response.status}`);
        const errorText = await response.text();
        console.log('Response details:', errorText);
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('%cAPI Raw Response', 'background: #6c5ce7; color: white;', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('%cJSON Parse Error', 'background: red; color: white;', parseError);
        console.log('Failed to parse response:', responseText);
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
      
      // Kiểm tra kết quả từ API
      if (!result.success) {
        console.error('%cAPI Error', 'background: red; color: white;', result.message || 'Không có dữ liệu trả về');
        throw new Error(`API error: ${result.message || 'Không có dữ liệu trả về'}`);
      }
      
      // Xử lý dữ liệu trả về
      console.log('%cAPI Success', 'background: green; color: white;', 'Dữ liệu trả về:', result);
      
      const tasks = result.data || [];
      console.log('%cTasks Fetched', 'background: #4ecdc4; color: white;', `Số lượng công việc: ${tasks.length}`);
      
      if (tasks.length > 0) {
        console.log('Công việc đầu tiên:', tasks[0]);
        // Transform dữ liệu nếu cần
        const transformedTasks = tasks.map(task => ({
          ...task,
          // Đảm bảo task có đủ các trường cần thiết
          id: task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          progress: task.progress || 0,
          isNew: false
        }));
        return transformedTasks;
      } else {
        console.warn('%cNo Tasks', 'background: orange; color: black;', 'Không có công việc nào được trả về');
        throw new Error('Không có dữ liệu công việc trả về');
      }
    } catch (error) {
      // Hiển thị thông tin lỗi chi tiết hơn
      console.error('%c[LỖI]', 'background: red; color: white; padding: 2px 5px; border-radius: 3px;', 'Lỗi khi lấy dữ liệu từ Google Sheets:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        error
      });
      
      // Sử dụng các công việc mẫu từ file mockTasks.ts
      console.log('%c[Sử dụng dữ liệu mẫu]', 'background: orange; color: black;', 'Đang sử dụng dữ liệu mẫu để khắc phục lỗi tạm thời');
      return mockTasks as Task[];
    }
  }

  // Chuyển đổi loại công việc sang tiếng Việt
  private translateTaskType(type: string): string {
    if (!type) return '';
    
    const typeMap: Record<string, string> = {
      'partner_new': 'Đối tác mới',
      'partner_old': 'Đối tác cũ',
      'architect_new': 'KTS mới',
      'architect_old': 'KTS cũ',
      'client_new': 'Khách hàng mới',
      'client_old': 'Khách hàng cũ',
      'quote_new': 'Báo giá mới',
      'quote_old': 'Báo giá cũ',
      'other': 'Khác'
    };
    
    return typeMap[type] || type;
  }

  // Chuyển đổi trạng thái công việc sang tiếng Việt
  private translateTaskStatus(status: string): string {
    if (!status) return '';
    
    const statusMap: Record<string, string> = {
      'todo': 'Chưa bắt đầu',
      'in-progress': 'Đang thực hiện',
      'on-hold': 'Đang chờ',
      'completed': 'Hoàn thành'
    };
    
    return statusMap[status] || status;
  }

  // Chuyển đổi khu vực sang tiếng Việt
  private translateLocation(location: string): string {
    if (!location) return '';
    
    const locationMap: Record<string, string> = {
      'north': 'Miền Bắc',
      'central': 'Miền Trung',
      'south': 'Miền Nam',
      'nationwide': 'Toàn Quốc'
    };
    
    return locationMap[location] || location;
  }

  // Chuyển đổi dữ liệu task sang định dạng phù hợp để lưu vào Google Sheets
  private formatTaskDataForSheets(taskData: Record<string, unknown>): Record<string, string | number | boolean> {
    // Hàm hỗ trợ để convert các trường
    const getStringValue = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      return String(value);
    };
    
    const getNumberValue = (value: unknown): number => {
      if (typeof value === 'number') return value;
      return 0;
    };
    
    const formattedData: Record<string, string | number | boolean> = {
      id: getStringValue(taskData.id),
      title: getStringValue(taskData.title),
      description: getStringValue(taskData.description),
      type: getStringValue(taskData.type),
      status: getStringValue(taskData.status),
      date: getStringValue(taskData.date),
      time: getStringValue(taskData.time),
      progress: getNumberValue(taskData.progress),
      user_id: getStringValue(taskData.user_id),
      user_name: getStringValue(taskData.user_name),
      location: getStringValue(taskData.location),
      team_id: getStringValue(taskData.team_id || taskData.teamId),
      assignedTo: getStringValue(taskData.assignedTo),
      created_at: getStringValue(taskData.created_at) || new Date().toISOString()
    };
    
    return formattedData;
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
