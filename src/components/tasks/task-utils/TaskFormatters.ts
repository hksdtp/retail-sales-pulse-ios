
// Các hàm để định dạng và hiển thị

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'partner': return 'bg-ios-blue text-white';
    case 'architect': return 'bg-ios-green text-white';
    case 'client': return 'bg-ios-orange text-white';
    case 'quote': return 'bg-ios-yellow text-black';
    default: return 'bg-gray-200 text-gray-800';
  }
};

export const getTypeName = (type: string) => {
  switch (type) {
    case 'partner': return 'Đối tác';
    case 'architect': return 'KTS';
    case 'client': return 'Khách hàng';
    case 'quote': return 'Báo giá';
    default: return type;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-ios-green';
    case 'in-progress': return 'bg-ios-blue';
    case 'on-hold': return 'bg-ios-yellow';
    case 'todo': return 'bg-gray-300';
    default: return 'bg-gray-200';
  }
};

export const getLocationName = (location: string) => {
  return location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh';
};
