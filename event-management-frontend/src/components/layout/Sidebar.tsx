import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  ClipboardList, 
  QrCode, 
  Award, 
  Users, 
  User, 
  Settings 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const Sidebar: React.FC = () => {
  const { user, profilePicture } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Define links based on user role
  const getLinks = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { label: 'Overview', path: '/admin', icon: LayoutDashboard },
          { label: 'Manage Events', path: '/events', icon: Calendar },
          { label: 'Create Event', path: '/events/new', icon: PlusCircle },
          { label: 'View Registrations', path: '/registrations', icon: ClipboardList },
          { label: 'Mark Attendance', path: '/attendance', icon: ClipboardList },
          { label: 'QR Attendance Scanner', path: '/qr-attendance', icon: QrCode },
          { label: 'Issue Certificates', path: '/certificates', icon: Award },
        ];
      case 'ORGANIZER':
        return [
          { label: 'Overview', path: '/organizer', icon: LayoutDashboard },
          { label: 'Manage Events', path: '/events', icon: Calendar },
          { label: 'Create Event', path: '/events/new', icon: PlusCircle },
          { label: 'Mark Attendance', path: '/attendance', icon: ClipboardList },
          { label: 'QR Attendance Scanner', path: '/qr-attendance', icon: QrCode },
          { label: 'Issue Certificates', path: '/certificates', icon: Award },
        ];
      case 'STUDENT':
        return [
          { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
          { label: 'Browse Events', path: '/events', icon: Calendar },
          { label: 'My Teams', path: '/teams', icon: Users },
          { label: 'My Profile', path: '/profile', icon: User },
          { label: 'Settings', path: '/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 border-r border-white/10 dark:border-white/5 bg-white/40 dark:bg-card/40 backdrop-blur-md hidden md:flex flex-col min-h-[calc(100vh-4rem)] p-4 gap-2">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
        {user.role} PANEL
      </div>
      
      <nav className="flex-1 flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-secondary/80 dark:hover:bg-secondary/40 text-muted-foreground hover:text-foreground",
                isActive && "bg-primary/10 dark:bg-primary/15 text-primary hover:bg-primary/15 dark:hover:bg-primary/20 hover:text-primary"
              )}
            >
              <Icon className={cn("h-4 w-4 text-muted-foreground group-hover:text-foreground", isActive && "text-primary")} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="border-t border-border pt-4 px-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold text-sm overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              user.name.substring(0, 1).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
