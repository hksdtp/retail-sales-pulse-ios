/**
 * Plan Types and Interfaces
 * Định nghĩa types cho hệ thống quản lý kế hoạch
 */

export interface Plan {
  id: string;
  title: string;
  description: string;
  type: 'work' | 'meeting' | 'call' | 'visit' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Scheduling information
  scheduled_date: string; // ISO date string
  scheduled_time?: string; // HH:mm format
  reminder_date?: string; // ISO date string for reminder
  
  // Plan-specific fields
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval?: number; // Every X days/weeks/months
  recurrence_end_date?: string;
  
  // Relationship with tasks
  source_task_id?: string; // If created from a task
  generated_task_ids: string[]; // Tasks created from this plan
  
  // Status and metadata
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'overdue';
  auto_create_task: boolean; // Whether to auto-create task on scheduled date
  is_template: boolean; // Whether this is a reusable template
  
  // User and team information
  user_id: string;
  user_name: string;
  team_id: string;
  location: string;
  assigned_to?: string; // Can be assigned to someone else
  
  // Visibility and sharing
  visibility: 'personal' | 'team' | 'public';
  shared_with: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Additional metadata
  tags?: string[];
  notes?: string;
  attachments?: string[];
}

export interface PlanFormData {
  title: string;
  description: string;
  type: 'work' | 'meeting' | 'call' | 'visit' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_date: string;
  scheduled_time: string;
  reminder_date?: string;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval?: number;
  recurrence_end_date?: string;
  auto_create_task: boolean;
  is_template: boolean;
  assigned_to?: string;
  visibility: 'personal' | 'team' | 'public';
  shared_with: string[];
  tags: string[];
  notes: string;
}

export interface TaskToPlanConversion {
  task_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  reminder_date?: string;
  is_recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval?: number;
  auto_create_task?: boolean;
}

export interface PlanToTaskConversion {
  plan_id: string;
  execution_date: string;
  inherit_properties: boolean;
  custom_title?: string;
  custom_description?: string;
  custom_priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface PlanFilters {
  status?: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'overdue';
  type?: 'work' | 'meeting' | 'call' | 'visit' | 'other';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  date_range?: {
    start: string;
    end: string;
  };
  assigned_to?: string;
  user_id?: string;
  team_id?: string;
  is_recurring?: boolean;
  search?: string;
}

export interface PlanNotification {
  id: string;
  plan_id: string;
  type: 'reminder' | 'due_today' | 'overdue' | 'auto_created';
  title: string;
  message: string;
  scheduled_time: string;
  sent: boolean;
  user_id: string;
  created_at: string;
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  template_data: Partial<PlanFormData>;
  category: string;
  is_public: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PlanStats {
  total_plans: number;
  scheduled_plans: number;
  active_plans: number;
  completed_plans: number;
  overdue_plans: number;
  upcoming_this_week: number;
  recurring_plans: number;
  auto_created_tasks: number;
}

// Utility types
export type PlanStatus = Plan['status'];
export type PlanType = Plan['type'];
export type PlanPriority = Plan['priority'];
export type PlanVisibility = Plan['visibility'];
export type RecurrencePattern = Plan['recurrence_pattern'];

// Form validation schemas
export interface PlanValidationRules {
  title: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  description: {
    required: boolean;
    maxLength: number;
  };
  scheduled_date: {
    required: boolean;
    minDate?: string; // Cannot schedule in the past
  };
  recurrence_end_date: {
    mustBeAfterScheduledDate: boolean;
  };
}

// API response types
export interface PlanResponse {
  success: boolean;
  data?: Plan;
  error?: string;
  message?: string;
}

export interface PlansResponse {
  success: boolean;
  data?: Plan[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
  message?: string;
}

export interface PlanConversionResponse {
  success: boolean;
  data?: {
    plan?: Plan;
    task?: any; // Import Task type if needed
  };
  error?: string;
  message?: string;
}

// Event types for plan-task synchronization
export interface PlanTaskSyncEvent {
  type: 'plan_created' | 'plan_updated' | 'plan_completed' | 'task_completed' | 'task_to_plan' | 'plan_to_task';
  plan_id?: string;
  task_id?: string;
  data: any;
  timestamp: string;
  user_id: string;
}

export default Plan;
