
// Service để xử lý kết nối và lưu dữ liệu vào Google Sheets

class GoogleSheetsService {
  private serviceAccountString: string | null = null; 
  private sheetId: string | null = null;
  private accessToken: string | null = null; // Thêm token truy cập
  private tokenExpiry: number = 0; // Thời gian hết hạn của token

  constructor() {
    // Lấy thông tin từ localStorage nếu đã được lưu trước đó
    this.serviceAccountString = localStorage.getItem('googleServiceAccount');
    this.sheetId = localStorage.getItem('googleSheetId');
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

  // Lấy token truy cập sử dụng Service Account
  private async getAccessToken(): Promise<string> {
    try {
      // Kiểm tra xem token hiện tại còn hiệu lực không
      if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
        return this.accessToken;
      }

      if (!this.serviceAccountString) {
        throw new Error('Service Account chưa được cấu hình');
      }

      // Parse thông tin Service Account
      const serviceAccount = JSON.parse(this.serviceAccountString);
      
      // Tạo JWT để yêu cầu access token
      const now = Math.floor(Date.now() / 1000);
      const expiry = now + 3600; // Token hết hạn sau 1 giờ
      
      const jwtHeader = {
        alg: 'RS256',
        typ: 'JWT'
      };
      
      const jwtClaim = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: expiry,
        iat: now
      };
      
      // Mã hóa và ký JWT
      // Lưu ý: Trong môi trường trình duyệt thực tế, việc tạo và ký JWT là không an toàn
      // vì private key sẽ bị lộ. Đây chỉ là cách giải quyết tạm thời.
      // Cách tiếp cận tốt hơn là sử dụng backend để xử lý việc này.
      
      // Giả lập việc có token (trong ứng dụng thực tế cần xử lý qua backend)
      console.log("Đang lấy access token từ Service Account...");
      
      // Giả định là chúng ta có backend xử lý việc này và trả về token
      const mockResponse = {
        access_token: "mock_access_token_" + Math.random().toString(36).substring(7),
        expires_in: 3600
      };
      
      // Lưu token và thời gian hết hạn
      this.accessToken = mockResponse.access_token;
      this.tokenExpiry = Date.now() + (mockResponse.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Lỗi khi lấy access token:', error);
      throw new Error('Không thể xác thực với Google API');
    }
  }

  // Lưu dữ liệu công việc vào Google Sheets
  async saveTask(taskData: any) {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets chưa được cấu hình');
    }

    try {
      // Chuẩn bị dữ liệu để lưu vào Google Sheets
      const formattedData = this.formatTaskDataForSheets(taskData);
      
      // Lấy access token
      const accessToken = await this.getAccessToken();
      
      // Endpoint của Google Sheets API để thêm dữ liệu
      const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/A:Z:append?valueInputOption=USER_ENTERED`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [formattedData]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lỗi khi lưu dữ liệu vào Google Sheets:', errorData);
        throw new Error(`Lỗi khi lưu dữ liệu: ${errorData.error?.message || 'Không thể kết nối với Google Sheets'}`);
      }
      
      const data = await response.json();
      console.log('Dữ liệu đã được lưu vào Google Sheets:', data);
      return data;
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu vào Google Sheets:', error);
      throw error;
    }
  }

  // Chuyển đổi dữ liệu task sang định dạng phù hợp với Google Sheets
  private formatTaskDataForSheets(taskData: any) {
    // Format dữ liệu thành mảng theo thứ tự cột trong Google Sheets
    // Thứ tự: Tiêu đề, Mô tả, Loại, Trạng thái, Ngày, Thời gian, Người tạo, Người được giao, Đội nhóm, Khu vực, Ngày tạo
    return [
      taskData.title,
      taskData.description,
      this.translateTaskType(taskData.type),
      this.translateTaskStatus(taskData.status),
      taskData.date,
      taskData.time || '',
      taskData.user_name || '',
      taskData.assignedTo || '',
      taskData.team_id || '',
      this.translateLocation(taskData.location),
      taskData.created_at
    ];
  }

  // Chuyển đổi loại công việc sang tiếng Việt
  private translateTaskType(type: string): string {
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
    return location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh';
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
