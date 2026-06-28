import api from './api';

export const qrService = {
  getQrCodeUrl: async (email: string, eventId: number): Promise<string> => {
    const response = await api.get(`/qr/${email}/${eventId}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },
};

export default qrService;
