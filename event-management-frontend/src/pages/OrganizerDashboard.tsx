import React from 'react';
import { useQuery } from '@tanstack/react-query';
import dashboardService from '@/services/dashboardService';
import eventService from '@/services/eventService';
import attendanceService from '@/services/attendanceService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  CheckSquare, 
  QrCode, 
  Plus, 
  ArrowRight 
} from 'lucide-react';

export const OrganizerDashboard: React.FC = () => {
  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['organizerStats'],
    queryFn: dashboardService.getAnalytics,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['organizerEvents'],
    queryFn: eventService.getAllEvents,
  });

  const { data: attendances, isLoading: attendanceLoading } = useQuery({
    queryKey: ['organizerAttendances'],
    queryFn: attendanceService.getAttendance,
  });

  if (statsLoading || eventsLoading || attendanceLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted-foreground/10 animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-muted-foreground/10 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="h-[350px] bg-muted-foreground/10 animate-pulse rounded-2xl" />
      </div>
    );
  }

  // Calculate attendance ratios
  const totalMarked = attendances?.length ?? 0;
  const presentCount = attendances?.filter(a => a.present).length ?? 0;
  const presentPercent = totalMarked ? Math.round((presentCount / totalMarked) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Organizer Dashboard</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Coordinate your workshops, log check-ins, and issue certificates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/qr-attendance">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Scan QR
            </Button>
          </Link>
          <Link to="/events/new">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-indigo-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Scheduled Events</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.totalEvents}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-pink-500/10 border border-pink-500/25 rounded-2xl text-pink-500">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sign-ups Recorded</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.totalRegistrations}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-500">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Present</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{presentCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-500">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attendance Quotient</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{presentPercent}%</p>
          </div>
        </Card>
      </div>

      {/* Grid: Events and Check-in analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Table Overview */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-foreground">Scheduled Worksheets</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Quick lookup of details</p>
            </div>
            <Link to="/events" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              Manage Events
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {events && events.length > 0 ? (
              events.slice(0, 5).map((evt) => (
                <div key={evt.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-bold text-foreground">{evt.title}</p>
                    <span className="text-xs text-muted-foreground font-semibold mt-0.5 block">{evt.venue} • {evt.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/events/${evt.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground font-semibold">
                No events scheduled.
              </div>
            )}
          </div>
        </Card>

        {/* Dynamic SVG Visual for check-in rates */}
        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Check-in Analysis</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Attendee ratios</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-secondary"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${presentPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="text-center">
                <span className="text-3xl font-extrabold text-foreground">{presentPercent}%</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mt-0.5">Present</span>
              </div>
            </div>

            <div className="flex gap-4 text-xs font-bold mt-6 w-full justify-around">
              <div className="text-center">
                <p className="text-foreground">{presentCount}</p>
                <p className="text-muted-foreground text-[10px] uppercase">Checked In</p>
              </div>
              <div className="text-center">
                <p className="text-foreground">{totalMarked - presentCount}</p>
                <p className="text-muted-foreground text-[10px] uppercase">Absent</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
