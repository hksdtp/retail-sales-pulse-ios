// Danh sách ngày lễ Việt Nam
export interface VietnamHoliday {
  date: string; // YYYY-MM-DD format
  name: string;
  type: 'national' | 'traditional' | 'international';
  isOfficial: boolean; // Có nghỉ làm không
}

export const vietnamHolidays2024: VietnamHoliday[] = [
  // Tết Dương lịch
  { date: '2024-01-01', name: 'Tết Dương lịch', type: 'national', isOfficial: true },
  
  // Tết Nguyên đán (10-16/2/2024)
  { date: '2024-02-10', name: 'Tết Nguyên đán (30 Tết)', type: 'traditional', isOfficial: true },
  { date: '2024-02-11', name: 'Tết Nguyên đán (Mùng 1)', type: 'traditional', isOfficial: true },
  { date: '2024-02-12', name: 'Tết Nguyên đán (Mùng 2)', type: 'traditional', isOfficial: true },
  { date: '2024-02-13', name: 'Tết Nguyên đán (Mùng 3)', type: 'traditional', isOfficial: true },
  { date: '2024-02-14', name: 'Tết Nguyên đán (Mùng 4)', type: 'traditional', isOfficial: true },
  { date: '2024-02-15', name: 'Tết Nguyên đán (Mùng 5)', type: 'traditional', isOfficial: true },
  { date: '2024-02-16', name: 'Tết Nguyên đán (Mùng 6)', type: 'traditional', isOfficial: true },
  
  // Ngày Quốc tế Phụ nữ
  { date: '2024-03-08', name: 'Ngày Quốc tế Phụ nữ', type: 'international', isOfficial: false },
  
  // Giỗ Tổ Hùng Vương
  { date: '2024-04-18', name: 'Giỗ Tổ Hùng Vương', type: 'traditional', isOfficial: true },
  
  // Ngày Giải phóng miền Nam
  { date: '2024-04-30', name: 'Ngày Giải phóng miền Nam', type: 'national', isOfficial: true },
  
  // Ngày Quốc tế Lao động
  { date: '2024-05-01', name: 'Ngày Quốc tế Lao động', type: 'international', isOfficial: true },
  
  // Ngày Quốc khánh
  { date: '2024-09-02', name: 'Ngày Quốc khánh', type: 'national', isOfficial: true },
];

export const vietnamHolidays2025: VietnamHoliday[] = [
  // Tết Dương lịch
  { date: '2025-01-01', name: 'Tết Dương lịch', type: 'national', isOfficial: true },
  
  // Tết Nguyên đán (28/1 - 3/2/2025)
  { date: '2025-01-28', name: 'Tết Nguyên đán (30 Tết)', type: 'traditional', isOfficial: true },
  { date: '2025-01-29', name: 'Tết Nguyên đán (Mùng 1)', type: 'traditional', isOfficial: true },
  { date: '2025-01-30', name: 'Tết Nguyên đán (Mùng 2)', type: 'traditional', isOfficial: true },
  { date: '2025-01-31', name: 'Tết Nguyên đán (Mùng 3)', type: 'traditional', isOfficial: true },
  { date: '2025-02-01', name: 'Tết Nguyên đán (Mùng 4)', type: 'traditional', isOfficial: true },
  { date: '2025-02-02', name: 'Tết Nguyên đán (Mùng 5)', type: 'traditional', isOfficial: true },
  { date: '2025-02-03', name: 'Tết Nguyên đán (Mùng 6)', type: 'traditional', isOfficial: true },
  
  // Ngày Quốc tế Phụ nữ
  { date: '2025-03-08', name: 'Ngày Quốc tế Phụ nữ', type: 'international', isOfficial: false },
  
  // Giỗ Tổ Hùng Vương
  { date: '2025-04-06', name: 'Giỗ Tổ Hùng Vương', type: 'traditional', isOfficial: true },
  
  // Ngày Giải phóng miền Nam
  { date: '2025-04-30', name: 'Ngày Giải phóng miền Nam', type: 'national', isOfficial: true },
  
  // Ngày Quốc tế Lao động
  { date: '2025-05-01', name: 'Ngày Quốc tế Lao động', type: 'international', isOfficial: true },
  
  // Ngày Quốc khánh
  { date: '2025-09-02', name: 'Ngày Quốc khánh', type: 'national', isOfficial: true },
];

// Combine all holidays
export const allVietnamHolidays = [...vietnamHolidays2024, ...vietnamHolidays2025];

// Helper functions
export const isVietnamHoliday = (date: string): VietnamHoliday | null => {
  return allVietnamHolidays.find(holiday => holiday.date === date) || null;
};

export const isOfficialHoliday = (date: string): boolean => {
  const holiday = isVietnamHoliday(date);
  return holiday ? holiday.isOfficial : false;
};

export const getHolidayName = (date: string): string | null => {
  const holiday = isVietnamHoliday(date);
  return holiday ? holiday.name : null;
};

export const getHolidaysInMonth = (year: number, month: number): VietnamHoliday[] => {
  const monthStr = month.toString().padStart(2, '0');
  const yearMonth = `${year}-${monthStr}`;
  
  return allVietnamHolidays.filter(holiday => 
    holiday.date.startsWith(yearMonth)
  );
};

// Vietnamese month names
export const vietnameseMonths = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

// Vietnamese day names
export const vietnameseDays = [
  'Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'
];

// Short Vietnamese day names
export const vietnameseDaysShort = [
  'CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'
];
