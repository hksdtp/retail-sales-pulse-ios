import React, { useState, useRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  ripple?: boolean;
  hoverLift?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  ripple = true,
  hoverLift = true,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  onClick,
  disabled,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create ripple effect
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = {
        id: rippleId.current++,
        x,
        y
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    onClick?.(e);
  };

  const isDisabled = disabled || loading;

  return (
    <Button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden transition-all duration-200 ease-out',
        'transform-gpu', // Force GPU acceleration
        hoverLift && !isDisabled && 'hover:translate-y-[-2px] hover:scale-[1.02]',
        hoverLift && !isDisabled && 'hover:shadow-lg',
        'active:scale-[0.98] active:translate-y-0',
        'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
        'focus-visible:translate-y-[-2px] focus-visible:scale-[1.02]',
        isDisabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      disabled={isDisabled}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s',
            animationTimingFunction: 'ease-out'
          }}
        />
      ))}

      {/* Button content */}
      <span className={cn(
        'flex items-center justify-center gap-2 transition-opacity duration-200',
        loading && 'opacity-0'
      )}>
        {icon && iconPosition === 'left' && (
          <span className="transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
        )}
      </span>

      {/* Loading state */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {loadingText && <span>{loadingText}</span>}
          </div>
        </span>
      )}
    </Button>
  );
};

// Floating Action Button variant
interface FloatingActionButtonProps extends Omit<AnimatedButtonProps, 'variant' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  size = 'md',
  position = 'bottom-right',
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <AnimatedButton
      className={cn(
        'fixed z-50 rounded-full shadow-lg',
        'bg-primary text-primary-foreground',
        'hover:shadow-xl',
        sizeClasses[size],
        positionClasses[position],
        className
      )}
      hoverLift={true}
      ripple={true}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
};

// Icon Button variant
interface IconButtonProps extends Omit<AnimatedButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-3'
  };

  return (
    <AnimatedButton
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
    </AnimatedButton>
  );
};

// Button with loading state and success animation
interface ActionButtonProps extends AnimatedButtonProps {
  onSuccess?: () => void;
  successDuration?: number;
  successIcon?: React.ReactNode;
  successText?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  onSuccess,
  successDuration = 2000,
  successIcon,
  successText = 'Success!',
  ...props
}) => {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state !== 'idle') return;

    setState('loading');
    
    try {
      await onClick?.(e);
      setState('success');
      onSuccess?.();
      
      setTimeout(() => {
        setState('idle');
      }, successDuration);
    } catch (error) {
      setState('idle');
      throw error;
    }
  };

  return (
    <AnimatedButton
      {...props}
      onClick={handleClick}
      loading={state === 'loading'}
      className={cn(
        state === 'success' && 'bg-green-500 hover:bg-green-600',
        props.className
      )}
    >
      {state === 'success' ? (
        <span className="flex items-center gap-2">
          {successIcon || '✓'}
          {successText}
        </span>
      ) : (
        children
      )}
    </AnimatedButton>
  );
};

export default AnimatedButton;
