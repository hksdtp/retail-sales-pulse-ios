
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KpiCardProps {
  title: string;
  value: string | number;
  change: number;
  data: Array<{ value: number }>;
  className?: string;
  oldValue?: string | number;
}

const KpiCard = ({ title, value, change, data, className, oldValue }: KpiCardProps) => {
  const isPositive = change >= 0;

  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div className="flex items-baseline mt-1 gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {oldValue && (
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Cũ: </span>
                <span className="text-sm font-medium ml-1">{oldValue}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-ios-green' : 'text-ios-red'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">so với tháng trước</span>
          </div>
          
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isPositive ? '#34C759' : '#FF3B30'} 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
