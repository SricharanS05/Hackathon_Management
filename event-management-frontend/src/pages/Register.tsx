import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useToast } from '@/components/ui/Toast';
import authService from '@/services/authService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { User, Mail, Lock, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: zod.enum(['STUDENT', 'ORGANIZER']),
});

type RegisterFormValues = zod.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await authService.register(values);
      success('Registration successful! Please sign in with your credentials.');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Registration failed. The email may already be in use.';
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
        className="w-full max-w-md my-8"
      >
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-foreground">Create Account</h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Join EventIQ and start orchestrating technical events
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-[38px] h-4.5 w-4.5 text-muted-foreground/60 pointer-events-none z-10" />
              <Input
                label="Full Name"
                placeholder="John Doe"
                className="pl-10"
                error={errors.name?.message}
                disabled={isLoading}
                {...register('name')}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-[38px] h-4.5 w-4.5 text-muted-foreground/60 pointer-events-none z-10" />
              <Input
                label="Email Address"
                placeholder="john@gmail.com"
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
                placeholder="Password@123"
                type="password"
                className="pl-10"
                error={errors.password?.message}
                disabled={isLoading}
                helperText="Must be 8+ characters with uppercase, number, and special character."
                {...register('password')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 dark:text-muted-foreground">
                Profile Type
              </label>
              <div className="relative">
                <UserCog className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground/60 pointer-events-none z-10" />
                <select
                  className="glass-input pl-10 pr-4 py-2.5 text-sm w-full bg-white/40 dark:bg-black/20 border-border text-foreground appearance-none outline-none"
                  disabled={isLoading}
                  {...register('role')}
                >
                  <option value="STUDENT" className="dark:bg-card">Student Participant</option>
                  <option value="ORGANIZER" className="dark:bg-card">Event Organizer</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
                  ▼
                </div>
              </div>
              {errors.role && (
                <span className="text-xs font-semibold text-rose-500">{errors.role.message}</span>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Register
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
