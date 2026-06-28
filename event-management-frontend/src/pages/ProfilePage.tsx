import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import registrationService from '@/services/registrationService';
import attendanceService from '@/services/attendanceService';
import certificateService from '@/services/certificateService';
import eventService from '@/services/eventService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Mail, Award, CheckSquare, HelpCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profilePicture, updateProfilePicture } = useAuth();
  const { success, error: toastError } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toastError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfilePicture(reader.result as string);
        success('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Queries
  const { data: registrations } = useQuery({
    queryKey: ['profileRegistrations'],
    queryFn: registrationService.getAllRegistrations,
  });

  const { data: attendances } = useQuery({
    queryKey: ['profileAttendances'],
    queryFn: attendanceService.getAttendance,
  });

  const { data: events } = useQuery({
    queryKey: ['profileEvents'],
    queryFn: eventService.getAllEvents,
  });

  // Certificate trigger mutation
  const certMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not authenticated');
      return certificateService.generateCertificate(user.name, user.email);
    },
    onSuccess: (msg) => {
      success(msg || 'Completion Certificate sent to your registered email successfully!');
    },
    onError: (err: any) => {
      console.error(err);
      toastError(err.response?.data?.message || 'Certificate request failed. Mark attendance first.');
    },
  });

  // Unregister mutation
  const unregisterMutation = useMutation({
    mutationFn: (eventId: number) => registrationService.unregisterFromEvent(eventId),
    onSuccess: () => {
      success('Successfully unregistered from event.');
      queryClient.invalidateQueries({ queryKey: ['profileRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['allRegistrations'] });
    },
    onError: () => {
      toastError('Failed to unregister from event.');
    },
  });

  if (!user) return null;

  // Filters for Student Dashboard
  const myRegs = registrations?.filter((r) => r.studentEmail === user.email) ?? [];
  const myAttendances = attendances?.filter((a) => a.studentEmail === user.email && a.present) ?? [];

  const getEventTitle = (eventId: number) => {
    return events?.find((e) => e.id === eventId)?.title || `Event ID: ${eventId}`;
  };

  const attendancePercent = myRegs.length 
    ? Math.round((myAttendances.length / myRegs.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">My Profile</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Review credentials, check-in records, and certificates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Info panel */}
        <Card className="flex flex-col items-center text-center p-8 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-4xl font-extrabold shadow-glow-primary overflow-hidden"
            title="Click to upload profile picture"
          >
            {profilePicture ? (
              <img src={profilePicture} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              user.name.substring(0, 2).toUpperCase()
            )}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-[10px] text-white font-bold uppercase tracking-wider">Upload</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div>
            <h2 className="text-xl font-bold text-foreground break-all">{user.name}</h2>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-primary/15 text-primary border border-primary/20">
              {user.role}
            </span>
          </div>

          <div className="w-full border-t border-border pt-6 space-y-4 text-left text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary/75" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase leading-none">Email Address</p>
                <p className="text-foreground mt-1 break-all">{user.email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Cards: Stats & Certificate list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-5 flex flex-col gap-1 hover:scale-[1.01] transition-transform">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enrolled Events</span>
              <p className="text-3xl font-extrabold text-foreground">{myRegs.length}</p>
            </Card>

            <Card className="p-5 flex flex-col gap-1 hover:scale-[1.01] transition-transform">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Marked Present</span>
              <p className="text-3xl font-extrabold text-foreground">{myAttendances.length}</p>
            </Card>

            <Card className="p-5 flex flex-col gap-1 hover:scale-[1.01] transition-transform">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Presence Quotient</span>
              <p className="text-3xl font-extrabold text-foreground">{attendancePercent}%</p>
            </Card>
          </div>

          {/* Certificate Dispatch Trigger */}
          {user.role === 'STUDENT' && (
            <Card className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-indigo-500 hidden sm:block">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Completion Certificate</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed max-w-md">
                    Claim your certificate of participation. Your official certificate will be generated and sent directly to your registered email address.
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => certMutation.mutate()} 
                isLoading={certMutation.isPending}
                className="w-full sm:w-auto"
              >
                Claim Certificate
              </Button>
            </Card>
          )}

          {/* User Specific registrations list */}
          {user.role === 'STUDENT' && (
            <Card className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Activity Summary</h3>
              {myRegs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Title</TableHead>
                      <TableHead>Event ID</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRegs.map((reg) => {
                      const present = myAttendances.some((a) => a.eventId === reg.eventId);
                      return (
                        <TableRow key={reg.id}>
                          <TableCell>{getEventTitle(reg.eventId)}</TableCell>
                          <TableCell className="font-mono">#{reg.eventId}</TableCell>
                          <TableCell>
                            {present ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                                <CheckSquare className="h-3.5 w-3.5" />
                                Checked In
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-secondary text-muted-foreground rounded-full border border-border">
                                <HelpCircle className="h-3.5 w-3.5" />
                                Awaiting Checkin
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!present && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10 h-8 px-3"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to unregister from this event?")) {
                                    unregisterMutation.mutate(reg.eventId);
                                  }
                                }}
                                isLoading={unregisterMutation.isPending && unregisterMutation.variables === reg.eventId}
                              >
                                Unregister
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground font-semibold">
                  No active event registrations.
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
