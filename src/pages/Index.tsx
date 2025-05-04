
import React, { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from '@/components/dashboard/Dashboard';
import Logo from '@/components/Logo';
import { LayoutDashboard } from 'lucide-react';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  
  const handleAuthenticated = (userData: { email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  return (
    <div className="min-h-screen bg-dot-pattern relative overflow-hidden">
      {/* Light trails inspired by the image */}
      <div className="light-trail light-trail-1"></div>
      <div className="light-trail light-trail-2"></div>
      
      <header className="header-container">
        <div className="container flex h-16 items-center justify-center">
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
              <div className="mb-4 flex justify-center">
                <Logo size="xl" />
              </div>
              <p className="mt-4 text-white/80">
                Application de suivi de santé et de gestion d'ordonnances
              </p>
            </div>
            <div className="glass-card p-1 shadow-2xl">
              <AuthForm onAuthenticated={handleAuthenticated} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
