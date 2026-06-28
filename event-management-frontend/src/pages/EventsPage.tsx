import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import registrationService from '@/services/registrationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';
import { Search, Plus, Calendar, MapPin, Users2, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['eventsList'],
    queryFn: eventService.getAllEvents,
  });

  // Fetch registrations to check user enrollment
  const { data: registrations } = useQuery({
    queryKey: ['userRegistrations'],
    queryFn: registrationService.getAllRegistrations,
    enabled: user?.role === 'STUDENT',
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (eventId: number) => {
      if (!user) throw new Error('Not authenticated');
      return registrationService.registerForEvent({
        studentName: user.name,
        studentEmail: user.email,
        eventId,
      });
    },
    onSuccess: () => {
      success('Successfully registered for event!');
      queryClient.invalidateQueries({ queryKey: ['userRegistrations'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to register for event.';
      toastError(msg);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: () => {
      success('Successfully deleted event!');
      queryClient.invalidateQueries({ queryKey: ['eventsList'] });
    },
    onError: () => {
      toastError('Failed to delete event. Make sure you have appropriate rights.');
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const isStudentRegistered = (eventId: number) => {
    return registrations?.some((reg) => reg.studentEmail === user?.email && reg.eventId === eventId) ?? false;
  };

  const filteredEvents = events?.filter(
    (evt) =>
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.venue.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const isManager = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gradient bg-gradient-to-r from-violet-600 to-pink-600">Technical Events</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Browse and coordinate campus hackathons, symposiums, and code challenges
          </p>
        </div>
        
        {isManager && (
          <Link to="/events/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Event
            </Button>
          </Link>
        )}
      </div>

      {/* Search Input bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
        <Input
          placeholder="Search by title, venue, or description..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid List */}
      {eventsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
            >
              <Card className="flex flex-col justify-between h-full hoverEffect">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-foreground truncate">{evt.title}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                      ID: {evt.id}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-muted-foreground line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-2 pt-2 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary/70" />
                      <span>Date: {evt.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary/70" />
                      <span className="truncate">Venue: {evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-primary/70" />
                      <span>Capacity: {evt.maxCapacity} students</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border mt-5 pt-4 flex gap-2 justify-between items-center">
                  <Link to={`/events/${evt.id}`}>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </Link>

                  <div className="flex gap-2">
                    {isManager && (
                      <>
                        <Link to={`/events/${evt.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-9 w-9">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleDelete(evt.id)}
                          isLoading={deleteMutation.isPending && deleteMutation.variables === evt.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {user?.role === 'STUDENT' && (
                      isStudentRegistered(evt.id) ? (
                        <Button variant="outline" size="sm" disabled>
                          Registered
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => registerMutation.mutate(evt.id)}
                          isLoading={registerMutation.isPending && registerMutation.variables === evt.id}
                        >
                          Register
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl glass-panel">
          <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No events found</h3>
          <p className="text-sm font-medium text-muted-foreground mt-1">Try tweaking your search parameters.</p>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
