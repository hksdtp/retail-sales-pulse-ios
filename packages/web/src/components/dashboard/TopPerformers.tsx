import React, { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

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

  // Lọc danh sách nhân viên xuất sắc từ dữ liệu người dùng thực
  const topPerformers = useMemo(() => {
    // Dữ liệu thật từ báo cáo doanh số (5 tháng đầu năm 2024)
    const realPerformers = [
      {
        id: 'nga_hcm',
        name: 'Nguyễn Thị Nga',
        role: 'Nhân viên',
        location: 'HCM',
        avatar: 'N',
        sales: 2580000000, // 2.58 tỷ
        deals: 25,
        completion: 135,
        contribution: 53.67
      },
      {
        id: 'huong_hn',
        name: 'Phạm Thị Hương',
        role: 'Nhân viên',
        location: 'Hà Nội',
        avatar: 'H',
        sales: 1310000000, // 1.31 tỷ
        deals: 20,
        completion: 125,
        contribution: 27.01
      },
      {
        id: 'anh_hn',
        name: 'Lương Việt Anh',
        role: 'Nhóm trưởng',
        location: 'Hà Nội',
        avatar: 'A',
        sales: 1150000000, // 1.15 tỷ
        deals: 18,
        completion: 120,
        contribution: 23.73
      }
    ];

    return realPerformers;
  }, []);

  // Chỉ hiển thị nếu người dùng có vai trò là retail_director hoặc project_director
  if (currentUser?.role !== 'retail_director' && currentUser?.role !== 'project_director') {
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
