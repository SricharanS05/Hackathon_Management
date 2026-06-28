import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import eventService from '@/services/eventService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const eventSchema = zod.object({
  title: zod.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: zod.string().min(1, 'Description is required'),
  venue: zod.string().min(1, 'Venue is required'),
  eventDate: zod
    .string()
    .min(1, 'Event date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  registrationDeadline: zod
    .string()
    .min(1, 'Registration deadline is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  maxCapacity: zod
    .number()
    .min(1, 'Capacity must be greater than 0'),
});

type EventFormValues = zod.infer<typeof eventSchema>;

export const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      venue: '',
      eventDate: '',
      registrationDeadline: '',
      maxCapacity: 100,
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    setIsLoading(true);
    try {
      await eventService.createEvent({
        ...values,
        createdBy: user?.name || 'Organizer',
      });
      success('Event scheduled successfully!');
      navigate('/events');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to schedule event. Please try again.';
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to list
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground">Schedule New Event</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Provide technical parameters, dates, and boundaries for registration
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Event Title"
              placeholder="e.g. hackathon, flutter dev workshop"
              error={errors.title?.message}
              disabled={isLoading}
              {...register('title')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 dark:text-muted-foreground">
                Description
              </label>
              <textarea
                className="glass-input px-4 py-2.5 text-sm w-full min-h-[120px] bg-white/40 dark:bg-black/20 border-border text-foreground outline-none resize-y"
                placeholder="Describe the target audience, tools covered, guidelines, and benefits..."
                disabled={isLoading}
                {...register('description')}
              />
              {errors.description && (
                <span className="text-xs font-semibold text-rose-500">{errors.description.message}</span>
              )}
            </div>

            <Input
              label="Venue / Auditorium"
              placeholder="e.g. Lab 4, Tech Block or Auditorium 1"
              error={errors.venue?.message}
              disabled={isLoading}
              {...register('venue')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Event Date"
                type="date"
                error={errors.eventDate?.message}
                disabled={isLoading}
                {...register('eventDate')}
              />

              <Input
                label="Registration Deadline"
                type="date"
                error={errors.registrationDeadline?.message}
                disabled={isLoading}
                {...register('registrationDeadline')}
              />
            </div>

            <Input
              label="Max Participant Capacity"
              placeholder="100"
              type="number"
              error={errors.maxCapacity?.message}
              disabled={isLoading}
              {...register('maxCapacity', { valueAsNumber: true })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link to="/events">
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isLoading}>
                Schedule Event
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateEvent;
