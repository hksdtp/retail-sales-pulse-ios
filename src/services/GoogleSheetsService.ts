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

  // Lấy token truy cập sử dụng Service Account
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
      
      try {
        // Gửi yêu cầu xác thực
        const serviceAccountInfo = JSON.parse(this.serviceAccountString);
        
        // Tạo JWT assertion
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + 3600; // Hết hạn sau 1 giờ
        
        const jwtHeader = {
          alg: 'RS256',
          typ: 'JWT'
        };
        
        const jwtClaim = {
          iss: serviceAccountInfo.client_email,
          scope: 'https://www.googleapis.com/auth/spreadsheets',
          aud: 'https://oauth2.googleapis.com/token',
          exp: exp,
          iat: iat
        };
        
        // Base64Url encode header and claim
        const base64Header = btoa(JSON.stringify(jwtHeader))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
          
        const base64Claim = btoa(JSON.stringify(jwtClaim))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        
        // Tạo nội dung cần ký
        const signContent = `${base64Header}.${base64Claim}`;
        
        // Dùng Web Crypto API để ký JWT
        const privateKey = this.pemToArrayBuffer(serviceAccountInfo.private_key);
        const keyImport = await window.crypto.subtle.importKey(
          'pkcs8',
          privateKey,
          {
            name: 'RSASSA-PKCS1-v1_5',
            hash: {name: 'SHA-256'}
          },
          false,
          ['sign']
        );
        
        const encoder = new TextEncoder();
        const signatureBuffer = await window.crypto.subtle.sign(
          {name: 'RSASSA-PKCS1-v1_5'},
          keyImport,
          encoder.encode(signContent)
        );
        
        // Chuyển signature thành base64url
        const signatureBytes = new Uint8Array(signatureBuffer);
        let binaryString = '';
        signatureBytes.forEach(byte => {
          binaryString += String.fromCharCode(byte);
        });
        
        const base64Signature = btoa(binaryString)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        
        // Tạo JWT hoàn chỉnh
        const jwt = `${signContent}.${base64Signature}`;
        
        // Gửi yêu cầu lấy token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
          })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok || !tokenData.access_token) {
          console.error('Lỗi lấy token:', tokenData);
          throw new Error(`Không thể lấy access token: ${tokenData.error || 'Lỗi không xác định'}`);
        }
        
        // Lưu token và thời gian hết hạn
        this.accessToken = tokenData.access_token;
        this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
        
        return this.accessToken;
        
      } catch (error) {
        console.error('Lỗi xác thực:', error);
        
        // Thử phương pháp thay thế nếu gặp lỗi với JWT
        try {
          console.log("Đang thử phương pháp xác thực thay thế...");
          
          // Gửi yêu cầu đến proxy server (nếu có)
          const response = await fetch('https://cors-anywhere.herokuapp.com/https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              serviceAccount: this.serviceAccountString
            })
          });
          
          if (!response.ok) {
            throw new Error('Không thể xác thực qua proxy server');
          }
          
          const data = await response.json();
          return data.access_token;
        } catch (proxyError) {
          console.error('Lỗi khi sử dụng proxy:', proxyError);
          throw new Error('Không thể xác thực với Google API. Vui lòng đảm bảo Service Account đã được thiết lập đúng cách.');
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy access token:', error);
      throw error;
    }
  }
  
  // Chuyển định dạng PEM key sang ArrayBuffer
  private pemToArrayBuffer(pem: string): ArrayBuffer {
    // Xóa header, footer và các dòng mới
    const pemContent = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\n/g, '');
    
    // Decode base64
    const binaryString = atob(pemContent);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
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
      
      if (!this.sheetId) {
        throw new Error('Thiếu ID Google Sheet');
      }
      
      // Lấy access token
      const accessToken = await this.getAccessToken();
      
      console.log("Đang gửi dữ liệu đến Google Sheets...");
      
      // Sử dụng Google Sheets API với access token
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
        
        // Hiển thị thông báo chi tiết hơn
        let errorMessage = 'Không thể kết nối với Google Sheets. ';
        if (errorData.error && errorData.error.message) {
          errorMessage += errorData.error.message;
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
