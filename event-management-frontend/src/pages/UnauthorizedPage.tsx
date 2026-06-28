import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md flex flex-col items-center"
      >
        <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center justify-center text-rose-500 mb-6 shadow-glow-primary">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-3">Unauthorized Access</h1>
        <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
          You do not have the required permissions to view this panel. If you believe this is an error, please log in with a different account.
        </p>
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
          <Link to="/login">
            <Button>Sign In Again</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
