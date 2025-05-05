
import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from '@/components/dashboard/Dashboard';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { LayoutDashboard } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { logOut } from '@/services/authService';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; displayName?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      
      if (currentUser) {
        setIsAuthenticated(true);
        setUser({
          email: currentUser.email || '',
          displayName: currentUser.displayName
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleAuthenticated = (userData: { email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  const handleLogout = async () => {
    try {
      await logOut();
      setIsAuthenticated(false);
      setUser(null);
      toast({
        title: "Déconnecté",
        description: "Vous avez été déconnecté avec succès."
      });
    } catch (err) {
      console.error('Logout error:', err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion."
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-dot-pattern relative overflow-hidden flex flex-col">
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
                onClick={handleLogout}
              >
                <LayoutDashboard size={16} />
                Déconnexion
              </button>
            </nav>
          )}
        </div>
      </header>
      
      <main className="container py-10 flex-1">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse">Chargement...</div>
          </div>
        ) : isAuthenticated && user ? (
          <div className="animate-fade-in">
            <Dashboard 
              userName={user.displayName || user.email.split('@')[0]} 
              userId={auth.currentUser?.uid || ''}
            />
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
      
      <Footer />
    </div>
  );
};

export default Index;
