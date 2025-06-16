/**
 * Google Apps Script để quản lý khách hàng cho từng nhân viên
 * Mỗi nhân viên sẽ có một sheet riêng để lưu trữ danh sách khách hàng
 */

// ID của Google Spreadsheet chính
const MAIN_SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Headers cho customer sheet
const CUSTOMER_HEADERS = [
  'ID',
  'Tên khách hàng',
  'Loại khách hàng',
  'Số điện thoại',
  'Email',
  'Địa chỉ',
  'Ghi chú',
  'Người phụ trách',
  'Người tạo',
  'Ngày tạo',
  'Ngày cập nhật',
  'Trạng thái'
];

/**
 * Hàm chính xử lý các request
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const employeeName = e.parameter.employeeName;
    const employeeId = e.parameter.employeeId;
    
    console.log(`Action: ${action}, Employee: ${employeeName} (${employeeId})`);
    
    switch (action) {
      case 'createEmployeeSheet':
        return createEmployeeCustomerSheet(employeeName, employeeId);
        
      case 'saveCustomer':
        const customerData = JSON.parse(e.parameter.data);
        return saveCustomerToEmployeeSheet(employeeName, employeeId, customerData);
        
      case 'updateCustomer':
        const updateData = JSON.parse(e.parameter.data);
        const customerId = e.parameter.customerId;
        return updateCustomerInEmployeeSheet(employeeName, employeeId, customerId, updateData);
        
      case 'deleteCustomer':
        const deleteCustomerId = e.parameter.customerId;
        return deleteCustomerFromEmployeeSheet(employeeName, employeeId, deleteCustomerId);
        
      case 'syncEmployeeCustomers':
        const customersData = JSON.parse(e.parameter.data);
        return syncEmployeeCustomers(employeeName, employeeId, customersData);
        
      case 'getEmployeeCustomers':
        return getEmployeeCustomers(employeeName, employeeId);
        
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    return createResponse(false, error.toString());
  }
}

/**
 * Tạo sheet mới cho nhân viên
 */
function createEmployeeCustomerSheet(employeeName, employeeId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(MAIN_SPREADSHEET_ID);
    const sheetName = `KH_${employeeName}_${employeeId}`;
    
    // Kiểm tra xem sheet đã tồn tại chưa
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      // Tạo sheet mới
      sheet = spreadsheet.insertSheet(sheetName);
      
      // Thêm headers
      sheet.getRange(1, 1, 1, CUSTOMER_HEADERS.length).setValues([CUSTOMER_HEADERS]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, CUSTOMER_HEADERS.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      
      // Auto resize columns
      sheet.autoResizeColumns(1, CUSTOMER_HEADERS.length);
      
      console.log(`Created customer sheet for ${employeeName}`);
    }
    
    return createResponse(true, 'Customer sheet created successfully');
  } catch (error) {
    console.error('Error creating employee customer sheet:', error);
    return createResponse(false, error.toString());
  }
}

/**
 * Lưu khách hàng vào sheet của nhân viên
 */
function saveCustomerToEmployeeSheet(employeeName, employeeId, customerData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(MAIN_SPREADSHEET_ID);
    const sheetName = `KH_${employeeName}_${employeeId}`;
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // Tạo sheet nếu chưa có
    if (!sheet) {
      createEmployeeCustomerSheet(employeeName, employeeId);
      sheet = spreadsheet.getSheetByName(sheetName);
    }
    
    // Chuẩn bị dữ liệu
    const rowData = [
      customerData.id || '',
      customerData.name || '',
      customerData.type || '',
      customerData.phone || '',
      customerData.email || '',
      customerData.address || '',
      customerData.notes || '',
      customerData.assignedTo || '',
      customerData.createdBy || '',
      customerData.createdAt || '',
      customerData.updatedAt || '',
      customerData.status || 'active'
    ];
    
    // Thêm dòng mới
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);
    
    console.log(`Saved customer ${customerData.name} for ${employeeName}`);
    return createResponse(true, 'Customer saved successfully');
  } catch (error) {
    console.error('Error saving customer:', error);
    return createResponse(false, error.toString());
  }
}

/**
 * Cập nhật khách hàng trong sheet
 */
