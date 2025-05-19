// Script để kiểm tra kết nối với Google Apps Script
// Dán vào console trình duyệt để kiểm tra

function testAppsScript() {
  // URL của Google Apps Script (thay thế bằng URL mới sau khi deploy)
  const url = prompt('Nhập URL Google Apps Script mới của bạn:');
  
  if (!url) {
    console.error('Không nhận được URL');
    return;
  }
  
  // Dữ liệu thử nghiệm
  const testData = {
    title: 'Công việc thử nghiệm',
    description: 'Đây là công việc thử nghiệm để kiểm tra kết nối',
    type: 'Đối tác mới',
    status: 'Chưa bắt đầu',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    user_name: 'Test User',
    assignedTo: 'Test User',
    team_id: 'Test Team',
    location: 'Hà Nội',
    created_at: new Date().toISOString()
  };
  
  console.log('Đang gửi dữ liệu thử nghiệm đến:', url);
  console.log('Dữ liệu:', testData);
  
  // Tạo form ẩn
  const iframe = document.createElement('iframe');
  iframe.name = `test_frame_${Date.now()}`;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.target = iframe.name;
  
  const hiddenField = document.createElement('input');
  hiddenField.type = 'hidden';
  hiddenField.name = 'data';
  hiddenField.value = JSON.stringify(testData);
  form.appendChild(hiddenField);
  
  document.body.appendChild(form);
  
  // Xử lý hoàn thành
  iframe.onload = () => {
    console.log('Đã gửi dữ liệu thành công!');
    document.body.removeChild(form);
    setTimeout(() => {
      document.body.removeChild(iframe);
      alert('Đã gửi dữ liệu thử nghiệm thành công! Vui lòng kiểm tra Google Sheet của bạn.');
    }, 1000);
  };
  
  // Gửi form
  form.submit();
}

// Chạy hàm kiểm tra
testAppsScript();
