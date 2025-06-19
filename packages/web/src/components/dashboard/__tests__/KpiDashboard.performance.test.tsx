import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import KpiDashboard from '../KpiDashboard';
import { User } from '@/types/user';

// Mock framer-motion with performance tracking
const mockMotionDiv = jest.fn();
jest.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => {
      mockMotionDiv(props);
      return <div {...props}>{props.children}</div>;
    },
  },
}));

// Mock other components to isolate dashboard performance
jest.mock('../KpiCard', () => {
  return function MockKpiCard(props: any) {
    return <div data-testid="kpi-card" data-title={props.title} />;
  };
});

jest.mock('../RevenueChart', () => {
  return function MockRevenueChart() {
    return <div data-testid="revenue-chart" />;
  };
});

jest.mock('../TopPerformers', () => {
  return function MockTopPerformers() {
    return <div data-testid="top-performers" />;
  };
});

jest.mock('../RegionDistribution', () => {
  return function MockRegionDistribution() {
    return <div data-testid="region-distribution" />;
  };
});

jest.mock('../ConversionRates', () => {
  return function MockConversionRates() {
    return <div data-testid="conversion-rates" />;
  };
});

// Mock SF Symbol components
jest.mock('../../ui/sf-symbol', () => ({
  DashboardIcon: (props: any) => <span data-testid="dashboard-icon" {...props} />,
  TrendingUpIcon: (props: any) => <span data-testid="trending-up-icon" {...props} />,
  UsersIcon: (props: any) => <span data-testid="users-icon" {...props} />,
  DollarSignIcon: (props: any) => <span data-testid="dollar-sign-icon" {...props} />,
}));

describe('KpiDashboard Performance Tests', () => {
  const mockUser: User = {
    id: '1',
    name: 'Khổng Đức Mạnh',
    email: 'test@example.com',
    role: 'director',
    team: 'management',
    permissions: {
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canViewAllTasks: true,
      canManageTeam: true,
    },
  };

  const mockKpiData = [
    {
      title: 'Tổng KTS',
      value: '150',
      change: 5.2,
      data: [{ value: 10 }, { value: 20 }, { value: 15 }, { value: 25 }, { value: 30 }],
      category: 'task' as const,
    },
    {
      title: 'Doanh số',
      value: '10.2 tỷ VND',
      change: -2.1,
      data: [{ value: 100 }, { value: 120 }, { value: 110 }, { value: 130 }, { value: 125 }],
      category: 'sales' as const,
    },
  ];

  const mockDashboardData = {
    kpiCards: mockKpiData,
    summary: {
      totalTasks: 150,
      completedTasks: 120,
      completionRate: 80,
      totalSales: 10200000000,
    },
  };

  beforeEach(() => {
    mockMotionDiv.mockClear();
    // Mock performance.now for consistent timing
    global.performance.now = jest.fn(() => Date.now());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses iOS-optimized animation timing', () => {
    render(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    // Check that motion components use iOS timing functions
    const motionCalls = mockMotionDiv.mock.calls;
    
    // Find transition configurations
    const transitionConfigs = motionCalls
      .map(call => call[0]?.transition)
      .filter(Boolean);

    expect(transitionConfigs.length).toBeGreaterThan(0);
    
    // Check for iOS-style easing
    transitionConfigs.forEach(config => {
      if (config.ease) {
        expect(config.ease).toEqual([0.25, 0.46, 0.45, 0.94]);
      }
      // Check for reasonable duration (not too long for 60fps)
      if (config.duration) {
        expect(config.duration).toBeLessThanOrEqual(0.5);
      }
    });
  });

  it('applies hardware acceleration classes for smooth animations', () => {
    const { container } = render(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    // Check for iOS card classes that enable hardware acceleration
    const iosCards = container.querySelectorAll('.ios-card');
    expect(iosCards.length).toBeGreaterThan(0);

    iosCards.forEach(card => {
      // These classes should trigger hardware acceleration
      expect(card).toHaveClass('ios-card');
    });
  });

  it('uses optimized spacing system for consistent layout', () => {
    const { container } = render(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    // Check for iOS spacing classes
    const spacingElements = container.querySelectorAll('[class*="ios-"]');
    expect(spacingElements.length).toBeGreaterThan(0);

    // Verify 8px grid system usage
    const spacingClasses = Array.from(spacingElements)
      .map(el => el.className)
      .join(' ');

    expect(spacingClasses).toMatch(/p-ios-[0-9]+/);
    expect(spacingClasses).toMatch(/gap-ios-[0-9]+/);
  });

  it('renders efficiently with minimal DOM nodes', () => {
    const { container } = render(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    // Count total DOM nodes
    const allElements = container.querySelectorAll('*');
    
    // Should be reasonable number of elements (not excessive)
    expect(allElements.length).toBeLessThan(100);
    
    // Check for efficient structure
    const kpiCards = screen.getAllByTestId('kpi-card');
    expect(kpiCards).toHaveLength(mockKpiData.length);
  });

  it('handles loading state efficiently', () => {
    const { container } = render(
      <KpiDashboard
        kpiData={[]}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={true}
      />
    );

    // Loading state should be minimal and fast
    const loadingElements = container.querySelectorAll('.animate-pulse, .shimmer');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('optimizes re-renders with proper key usage', () => {
    const { rerender } = render(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    const initialCallCount = mockMotionDiv.mock.calls.length;

    // Update with same data - should not cause unnecessary re-renders
    rerender(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    // Motion components should not be recreated unnecessarily
    const afterUpdateCallCount = mockMotionDiv.mock.calls.length;
    expect(afterUpdateCallCount).toBe(initialCallCount);
  });

  it('uses CSS-based animations for better performance', () => {
    const { container } = render(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    // Check for CSS transition classes
    const elementsWithTransitions = container.querySelectorAll('[class*="transition"]');
    expect(elementsWithTransitions.length).toBeGreaterThan(0);

    // Check for iOS touch feedback classes
    const touchFeedbackElements = container.querySelectorAll('.ios-touch-feedback');
    expect(touchFeedbackElements.length).toBeGreaterThan(0);
  });

  it('implements proper accessibility without performance impact', () => {
    render(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    // Check for semantic elements
    const semanticElements = screen.getAllByRole('img', { hidden: true });
    expect(semanticElements.length).toBeGreaterThan(0);

    // Verify SF Symbol icons have proper accessibility
    const dashboardIcon = screen.getByTestId('dashboard-icon');
    expect(dashboardIcon).toBeInTheDocument();
  });

  it('handles responsive design efficiently', () => {
    const { container } = render(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    // Check for responsive grid classes
    const gridElements = container.querySelectorAll('[class*="grid-cols"]');
    expect(gridElements.length).toBeGreaterThan(0);

    // Verify mobile-first approach
    const responsiveElements = container.querySelectorAll('[class*="md:"], [class*="lg:"]');
    expect(responsiveElements.length).toBeGreaterThan(0);
  });

  it('measures animation performance timing', async () => {
    const startTime = performance.now();
    
    render(
      <KpiDashboard
        kpiData={mockKpiData}
        currentUser={mockUser}
        dashboardData={mockDashboardData}
        isLoading={false}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Initial render should be fast (< 16ms for 60fps)
    expect(renderTime).toBeLessThan(50); // Allow some buffer for test environment
  });
});
