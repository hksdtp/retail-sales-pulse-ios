-- ===== PLANS TABLE MIGRATION =====
-- Tạo bảng plans và relationships với tasks table

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'work' CHECK (type IN ('work', 'meeting', 'call', 'visit', 'other')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Scheduling information
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    reminder_date TIMESTAMP WITH TIME ZONE,
    
    -- Recurrence settings
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(20) CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
    recurrence_interval INTEGER DEFAULT 1,
    recurrence_end_date DATE,
    
    -- Task relationship
    source_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    generated_task_ids UUID[] DEFAULT '{}',
    
    -- Status and automation
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled', 'overdue')),
    auto_create_task BOOLEAN DEFAULT TRUE,
    is_template BOOLEAN DEFAULT FALSE,
    
    -- User and team information
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    team_id VARCHAR(50),
    location VARCHAR(100),
    assigned_to VARCHAR(255),
    
    -- Visibility and sharing
    visibility VARCHAR(20) NOT NULL DEFAULT 'personal' CHECK (visibility IN ('personal', 'team', 'public')),
    shared_with TEXT[] DEFAULT '{}',
    
    -- Additional metadata
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    attachments TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_team_id ON plans(team_id);
CREATE INDEX IF NOT EXISTS idx_plans_scheduled_date ON plans(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);
CREATE INDEX IF NOT EXISTS idx_plans_type ON plans(type);
CREATE INDEX IF NOT EXISTS idx_plans_assigned_to ON plans(assigned_to);
CREATE INDEX IF NOT EXISTS idx_plans_source_task_id ON plans(source_task_id);
CREATE INDEX IF NOT EXISTS idx_plans_is_recurring ON plans(is_recurring);
CREATE INDEX IF NOT EXISTS idx_plans_auto_create_task ON plans(auto_create_task);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_plans_user_status_date ON plans(user_id, status, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_plans_team_status_date ON plans(team_id, status, scheduled_date);

-- Add plan_id column to tasks table for reverse relationship
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_from_plan BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT FALSE;

-- Create index for plan_id in tasks
CREATE INDEX IF NOT EXISTS idx_tasks_plan_id ON tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_from_plan ON tasks(is_from_plan);

-- Create plan_notifications table for scheduling notifications
CREATE TABLE IF NOT EXISTS plan_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('reminder', 'due_today', 'overdue', 'auto_created')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_plan_notifications_plan_id ON plan_notifications(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_notifications_user_id ON plan_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_notifications_scheduled_time ON plan_notifications(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_plan_notifications_sent ON plan_notifications(sent);

-- Create plan_templates table for reusable templates
CREATE TABLE IF NOT EXISTS plan_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for templates
CREATE INDEX IF NOT EXISTS idx_plan_templates_created_by ON plan_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_plan_templates_category ON plan_templates(category);
CREATE INDEX IF NOT EXISTS idx_plan_templates_is_public ON plan_templates(is_public);

-- Create plan_task_sync_log table for tracking synchronization events
CREATE TABLE IF NOT EXISTS plan_task_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    event_data JSONB,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sync log
CREATE INDEX IF NOT EXISTS idx_sync_log_plan_id ON plan_task_sync_log(plan_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_task_id ON plan_task_sync_log(task_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_event_type ON plan_task_sync_log(event_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_created_at ON plan_task_sync_log(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_templates_updated_at 
    BEFORE UPDATE ON plan_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update plan status based on dates
CREATE OR REPLACE FUNCTION update_plan_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status to overdue if scheduled_date has passed and status is still scheduled
    IF NEW.scheduled_date < CURRENT_DATE AND NEW.status = 'scheduled' THEN
        NEW.status = 'overdue';
    END IF;
    
    -- Update status to active if scheduled_date is today and status is scheduled
    IF NEW.scheduled_date = CURRENT_DATE AND NEW.status = 'scheduled' THEN
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic status updates
CREATE TRIGGER update_plan_status_trigger 
    BEFORE INSERT OR UPDATE ON plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_plan_status();

-- Create RLS (Row Level Security) policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_task_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for plans table
CREATE POLICY "Users can view their own plans" ON plans
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view team plans" ON plans
    FOR SELECT USING (
        team_id = current_setting('app.current_team_id', true) 
        AND visibility IN ('team', 'public')
    );

CREATE POLICY "Users can insert their own plans" ON plans
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own plans" ON plans
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own plans" ON plans
    FOR DELETE USING (user_id = current_setting('app.current_user_id', true));

-- Grant permissions
GRANT ALL ON plans TO authenticated;
GRANT ALL ON plan_notifications TO authenticated;
GRANT ALL ON plan_templates TO authenticated;
GRANT ALL ON plan_task_sync_log TO authenticated;

-- Insert sample data for testing (optional)
-- INSERT INTO plans (title, description, type, scheduled_date, user_id, user_name, team_id, location)
-- VALUES 
--     ('Weekly Team Meeting', 'Họp nhóm hàng tuần để review progress', 'meeting', CURRENT_DATE + INTERVAL '1 day', 'user_test', 'Test User', '1', 'Hà Nội'),
--     ('Customer Visit', 'Thăm khách hàng ABC Company', 'visit', CURRENT_DATE + INTERVAL '3 days', 'user_test', 'Test User', '1', 'Hà Nội');

COMMENT ON TABLE plans IS 'Bảng lưu trữ kế hoạch công việc';
COMMENT ON TABLE plan_notifications IS 'Bảng lưu trữ thông báo cho kế hoạch';
COMMENT ON TABLE plan_templates IS 'Bảng lưu trữ templates kế hoạch có thể tái sử dụng';
COMMENT ON TABLE plan_task_sync_log IS 'Bảng log các sự kiện đồng bộ giữa plan và task';
