import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { aiInsightsService, AIInsight, AIAnalysis } from '@/services/aiInsightsService';
import { cn } from '@/lib/utils';

interface AIInsightsProps {
  className?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ className }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalysis = async () => {
      setIsLoading(true);
      try {
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        const aiAnalysis = aiInsightsService.generateAIAnalysis();
        setAnalysis(aiAnalysis);
      } catch (error) {
        console.error('Error loading AI analysis:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, []);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'prediction': return Target;
      case 'opportunity': return Lightbulb;
      default: return BarChart3;
    }
  };

  const getInsightColor = (type: AIInsight['type'], impact: AIInsight['impact']) => {
    if (type === 'alert') return 'border-red-200 bg-red-50';
    if (impact === 'high') return 'border-orange-200 bg-orange-50';
    if (type === 'opportunity') return 'border-green-200 bg-green-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-blue-600 bg-blue-100';
    return 'text-orange-600 bg-orange-100';
  };

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">🤖 Phân tích dữ liệu doanh số</h3>
            <p className="text-sm text-gray-600">Đang phân tích dữ liệu...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}>
        <div className="text-center text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Không thể tải AI insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 overflow-hidden", className)}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">🤖 Phân tích dữ liệu doanh số</h3>
            <p className="text-purple-100 text-sm">Phân tích thông minh từ dữ liệu doanh số</p>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-300 ml-auto animate-pulse" />
        </div>
        
        {/* AI Summary */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm leading-relaxed">{analysis.summary}</p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {analysis.insights.slice(0, 4).map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                  getInsightColor(insight.type, insight.impact),
                  selectedInsight?.id === insight.id && "ring-2 ring-purple-500"
                )}
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    getConfidenceColor(insight.confidence)
                  )}>
                    {insight.confidence}%
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
                  {insight.title}
                </h4>
                
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  )}>
                    {insight.impact === 'high' ? 'Cao' : insight.impact === 'medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                  
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Predictions */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2 text-blue-600" />
            🔮 Dự báo AI
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {aiInsightsService.formatCurrency(analysis.predictions.nextMonthSales)}
              </div>
              <div className="text-gray-600">Doanh số tháng tới</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {analysis.predictions.targetAchievementProbability}%
              </div>
              <div className="text-gray-600">Khả năng đạt target</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {analysis.predictions.riskFactors.length}
              </div>
              <div className="text-gray-600">Yếu tố rủi ro</div>
            </div>
          </div>
        </div>

        {/* Quick Recommendations */}
        <div className="bg-green-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-green-600" />
            💡 Khuyến nghị ngay
          </h4>
          
          <ul className="space-y-2 text-sm">
            {analysis.recommendations.immediate.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{selectedInsight.title}</h3>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-700 mb-4">{selectedInsight.description}</p>
              
              {selectedInsight.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Khuyến nghị:</h4>
                  <ul className="space-y-2 text-sm">
                    {selectedInsight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-600">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsights;
