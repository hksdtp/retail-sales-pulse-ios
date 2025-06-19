import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Zap, 
  TouchIcon as Touch,
  Eye,
  Gauge,
  CheckCircle
} from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { MobileButton, useMobileDetection, useHapticFeedback } from '@/components/mobile/MobileOptimizations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MobileOptimizationTest: React.FC = () => {
  const { isMobile, isTablet, orientation } = useMobileDetection();
  const triggerHaptic = useHapticFeedback();

  const handleHapticTest = (type: 'light' | 'medium' | 'heavy') => {
    triggerHaptic(type);
  };

  const optimizations = [
    {
      title: 'Touch Targets',
      description: 'Minimum 44px touch targets for better accessibility',
      icon: Touch,
      status: 'active',
      color: 'green'
    },
    {
      title: 'Safe Areas',
      description: 'iOS safe area support for notched devices',
      icon: Smartphone,
      status: 'active',
      color: 'blue'
    },
    {
      title: 'Performance',
      description: 'Hardware acceleration and optimized animations',
      icon: Zap,
      status: 'active',
      color: 'yellow'
    },
    {
      title: 'Typography',
      description: 'Optimized font sizes and line heights for mobile',
      icon: Eye,
      status: 'active',
      color: 'purple'
    },
    {
      title: 'Scrolling',
      description: 'Smooth scrolling with momentum and containment',
      icon: Gauge,
      status: 'active',
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <AppLayout>
      <PageHeader
        title="Mobile Optimization Test"
        subtitle="Testing mobile-specific optimizations and responsive design"
      />

      <div className="p-3 md:p-6 space-y-4 md:space-y-6 mobile-content">
        {/* Device Detection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mobile-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {isMobile ? <Smartphone className="w-5 h-5" /> : 
                 isTablet ? <Tablet className="w-5 h-5" /> : 
                 <Monitor className="w-5 h-5" />}
                Device Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="mobile-card bg-gray-50">
                  <div className="font-medium">Device Type</div>
                  <div className="text-gray-600">
                    {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
                  </div>
                </div>
                <div className="mobile-card bg-gray-50">
                  <div className="font-medium">Orientation</div>
                  <div className="text-gray-600 capitalize">{orientation}</div>
                </div>
                <div className="mobile-card bg-gray-50">
                  <div className="font-medium">Screen Size</div>
                  <div className="text-gray-600">
                    {window.innerWidth} × {window.innerHeight}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Haptic Feedback Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mobile-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Haptic Feedback Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MobileButton
                  variant="primary"
                  size="md"
                  onClick={() => handleHapticTest('light')}
                  className="mobile-touch-target"
                >
                  Light Haptic
                </MobileButton>
                <MobileButton
                  variant="secondary"
                  size="md"
                  onClick={() => handleHapticTest('medium')}
                  className="mobile-touch-target"
                >
                  Medium Haptic
                </MobileButton>
                <MobileButton
                  variant="ghost"
                  size="md"
                  onClick={() => handleHapticTest('heavy')}
                  className="mobile-touch-target border"
                >
                  Heavy Haptic
                </MobileButton>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Optimizations Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mobile-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Mobile Optimizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {optimizations.map((opt, index) => {
                  const Icon = opt.icon;
                  return (
                    <motion.div
                      key={opt.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-3 rounded-lg border ${getColorClasses(opt.color)} mobile-card`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm">{opt.title}</h3>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-xs mt-1 opacity-80">{opt.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Touch Target Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mobile-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Touch Target Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  All interactive elements should be at least 44px × 44px for optimal touch experience.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <button
                      key={i}
                      className="mobile-touch-target bg-blue-100 hover:bg-blue-200 active:bg-blue-300 rounded-lg transition-colors duration-200 flex items-center justify-center text-blue-800 font-medium"
                      onClick={() => triggerHaptic('light')}
                    >
                      Button {i}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mobile-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Optimizations Applied:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Hardware acceleration enabled</li>
                    <li>• Smooth scrolling with momentum</li>
                    <li>• Optimized touch interactions</li>
                    <li>• Reduced motion support</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">iOS Enhancements:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Safe area support</li>
                    <li>• Enhanced backdrop blur</li>
                    <li>• Prevent zoom on input focus</li>
                    <li>• Native-like animations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default MobileOptimizationTest;
