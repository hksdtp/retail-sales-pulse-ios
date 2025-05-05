
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Hà Nội', value: 68 },
  { name: 'Hồ Chí Minh', value: 32 },
];

const COLORS = ['#0A84FF', '#FF9500'];

const RegionDistribution = () => {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Doanh số theo khu vực</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend layout="vertical" align="right" verticalAlign="middle" />
              <Tooltip
                formatter={(value) => [`${value}%`, undefined]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionDistribution;
