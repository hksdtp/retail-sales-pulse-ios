
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import TaskKanban from './TaskKanban';
import TaskList from './TaskList';
import TaskCalendar from './TaskCalendar';

// Dữ liệu mẫu và các hàm sẽ được chuyển vào các hook và context trong tương lai
// khi ứng dụng được kết nối với backend

const TaskTabs = () => {
  const [view, setView] = useState('kanban');

  // Trong thực tế, chúng ta sẽ thêm các state và hàm xử lý để quản lý 
  // danh sách công việc và các thao tác CRUD, nhưng hiện tại, chúng chỉ là mẫu

  return (
    <Tabs value={view} onValueChange={setView} className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
          <TabsTrigger value="calendar">Lịch</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="kanban" className="mt-0">
        <TaskKanban />
      </TabsContent>
      
      <TabsContent value="list" className="mt-0">
        <TaskList />
      </TabsContent>
      
      <TabsContent value="calendar" className="mt-0">
        <TaskCalendar />
      </TabsContent>
    </Tabs>
  );
};

export default TaskTabs;
