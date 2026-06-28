import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const forgotPasswordSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordFormValues = zod.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const { success } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
    success(`Reset instructions sent to ${values.email}`);
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
        <Card className="p-8">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-extrabold text-foreground">Reset Password</h1>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  Enter your email address and we'll send you recovery details
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

                <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                  Send Recovery Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-extrabold text-foreground mb-2">Instructions Sent</h1>
              <p className="text-sm font-medium text-muted-foreground mb-6 leading-relaxed">
                If the email exists in our system, we've dispatched a password reset link to it. Please check your inbox.
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
                Try Different Email
              </Button>
            </div>
          )}

          <div className="text-center mt-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
