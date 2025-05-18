// Service để xử lý kết nối và lưu dữ liệu vào Google Sheets thông qua Google Apps Script

class AppsScriptGoogleSheetsService {
  private webhookUrl: string | null = null;

  constructor() {
    // Lấy thông tin từ localStorage nếu đã được lưu trước đó
    this.webhookUrl = localStorage.getItem('googleAppsScriptUrl');
  }

  // Thiết lập URL webhook của Google Apps Script
  setWebhookUrl(url: string) {
    if (!url.trim()) {
      throw new Error('URL không được để trống');
    }
    
    // Kiểm tra URL có đúng định dạng Google Apps Script không
    if (!url.includes('script.google.com/macros/s/')) {
      throw new Error('URL không hợp lệ. Phải là URL của Google Apps Script');
    }
    
    this.webhookUrl = url.trim();
    localStorage.setItem('googleAppsScriptUrl', this.webhookUrl);
    
    return true;
  }

  // Kiểm tra đã cấu hình chưa
  isConfigured() {
    return !!this.webhookUrl;
  }

  // Lấy thông tin cấu hình
  getConfig() {
    return {
      webhookUrl: this.webhookUrl
    };
  }

  // Tạo một promise tự chế để gọi Google Apps Script với JSONP
  private createCORSRequest(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.webhookUrl) {
        reject(new Error('URL chưa được cấu hình'));
        return;
      }

