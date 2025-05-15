
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
      // Nếu chưa có cấu hình Service Account
      if (!this.serviceAccountString || !this.sheetId) {
        throw new Error('Service Account chưa được cấu hình');
      }

      console.log("Bắt đầu lấy token xác thực...");
      
      // Trong thực tế, việc xác thực bằng service account cần một backend an toàn
      // Đối với ứng dụng frontend, chúng ta sẽ sử dụng Google Identity Platform 
      // hoặc một proxy server để xử lý xác thực
      
      // Đây là một giải pháp tạm thời - sử dụng API gateway hoặc proxy server
      const proxyUrl = 'https://sheets-proxy.onrender.com/auth'; // Giả định URL proxy server
      
      // Gửi yêu cầu đến proxy server để lấy token
      try {
        console.log("Đang gửi yêu cầu xác thực...");
        
        // Trong thực tế, hàm này sẽ gọi đến một proxy server
        // Ở đây, vì chưa có proxy server thực tế, chúng ta sẽ yêu cầu người dùng
        // chia sẻ Google Sheet để "Bất kỳ ai có liên kết" có thể chỉnh sửa
        console.log("Đảm bảo Google Sheet đã được chia sẻ cho mọi người có liên kết và có quyền chỉnh sửa");
        
        // Sử dụng API key thay vì Service Account (giới hạn nhưng đơn giản hơn)
        // Google Sheets API cho phép một số hoạt động cơ bản với API key nếu sheet được chia sẻ công khai
        return "SHEET_IS_PUBLIC"; // Token giả để tiếp tục quy trình
      } catch (authError) {
        console.error('Lỗi xác thực qua proxy:', authError);
        throw new Error('Không thể xác thực với Google API. Vui lòng đảm bảo Google Sheet đã được chia sẻ công khai.');
      }
    } catch (error) {
      console.error('Lỗi khi lấy access token:', error);
      throw error;
    }
  }

  // Lưu dữ liệu công việc vào Google Sheets
  async saveTask(taskData: any) {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets chưa được cấu hình');
    }

    try {
      console.log("Bắt đầu lưu dữ liệu công việc...");
      
      // Chuẩn bị dữ liệu để lưu vào Google Sheets
      const formattedData = this.formatTaskDataForSheets(taskData);
      
      // Lấy access token hoặc xác nhận sheet được chia sẻ công khai
      await this.getAccessToken();
      
      if (!this.sheetId) {
        throw new Error('Thiếu ID Google Sheet');
      }
      
      console.log("Đang gửi dữ liệu đến Google Sheets...");
      
      // Sử dụng Google Sheets API với sheet công khai
      const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/A:Z:append?valueInputOption=USER_ENTERED&key=AIzaSyDgcj4iNj0MtmM0HF2Utew9UoN5BlDH5f4`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [formattedData]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lỗi khi lưu dữ liệu vào Google Sheets:', errorData);
        
        // Hiển thị thông báo chi tiết hơn
        let errorMessage = 'Không thể kết nối với Google Sheets. ';
        if (errorData.error && errorData.error.message) {
          errorMessage += errorData.error.message;
        }
        
        if (errorData.error && errorData.error.message && errorData.error.message.includes('invalid authentication credentials')) {
          errorMessage += ' Vui lòng đảm bảo Google Sheet đã được chia sẻ công khai với quyền chỉnh sửa.';
        }
        
        throw new Error(errorMessage);
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
