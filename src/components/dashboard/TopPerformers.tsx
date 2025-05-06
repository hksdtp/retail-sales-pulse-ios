
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
    // Lấy danh sách nhân viên (không bao gồm giám đốc)
    const employees = users.filter(user => user.role !== 'director');
    
    // Tạo dữ liệu hiệu suất giả lập cho mỗi nhân viên
    return employees
      .slice(0, 3)  // Lấy 3 người đầu tiên
      .map((user) => {
        // Tính toán giả lập doanh số cho mỗi nhân viên
        const sales = user.role === 'team_leader' 
          ? Math.floor(Math.random() * 100000000) + 300000000 
          : Math.floor(Math.random() * 50000000) + 250000000;
        
        const deals = user.role === 'team_leader' 
          ? Math.floor(Math.random() * 10) + 15 
          : Math.floor(Math.random() * 5) + 10;
        
        const completion = user.role === 'team_leader' 
          ? Math.floor(Math.random() * 30) + 120 
          : Math.floor(Math.random() * 20) + 100;
          
        return {
          id: user.id,
          name: user.name,
          role: user.role === 'team_leader' ? 'Nhóm trưởng' : 'Nhân viên',
          avatar: user.name.charAt(0),
          sales,
          deals,
          completion
        };
      })
      // Sắp xếp theo doanh số từ cao đến thấp
      .sort((a, b) => b.sales - a.sales);
  }, [users]);
  
  // Chỉ hiển thị nếu người dùng có vai trò là director
  if (currentUser?.role !== 'director') {
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
