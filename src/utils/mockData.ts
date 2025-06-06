import { Task } from '../components/tasks/types/TaskTypes';

// Dữ liệu trống - sẵn sàng cho dữ liệu thật
export const mockTasks: Task[] = [];

// Xóa tất cả dữ liệu trong localStorage
export const saveMockTasksToLocalStorage = (): void => {
  localStorage.removeItem('rawTasks');
  localStorage.removeItem('tasks');
};

// Lấy dữ liệu mẫu từ localStorage
export const getMockTasksFromLocalStorage = (): Task[] => {
  const storedTasks = localStorage.getItem('rawTasks');
  return storedTasks ? JSON.parse(storedTasks) : [];
};
