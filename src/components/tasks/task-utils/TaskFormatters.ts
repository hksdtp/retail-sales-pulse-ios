
// Các hàm để định dạng và hiển thị

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'partner_new':
    case 'partner_old': 
      return 'bg-ios-blue text-white';
    case 'architect_new':
    case 'architect_old': 
      return 'bg-ios-green text-white';
    case 'client_new':
    case 'client_old': 
      return 'bg-ios-orange text-white';
    case 'quote_new':
    case 'quote_old': 
      return 'bg-ios-yellow text-black';
    case 'other':
      return 'bg-purple-500 text-white';
    default: 
      return 'bg-gray-200 text-gray-800';
  }
};

export const getTypeName = (type: string) => {
  switch (type) {
    case 'partner_new': return 'Đối tác mới';
    case 'partner_old': return 'Đối tác cũ';
    case 'architect_new': return 'KTS mới';
    case 'architect_old': return 'KTS cũ';
    case 'client_new': return 'Khách hàng mới';
    case 'client_old': return 'Khách hàng cũ';
    case 'quote_new': return 'Báo giá mới';
    case 'quote_old': return 'Báo giá cũ';
    case 'other': return 'Khác';
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
