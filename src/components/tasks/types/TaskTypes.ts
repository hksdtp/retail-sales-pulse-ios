
export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'partner_new' | 'partner_old' | 'architect_new' | 'architect_old' | 'client_new' | 'client_old' | 'quote_new' | 'quote_old' | 'other';
  date: string;
  status: 'todo' | 'in-progress' | 'on-hold' | 'completed';
  progress: number;
  isNew: boolean;
  location: string;
  teamId: string;
  assignedTo: string;
  user_id: string;
  user_name?: string;
  team_id?: string;
  created_at: string;
  time?: string;
  isShared?: boolean; // Đánh dấu công việc được chia sẻ bởi Giám đốc
  isSharedWithTeam?: boolean; // Đánh dấu công việc được chia sẻ với cả nhóm
  [key: string]: string | number | boolean | undefined | null;
}

export interface TaskListProps {
  location: string;
  teamId: string;
}
