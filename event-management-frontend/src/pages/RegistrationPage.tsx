import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import registrationService from '@/services/registrationService';
import eventService from '@/services/eventService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import { Search, Download, ClipboardList } from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState('');

  // Queries
  const { data: registrations, isLoading: regsLoading } = useQuery({
    queryKey: ['allRegistrations'],
    queryFn: registrationService.getAllRegistrations,
  });

  const { data: events } = useQuery({
    queryKey: ['eventsSummary'],
    queryFn: eventService.getAllEvents,
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

  // Map event titles for quick display
  const getEventTitle = (eventId: number) => {
    return events?.find((e) => e.id === eventId)?.title || `Event ID: ${eventId}`;
  };

  const filteredRegs = registrations?.filter(
    (reg) =>
      reg.studentName.toLowerCase().includes(search.toLowerCase()) ||
      reg.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      String(reg.eventId).includes(search) ||
      getEventTitle(reg.eventId).toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Sign-up Sheets</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Global sheet log mapping students to registered technical challenges
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
        <Input
          placeholder="Search by student name, email, or event title..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Registrations List */}
      {regsLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredRegs.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Student Email</TableHead>
              <TableHead>Event Title</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegs.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell className="font-mono">#{reg.id}</TableCell>
                <TableCell>{reg.studentName}</TableCell>
                <TableCell>{reg.studentEmail}</TableCell>
                <TableCell>{getEventTitle(reg.eventId)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl glass-panel">
          <ClipboardList className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No registrations recorded</h3>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Student sign-ups will show up here once they register for events.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegistrationPage;
