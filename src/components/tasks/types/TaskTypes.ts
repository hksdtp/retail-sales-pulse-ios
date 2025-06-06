export interface TaskFilters {
  status?: string;
  type?: string;
  search?: string;
  date?: Date | null;
  teamId?: string;
  assignedTo?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all' | 'custom';
  progress?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type:
    | 'partner_new'
    | 'partner_old'
    | 'architect_new'
    | 'architect_old'
    | 'client_new'
    | 'client_old'
    | 'quote_new'
    | 'quote_old'
    | 'report'
    | 'training'
    | 'meeting'
    | 'inventory'
    | 'other';
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
  isShared?: boolean;
  isSharedWithTeam?: boolean;
  [key: string]: string | number | boolean | undefined | null;
}

export interface TaskListProps {
  location: string;
  teamId: string;
}
