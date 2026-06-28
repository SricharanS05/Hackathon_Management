import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import authService from '@/services/authService';
import { decodeToken } from '@/utils/jwt';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const isExpired = searchParams.get('expired') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(values);
      if (response.token) {
        // Save to context which puts it in localStorage
        login(response.token);
        
        // Decode role to redirect user to appropriate portal
        const decoded = decodeToken(response.token);
        success('Successfully logged in!');

        if (decoded?.role === 'ADMIN') {
          navigate('/admin');
        } else if (decoded?.role === 'ORGANIZER') {
          navigate('/organizer');
        } else {
          navigate('/student');
        }
      } else {
        toastError('Failed to retrieve authentication token.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow flares */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {isExpired && (
          <div className="mb-4 flex items-center gap-3 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 backdrop-blur-sm text-sm font-semibold">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-foreground">Sign In</h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Enter credentials to access your EventIQ panel
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-[38px] h-4.5 w-4.5 text-muted-foreground/60 pointer-events-none z-10" />
              <Input
                label="Email Address"
                placeholder="you@gmail.com"
                type="email"
                className="pl-10"
                error={errors.email?.message}
                disabled={isLoading}
                {...register('email')}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-[38px] h-4.5 w-4.5 text-muted-foreground/60 pointer-events-none z-10" />
              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                className="pl-10"
                error={errors.password?.message}
                disabled={isLoading}
                {...register('password')}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
