
export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'partner' | 'architect' | 'client' | 'quote';
  date: string;
  status: 'todo' | 'in-progress' | 'on-hold' | 'completed';
  progress: number;
  isNew: boolean;
  location: 'hanoi' | 'hcm';
  teamId: string;
  assignedTo: string;
}

export interface TaskListProps {
  location: string;
  teamId: string;
}
