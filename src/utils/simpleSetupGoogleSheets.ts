import { googleSheetsService } from '@/services/GoogleSheetsService';

export const simpleSetupGoogleSheets = () => {
  try {
    // Sử dụng API key đơn giản để cấu hình
    const sheetId = '18suuPRMUScXDWPmvIzmbZpLOTlEViis5olm7G1TqV1A';
    const apiKey = 'AIzaSyAXwhLirER9EBC101q9mhyT5Uyj06bC5rg';

    // Cấu hình với API key
    const success = googleSheetsService.setConfig(sheetId, apiKey);

    if (success) {
      return {
        success: true,
        message: 'Đã cấu hình Google Sheets thành công với API key!',
        sheetId,
      };
    } else {
      return {
        success: false,
        message: 'Không thể cấu hình Google Sheets',
      };
    }
  } catch (error) {
    console.error('Lỗi khi cấu hình Google Sheets:', error);
    return {
      success: false,
      message: `Lỗi khi cấu hình: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
    };
  }
};
