import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden active:scale-[0.98] hover:-translate-y-0.5',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] text-white shadow-md hover:shadow-lg hover:shadow-[#6c5ce7]/30',
        destructive:
          'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-md hover:shadow-lg hover:shadow-rose-500/30',
        outline:
          'bg-white/90 border border-gray-200/50 backdrop-blur-sm text-[#2d3436] hover:bg-white hover:border-[#6c5ce7]/30 hover:text-[#6c5ce7]',
        secondary:
          'bg-white/80 text-[#2d3436] border border-gray-200/50 backdrop-blur-sm hover:bg-white',
        ghost: 'hover:bg-gray-100/80 hover:text-[#6c5ce7] text-[#636e72]',
        link: 'text-[#6c5ce7] hover:text-[#6c5ce7]/80 underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] text-white shadow-md hover:shadow-lg hover:shadow-[#6c5ce7]/30',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-xl px-3',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-xl px-8 text-base font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
