import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import registrationService from '@/services/registrationService';
import teamService from '@/services/teamService';
import qrService from '@/services/qrService';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  QrCode, 
  UserCheck, 
  ArrowRight 
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedEventForQr, setSelectedEventForQr] = useState<{ id: number; title: string } | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);

  // Queries
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['studentEvents'],
    queryFn: eventService.getAllEvents,
  });

  const { data: registrations, isLoading: regsLoading } = useQuery({
    queryKey: ['studentRegistrations'],
    queryFn: registrationService.getAllRegistrations,
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['studentTeams'],
    queryFn: teamService.getAllTeams,
  });

  // Register for Event mutation
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
      success('Successfully registered for the event!');
      queryClient.invalidateQueries({ queryKey: ['studentRegistrations'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to register for the event.';
      toastError(msg);
    },
  });

  // Fetch QR Code Ticket
  const handleViewQr = async (eventId: number, eventTitle: string) => {
    if (!user) return;
    setSelectedEventForQr({ id: eventId, title: eventTitle });
    setQrLoading(true);
    try {
      const url = await qrService.getQrCodeUrl(user.email, eventId);
      setQrCodeUrl(url);
    } catch (err) {
      toastError('Failed to generate secure QR ticket.');
    } finally {
      setQrLoading(false);
    }
  };

  if (eventsLoading || regsLoading || teamsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted-foreground/10 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="h-[350px] bg-muted-foreground/10 animate-pulse rounded-2xl" />
      </div>
    );
  }

  // Filter registrations matching student's email
  const studentRegs = registrations?.filter((r) => r.studentEmail === user?.email) ?? [];
  const registeredEventIds = new Set(studentRegs.map((r) => r.eventId));

  // My Teams (either leader or matches student name)
  const studentTeams = teams?.filter((t) => t.leaderName === user?.name) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Explore upcoming workshops, join code guilds, and view your tickets
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-indigo-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Events</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{events?.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-500">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">My Registrations</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{studentRegs.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Formed Teams</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{studentTeams.length}</p>
          </div>
        </Card>
      </div>

      {/* Registered Events / Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">My Registrations & Tickets</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Your registered events and access QR tickets</p>
          </div>

          <div className="divide-y divide-border">
            {studentRegs.length > 0 ? (
              studentRegs.map((reg) => {
                const matchedEvent = events?.find((e) => e.id === reg.eventId);
                return (
                  <div key={reg.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-foreground">{matchedEvent?.title || `Event #${reg.eventId}`}</p>
                      <span className="text-xs text-muted-foreground font-semibold mt-0.5 block">
                        Date: {matchedEvent?.eventDate || 'N/A'} • Venue: {matchedEvent?.venue || 'N/A'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleViewQr(reg.eventId, matchedEvent?.title || 'Event Ticket')}
                    >
                      <QrCode className="h-4 w-4" />
                      View Ticket
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground font-semibold">
                You haven't registered for any events yet.
              </div>
            )}
          </div>
        </Card>

        {/* Suggested Tech Events */}
        <Card className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-foreground">Available Technical Events</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Explore active hackathons and workshops</p>
            </div>
            <Link to="/events" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              Explore All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {events && events.length > 0 ? (
              events
                .filter((e) => !registeredEventIds.has(e.id))
                .slice(0, 4)
                .map((evt) => (
                  <div key={evt.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-foreground">{evt.title}</p>
                      <span className="text-xs text-muted-foreground font-semibold mt-0.5 block">
                        Deadline: {evt.registrationDeadline} • Venue: {evt.venue}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => registerMutation.mutate(evt.id)}
                      isLoading={registerMutation.isPending && registerMutation.variables === evt.id}
                    >
                      Register
                    </Button>
                  </div>
                ))
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground font-semibold">
                No events currently open for registration.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Ticket Modal */}
      <Dialog
        isOpen={!!selectedEventForQr}
        onClose={() => {
          setSelectedEventForQr(null);
          setQrCodeUrl('');
        }}
        title={`Access Ticket: ${selectedEventForQr?.title}`}
      >
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm text-muted-foreground mb-6 font-medium leading-relaxed">
            Present this QR code to the event coordinator to register your attendance at the venue.
          </p>
          
          <div className="h-56 w-56 bg-white dark:bg-white rounded-2xl border border-border p-4 shadow-glass-md flex items-center justify-center relative">
            {qrLoading ? (
              <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Secure Event check-in ticket" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-rose-500 font-semibold">Failed to load ticket</span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Student Credentials</span>
            <span className="text-sm font-bold text-foreground">{user?.name} ({user?.email})</span>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
