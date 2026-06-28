import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import registrationService from '@/services/registrationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { 
  Calendar, 
  MapPin, 
  Users2, 
  ChevronLeft, 
  Edit, 
  Trash2, 
  UserCheck, 
  FolderPlus,
  ShieldCheck 
} from 'lucide-react';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Queries
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['eventDetails', eventId],
    queryFn: () => eventService.getEventById(eventId),
    enabled: !isNaN(eventId),
  });

  const { data: registrations, isLoading: regsLoading } = useQuery({
    queryKey: ['eventRegistrations', eventId],
    queryFn: registrationService.getAllRegistrations,
  });

  // Register mutation
  const registerMutation = useMutation<any, any, string>({
    pattern: 'register',
    mutationFn: (studentName: string) => {
      if (!user) throw new Error('Not authenticated');
      return registrationService.registerForEvent({
        studentName,
        studentEmail: user.email,
        eventId,
      });
    },
    onSuccess: () => {
      success('Successfully registered for this event!');
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations', eventId] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to register for this event.';
      toastError(msg);
    },
  } as any);

  const handleRegister = () => {
    if (!user) return;
    const name = window.prompt("Please enter your name for registration:", user.name);
    if (name === null) return; // User cancelled
    if (name.trim() === '') {
      alert("Name is required for event registration.");
      return;
    }
    registerMutation.mutate(name.trim());
  };

  // Unregister mutation
  const unregisterMutation = useMutation({
    mutationFn: () => registrationService.unregisterFromEvent(eventId),
    onSuccess: () => {
      success('Successfully unregistered from this event.');
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations', eventId] });
      queryClient.invalidateQueries({ queryKey: ['allRegistrations'] });
    },
    onError: () => {
      toastError('Failed to unregister from this event.');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => eventService.deleteEvent(eventId),
    onSuccess: () => {
      success('Successfully deleted event!');
      queryClient.invalidateQueries({ queryKey: ['eventsList'] });
      navigate('/events');
    },
    onError: () => {
      toastError('Failed to delete event.');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  if (eventLoading || regsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-24 bg-muted-foreground/10 animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[300px] bg-muted-foreground/10 animate-pulse rounded-2xl" />
          <div className="h-[300px] bg-muted-foreground/10 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-foreground">Event not found</h2>
        <p className="text-sm text-muted-foreground mt-2">The event may have been deleted or the ID is invalid.</p>
        <Link to="/events" className="mt-4 inline-block">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    );
  }

  // Filter registrations matching this event
  const eventRegs = registrations?.filter((r) => r.eventId === eventId) ?? [];
  const isRegistered = user?.role === 'STUDENT' && eventRegs.some((r) => r.studentEmail === user.email);
  const isManager = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">{event.title}</h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Event ID: {event.id} • Created by: {event.createdBy}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isManager && (
              <>
                <Link to={`/events/${event.id}/edit`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Event
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={handleDelete}
                  isLoading={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}

            {user?.role === 'STUDENT' && (
              isRegistered ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                    Enrolled
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to unregister from this event?")) {
                        unregisterMutation.mutate();
                      }
                    }}
                    isLoading={unregisterMutation.isPending}
                  >
                    Unregister
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleRegister}
                  isLoading={registerMutation.isPending}
                >
                  Register Now
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: description & info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">About the Event</h2>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </Card>

          {/* Registrants sheet for managers */}
          {isManager && (
            <Card className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground">Registered Participants</h2>
                <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full">
                  {eventRegs.length} Active
                </span>
              </div>

              {eventRegs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventRegs.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-mono">#{reg.id}</TableCell>
                        <TableCell>{reg.studentName}</TableCell>
                        <TableCell>{reg.studentEmail}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground font-semibold">
                  No students have signed up for this event yet.
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right column: metadata card */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Scheduling Parameters</h2>
            
            <div className="space-y-4 text-sm font-semibold text-muted-foreground">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Event Date</p>
                  <p className="text-foreground mt-0.5">{event.eventDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Registration Deadline</p>
                  <p className="text-foreground mt-0.5">{event.registrationDeadline}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Venue</p>
                  <p className="text-foreground mt-0.5 truncate max-w-[200px]">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Maximum Capacity</p>
                  <p className="text-foreground mt-0.5">{event.maxCapacity} Seats</p>
                </div>
              </div>
            </div>
          </Card>
          
          {user?.role === 'STUDENT' && isRegistered && (
            <Card className="p-5 flex flex-col gap-3 items-center justify-center text-center">
              <FolderPlus className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="text-sm font-bold text-foreground">Join team or collaborate</p>
                <p className="text-xs text-muted-foreground mt-1">Find colleagues and form team bounds for this challenge.</p>
              </div>
              <Link to="/teams" className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  Go to Teams
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
