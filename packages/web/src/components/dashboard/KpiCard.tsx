import React from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

import { Card, CardContent } from '@/components/ui/card';
import { SFSymbol } from '@/components/ui/sf-symbol';

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

  // iOS System Colors theo category
  const getIOSColors = () => {
    switch (category) {
      case 'sales':
        return {
          background: 'from-ios-orange/10 via-ios-yellow/5 to-ios-orange/10',
          border: 'border-ios-orange/20',
          accent: 'text-ios-orange',
          indicator: 'bg-ios-orange',
          chart: '#FF9500', // iOS Orange
        };
      case 'task':
        return {
          background: 'from-ios-blue/10 via-ios-indigo/5 to-ios-blue/10',
          border: 'border-ios-blue/20',
          accent: 'text-ios-blue',
          indicator: 'bg-ios-blue',
          chart: '#007AFF', // iOS Blue
        };
      default:
        return {
          background: 'from-ios-gray-6/80 via-ios-gray-5/60 to-ios-gray-6/80',
          border: 'border-ios-gray-4/50',
          accent: 'text-ios-gray',
          indicator: 'bg-ios-gray',
          chart: '#8E8E93', // iOS Gray
        };
    }
  };

  const colors = getIOSColors();

  return (
    <Card
      className={`
        ios-card
        bg-gradient-to-br ${colors.background}
        ios-vibrancy-ultra-thin
        border ${colors.border}
        shadow-ios-md
        hover:shadow-ios-lg
        overflow-hidden
        rounded-ios-xl
        transition-all duration-300 ease-out
        hover:scale-[1.02]
        hover:-translate-y-1
        ios-touch-feedback
        group
        ${className}
      `}
    >
      <CardContent className="p-ios-3 md:p-ios-6 relative">
        {/* iOS-style subtle background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/30 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/20 to-transparent rounded-full translate-y-8 -translate-x-8"></div>
        </div>

        <div className="flex flex-col relative z-10">
          <div className="flex items-center justify-between mb-ios-2 md:mb-ios-3">
            <span className="ios-caption-1 uppercase tracking-wider text-ios-label-secondary">{title}</span>
            <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${colors.indicator} shadow-ios-sm`}></div>
          </div>

          <div className="flex items-baseline gap-ios-2 md:gap-ios-3 mb-ios-3 md:mb-ios-4">
            <span className="ios-title-2 md:ios-title-1 font-bold text-ios-label-primary tracking-tight">{value}</span>
            {oldValue && (
              <div className="flex items-center ios-vibrancy-light rounded-ios-md px-ios-2 py-ios-1">
                <span className="ios-caption-2">Trước: </span>
                <span className="ios-caption-1 ml-1">{oldValue}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`
                inline-flex items-center px-ios-2 py-ios-1 rounded-ios-md ios-caption-1 font-semibold
                ${isPositive
                  ? 'bg-ios-green/10 text-ios-green border border-ios-green/20'
                  : 'bg-ios-red/10 text-ios-red border border-ios-red/20'
                }
              `}>
                <SFSymbol
                  name={isPositive ? "arrow.up" : "arrow.down"}
                  size="xs"
                  className="mr-1"
                  color={isPositive ? '#34C759' : '#FF3B30'}
                />
                {Math.abs(change)}%
              </div>
            </div>
            <span className="ios-caption-2">vs kế hoạch</span>
          </div>

          <div className="mt-ios-3 md:mt-ios-5 h-10 md:h-14 relative overflow-hidden rounded-ios-md ios-vibrancy-light">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60"></div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors.chart}
                  strokeWidth={2.5}
                  dot={false}
                  strokeDasharray="0"
                  className="drop-shadow-sm"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* iOS-style subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/15 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
