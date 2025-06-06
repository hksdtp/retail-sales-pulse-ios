import { ArrowDown, ArrowUp } from 'lucide-react';
import React from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

import { Card, CardContent } from '@/components/ui/card';

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
    <Card
      className={`bg-white/95 backdrop-blur-lg border border-white/30 shadow-xl overflow-hidden rounded-[20px] transition-all ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#636e72]">{title}</span>
          <div className="flex items-baseline mt-1 gap-2">
            <span className="text-2xl font-bold text-[#2d3436]">{value}</span>
            {oldValue && (
              <div className="flex items-center">
                <span className="text-sm text-[#636e72]">Cũ: </span>
                <span className="text-sm font-medium ml-1 text-[#2d3436]">{oldValue}</span>
              </div>
            )}
          </div>

          <div className="flex items-center mt-2">
            <span
              className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}
            >
              {isPositive ? (
                <ArrowUp className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-[#636e72] ml-1">so với tháng trước</span>
          </div>

          <div className="mt-3 h-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
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
