import React from 'react';
import { useQuery } from '@tanstack/react-query';
import dashboardService from '@/services/dashboardService';
import eventService from '@/services/eventService';
import registrationService from '@/services/registrationService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Award, 
  Download, 
  Plus, 
  ArrowRight 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { success, error: toastError } = useToast();

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: dashboardService.getAnalytics,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['adminRecentEvents'],
    queryFn: eventService.getAllEvents,
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['adminRecentRegistrations'],
    queryFn: registrationService.getAllRegistrations,
  });

  // Export handlers
  const handleExportCsv = async () => {
    try {
      await registrationService.exportCsv();
      success('Registrations exported as CSV successfully!');
    } catch (err) {
      toastError('Failed to export CSV report.');
    }
  };

  const handleExportExcel = async () => {
    try {
      await registrationService.exportExcel();
      success('Registrations exported as Excel successfully!');
    } catch (err) {
      toastError('Failed to export Excel report.');
    }
  };

  if (statsLoading || eventsLoading || registrationsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted-foreground/10 animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-muted-foreground/10 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[350px] bg-muted-foreground/10 animate-pulse rounded-2xl" />
          <div className="h-[350px] bg-muted-foreground/10 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate ratios
  const attendanceRate = stats?.totalRegistrations 
    ? Math.round((stats.totalAttendance / stats.totalRegistrations) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Admin Console</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Overview of event sign-ups, check-ins, and active teams
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Link to="/events/new">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-violet-500/10 border border-violet-500/25 rounded-2xl text-violet-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.totalUsers}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-indigo-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Events</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.totalEvents}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-pink-500/10 border border-pink-500/25 rounded-2xl text-pink-500">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Registrations</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.totalRegistrations}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-500">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attendance</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.totalAttendance}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:scale-[1.01] transition-transform">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-500">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Teams</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.totalTeams}</p>
          </div>
        </Card>
      </div>

      {/* Charts & Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic SVG Area Chart representation of Registrations vs Attendance */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-foreground">Sign-up & Check-in Trends</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Ratios of event interest vs actual attendance</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
              {attendanceRate}% Check-in Rate
            </span>
          </div>

          {/* Premium Vector Chart */}
          <div className="h-[250px] w-full mt-2 relative flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Background grid */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              {/* Area path for Registrations */}
              <path
                d="M 0 160 Q 100 120 200 80 T 400 60 L 500 40 L 500 200 L 0 200 Z"
                fill="url(#regGrad)"
              />
              <path
                d="M 0 160 Q 100 120 200 80 T 400 60 L 500 40"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
              />

              {/* Area path for Attendance */}
              <path
                d="M 0 180 Q 100 150 200 110 T 400 90 L 500 70 L 500 200 L 0 200 Z"
                fill="url(#attGrad)"
              />
              <path
                d="M 0 180 Q 100 150 200 110 T 400 90 L 500 70"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] font-bold text-muted-foreground">
              <span>Sprint 1</span>
              <span>Sprint 2</span>
              <span>Sprint 3</span>
              <span>Sprint 4</span>
              <span>Sprint 5</span>
            </div>
          </div>
          
          <div className="flex gap-4 items-center justify-center text-xs mt-2 font-bold">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 bg-violet-500 rounded" />
              <span className="text-muted-foreground">Registrations ({stats?.totalRegistrations})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 bg-emerald-500 rounded" />
              <span className="text-muted-foreground">Attendance ({stats?.totalAttendance})</span>
            </div>
          </div>
        </Card>

        {/* System Distribution Bar Chart */}
        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Operational Ratios</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Comparative load parameters</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 justify-center">
            {/* Users vs Teams */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground">Team Size Ratio</span>
                <span className="text-foreground">
                  {stats?.totalTeams ? Math.round((stats.totalUsers / stats.totalTeams) * 10) / 10 : 0} users/team
                </span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Registrations vs Events */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground">Event Engagement</span>
                <span className="text-foreground">
                  {stats?.totalEvents ? Math.round(stats.totalRegistrations / stats.totalEvents) : 0} signups/event
                </span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            {/* Attendance vs Users */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground">User Presence Quotient</span>
                <span className="text-foreground">{stats?.totalUsers ? Math.round((stats.totalAttendance / stats.totalUsers) * 100) : 0}% active</span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid: Recent Events and Sign-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events Card */}
        <Card className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recent Events</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Top scheduling entries</p>
            </div>
            <Link to="/events" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {events && events.length > 0 ? (
              events.slice(0, 4).map((evt) => (
                <div key={evt.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-bold text-foreground">{evt.title}</p>
                    <span className="text-xs text-muted-foreground font-semibold mt-0.5 block">{evt.venue} • {evt.eventDate}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-secondary rounded-lg border border-border">
                    Cap: {evt.maxCapacity}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground font-semibold">
                No events scheduled yet.
              </div>
            )}
          </div>
        </Card>

        {/* Recent Registrations Card */}
        <Card className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recent Sign-ups</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Student check-in submissions</p>
            </div>
            {stats?.totalRegistrations && stats.totalRegistrations > 0 ? (
              <Link to="/registrations" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                Manage
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>

          <div className="divide-y divide-border">
            {registrations && registrations.length > 0 ? (
              registrations.slice(0, 4).map((reg) => (
                <div key={reg.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-bold text-foreground">{reg.studentName}</p>
                    <span className="text-xs text-muted-foreground font-semibold mt-0.5 block">{reg.studentEmail}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md">
                    Event ID: {reg.eventId}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground font-semibold">
                No registrations recorded.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
