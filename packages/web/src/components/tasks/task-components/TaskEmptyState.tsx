import React from 'react';
import { Plus, Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TaskEmptyState = () => {
  return (
    <Card className="border border-dashed shadow-none macos-card">
      <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="mb-4">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-2" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có công việc nào</h3>
        <p className="text-muted-foreground text-sm mb-4 max-w-sm">
          Chưa có công việc nào được tạo. Hãy tạo công việc đầu tiên để bắt đầu quản lý công việc của bạn.
        </p>
        <Button className="macos-button flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo công việc đầu tiên
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskEmptyState;
