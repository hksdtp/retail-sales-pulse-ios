import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

const ChangePasswordForm: React.FC = () => {
  const { changePassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: PasswordForm) => {
    changePassword(data.password);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b] via-[#4ecdc4] to-[#6c5ce7] bg-[length:400%_400%] animate-gradient-animation">
        <div className="absolute inset-0 opacity-30 bg-pattern animate-float"></div>
      </div>

      <motion.div
        className="w-full max-w-md mx-auto px-5 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white/95 backdrop-blur-lg p-8 md:p-10 rounded-[20px] border border-white/30 shadow-xl"
          whileHover={{ translateY: -5, transition: { duration: 0.4 } }}
        >
          <div className="text-center mb-8">
            <h1 className="text-[#2d3436] font-bold text-2xl md:text-3xl mb-2 uppercase tracking-wide">
              Đổi Mật Khẩu
            </h1>
            <p className="text-[#636e72] text-sm md:text-base font-medium">
              Đây là lần đầu tiên bạn đăng nhập. Vui lòng đổi mật khẩu để tiếp tục.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-1.5">
                <h3 className="font-medium text-[#2d3436] text-sm">Mật khẩu mới</h3>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu mới"
                            {...field}
                            className="pr-10 h-12 bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full text-gray-500 hover:text-[#6c5ce7]"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormDescription className="text-xs text-[#636e72]">
                        Mật khẩu phải có ít nhất 8 ký tự
                      </FormDescription>
                      <FormMessage className="text-xs font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-medium text-[#2d3436] text-sm">Xác nhận mật khẩu</h3>
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Xác nhận mật khẩu mới"
                            {...field}
                            className="pr-10 h-12 bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full text-gray-500 hover:text-[#6c5ce7]"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage className="text-xs font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] text-white font-semibold text-base rounded-xl relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#6c5ce7]/40 transition-all duration-300 mt-6"
              >
                <span className="relative z-10">Đổi mật khẩu</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:animate-shimmer"></span>
              </Button>

              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  className="text-[#636e72] text-sm md:text-base transition-all duration-300 px-4 py-2 rounded-lg hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/10 hover:-translate-y-0.5 flex items-center"
                  onClick={() => window.history.back()}
                >
                  Quay lại
                </button>
              </div>
            </form>
          </Form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ChangePasswordForm;
