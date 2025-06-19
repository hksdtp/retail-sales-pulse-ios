import React from 'react';
import { cn } from '@/lib/utils';

// SF Symbols mapping to Unicode characters
const SF_SYMBOLS = {
  // Dashboard & Analytics
  'chart.bar.fill': '📊',
  'chart.line.uptrend.xyaxis': '📈',
  'chart.pie.fill': '🥧',
  'chart.bar.xaxis': '📊',
  
  // Tasks & Productivity
  'checkmark.circle.fill': '✅',
  'checkmark.circle': '☑️',
  'plus.circle.fill': '➕',
  'minus.circle.fill': '➖',
  'exclamationmark.circle.fill': '❗',
  'clock.fill': '🕐',
  'calendar': '📅',
  'list.bullet': '📋',
  
  // People & Users
  'person.fill': '👤',
  'person.2.fill': '👥',
  'person.3.fill': '👨‍👩‍👧',
  'person.crop.circle.fill': '👤',
  
  // Business & Finance
  'dollarsign.circle.fill': '💰',
  'creditcard.fill': '💳',
  'banknote.fill': '💵',
  'building.2.fill': '🏢',
  'briefcase.fill': '💼',
  
  // Communication
  'phone.fill': '📞',
  'envelope.fill': '✉️',
  'message.fill': '💬',
  'bell.fill': '🔔',
  
  // Navigation
  'house.fill': '🏠',
  'magnifyingglass': '🔍',
  'gear': '⚙️',
  'arrow.right': '→',
  'arrow.left': '←',
  'arrow.up': '↑',
  'arrow.down': '↓',
  
  // Status & Indicators
  'circle.fill': '●',
  'star.fill': '⭐',
  'heart.fill': '❤️',
  'flag.fill': '🚩',
  'bookmark.fill': '🔖',
  
  // Actions
  'plus': '+',
  'minus': '-',
  'multiply': '×',
  'divide': '÷',
  'equal': '=',
  'trash.fill': '🗑️',
  'pencil': '✏️',
  'square.and.arrow.up': '📤',
  'square.and.arrow.down': '📥',
  
  // Technology
  'wifi': '📶',
  'battery.100': '🔋',
  'bolt.fill': '⚡',
  'cloud.fill': '☁️',
  'server.rack': '🖥️',
} as const;

// Fallback to CSS-based SF Symbols for better visual consistency
const CSS_SF_SYMBOLS = {
  // Dashboard & Analytics
  'chart.bar.fill': 'chart.bar.fill',
  'chart.line.uptrend.xyaxis': 'chart.line.uptrend.xyaxis',
  'chart.pie.fill': 'chart.pie.fill',
  'chart.bar.xaxis': 'chart.bar.xaxis',
  
  // Tasks & Productivity
  'checkmark.circle.fill': 'checkmark.circle.fill',
  'checkmark.circle': 'checkmark.circle',
  'plus.circle.fill': 'plus.circle.fill',
  'minus.circle.fill': 'minus.circle.fill',
  'exclamationmark.circle.fill': 'exclamationmark.circle.fill',
  'clock.fill': 'clock.fill',
  'calendar': 'calendar',
  'list.bullet': 'list.bullet',
  
  // People & Users
  'person.fill': 'person.fill',
  'person.2.fill': 'person.2.fill',
  'person.3.fill': 'person.3.fill',
  'person.crop.circle.fill': 'person.crop.circle.fill',
  
  // Business & Finance
  'dollarsign.circle.fill': 'dollarsign.circle.fill',
  'creditcard.fill': 'creditcard.fill',
  'banknote.fill': 'banknote.fill',
  'building.2.fill': 'building.2.fill',
  'briefcase.fill': 'briefcase.fill',
  
  // Communication
  'phone.fill': 'phone.fill',
  'envelope.fill': 'envelope.fill',
  'message.fill': 'message.fill',
  'bell.fill': 'bell.fill',
  
  // Navigation
  'house.fill': 'house.fill',
  'magnifyingglass': 'magnifyingglass',
  'gear': 'gear',
  'arrow.right': 'arrow.right',
  'arrow.left': 'arrow.left',
  'arrow.up': 'arrow.up',
  'arrow.down': 'arrow.down',
  
  // Status & Indicators
  'circle.fill': 'circle.fill',
  'star.fill': 'star.fill',
  'heart.fill': 'heart.fill',
  'flag.fill': 'flag.fill',
  'bookmark.fill': 'bookmark.fill',
  
  // Actions
  'plus': 'plus',
  'minus': 'minus',
  'multiply': 'multiply',
  'divide': 'divide',
  'equal': 'equal',
  'trash.fill': 'trash.fill',
  'pencil': 'pencil',
  'square.and.arrow.up': 'square.and.arrow.up',
  'square.and.arrow.down': 'square.and.arrow.down',
  
  // Technology
  'wifi': 'wifi',
  'battery.100': 'battery.100',
  'bolt.fill': 'bolt.fill',
  'cloud.fill': 'cloud.fill',
  'server.rack': 'server.rack',
} as const;

