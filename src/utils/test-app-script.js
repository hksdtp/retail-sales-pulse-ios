// Script để kiểm tra kết nối trực tiếp với Google Apps Script
// Chạy script này trong console trình duyệt

function testGoogleAppScript() {
  // URL Apps Script cần kiểm tra
  const appScriptUrl = 'https://script.google.com/macros/s/AKfycbx3GFXtdbEqedLChaBkjH7k9w4pYfWfMWqOcR2dOcMhpCxjy-vly9GkF7aTCzczdCLa/exec';
  
  // Tạo một ID callback duy nhất
  const callbackName = `testCallback_${Date.now()}`;
  
  // Định nghĩa callback function
  window[callbackName] = function(response) {
    console.log('Phản hồi từ Google Apps Script:', response);
    // Xóa callback và script sau khi nhận được phản hồi
    delete window[callbackName];
    document.getElementById('testScript').remove();
  };
  
  // Tạo URL hoàn chỉnh với callback và action
  const fullUrl = `${appScriptUrl}?action=fetch&callback=${callbackName}`;
  console.log('Đang gửi yêu cầu tới:', fullUrl);
  
  // Tạo script tag để gọi API
  const script = document.createElement('script');
  script.id = 'testScript';
  script.src = fullUrl;
  
  // Xử lý lỗi
  script.onerror = function(error) {
    console.error('Lỗi khi gọi Google Apps Script:', error);
    alert('Lỗi kết nối đến Google Apps Script. Chi tiết xem trong console.');
    // Xóa callback và script
    delete window[callbackName];
    document.getElementById('testScript').remove();
  };
  
  // Thêm script vào trang
  document.body.appendChild(script);
  
  // Thiết lập timeout nếu không nhận được phản hồi
  setTimeout(function() {
    if (window[callbackName]) {
      console.error('Hết thời gian chờ phản hồi từ Google Apps Script');
      alert('Hết thời gian chờ phản hồi từ Google Apps Script.');
      // Xóa callback và script
      delete window[callbackName];
      if (document.getElementById('testScript')) {
        document.getElementById('testScript').remove();
      }
    }
  }, 10000); // Chờ tối đa 10 giây
}

// Gọi hàm test
// testGoogleAppScript();
