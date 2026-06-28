import api from './api';
import type { Attendance } from '@/types';

export const attendanceService = {
  markAttendance: async (email: string, eventId: number): Promise<Attendance> => {
    const response = await api.post<Attendance>('/attendance', null, {
      params: { email, eventId },
    });
    return response.data;
  },

  getAttendance: async (): Promise<Attendance[]> => {
    const response = await api.get<Attendance[]>('/attendance');
    return response.data;
  },

  markQrAttendance: async (email: string, eventId: number): Promise<Attendance> => {
    const response = await api.post<Attendance>('/qr-attendance', null, {
      params: { email, eventId },
    });
    return response.data;
  },
};

export default attendanceService;
