import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import certificateService from '@/services/certificateService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Award, ShieldAlert, Sparkles, Download } from 'lucide-react';

export const CertificatePage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const certificateRef = useRef<HTMLDivElement>(null);

  // Issue Certificate mutation
  const issueMutation = useMutation({
    mutationFn: () => certificateService.generateCertificate(studentName.trim(), studentEmail.trim()),
    onSuccess: (msg) => {
      success(msg || 'Certificate generated and email dispatched successfully!');
    },
    onError: (err: any) => {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to generate certificate. Verify student credentials.';
      toastError(errMsg);
    },
  });

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) {
      toastError('Please supply both the name and email variables.');
      return;
    }
    issueMutation.mutate();
  };

  // Local image download using html-to-image or standard print emulator
  const handleLocalDownload = () => {
    if (!studentName.trim()) {
      toastError('Please fill in the Student Name before exporting.');
      return;
    }
    // Leverage window.print or a clean print simulation since canvas/screenshot libraries add size bloat
    const printContent = certificateRef.current?.innerHTML;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Certificate - ${studentName}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 90vh; background-color: #f8fafc; }
                .cert-box { border: 10px double #6366f1; padding: 50px; text-align: center; background: white; max-width: 800px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 8px; }
                h1 { color: #4f46e5; margin-bottom: 5px; font-size: 32px; }
                h3 { font-style: italic; color: #64748b; margin-top: 0; }
                .name { font-size: 28px; font-weight: bold; color: #1e293b; margin: 30px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: inline-block; min-width: 300px; }
                .desc { line-height: 1.6; color: #475569; max-width: 600px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div class="cert-box">
                <h1>Certificate of Completion</h1>
                <h3>EVENTIQ CREDENTIAL SYSTEM</h3>
                <p>This is proudly presented to</p>
                <div class="name">${studentName}</div>
                <p class="desc">for successfully completing the technical event challenges with outstanding performance. Validated under student email registration: <strong>${studentEmail || 'N/A'}</strong>.</p>
              </div>
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Smart Certificate Workspace</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Issue verified event completions to students. Generates dynamic PDF templates and emails notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Input parameters */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Recipient Details
            </h2>

            <form onSubmit={handleIssue} className="space-y-4">
              <Input
                label="Student Name"
                placeholder="e.g. John Doe"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled={issueMutation.isPending}
              />

              <Input
                label="Student Email Address"
                placeholder="e.g. john@gmail.com"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                disabled={issueMutation.isPending}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2"
                  isLoading={issueMutation.isPending}
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  Issue Certificate
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  onClick={handleLocalDownload}
                >
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </Card>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs font-semibold leading-relaxed">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>
              Issuing a certificate triggers the Spring Boot backend SMTP agent to dispatch a PDF validation payload directly to the student's email inbox.
            </span>
          </div>
        </div>

        {/* Right: Live Preview Panel */}
        <div className="lg:col-span-3">
          <Card className="p-0 overflow-hidden relative border border-border h-full flex flex-col justify-between">
            <div className="px-6 py-4 border-b border-border bg-secondary/20">
              <h2 className="text-sm font-bold text-foreground">Interactive Certificate Preview</h2>
            </div>

            <div className="flex-1 p-8 flex items-center justify-center bg-slate-900/5 dark:bg-black/40 min-h-[300px]">
              <div 
                ref={certificateRef}
                className="w-full max-w-md aspect-[1.414] bg-white border-[12px] border-double border-indigo-600 p-6 flex flex-col justify-between items-center text-center text-slate-800 shadow-glass-md rounded-lg relative"
              >
                {/* Visual border overlay */}
                <div className="absolute inset-1.5 border border-indigo-600/30 pointer-events-none" />

                <div className="space-y-1 mt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 block">EventIQ System Certificate</span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Certificate of Excellence</h3>
                </div>

                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">This is proudly awarded to</p>
                  <div className="text-xl font-bold font-serif text-slate-800 border-b border-slate-200 px-4 py-1.5 inline-block min-w-[200px]">
                    {studentName || 'Student Name'}
                  </div>
                </div>

                <p className="text-[9px] font-semibold text-slate-500 max-w-sm leading-relaxed px-4">
                  For outstanding contribution and completion of technical challenges. Registered database credential signature: 
                  <span className="text-indigo-600 font-bold block mt-1">{studentEmail || 'student@gmail.com'}</span>
                </p>

                <div className="flex justify-between items-end w-full px-4 mb-2 text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                  <div className="text-left border-t border-slate-200 pt-1 w-20">System Verifier</div>
                  <div className="text-right border-t border-slate-200 pt-1 w-20">Event Coordinator</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
