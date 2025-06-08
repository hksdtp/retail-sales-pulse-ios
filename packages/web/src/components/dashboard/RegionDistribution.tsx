import React, { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { reportsDataService } from '@/services/ReportsDataService';

// Màu sắc iOS cho biểu đồ
const COLORS = ['#007AFF', '#FF9500', '#4CD964'];

const RegionDistribution = () => {
  const { currentUser } = useAuth();

  // Lấy dữ liệu phân bố theo vùng từ ReportsDataService
  const data = useMemo(() => {
    const metrics = reportsDataService.getDashboardMetrics();
    const totalSales = metrics.regionData.hanoi.sales + metrics.regionData.hcm.sales;

    return [
      {
        name: 'Hà Nội',
        value: Math.round((metrics.regionData.hanoi.sales / totalSales) * 100),
        sales: metrics.regionData.hanoi.sales,
        employees: metrics.regionData.hanoi.employees
      },
      {
        name: 'TP.HCM',
        value: Math.round((metrics.regionData.hcm.sales / totalSales) * 100),
        sales: metrics.regionData.hcm.sales,
        employees: metrics.regionData.hcm.employees
      }
    ];
  }, []);

  // Chỉ hiển thị nếu người dùng có vai trò là retail_director
  if (currentUser?.role !== 'retail_director') {
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
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
