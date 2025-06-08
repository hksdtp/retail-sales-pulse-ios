// Script kiểm tra kết nối trực tiếp với Google Apps Script - Không dùng form
// Copy và dán vào console trình duyệt

async function testDirectFetch() {
  const url = prompt('Nhập URL Google Apps Script của bạn:');

  if (!url) {
    console.error('Không nhận được URL');
    return;
  }

  // Dữ liệu thử nghiệm
  const testData = {
    title: 'Test từ fetch API',
    description: 'Đây là dữ liệu kiểm tra kết nối',
    type: 'Đối tác mới',
    status: 'Chưa bắt đầu',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    user_name: 'Tester',
    assignedTo: 'Tester',
    team_id: 'Test Team',
    location: 'Hà Nội',
    created_at: new Date().toISOString(),
  };

  console.log('Đang gửi dữ liệu thử nghiệm đến:', url);
  console.log('Dữ liệu:', testData);

  try {
    // Phương pháp 1: Sử dụng fetch API
    console.log('Thử phương pháp 1: fetch API với JSON');
    const fetchResponse = await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Quan trọng!
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Phản hồi fetch:', fetchResponse);
    console.log('Fetch đã hoàn thành!');

    // Phương pháp 2: Tạo form và gửi
    console.log('Thử phương pháp 2: XMLHttpRequest');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // Chuyển đổi dữ liệu thành x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('data', JSON.stringify(testData));

    // Xử lý hoàn thành
    xhr.onload = function () {
      console.log('XHR đã hoàn thành:', xhr.status, xhr.responseText);
    };

    // Xử lý lỗi
    xhr.onerror = function (error) {
      console.error('Lỗi XHR:', error);
    };

    // Gửi request
    xhr.send(formData.toString());
    console.log('Đã gửi XHR request');

    alert(
      'Đã gửi dữ liệu thử nghiệm bằng cả hai phương pháp! Vui lòng kiểm tra Google Sheet của bạn sau vài giây.',
    );
  } catch (error) {
    console.error('Lỗi khi gửi dữ liệu:', error);
    alert('Có lỗi khi gửi dữ liệu: ' + error.message);
  }
}

// Chạy thử nghiệm
testDirectFetch();
