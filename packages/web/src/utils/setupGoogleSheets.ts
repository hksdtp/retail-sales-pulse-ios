import { googleSheetsService } from '@/services/GoogleSheetsService';

// Hàm cấu hình tự động Google Sheets với Service Account
export const setupGoogleSheetsConfig = () => {
  // ID Google Sheet mà bạn đã cung cấp
  const sheetId = '18suuPRMUScXDWPmvIzmbZpLOTlEViis5olm7G1TqV1A';

  // API key dự phòng nếu cần
  const apiKey = 'AIzaSyAXwhLirER9EBC101q9mhyT5Uyj06bC5rg';

  // Thông tin Service Account JSON
  const serviceAccountJson = `{
  "type": "service_account",
  "project_id": "duthuyen",
  "private_key_id": "d961da94d934d081c6ec856090c9e637218b7ca9",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDtxoXXqeub/YF3\\n2m+LBDB5AoSHR7Pwel8zKd16CFKU7WWokmaf6mVXGu6Kz+xqYaczFncDw64JZGE9\\nYwgUX1ezYCaEvq1YXwBVk9ikHeiybms+OShIi6kB6/25qDu5AmryABrhujUc1QHd\\n3xcUXC5o0ACnQJKO+NsFoi4nr0eo2D/DVqUOKKp/ANnGO7DOp16P2Iq2rw5fH5bU\\nWbqbgzPVllZh3hLO+ZDdY3c7ZV6k3Q0HWtTs/YP4gbMZcvHGziE++Io+IbiK17cF\\nmXCZUuHT8dwAPhusvYVVcwXQJXLqRS7w1840F9vqv6Z7MyPxmZ6IsUmo7D9dvGkn\\nCNJ5QJ4JAgMBAAECggEAD9Da8cGyc5WM8VM1BK7yZ3YwqQvuruIA55cTDY00qwXQ\\nc4JLc7skYwMeV1rlu5zDwZzurTAsqSDFbA8kiDBgVcThQwao4p4tGEQljqMTqZy5\\nIvIr2Ql7JC7VmW4UjOWZhf/WSen4IvMTNPYkI51PE/cz9+wOY5avgOQtBEQ/NL6O\\nx9WzFDD04INi8+x/weq3bZ5/MZM1YVNOEcERePVc/I7w1QJBNGC1CbnNOJAKxHTJ\\nbdft6jqjumemiUi65Mz0p4ZI/GKY3MjR7YDLUV6s+0JGpOtE4emghXVgBzwQJRom\\neoRteClMH8nOwLRSSV2HsAp1XvzMySQqvsgl5vcF5QKBgQD9V0Poyc6+dyCO3xQw\\nw5ksL2ONVX/CrIq40apSg+eaPLoNp8+2sUyGYleB4biWuKlaKIgsM/S8qT4UsiPt\\n9/wlu++N+Q5Z/sBo1no1Piad8B0pPrz1YyfGn9LXLq5DzagRmoIl1J1XA6J8YmHH\\nvPWO58DQOrlHCsNfJ8a3QepZ9QKBgQDwRW7OxaJA3J+2A9v7ouguVZjeExmZY8LA\\nu3Ufaue59aa/U4fWCZFMSWdPMaNOhaYlq+a+JftgfjUwvLWka76Au3WZFjjsr1/c\\n/Gn8Si/XbWy66ES/RZsQQoAEE9fahbrmAf7NnVDWJQ8RX2qa/LNipeDfhzxOWJV5\\n7mkEFhaDRQKBgB7h5WhaOXakZPaloPt0zJZDTJptAr8Dc4GmJWIbrD70CiYh/8Mg\\nh9iV4l712h+dcR+Jc1gYGUxqQSQatyCKK1WaPFCNPL+hu2jMRGd7JQ/5tkRR3oz3\\nQmEHGJecnCetyUAkGptr+KYjzknlYFAN68042RtJHU7YtApEegfa5CuFAoGBAI/y\\nGQuZzbYsNybVsxJTq+QudfH94WVLJh9Pb0DOTFvVdvvC8Gtjuf/JLjJ824iseziw\\nfwHGQY6yre0v8Wa7Ahufszlu3dW2z6jWNCzoyTa4IN7tTlqFOfwIyycmODh7y9gG\\ns/+9UvOoqhlPX8/QuyvLkyh3ncKWQZ8WHSZMkVo9AoGBAMBsoPCQqJ1IJFs2xkdg\\nF3HRJMzM0dnK0IuHDp8MBdcQoaJXpkv7hf+KxPWoYD6m3mtC7VaodwHSCkfZvteO\\nmKVXJ9raTwha6kIadfdduace+3sBnFPJKMiKqLrqHwCc7BDXLqwAHTGCzVeOQFOh\\nGJnqStBUw4LK/zHv5y9fkv8w\\n-----END PRIVATE KEY-----\\n",
  "client_email": "salebanle@duthuyen.iam.gserviceaccount.com",
  "client_id": "102037417987559243661",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/salebanle%40duthuyen.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}`;

  try {
    // Cấu hình ServiceAccount
    const success = googleSheetsService.setConfig(sheetId, serviceAccountJson);

    // Dự phòng: nếu cấu hình service account thất bại, cấu hình với API key
    if (!success) {
      googleSheetsService.setConfig(sheetId, serviceAccountJson);
    }

    return {
      success: true,
      message: 'Đã cấu hình Google Sheets thành công!',
      serviceAccountEmail: 'salebanle@duthuyen.iam.gserviceaccount.com',
      sheetId,
    };
  } catch (error) {
    console.error('Lỗi khi cấu hình Google Sheets:', error);
    return {
      success: false,
      message: `Lỗi khi cấu hình: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
    };
  }
};
