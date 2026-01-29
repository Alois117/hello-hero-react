import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLoadingScreenProps {
  message?: string;
}

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ 
  message = 'Initializing secure session...' 
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} 
        />
      </div>

      <div className="relative z-10 text-center space-y-8">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt="Avis AI Monitoring Logo"
              className="h-16 w-auto object-contain"
            />
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
                Avis
              </h1>
              <p className="text-lg text-muted-foreground">
                AI-Powered Monitoring
              </p>
            </div>
          </div>

          {/* Loading Indicator */}
          <div className="flex items-center justify-center gap-3 text-muted-foreground mt-6">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xl">{message}</span>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Enterprise-Grade Security • Zero Trust Architecture
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;