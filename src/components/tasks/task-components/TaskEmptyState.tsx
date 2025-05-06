
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TaskEmptyState = () => {
  return (
    <Card className="border border-dashed shadow-none">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">Không có công việc nào phù hợp với điều kiện lọc</p>
      </CardContent>
    </Card>
  );
};

export default TaskEmptyState;
