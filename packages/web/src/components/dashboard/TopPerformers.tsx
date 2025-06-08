import React, { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { reportsDataService } from '@/services/ReportsDataService';

interface Performer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  sales: number;
  deals: number;
  completion: number;
}

const TopPerformers = () => {
  const { currentUser, users } = useAuth();

  // Lấy danh sách nhân viên xuất sắc từ ReportsDataService
  const topPerformers = useMemo(() => {
    return reportsDataService.getTopPerformers(3);
  }, []);

  // Chỉ hiển thị nếu người dùng có vai trò là retail_director
  if (currentUser?.role !== 'retail_director') {
    return null;
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Nhân viên xuất sắc</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers.map((performer) => (
            <div key={performer.id} className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-ios-blue flex items-center justify-center text-white font-medium">
                {performer.avatar}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">{performer.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(performer.sales / 1000000).toFixed(1)}tr</p>
                    <p className="text-sm text-muted-foreground">{performer.deals} đơn</p>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ios-blue rounded-full"
                    style={{ width: `${Math.min(performer.completion, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1">{performer.completion}% mục tiêu</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformers;
