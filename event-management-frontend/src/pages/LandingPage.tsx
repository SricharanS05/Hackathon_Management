import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import dashboardService from '@/services/dashboardService';
import { 
  Zap, 
  Users, 
  QrCode, 
  Award, 
  BarChart3, 
  ArrowRight, 
  Calendar, 
  Layers 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  // Fetch live stats from backend to display on landing page
  const { data: stats } = useQuery({
    queryKey: ['landingStats'],
    queryFn: dashboardService.getAnalytics,
    retry: false,
  });

  const features = [
    {
      icon: Calendar,
      title: "Technical Events",
      description: "Discover and register for cutting-edge technical workshops, hackathons, and seminars."
    },
    {
      icon: Users,
      title: "Team Formations",
      description: "Form coders guilds or join dynamic teams seamlessly with generated invite codes."
    },
    {
      icon: QrCode,
      title: "QR Check-ins",
      description: "Ditch paper registers. Check into events instantly with secure, encrypted QR tickets."
    },
    {
      icon: Award,
      title: "Smart Certificates",
      description: "Earn validated PDF credentials generated and emailed directly upon event completion."
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      description: "Track registrations, check-in percentages, and active student profiles in real-time."
    },
    {
      icon: Layers,
      title: "Role Boundaries",
      description: "Optimized interfaces built specifically for Admins, Organizers, and Students."
    }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-bold text-primary tracking-wide uppercase">Discover. Register. Attend.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl leading-[1.15] mb-6">
            The Premium Platform for <br/>
            <span className="text-gradient">Technical Event Innovation</span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mb-8 font-medium">
            Manage, discover, and participate in campus hackathons and workshops. Track attendance with secure QR codes, assemble code teams, and earn automatic certificates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Events
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live Statistics Counter Grid */}
      <section className="w-full bg-secondary/30 dark:bg-card/25 border-y border-border py-12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{stats?.totalEvents ?? "8+"}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Live Events</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{stats?.totalUsers ?? "20+"}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Active Students</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{stats?.totalRegistrations ?? "45+"}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Registrations</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{stats?.totalAttendance ?? "40+"}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Check-ins Marked</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{stats?.totalTeams ?? "10+"}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Teams Assembled</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Engineered for High-Performing Campus Tech
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto font-medium">
            Everything you need to orchestrate workshops, coordinate coding sprints, and automate academic credit credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="glass-panel hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300 rounded-2xl p-6"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
