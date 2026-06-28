import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useQuery } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
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

export const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current event parameters
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['editEvent', eventId],
    queryFn: () => eventService.getEventById(eventId),
    enabled: !isNaN(eventId),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });

  // Prefill form
  useEffect(() => {
    if (event) {
      setValue('title', event.title);
      setValue('description', event.description);
      setValue('venue', event.venue);
      setValue('eventDate', event.eventDate);
      setValue('registrationDeadline', event.registrationDeadline);
      setValue('maxCapacity', event.maxCapacity);
    }
  }, [event, setValue]);

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
      await eventService.updateEvent(eventId, {
        ...values,
        createdBy: event?.createdBy || user?.name || 'Admin',
      });
      success('Event details modified successfully!');
      navigate(`/events/${eventId}`);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to modify event.';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-6 w-24 bg-muted-foreground/10 animate-pulse rounded" />
        <div className="h-[400px] bg-muted-foreground/10 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-foreground">Event not found</h2>
        <Link to="/events" className="mt-4 inline-block">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link to={`/events/${eventId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to details
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground">Modify Event Settings</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Adjust schedule timing, venue arrangements, or capacities
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
              disabled={isSubmitting}
              {...register('title')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 dark:text-muted-foreground">
                Description
              </label>
              <textarea
                className="glass-input px-4 py-2.5 text-sm w-full min-h-[120px] bg-white/40 dark:bg-black/20 border-border text-foreground outline-none resize-y"
                placeholder="Describe the target audience, tools covered, guidelines, and benefits..."
                disabled={isSubmitting}
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
              disabled={isSubmitting}
              {...register('venue')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Event Date"
                type="date"
                error={errors.eventDate?.message}
                disabled={isSubmitting}
                {...register('eventDate')}
              />

              <Input
                label="Registration Deadline"
                type="date"
                error={errors.registrationDeadline?.message}
                disabled={isSubmitting}
                {...register('registrationDeadline')}
              />
            </div>

            <Input
              label="Max Participant Capacity"
              placeholder="150"
              type="number"
              error={errors.maxCapacity?.message}
              disabled={isSubmitting}
              {...register('maxCapacity', { valueAsNumber: true })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link to={`/events/${eventId}`}>
                <Button variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditEvent;
