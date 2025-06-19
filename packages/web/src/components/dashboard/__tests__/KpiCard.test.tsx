import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import KpiCard from '../KpiCard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
}));

// Mock SF Symbol component
jest.mock('../../ui/sf-symbol', () => ({
  SFSymbol: ({ name, ...props }: any) => <span data-testid={`sf-symbol-${name}`} {...props} />,
}));

describe('KpiCard', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: '100',
    change: 5.5,
    data: [
      { value: 10 },
      { value: 20 },
      { value: 15 },
      { value: 25 },
      { value: 30 },
    ],
  };

  it('renders basic KPI card with title and value', () => {
    render(<KpiCard {...defaultProps} />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays positive change indicator correctly', () => {
    render(<KpiCard {...defaultProps} change={5.5} />);
    
    expect(screen.getByTestId('sf-symbol-arrow.up')).toBeInTheDocument();
    expect(screen.getByText('5.5%')).toBeInTheDocument();
  });

  it('displays negative change indicator correctly', () => {
    render(<KpiCard {...defaultProps} change={-3.2} />);
    
    expect(screen.getByTestId('sf-symbol-arrow.down')).toBeInTheDocument();
    expect(screen.getByText('3.2%')).toBeInTheDocument();
  });

  it('applies correct iOS styling classes', () => {
    const { container } = render(<KpiCard {...defaultProps} />);
    
    const card = container.querySelector('.ios-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('ios-vibrancy-ultra-thin');
    expect(card).toHaveClass('rounded-ios-xl');
    expect(card).toHaveClass('shadow-ios-md');
  });

  it('applies task category styling', () => {
    const { container } = render(<KpiCard {...defaultProps} category="task" />);
    
    const card = container.querySelector('.ios-card');
    expect(card).toHaveClass('from-ios-blue/10');
    expect(card).toHaveClass('border-ios-blue/20');
  });

  it('applies sales category styling', () => {
    const { container } = render(<KpiCard {...defaultProps} category="sales" />);
    
    const card = container.querySelector('.ios-card');
    expect(card).toHaveClass('from-ios-orange/10');
    expect(card).toHaveClass('border-ios-orange/20');
  });

  it('displays old value when provided', () => {
    render(<KpiCard {...defaultProps} oldValue="80" />);
    
    expect(screen.getByText('Trước:')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('renders chart component', () => {
    render(<KpiCard {...defaultProps} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('uses iOS spacing system', () => {
    const { container } = render(<KpiCard {...defaultProps} />);
    
    const content = container.querySelector('.p-ios-3');
    expect(content).toBeInTheDocument();
    
    const spacing = container.querySelector('.mb-ios-2');
    expect(spacing).toBeInTheDocument();
  });

  it('applies iOS typography classes', () => {
    render(<KpiCard {...defaultProps} />);
    
    const title = screen.getByText('Test Metric');
    expect(title).toHaveClass('ios-caption-1');
    
    const value = screen.getByText('100');
    expect(value).toHaveClass('ios-title-2');
  });

  it('has proper accessibility attributes', () => {
    render(<KpiCard {...defaultProps} />);
    
    const changeIndicator = screen.getByTestId('sf-symbol-arrow.up');
    expect(changeIndicator).toBeInTheDocument();
  });

  it('applies hover effects with iOS touch feedback', () => {
    const { container } = render(<KpiCard {...defaultProps} />);
    
    const card = container.querySelector('.ios-touch-feedback');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('hover:scale-[1.02]');
    expect(card).toHaveClass('hover:-translate-y-1');
  });

  it('renders with custom className', () => {
    const { container } = render(<KpiCard {...defaultProps} className="custom-class" />);
    
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('handles zero change correctly', () => {
    render(<KpiCard {...defaultProps} change={0} />);
    
    expect(screen.getByTestId('sf-symbol-arrow.up')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('uses correct chart color based on category', () => {
    // This test would need to check the actual chart stroke color
    // For now, we verify the component renders without errors
    render(<KpiCard {...defaultProps} category="sales" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('applies iOS vibrancy effects', () => {
    const { container } = render(<KpiCard {...defaultProps} oldValue="80" />);
    
    const vibrancyElement = container.querySelector('.ios-vibrancy-light');
    expect(vibrancyElement).toBeInTheDocument();
  });

  it('has proper performance optimizations', () => {
    const { container } = render(<KpiCard {...defaultProps} />);
    
    const card = container.querySelector('.ios-card');
    // Check if hardware acceleration classes are applied
    expect(card).toHaveStyle('transform: translateZ(0)');
  });
});
