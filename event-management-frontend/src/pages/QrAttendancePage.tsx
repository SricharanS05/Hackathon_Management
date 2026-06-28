import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import attendanceService from '@/services/attendanceService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { QrCode, Scan, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QrAttendancePage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [scannedEmail, setScannedEmail] = useState('');
  const [scanResult, setScanResult] = useState<{ name?: string; email: string; success: boolean; msg: string } | null>(null);

  // Fetch events
  const { data: events } = useQuery({
    queryKey: ['qrEventsList'],
    queryFn: eventService.getAllEvents,
  });

  // Log QR check-in mutation
  const qrCheckinMutation = useMutation({
    mutationFn: ({ email, eventId }: { email: string; eventId: number }) =>
      attendanceService.markQrAttendance(email, eventId),
    onSuccess: (data) => {
      success(`Check-in recorded for ${data.studentEmail}`);
      setScanResult({
        email: data.studentEmail,
        success: true,
        msg: `Student successfully authenticated. Presence status set to Present.`,
      });
      setScannedEmail('');
    },
    onError: (err: any) => {
      console.error(err);
      const errMsg = err.response?.data?.message || 'QR Ticket signature verification failed or user not registered.';
      toastError(errMsg);
      setScanResult({
        email: scannedEmail,
        success: false,
        msg: errMsg,
      });
    },
  });

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEventId === '') {
      toastError('Please select a live event prior to scanning.');
      return;
    }
    if (!scannedEmail.trim()) {
      toastError('Please specify the ticket email signature.');
      return;
    }

    qrCheckinMutation.mutate({
      email: scannedEmail.trim(),
      eventId: selectedEventId,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">QR Attendance Scanner</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Scan student ticket barcodes or simulate inputs to record check-in attendance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: View Finder & Simulation input */}
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden relative border border-border">
            {/* Viewfinder simulation */}
            <div className="aspect-square bg-slate-950 flex flex-col items-center justify-center p-6 relative">
              {/* Scan box corners */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br" />

              {/* Animated scan line */}
              <motion.div
                animate={{ y: [0, 200, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent z-10"
                style={{ top: '8%' }}
              />

              <div className="text-center z-10 space-y-3">
                <Scan className="h-12 w-12 text-emerald-500/70 mx-auto animate-pulse" />
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  Simulating Camera lens...
                </p>
              </div>
            </div>
          </Card>

          {/* Form to input ticket details */}
          <Card className="p-6">
            <form onSubmit={handleSimulateScan} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Event Selection
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                  <select
                    className="glass-input pl-10 pr-4 py-2.5 text-sm w-full bg-white/40 dark:bg-black/20 border-border text-foreground appearance-none outline-none"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">-- Choose Target Event --</option>
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

              <Input
                label="Student Ticket Email (Barcode Signature)"
                placeholder="e.g. student@gmail.com"
                value={scannedEmail}
                onChange={(e) => setScannedEmail(e.target.value)}
                disabled={qrCheckinMutation.isPending}
              />

              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                isLoading={qrCheckinMutation.isPending}
              >
                <QrCode className="h-4.5 w-4.5" />
                Verify & Log Check-in
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Scan History & Results Panel */}
        <div className="space-y-6">
          <Card className="p-6 h-full flex flex-col justify-between min-h-[300px]">
            <div>
              <h2 className="text-lg font-bold text-foreground">Verification Feedback</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Real-time database check-in status</p>
            </div>

            <div className="flex-1 flex flex-col justify-center py-6">
              <AnimatePresence mode="wait">
                {scanResult ? (
                  <motion.div
                    key={scanResult.email + scanResult.success}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center space-y-4"
                  >
                    {scanResult.success ? (
                      <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                        <AlertCircle className="h-8 w-8" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className={`text-base font-bold uppercase tracking-wider ${scanResult.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {scanResult.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                      </h3>
                      <p className="text-sm font-bold text-foreground mt-2">{scanResult.email}</p>
                      <p className="text-xs font-semibold text-muted-foreground leading-relaxed mt-2.5 max-w-sm mx-auto">
                        {scanResult.msg}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-muted-foreground/60 space-y-2">
                    <Scan className="h-10 w-10 mx-auto animate-pulse" />
                    <p className="text-sm font-bold">Awaiting Scan Signature</p>
                    <p className="text-xs font-semibold max-w-xs mx-auto">
                      Select an event and specify a student's email coordinate to test.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {scanResult && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setScanResult(null)}
              >
                Clear Results
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QrAttendancePage;
