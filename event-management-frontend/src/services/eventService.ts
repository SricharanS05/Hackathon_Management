import api from './api';
import type { Event, CreateEventRequest } from '@/types';

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events');
    return response.data;
  },

  getEventById: async (id: number): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: CreateEventRequest): Promise<Event> => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  updateEvent: async (id: number, data: CreateEventRequest): Promise<Event> => {
    const response = await api.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

export default eventService;
