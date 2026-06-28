import api from './api';
import type { Registration, RegisterEventRequest } from '@/types';

export const registrationService = {
  registerForEvent: async (data: RegisterEventRequest): Promise<Registration> => {
    const response = await api.post<Registration>('/registrations', data);
    return response.data;
  },

  getAllRegistrations: async (): Promise<Registration[]> => {
    const response = await api.get<Registration[]>('/registrations');
    return response.data;
  },

  exportCsv: async (): Promise<void> => {
    const response = await api.get('/registrations/export/csv', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registrations.csv');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },

  exportExcel: async (): Promise<void> => {
    const response = await api.get('/registrations/export/excel', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registrations.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },

  unregisterFromEvent: async (eventId: number): Promise<string> => {
    const response = await api.delete<string>(`/registrations/event/${eventId}`);
    return response.data;
  },
};

export default registrationService;
