// Script cấu hình tự động Google Sheets
// (Đã được thay thế bằng Firebase nhưng vẫn giữ lại file này để tránh lỗi tham chiếu)
console.log("Đã chuyển sang sử dụng Firebase. File này chỉ giữ lại để tránh lỗi tham chiếu.");

// Đặt dữ liệu giả để tránh lỗi
localStorage.setItem('googleSheetId', 'firebase-migration');
localStorage.setItem('googleSheetsApiKey', 'firebase-migration');
localStorage.setItem('googleServiceAccount', JSON.stringify({
  "type": "service_account",
  "project_id": "skduthuyen",
  "client_email": "firebase-migration@example.com"
}));
