import api from './api';
import type { Team, CreateTeamRequest } from '@/types';

export const teamService = {
  createTeam: async (data: CreateTeamRequest): Promise<Team> => {
    const response = await api.post<Team>('/teams', data);
    return response.data;
  },

  getAllTeams: async (): Promise<Team[]> => {
    const response = await api.get<Team[]>('/teams');
    return response.data;
  },

  joinTeam: async (teamCode: string): Promise<Team> => {
    const response = await api.get<Team>(`/teams/join/${teamCode}`);
    return response.data;
  },
};

export default teamService;
