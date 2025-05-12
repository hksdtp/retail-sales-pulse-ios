
// Service để xử lý kết nối và lưu dữ liệu vào Google Sheets

class GoogleSheetsService {
  private sheetId: string | null = null;
  private apiKey: string | null = null;

  constructor() {
    // Lấy thông tin từ localStorage nếu đã được lưu trước đó
    this.sheetId = localStorage.getItem('googleSheetId');
    this.apiKey = localStorage.getItem('googleSheetsApiKey');
  }

  // Thiết lập thông tin cấu hình Google Sheets
  setConfig(sheetId: string, apiKey: string) {
    this.sheetId = sheetId;
    this.apiKey = apiKey;
    
    // Lưu vào localStorage để sử dụng cho các lần sau
    localStorage.setItem('googleSheetId', sheetId);
    localStorage.setItem('googleSheetsApiKey', apiKey);
    
    return true;
  }

  // Kiểm tra đã cấu hình chưa
  isConfigured() {
    return !!(this.sheetId && this.apiKey);
  }

  // Lấy thông tin cấu hình
  getConfig() {
    return {
      sheetId: this.sheetId,
      apiKey: this.apiKey
    };
  }

  // Lưu dữ liệu công việc vào Google Sheets
  async saveTask(taskData: any) {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets chưa được cấu hình');
    }

    try {
      // Chuẩn bị dữ liệu để lưu vào Google Sheets
      const formattedData = this.formatTaskDataForSheets(taskData);
      
      // Endpoint của Google Sheets API để thêm dữ liệu
      const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/A:Z:append?valueInputOption=USER_ENTERED&key=${this.apiKey}`;
      
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