export type SFSymbolName = keyof typeof SF_SYMBOLS;

interface SFSymbolProps {
  name: SFSymbolName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  weight?: 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
  color?: string;
  className?: string;
  useCSSSymbols?: boolean; // Toggle between Unicode and CSS-based symbols
}

const sizeClasses = {
  xs: 'w-3 h-3 text-xs',
  sm: 'w-4 h-4 text-sm', 
  md: 'w-5 h-5 text-base',
  lg: 'w-6 h-6 text-lg',
  xl: 'w-8 h-8 text-xl',
  '2xl': 'w-10 h-10 text-2xl',
};

const weightClasses = {
  ultralight: 'font-thin',
  thin: 'font-extralight',
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  heavy: 'font-extrabold',
  black: 'font-black',
};

export const SFSymbol: React.FC<SFSymbolProps> = ({
  name,
  size = 'md',
  weight = 'regular',
  color,
  className,
  useCSSSymbols = false,
  ...props
}) => {
  const symbol = SF_SYMBOLS[name] || '?';
  const cssSymbol = CSS_SF_SYMBOLS[name] || name;
  
  if (useCSSSymbols) {
    // Use CSS-based SF Symbols (requires SF Symbols web font)
    return (
      <span
        className={cn(
          'sf-symbol inline-flex items-center justify-center',
          sizeClasses[size],
          weightClasses[weight],
          className
        )}
        style={{ 
          color,
          fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif',
          fontFeatureSettings: '"ss01", "ss02"',
        }}
        data-symbol={cssSymbol}
        {...props}
      >
        {symbol}
      </span>
    );
  }

  // Use Unicode fallback symbols
  return (
    <span
      className={cn(
        'sf-symbol inline-flex items-center justify-center',
        sizeClasses[size],
        weightClasses[weight],
        className
      )}
      style={{ 
        color,
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      }}
      role="img"
      aria-label={name.replace(/\./g, ' ')}
      {...props}
    >
      {symbol}
    </span>
  );
};

// Convenience components for common dashboard icons
export const DashboardIcon = (props: Omit<SFSymbolProps, 'name'>) => (
  <SFSymbol name="chart.bar.fill" {...props} />
);

export const TrendingUpIcon = (props: Omit<SFSymbolProps, 'name'>) => (
  <SFSymbol name="chart.line.uptrend.xyaxis" {...props} />
);

export const UsersIcon = (props: Omit<SFSymbolProps, 'name'>) => (
  <SFSymbol name="person.2.fill" {...props} />
);

export const DollarSignIcon = (props: Omit<SFSymbolProps, 'name'>) => (
  <SFSymbol name="dollarsign.circle.fill" {...props} />
);

export const CheckCircleIcon = (props: Omit<SFSymbolProps, 'name'>) => (
  <SFSymbol name="checkmark.circle.fill" {...props} />
);

export const CalendarIcon = (props: Omit<SFSymbolProps, 'name'>) => (
  <SFSymbol name="calendar" {...props} />
);

export const ClockIcon = (props: Omit<SFSymbolProps, 'name'>) => (
  <SFSymbol name="clock.fill" {...props} />
);

export default SFSymbol;
