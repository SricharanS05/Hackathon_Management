import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import teamService from '@/services/teamService';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronLeft, Users2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const JoinTeamPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [teamCode, setTeamCode] = useState('');

  // Join Team mutation
  const joinMutation = useMutation({
    mutationFn: () => teamService.joinTeam(teamCode.trim().toUpperCase()),
    onSuccess: () => {
      success(`Successfully joined the team!`);
      navigate('/teams');
    },
    onError: (err: any) => {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to join team. Verify the invite code is correct.';
      toastError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamCode.trim()) {
      toastError('Please supply the team code.');
      return;
    }
    joinMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <Link to="/teams" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Teams
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground">Join Guild Team</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Enter an invite code provided by a team leader to enroll in a squad
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-8">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Users2 className="h-6 w-6" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="6-Digit Team Invite Code"
              placeholder="e.g. ABC123"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              disabled={joinMutation.isPending}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={joinMutation.isPending}
            >
              Verify & Connect
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinTeamPage;
