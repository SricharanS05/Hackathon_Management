import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { DashboardLayout, BaseLayout } from '@/layouts/Layouts';

// Lazy load pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Dashboards
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const OrganizerDashboard = lazy(() => import('@/pages/OrganizerDashboard'));
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'));

// Events
const EventsPage = lazy(() => import('@/pages/EventsPage'));
const EventDetails = lazy(() => import('@/pages/EventDetails'));
const CreateEvent = lazy(() => import('@/pages/CreateEvent'));
const EditEvent = lazy(() => import('@/pages/EditEvent'));

// Features
const RegistrationPage = lazy(() => import('@/pages/RegistrationPage'));
const AttendancePage = lazy(() => import('@/pages/AttendancePage'));
const QrAttendancePage = lazy(() => import('@/pages/QrAttendancePage'));
const CertificatePage = lazy(() => import('@/pages/CertificatePage'));
const TeamsPage = lazy(() => import('@/pages/TeamsPage'));
const JoinTeamPage = lazy(() => import('@/pages/JoinTeamPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<BaseLayout><LandingPage /></BaseLayout>} />
        <Route path="/login" element={<BaseLayout><Login /></BaseLayout>} />
        <Route path="/register" element={<BaseLayout><Register /></BaseLayout>} />
        <Route path="/forgot-password" element={<BaseLayout><ForgotPassword /></BaseLayout>} />
        <Route path="/unauthorized" element={<BaseLayout><UnauthorizedPage /></BaseLayout>} />

        {/* Protected Shared Routes (All Authenticated) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER', 'STUDENT']} />}>
          <Route path="/events" element={<DashboardLayout><EventsPage /></DashboardLayout>} />
          <Route path="/events/:id" element={<DashboardLayout><EventDetails /></DashboardLayout>} />
          <Route path="/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<DashboardLayout><StudentDashboard /></DashboardLayout>} />
          <Route path="/teams" element={<DashboardLayout><TeamsPage /></DashboardLayout>} />
          <Route path="/teams/join" element={<DashboardLayout><JoinTeamPage /></DashboardLayout>} />
        </Route>

        {/* Protected Organizer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ORGANIZER']} />}>
          <Route path="/organizer" element={<DashboardLayout><OrganizerDashboard /></DashboardLayout>} />
        </Route>

        {/* Protected Organizer & Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']} />}>
          <Route path="/events/new" element={<DashboardLayout><CreateEvent /></DashboardLayout>} />
          <Route path="/events/:id/edit" element={<DashboardLayout><EditEvent /></DashboardLayout>} />
          <Route path="/attendance" element={<DashboardLayout><AttendancePage /></DashboardLayout>} />
          <Route path="/qr-attendance" element={<DashboardLayout><QrAttendancePage /></DashboardLayout>} />
          <Route path="/certificates" element={<DashboardLayout><CertificatePage /></DashboardLayout>} />
        </Route>

        {/* Protected Admin-Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
          <Route path="/registrations" element={<DashboardLayout><RegistrationPage /></DashboardLayout>} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<BaseLayout><NotFoundPage /></BaseLayout>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
