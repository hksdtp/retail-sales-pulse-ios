
import { Task } from '../types/TaskTypes';

// Dữ liệu mẫu mở rộng với thông tin về khu vực, nhóm và người được giao
export const tasks: Task[] = [
  {
    id: '1',
    title: 'Gặp đối tác ABC',
    description: 'Thảo luận về hợp tác mới',
    type: 'partner_new',
    date: '10:30',
    status: 'todo',
    progress: 0,
    isNew: true,
    location: 'hanoi',
    teamId: 'team-1',
    assignedTo: 'user-1'
  },
  {
    id: '3',
    title: 'Khảo sát công trình Y',
    description: 'Đo đạc và đánh giá hiện trạng',
    type: 'client_old',
    date: '14:00',
    status: 'in-progress',
    progress: 60,
    isNew: false,
    location: 'hcm',
    teamId: 'team-2',
    assignedTo: 'user-2'
  },
  {
    id: '4',
    title: 'Làm việc với KTS Nguyễn',
    description: 'Trao đổi về thiết kế mới',
    type: 'architect_new',
    date: '09:00',
    status: 'in-progress',
    progress: 30,
    isNew: true,
    location: 'hanoi',
    teamId: 'team-1',
    assignedTo: 'user-3'
  },
  {
    id: '2',
    title: 'Báo giá dự án X',
    description: 'Chuẩn bị báo giá cho khách hàng',
    type: 'quote_new',
    date: '12/05/2025',
    status: 'todo',
    progress: 0,
    isNew: true,
    location: 'hcm',
    teamId: 'team-3',
    assignedTo: 'user-4'
  },
  {
    id: '5',
    title: 'Phản hồi báo giá',
    description: 'Chờ khách hàng phản hồi',
    type: 'quote_old',
    date: '07/05/2025',
    status: 'on-hold',
    progress: 80,
    isNew: false,
    location: 'hanoi',
    teamId: 'team-2',
    assignedTo: 'user-5'
  },
  {
    id: '6',
    title: 'Ký hợp đồng với Z',
    description: 'Hoàn tất thủ tục ký kết',
    type: 'client_new',
    date: '01/05/2025',
    status: 'completed',
    progress: 100,
    isNew: false,
    location: 'hcm',
    teamId: 'team-1',
    assignedTo: 'user-6'
  },
];
