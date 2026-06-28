import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import registrationService from '@/services/registrationService';
import attendanceService from '@/services/attendanceService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { ClipboardCheck, Calendar, UserCheck, UserX } from 'lucide-react';
import { motion } from 'framer-motion';

export const AttendancePage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');

  // Fetch events
  const { data: events } = useQuery({
    queryKey: ['attendanceEvents'],
    queryFn: eventService.getAllEvents,
  });

  // Fetch registrations
  const { data: registrations, isLoading: regsLoading } = useQuery({
    queryKey: ['attendanceRegistrations'],
    queryFn: registrationService.getAllRegistrations,
    enabled: selectedEventId !== '',
  });

  // Fetch attendance records
  const { data: attendances, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendanceRecords'],
    queryFn: attendanceService.getAttendance,
    enabled: selectedEventId !== '',
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: ({ email, eventId }: { email: string; eventId: number }) =>
      attendanceService.markAttendance(email, eventId),
    onSuccess: () => {
      success('Attendance logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to log attendance.';
      toastError(msg);
    },
  });

  const getFilteredRegistrations = () => {
    if (selectedEventId === '') return [];
    return registrations?.filter((r) => r.eventId === selectedEventId) ?? [];
  };

  const isStudentPresent = (email: string) => {
    if (selectedEventId === '') return false;
    return (
      attendances?.some(
        (a) => a.studentEmail === email && a.eventId === selectedEventId && a.present
      ) ?? false
    );
  };

  const handleMarkPresent = (email: string) => {
    if (selectedEventId === '') return;
    markAttendanceMutation.mutate({ email, eventId: selectedEventId });
  };

  const filteredRegs = getFilteredRegistrations();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Attendance Register</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Select an active event worksheet to review check-ins or log student presence manually
        </p>
      </div>

      {/* Event Selection */}
      <Card className="p-6">
        <div className="flex flex-col gap-2 max-w-md">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Select Live Event
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
            <select
              className="glass-input pl-10 pr-4 py-2.5 text-sm w-full bg-white/40 dark:bg-black/20 border-border text-foreground appearance-none outline-none"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">-- Select Event --</option>
              {events?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
              ▼
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance Sheet */}
      {selectedEventId === '' ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl glass-panel">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">Select an event first</h3>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Choose an event from the panel above to load registered student rosters.
          </p>
        </div>
      ) : regsLoading || attendanceLoading ? (
        <TableSkeleton rows={5} />
      ) : filteredRegs.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student Email</TableHead>
                <TableHead>Attendance Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegs.map((reg) => {
                const present = isStudentPresent(reg.studentEmail);
                return (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.studentName}</TableCell>
                    <TableCell>{reg.studentEmail}</TableCell>
                    <TableCell>
                      {present ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full">
                          <UserCheck className="h-3.5 w-3.5" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-muted border border-border text-muted-foreground rounded-full">
                          <UserX className="h-3.5 w-3.5" />
                          Absent
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!present ? (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPresent(reg.studentEmail)}
                          isLoading={
                            markAttendanceMutation.isPending &&
                            markAttendanceMutation.variables?.email === reg.studentEmail
                          }
                        >
                          Mark Present
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Logged
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl glass-panel">
          <UserX className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No students registered</h3>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            No registrations exist for this event yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