function updateCustomerInEmployeeSheet(employeeName, employeeId, customerId, updateData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(MAIN_SPREADSHEET_ID);
    const sheetName = `KH_${employeeName}_${employeeId}`;
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return createResponse(false, 'Employee sheet not found');
    }
    
    // Tìm dòng chứa customer ID
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === customerId) {
        rowIndex = i + 1; // +1 vì getRange sử dụng 1-based index
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Customer not found');
    }
    
    // Cập nhật dữ liệu
    const updatedRowData = [
      customerId,
      updateData.name || data[rowIndex - 1][1],
      updateData.type || data[rowIndex - 1][2],
      updateData.phone || data[rowIndex - 1][3],
      updateData.email || data[rowIndex - 1][4],
      updateData.address || data[rowIndex - 1][5],
      updateData.notes || data[rowIndex - 1][6],
      updateData.assignedTo || data[rowIndex - 1][7],
      data[rowIndex - 1][8], // createdBy không thay đổi
      data[rowIndex - 1][9], // createdAt không thay đổi
      updateData.updatedAt || new Date().toISOString(),
      updateData.status || data[rowIndex - 1][11]
    ];
    
    sheet.getRange(rowIndex, 1, 1, updatedRowData.length).setValues([updatedRowData]);
    
    console.log(`Updated customer ${customerId} for ${employeeName}`);
    return createResponse(true, 'Customer updated successfully');
  } catch (error) {
    console.error('Error updating customer:', error);
    return createResponse(false, error.toString());
  }
}

/**
 * Xóa khách hàng khỏi sheet
 */
function deleteCustomerFromEmployeeSheet(employeeName, employeeId, customerId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(MAIN_SPREADSHEET_ID);
    const sheetName = `KH_${employeeName}_${employeeId}`;
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return createResponse(false, 'Employee sheet not found');
    }
    
    // Tìm dòng chứa customer ID
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === customerId) {
        rowIndex = i + 1; // +1 vì deleteRow sử dụng 1-based index
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Customer not found');
    }
    
    // Xóa dòng
    sheet.deleteRow(rowIndex);
    
    console.log(`Deleted customer ${customerId} for ${employeeName}`);
    return createResponse(true, 'Customer deleted successfully');
  } catch (error) {
    console.error('Error deleting customer:', error);
    return createResponse(false, error.toString());
  }
}

/**
 * Đồng bộ tất cả khách hàng của nhân viên
 */
function syncEmployeeCustomers(employeeName, employeeId, customersData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(MAIN_SPREADSHEET_ID);
    const sheetName = `KH_${employeeName}_${employeeId}`;
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // Tạo sheet nếu chưa có
    if (!sheet) {
      createEmployeeCustomerSheet(employeeName, employeeId);
      sheet = spreadsheet.getSheetByName(sheetName);
    }
    
    // Xóa dữ liệu cũ (giữ lại header)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // Thêm dữ liệu mới
    if (customersData && customersData.length > 0) {
      const rowsData = customersData.map(customer => [
        customer.id || '',
        customer.name || '',
        customer.type || '',
        customer.phone || '',
        customer.email || '',
        customer.address || '',
        customer.notes || '',
        customer.assignedTo || '',
        customer.createdBy || '',
        customer.createdAt || '',
        customer.updatedAt || '',
        customer.status || 'active'
      ]);
      
      sheet.getRange(2, 1, rowsData.length, CUSTOMER_HEADERS.length).setValues(rowsData);
    }
    
    console.log(`Synced ${customersData.length} customers for ${employeeName}`);
    return createResponse(true, `Synced ${customersData.length} customers successfully`);
  } catch (error) {
    console.error('Error syncing customers:', error);
    return createResponse(false, error.toString());
  }
}

/**
 * Lấy danh sách khách hàng của nhân viên
 */
function getEmployeeCustomers(employeeName, employeeId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(MAIN_SPREADSHEET_ID);
    const sheetName = `KH_${employeeName}_${employeeId}`;
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return createResponse(true, []);
    }
    
    const data = sheet.getDataRange().getValues();
    const customers = [];
    
    // Bỏ qua header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      customers.push({
        id: row[0],
        name: row[1],
        type: row[2],
        phone: row[3],
        email: row[4],
        address: row[5],
        notes: row[6],
        assignedTo: row[7],
        createdBy: row[8],
        createdAt: row[9],
        updatedAt: row[10],
        status: row[11]
      });
    }
    
    console.log(`Retrieved ${customers.length} customers for ${employeeName}`);
    return createResponse(true, customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    return createResponse(false, error.toString());
  }
}

/**
 * Tạo response object
 */
function createResponse(success, data) {
  const response = {
    success: success,
    data: data,
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
