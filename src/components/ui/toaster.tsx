import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, InfoIcon } from 'lucide-react';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts } = useToast();

  // Hàm lấy icon phù hợp với loại toast
  const getToastIcon = (variant: string | undefined) => {
    switch (variant) {
      case 'destructive':
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 border border-red-200">
            <AlertCircle className="h-4.5 w-4.5 text-red-600" />
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 border border-emerald-200">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 border border-amber-200">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 border border-blue-200">
            <InfoIcon className="h-4.5 w-4.5 text-blue-600" />
          </div>
        );
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'rounded-2xl overflow-hidden',
              variant === 'success'
                ? 'shadow-emerald-900/5'
                : variant === 'destructive'
                  ? 'shadow-red-900/5'
                  : variant === 'warning'
                    ? 'shadow-amber-900/5'
                    : 'shadow-slate-900/5',
            )}
          >
            <Toast key={id} {...props} variant={variant} className={cn('p-0 overflow-hidden')}>
              <div className="flex items-start w-full overflow-hidden">
                <div className="p-4 flex-1 flex items-start gap-3 min-w-0">
                  {getToastIcon(variant)}
                  <div className="grid gap-0.5 flex-1 min-w-0 py-1">
                    {title && (
                      <ToastTitle className="font-semibold text-[15px] leading-tight tracking-tight">
                        {title}
                      </ToastTitle>
                    )}
                    {description && (
                      <ToastDescription className="text-[13px] leading-normal text-muted-foreground break-words line-clamp-2">
                        {description}
                      </ToastDescription>
                    )}
                  </div>
                </div>
              </div>
              {action}
              <ToastClose />
            </Toast>
          </motion.div>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
