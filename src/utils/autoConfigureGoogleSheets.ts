/**
 * File này thực hiện cấu hình tự động Google Sheets với Apps Script URL
 */

import { appsScriptGoogleSheetsService } from "../services/AppsScriptGoogleSheetsService";
import { googleSheetsService } from "../services/GoogleSheetsService";

const AUTO_CONFIGURE_KEY = 'autoConfiguredGoogleSheets';

/**
 * Tự động cấu hình Google Sheets với Apps Script URL
 * @returns Kết quả cấu hình
 */
export const autoConfigureGoogleSheets = () => {
  try {
    // Kiểm tra đã cấu hình tự động chưa (để tránh cấu hình lại mỗi khi tải lại trang)
    const alreadyConfigured = localStorage.getItem(AUTO_CONFIGURE_KEY);
    
    if (alreadyConfigured === 'true') {
      console.log('Google Sheets đã được cấu hình tự động trước đó');
      return { 
        success: true, 
        message: 'Google Sheets đã được cấu hình tự động trước đó' 
      };
    }
    
    // URL của Google Apps Script mới
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbzugrxNCfrHO_W74o1JfBJIivYFTwGZrp1pRCcy3HtlZ3eZbnbEQgwbCDEeyz5N3j0/exec';
    
    // Cấu hình với AppsScript
    const result = appsScriptGoogleSheetsService.setWebhookUrl(appsScriptUrl);
    
    // Lưu lại thông tin đã cấu hình tự động
    localStorage.setItem(AUTO_CONFIGURE_KEY, 'true');
    
    console.log('Đã cấu hình tự động Google Sheets với Apps Script URL:', appsScriptUrl);
    
    return { 
      success: true, 
      message: 'Đã cấu hình tự động Google Sheets với Apps Script URL' 
    };
  } catch (error) {
    console.error('Lỗi khi cấu hình tự động Google Sheets:', error);
    return { 
      success: false, 
      message: 'Lỗi khi cấu hình tự động Google Sheets: ' + (error instanceof Error ? error.message : String(error))
    };
  }
};
