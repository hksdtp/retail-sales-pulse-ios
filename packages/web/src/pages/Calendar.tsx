import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, List, BarChart3, Settings } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

const Calendar = () => {
  const { currentUser } = useAuth();

  return (
    <AppLayout>
      <PageHeader
        title="Kế hoạch"
        subtitle="Lập và theo dõi kế hoạch công việc hàng ngày"
        actions={<Button>Thêm lịch hẹn</Button>}
      />

      <div className="p-4 md:p-6">
        <TaskCalendar />
      </div>
    </AppLayout>
  );
};

export default Calendar;
