
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// Dữ liệu mẫu phân bố theo khu vực
const data = [
  { name: 'Miền Bắc', value: 55 },
  { name: 'Miền Trung', value: 15 },
  { name: 'Miền Nam', value: 30 },
];

// Màu sắc iOS cho biểu đồ
const COLORS = ['#007AFF', '#FF9500', '#4CD964'];

const RegionDistribution = () => {
  const { currentUser } = useAuth();
  
  // Chỉ hiển thị nếu người dùng có vai trò là director
  if (currentUser?.role !== 'director') {
    return null;
  }
  
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Phân bố theo vùng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#888"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionDistribution;
