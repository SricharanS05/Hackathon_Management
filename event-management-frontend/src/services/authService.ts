import api from './api';

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'ORGANIZER' | 'STUDENT';
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'STUDENT';
}

export const authService = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<any>('/auth/login', data);
    const token = typeof response.data === 'string' ? response.data : response.data.token;
    return { token };
  },
};

export default authService;
