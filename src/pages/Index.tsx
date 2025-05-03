
import React, { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from '@/components/dashboard/Dashboard';
import Logo from '@/components/Logo';
import { LayoutDashboard, Circle } from 'lucide-react';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  
  const handleAuthenticated = (userData: { email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  return (
    <div className="min-h-screen bg-dot-pattern relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-accent/20 rounded-full blur-3xl"></div>
      
      {/* Floating elements */}
      <div className="hidden lg:block absolute top-40 right-[15%] floating-element" style={{animationDelay: "1s"}}>
        <Circle className="text-primary/30" size={60} />
      </div>
      <div className="hidden lg:block absolute bottom-40 left-[15%] floating-element" style={{animationDelay: "2s"}}>
        <Circle className="text-secondary/30" size={40} />
      </div>

      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container flex h-16 items-center">
          <Logo />
          {isAuthenticated && (
            <nav className="ml-auto">
              <button 
                className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setIsAuthenticated(false)}
              >
                <LayoutDashboard size={16} />
                Déconnexion
              </button>
            </nav>
          )}
        </div>
      </header>
      
      <main className="container py-10">
        {isAuthenticated && user ? (
          <div className="animate-fade-in">
            <Dashboard userName={user.email.split('@')[0]} />
          </div>
        ) : (
          <div className="max-w-md mx-auto py-12 animate-fade-in">
            <div className="mb-12 text-center">
              <div className="mb-4">
                <Logo size="xl" />
              </div>
              <p className="mt-4 text-muted-foreground">
                Application de suivi de santé et de gestion d'ordonnances
              </p>
            </div>
            <div className="gradient-border">
              <div>
                <AuthForm onAuthenticated={handleAuthenticated} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
