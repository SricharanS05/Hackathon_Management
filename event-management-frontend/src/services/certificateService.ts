import api from './api';

export const certificateService = {
  generateCertificate: async (name: string, email: string): Promise<string> => {
    const response = await api.get<string>(`/certificate/${encodeURIComponent(name)}/${encodeURIComponent(email)}`, {
      responseType: 'text' as any // Explicitly request text since backend returns a plain text message
    });
    return response.data;
  },
};

export default certificateService;
