
import React, { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from '@/components/dashboard/Dashboard';
import Logo from '@/components/Logo';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  
  const handleAuthenticated = (userData: { email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Logo />
          {isAuthenticated && (
            <nav className="ml-auto">
              <button 
                className="text-sm font-medium"
                onClick={() => setIsAuthenticated(false)}
              >
                Déconnexion
              </button>
            </nav>
          )}
        </div>
      </header>
      
      <main className="container py-6">
        {isAuthenticated && user ? (
          <Dashboard userName={user.email.split('@')[0]} />
        ) : (
          <div className="max-w-md mx-auto py-12">
            <div className="mb-8 text-center">
              <Logo size="lg" />
              <p className="mt-2 text-muted-foreground">
                Application de suivi de santé et de gestion d'ordonnances
              </p>
            </div>
            <AuthForm onAuthenticated={handleAuthenticated} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
