import React from 'react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import { Button } from '@/components/ui/button';

const Calendar = () => {
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
