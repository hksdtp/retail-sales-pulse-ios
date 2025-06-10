// Simple fallback dashboard để tránh crash
import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { User } from '@/types/user';

interface SimpleDashboardProps {
  currentUser: User | null;
  isLoading?: boolean;
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ currentUser, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isDirector = currentUser?.name === 'Khổng Đức Mạnh';
  const isTeamLeader = currentUser?.role === 'team_leader';

  const kpiCards = [
    {
      title: isDirector ? 'Tổng KTS' : isTeamLeader ? 'KTS Nhóm' : 'KTS Cá nhân',
      value: '0',
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: isDirector ? 'Tổng KH/CĐT' : isTeamLeader ? 'KH/CĐT Nhóm' : 'KH/CĐT Cá nhân',
      value: '0',
      icon: Users,
      color: 'green'
    },
    {
      title: isDirector ? 'Tổng SBG' : isTeamLeader ? 'SBG Nhóm' : 'SBG Cá nhân',
      value: '0',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: isDirector ? 'Tổng Doanh Số' : isTeamLeader ? 'Doanh Số Nhóm' : 'Doanh Số Cá nhân',
      value: '0',
      icon: DollarSign,
      color: 'yellow'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-cyan-50/80 border-blue-200/50 text-blue-700';
      case 'green':
        return 'bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/80 border-emerald-200/50 text-emerald-700';
      case 'purple':
        return 'bg-gradient-to-br from-purple-50/80 via-violet-50/60 to-indigo-50/80 border-purple-200/50 text-purple-700';
      case 'yellow':
        return 'bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/80 border-amber-200/50 text-amber-700';
      default:
        return 'bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-zinc-50/80 border-gray-200/50 text-gray-700';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Summary */}
      <div className="bg-gradient-to-br from-slate-50/80 via-white/90 to-blue-50/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-lg shadow-black/5 p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100/80 rounded-xl mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Dashboard đang được cập nhật
          </h3>
          <p className="text-sm text-slate-600">
            Dữ liệu KPI sẽ hiển thị khi có công việc và báo cáo được tạo.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="kpi-cards-grid">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses = getColorClasses(card.color);
          
          return (
            <div
              key={index}
              className={`
                rounded-2xl border backdrop-blur-xl p-6
                transition-all duration-500 ease-out
                hover:shadow-lg hover:shadow-black/10
                hover:scale-[1.02] hover:-translate-y-1
                group ${colorClasses}
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-white/60 group-hover:bg-white/80 transition-colors duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`w-2 h-2 rounded-full ${card.color === 'yellow' ? 'bg-amber-400' : 'bg-blue-400'} shadow-sm`}></div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold tracking-wide uppercase opacity-90">{card.title}</h4>
                <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                <div className="text-xs font-medium opacity-75 bg-white/40 rounded-lg px-2 py-1 inline-block">
                  Chưa có dữ liệu
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-lg shadow-black/5 p-8">
        <div className="text-center text-slate-600">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100/80 to-indigo-100/80 rounded-2xl mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="font-semibold text-slate-800 mb-3">Bắt đầu sử dụng Dashboard</h4>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Tạo công việc và báo cáo để xem dữ liệu KPI chi tiết tại đây.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
