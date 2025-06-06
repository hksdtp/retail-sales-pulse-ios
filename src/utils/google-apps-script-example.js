// Mã Google Apps Script cần được triển khai trong Google Apps Script Editor
// Sau khi triển khai, nhớ phải xuất bản dưới dạng Web App

function doGet(e) {
  // Thiết lập CORS cho phép tất cả các domain
  var output = ContentService.createTextOutput();

  // Lấy tên callback từ tham số nếu có
  var callback = e.parameter.callback;

  // Xử lý action
  var action = e.parameter.action;
  var result;

  try {
    if (action === 'fetch') {
      result = fetchTasks();
    } else if (action === 'save') {
      var taskData = JSON.parse(e.parameter.data || '{}');
      result = saveTask(taskData);
    } else {
      result = { success: false, message: 'Action không hợp lệ', data: null };
    }
  } catch (error) {
    result = {
      success: false,
      message: 'Lỗi: ' + error.message,
      data: null,
    };
  }

  // Định dạng kết quả dưới dạng JSONP nếu có callback
  var responseText = JSON.stringify(result);
  if (callback) {
    responseText = callback + '(' + responseText + ')';
  }

  // Thiết lập header để cho phép CORS
  output.setContent(responseText).setMimeType(ContentService.MimeType.JSON);

  return output;
}

// Hàm lấy danh sách task từ sheet
function fetchTasks() {
  try {
    // Lấy sheet chứa dữ liệu tasks
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
    if (!sheet) {
      return {
        success: false,
        message: 'Không tìm thấy sheet "Tasks"',
        data: [],
      };
    }

    // Lấy dữ liệu từ sheet
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var tasks = [];

    // Chuyển đổi dữ liệu thành mảng đối tượng
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var task = {};

      // Map từng cột vào thuộc tính tương ứng
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        var value = row[j];
        task[header] = value;
      }

      // Nếu có ID thì thêm vào danh sách
      if (task.id) {
        tasks.push(task);
      }
    }

    return {
      success: true,
      message: 'Lấy dữ liệu thành công',
      data: tasks,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Lỗi khi lấy dữ liệu: ' + error.message,
      data: [],
    };
  }
}

// Hàm lưu task vào sheet
function saveTask(taskData) {
  try {
    if (!taskData || !taskData.id) {
      return {
        success: false,
        message: 'Dữ liệu task không hợp lệ',
        data: null,
      };
    }

    // Lấy sheet chứa dữ liệu tasks
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
    if (!sheet) {
      // Tạo sheet mới nếu chưa có
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Tasks');

      // Thêm header
      sheet.appendRow([
        'id',
        'title',
        'description',
        'type',
        'status',
        'date',
        'time',
        'user_name',
        'assignedTo',
        'team_id',
        'location',
        'created_at',
      ]);
    }

    // Tìm task theo ID
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rowIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === taskData.id) {
        rowIndex = i + 1; // +1 vì indexing trong sheet bắt đầu từ 1
        break;
      }
    }

    // Chuẩn bị dữ liệu để lưu
    var rowData = [];
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      rowData.push(taskData[header] || '');
    }

    // Cập nhật hoặc thêm mới
    if (rowIndex > 0) {
      // Cập nhật task hiện có
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Thêm task mới
      sheet.appendRow(rowData);
    }

    return {
      success: true,
      message: 'Lưu task thành công',
      data: taskData,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Lỗi khi lưu task: ' + error.message,
      data: null,
    };
  }
}
