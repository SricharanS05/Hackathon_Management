export type UserRole = 'ADMIN' | 'ORGANIZER' | 'STUDENT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  venue: string;
  eventDate: string;
  registrationDeadline: string;
  maxCapacity: number;
  createdBy: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  venue: string;
  eventDate: string;
  registrationDeadline: string;
  maxCapacity: number;
  createdBy: string;
}

export interface Registration {
  id: number;
  studentName: string;
  studentEmail: string;
  eventId: number;
  eventTitle?: string; // Client-side augmented metadata
}

export interface RegisterEventRequest {
  studentName: string;
  studentEmail: string;
  eventId: number;
}

export interface Team {
  id: number;
  teamName: string;
  leaderName: string;
  teamCode: string;
}

export interface CreateTeamRequest {
  teamName: string;
  leaderName: string;
}

export interface Attendance {
  id: number;
  studentEmail: string;
  eventId: number;
  present: boolean;
  studentName?: string; // Client-side details
  eventTitle?: string;  // Client-side details
}

export interface DashboardAnalytics {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  totalTeams: number;
}