      // Tạo callback ID duy nhất
      const callbackName = `googleSheetsCallback_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Xử lý callback từ Google Apps Script
      (window as any)[callbackName] = (response: any) => {
        try {
          // Xóa script và cleanup
          delete (window as any)[callbackName];
          const scripts = document.querySelectorAll(`script[data-callback="${callbackName}"]`);
          scripts.forEach(script => script.remove());
          
          // Kiểm tra response trước khi resolve
          if (!response) {
            reject(new Error('Không có phản hồi từ Google Apps Script'));
            return;
          }
          
          // Trả về kết quả
          resolve(response);
        } catch (callbackError) {
          // Xử lý lỗi trong callback
          const errorMsg = callbackError instanceof Error ? callbackError.message : 'Lỗi khi xử lý phản hồi';
          reject(new Error(`Lỗi callback: ${errorMsg}`));
        }
      };

      try {
        // Tạo URL với payload và callback
        const url = new URL(this.webhookUrl);
        url.searchParams.append('callback', callbackName);
        
        // Thêm payload vào URL
        if (payload) {
          Object.keys(payload).forEach(key => {
            // Sử dụng Object.prototype để tránh ESLint warning
            if (Object.prototype.hasOwnProperty.call(payload, key)) {
              url.searchParams.append(key, payload[key]);
            }
          });
        }
        
        // Tạo script tag để gọi API
        const script = document.createElement('script');
        script.setAttribute('data-callback', callbackName);
        script.src = url.toString();
        
        // Xử lý lỗi
        script.onerror = (e) => {
          delete (window as any)[callbackName];
          script.remove();
          reject(new Error(`Lỗi khi gọi Google Apps Script: ${e instanceof Error ? e.message : 'Không thể kết nối'}`));
        };

        // Gắn script vào document để thực hiện request
        document.body.appendChild(script);
        
        // Thiết lập timeout để tránh chờ vô hạn
        setTimeout(() => {
          if ((window as any)[callbackName]) {
            delete (window as any)[callbackName];
            script.remove();
            reject(new Error('Timeout khi gọi Google Apps Script - không nhận được phản hồi sau 30 giây'));
          }
        }, 30000); // 30 giây timeout
        
      } catch (error) {
        delete (window as any)[callbackName];
        const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định';
        reject(new Error(`Lỗi khi tạo yêu cầu CORS: ${errorMsg}`));
      }
    });
  }

  // Tạo phiên form để gửi POST request
  private createFormSubmitRequest(data: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Gửi dữ liệu đến Apps Script URL:', this.webhookUrl);
        console.log('Dữ liệu gửi đi:', data);
        
        // Tạo iframe ẩn để chứa form
        const iframe = document.createElement('iframe');
        iframe.name = `form_iframe_${Date.now()}`;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Tạo form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = this.webhookUrl!;
        form.target = iframe.name;
        form.enctype = 'application/x-www-form-urlencoded';
        
        // Thêm trường dữ liệu
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = 'data';
        hiddenField.value = JSON.stringify(data);
        form.appendChild(hiddenField);
        
        // Thêm từng trường dữ liệu riêng biệt (phòng trường hợp server không parse JSON)
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const field = document.createElement('input');
            field.type = 'hidden';
            field.name = key;
            field.value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
            form.appendChild(field);
          }
        }
        
        // Thêm form vào trang
        document.body.appendChild(form);
        
        // Xử lý hoàn thành
        iframe.onload = () => {
          console.log('Iframe đã hoàn tất tải');
          
          // Thử lấy nội dung phản hồi từ iframe
          try {
            const iframeContent = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeContent) {
              const responseText = iframeContent.body.innerText || iframeContent.body.textContent;
              console.log('Phản hồi nhận được:', responseText);
            }
          } catch (e) {
            console.warn('Không thể đọc nội dung iframe (CORS):', e);
          }
          
          // Xóa các phần tử đã tạo
          document.body.removeChild(form);
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
          
          resolve({ success: true, message: 'Dữ liệu đã được gửi' });
        };
        
        // Xử lý lỗi
        iframe.onerror = (error) => {
          console.error('Lỗi khi tải iframe:', error);
          document.body.removeChild(form);
          document.body.removeChild(iframe);
          reject(new Error('Không thể tải iframe'));
        };
        
        // Gửi form
        console.log('Đang gửi form...');
        form.submit();
        console.log('Đã gửi form!');
      } catch (error) {
        console.error('Lỗi khi tạo form request:', error);
        reject(error);
      }
    });
  }

  // Lưu dữ liệu công việc vào Google Sheets thông qua Apps Script
  async saveTask(taskData: any) {
    if (!this.isConfigured()) {
      throw new Error('Google Apps Script URL chưa được cấu hình');
    }

    try {
      // Chuẩn bị dữ liệu để lưu vào Google Sheets
      const formattedData = this.formatTaskDataForSheets(taskData);
      
      // Thử phương pháp form submit
      try {
        const responseData = await this.createFormSubmitRequest(formattedData);
        console.log('Dữ liệu đã được lưu vào Google Sheets:', responseData);
        return responseData;
      } catch (formError) {
        console.warn('Không thể sử dụng phương pháp form, thử lại với JSONP:', formError);
        
        // Nếu form không thành công, thử JSONP
        const responseData = await this.createCORSRequest(formattedData);
        console.log('Dữ liệu đã được lưu vào Google Sheets (JSONP):', responseData);
        return responseData;
      }
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu vào Google Sheets:', error);
      throw error;
    }
  }

  // Chuyển đổi dữ liệu task để phù hợp với Google Apps Script
  private formatTaskDataForSheets(taskData: any) {
    // Giữ nguyên định dạng dữ liệu vì Google Apps Script sẽ xử lý
    return {
      title: taskData.title,
      description: taskData.description,
      type: this.translateTaskType(taskData.type),
      status: this.translateTaskStatus(taskData.status),
      date: taskData.date,
      time: taskData.time || '',
      user_name: taskData.user_name || '',
      assignedTo: taskData.assignedTo || '',
      team_id: taskData.team_id || '',
      location: this.translateLocation(taskData.location),
      created_at: taskData.created_at
    };
  }

  // Các hàm dịch giữ nguyên từ service cũ
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

  private translateTaskStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'todo': 'Chưa bắt đầu',
      'in-progress': 'Đang thực hiện',
      'on-hold': 'Đang chờ',
      'completed': 'Hoàn thành'
    };
    
    return statusMap[status] || status;
  }

  private translateLocation(location: string): string {
    return location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh';
  }
  
  // Chuyển đổi ngược từ tiếng Việt sang loại công việc
  private reverseTranslateTaskType(vietnameseType: string): string {
    const reverseTypeMap: Record<string, string> = {
      'Đối tác mới': 'partner_new',
      'Đối tác cũ': 'partner_old',
      'KTS mới': 'architect_new',
      'KTS cũ': 'architect_old',
      'Khách hàng mới': 'client_new',
      'Khách hàng cũ': 'client_old',
      'Báo giá mới': 'quote_new',
      'Báo giá cũ': 'quote_old',
      'Khác': 'other'
    };
    
    return reverseTypeMap[vietnameseType] || vietnameseType;
  }
  
  // Chuyển đổi ngược từ tiếng Việt sang trạng thái
  private reverseTranslateTaskStatus(vietnameseStatus: string): string {
    const reverseStatusMap: Record<string, string> = {
      'Chưa bắt đầu': 'todo',
      'Đang thực hiện': 'in-progress',
      'Đang chờ': 'on-hold',
      'Tạm hoãn': 'on-hold',
      'Hoàn thành': 'completed'
    };
    
    return reverseStatusMap[vietnameseStatus] || vietnameseStatus;
  }
  
  // Chuyển đổi ngược từ tiếng Việt sang mã khu vực
  private reverseTranslateLocation(vietnameseLocation: string): string {
    return vietnameseLocation === 'Hà Nội' ? 'hanoi' : 'hcm';
  }
  
  // Lấy dữ liệu từ Google Sheets thông qua Apps Script
  async fetchTasks(): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('Google Apps Script URL chưa được cấu hình');
    }

    try {
      // Gọi Apps Script với action=fetch
      const responseData = await this.createCORSRequest({ action: 'fetch' })
        .catch(err => {
          // Chuyển đổi các lỗi fetch thành đối tượng Error có thông tin chi tiết
          throw new Error(`Không thể kết nối đến Google Apps Script: ${err?.message || JSON.stringify(err)}`);
        });
      
      if (!responseData) {
        throw new Error('Không nhận được phản hồi từ Google Apps Script');
      }
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Google Apps Script trả về lỗi khi lấy dữ liệu');
      }
      
      // Kiểm tra dữ liệu
      if (!responseData.data || !Array.isArray(responseData.data)) {
        throw new Error('Dữ liệu nhận được không đúng định dạng');
      }
      
      // Tạo mảng tasks từ dữ liệu
      const tasks = this.parseTasksFromSheetData(responseData.data || []);
      console.log('Đã đọc dữ liệu từ Google Sheets:', tasks);
      return tasks;
      
    } catch (error) {
      // Đảm bảo lỗi luôn có thông tin đầy đủ
      const errorMessage = error instanceof Error 
        ? error.message 
        : (typeof error === 'string' ? error : 'Lỗi không xác định khi kết nối Google Sheets');
      
      // Log chi tiết hơn về lỗi
      console.error('Lỗi khi lấy dữ liệu từ Google Sheets:', {
        message: errorMessage,
        originalError: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      throw new Error(`Lỗi từ Google Sheets API: ${errorMessage}`);
    }
  }
  
  // Chuyển đổi dữ liệu từ Google Sheets sang mảng tasks
  private parseTasksFromSheetData(sheetData: any[]): any[] {
    const tasks = [];
    
    if (!Array.isArray(sheetData)) {
      console.warn('Dữ liệu không phải mảng:', sheetData);
      return [];
    }
    
    for (const rowData of sheetData) {
      // Mỗi hàng là một đối tượng chứa dữ liệu của task
      try {
        // Tiêu đề, Mô tả, Loại, Trạng thái, Ngày, Thời gian, Người tạo, Người được giao, Đội nhóm, Khu vực, Ngày tạo, ID
        const task = {
          id: rowData.id || this.generateId(),
          title: rowData.title || '',
          description: rowData.description || '',
          type: this.reverseTranslateTaskType(rowData.type || ''),
          status: this.reverseTranslateTaskStatus(rowData.status || ''),
          date: rowData.date || new Date().toISOString().split('T')[0],
          time: rowData.time || '',
          user_name: rowData.user_name || '',
          assignedTo: rowData.assignedTo || '',
          teamId: rowData.team_id || '',
          location: this.reverseTranslateLocation(rowData.location || 'hanoi'),
          created_at: rowData.created_at || new Date().toISOString(),
          progress: 0, // Giá trị mặc định
          isNew: false // Giá trị mặc định
        };
        
        tasks.push(task);
      } catch (e) {
        console.warn('Lỗi khi xử lý hàng dữ liệu:', e, rowData);
      }
    }
    
    return tasks;
  }
  
  // Tạo ID duy nhất cho task
  private generateId(): string {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }
}

// Export singleton instance
export const appsScriptGoogleSheetsService = new AppsScriptGoogleSheetsService();
