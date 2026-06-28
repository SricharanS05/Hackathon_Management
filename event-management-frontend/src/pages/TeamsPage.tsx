import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teamService from '@/services/teamService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';
import { Users, Plus, ArrowUpRight, Copy, Search, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const TeamsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch teams
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teamsList'],
    queryFn: teamService.getAllTeams,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not authenticated');
      return teamService.createTeam({
        teamName: teamName.trim(),
        leaderName: user.name,
      });
    },
    onSuccess: (data) => {
      success(`Team "${data.teamName}" formed successfully! Invite Code: ${data.teamCode}`);
      setIsCreateOpen(false);
      setTeamName('');
      queryClient.invalidateQueries({ queryKey: ['teamsList'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to form team. Name may be in use.';
      toastError(msg);
    },
  });

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toastError('Please specify the team name.');
      return;
    }
    createTeamMutation.mutate();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Invite code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredTeams = teams?.filter(
    (t) =>
      t.teamName.toLowerCase().includes(search.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(search.toLowerCase()) ||
      t.teamCode.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Code Guilds & Teams</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Form collaborative squads, view codes, and coordinate hackathon registrations
          </p>
        </div>
        
        {user?.role === 'STUDENT' && (
          <div className="flex items-center gap-2">
            <Link to="/teams/join">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                Join Guild
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Form Team
            </Button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
        <Input
          placeholder="Search by team name, leader, or invite code..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Teams List */}
      {teamsLoading ? (
        <TableSkeleton rows={5} />
      ) : filteredTeams.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Code</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>Leader Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-mono text-primary font-bold">{team.teamCode}</TableCell>
                  <TableCell>{team.teamName}</TableCell>
                  <TableCell>{team.leaderName}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center gap-1.5"
                      onClick={() => handleCopyCode(team.teamCode)}
                    >
                      {copiedCode === team.teamCode ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Copy Invite Code
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl glass-panel">
          <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No teams found</h3>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Form a new team or type a code to start collaborating.
          </p>
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setTeamName('');
        }}
        title="Form Collaborative Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <Input
            label="Team / Guild Name"
            placeholder="e.g. Byte Busters, Tech Titans"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={createTeamMutation.isPending}
          />
          <Input
            label="Leader / Founder"
            value={user?.name || ''}
            disabled
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={createTeamMutation.isPending}
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createTeamMutation.isPending}>
              Generate Team
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default TeamsPage;
