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
  category?: 'task' | 'sales' | 'combined';
}

const KpiCard = ({ title, value, change, data, className, oldValue, category = 'task' }: KpiCardProps) => {
  const isPositive = change >= 0;

  // Gradient colors theo category
  const getGradientColors = () => {
    switch (category) {
      case 'sales':
        return 'from-amber-50/80 via-yellow-50/60 to-orange-50/80';
      case 'task':
        return 'from-blue-50/80 via-indigo-50/60 to-cyan-50/80';
      default:
        return 'from-slate-50/80 via-gray-50/60 to-zinc-50/80';
    }
  };

  // Border colors theo category
  const getBorderColors = () => {
    switch (category) {
      case 'sales':
        return 'border-amber-200/50';
      case 'task':
        return 'border-blue-200/50';
      default:
        return 'border-gray-200/50';
    }
  };

  // Accent colors cho chart
  const getAccentColor = () => {
    switch (category) {
      case 'sales':
        return isPositive ? '#f59e0b' : '#dc2626';
      case 'task':
        return isPositive ? '#3b82f6' : '#ef4444';
      default:
        return isPositive ? '#10b981' : '#f43f5e';
    }
  };

  return (
    <Card
      className={`
        bg-gradient-to-br ${getGradientColors()}
        backdrop-blur-xl
        border ${getBorderColors()}
        shadow-lg shadow-black/5
        hover:shadow-xl hover:shadow-black/10
        overflow-hidden
        rounded-2xl
        transition-all duration-500 ease-out
        hover:scale-[1.02]
        hover:-translate-y-1
        group
        ${className}
      `}
    >
      <CardContent className="p-6 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="flex flex-col relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600 tracking-wide uppercase">{title}</span>
            <div className={`w-2 h-2 rounded-full ${category === 'sales' ? 'bg-amber-400' : 'bg-blue-400'} shadow-sm`}></div>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
            {oldValue && (
              <div className="flex items-center bg-white/60 rounded-lg px-2 py-1">
                <span className="text-xs text-slate-500 font-medium">Trước: </span>
                <span className="text-xs font-semibold ml-1 text-slate-700">{oldValue}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`
                inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold
                ${isPositive
                  ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50'
                  : 'bg-rose-100/80 text-rose-700 border border-rose-200/50'
                }
              `}>
                {isPositive ? (
                  <ArrowUp className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(change)}%
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium">vs kế hoạch</span>
          </div>

          <div className="mt-5 h-14 relative overflow-hidden rounded-lg bg-white/30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getAccentColor()}
                  strokeWidth={2.5}
                  dot={false}
                  strokeDasharray="0"
                  className="drop-shadow-sm"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
