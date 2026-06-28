import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Sun, Moon, Trash2, Shield, Settings, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { success, warning } = useToast();

  const handleClearCache = () => {
    // Keep JWT, just clear theme or other visual states
    localStorage.removeItem('theme');
    success('Client cache flushed successfully!');
  };

  const handleResetSession = () => {
    warning('Logging you out of the active terminal session...');
    setTimeout(() => {
      logout();
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings Panel
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Adjust visual styles, sessions, and operational logs
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Style Selection */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Theme Customization</h2>
            <p className="text-xs text-muted-foreground font-medium mt-1">Choose between Dark and Light mode schemes</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon className="h-6 w-6" />
              <span className="text-xs font-bold">Dark Theme</span>
            </button>

            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun className="h-6 w-6" />
              <span className="text-xs font-bold">Light Theme</span>
            </button>
          </div>
        </Card>

        {/* Security & Access */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Security & Context Logs</h2>
            <p className="text-xs text-muted-foreground font-medium mt-1">Details about your active authorization scope</p>
          </div>

          <div className="space-y-3 text-sm font-semibold text-muted-foreground">
            <div className="flex justify-between items-center p-3 rounded-xl border border-border bg-secondary/20">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Active Profile Level</span>
              </div>
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                {user?.role}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-xl border border-border bg-secondary/20">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span>Audible Notifications</span>
              </div>
              <span className="text-xs font-bold text-muted-foreground">Disabled</span>
            </div>
          </div>
        </Card>

        {/* Maintenance Actions */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Maintenance & Logs</h2>
            <p className="text-xs text-muted-foreground font-medium mt-1">Flush client data structures or reset credentials</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20"
              onClick={handleClearCache}
            >
              <Trash2 className="h-4 w-4" />
              Clear Local Cache
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleResetSession}
            >
              Sign Out Session
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
