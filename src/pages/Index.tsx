
import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from '@/components/dashboard/Dashboard';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logOut } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; displayName?: string | null; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false);
      
      if (session?.user) {
        setIsAuthenticated(true);
        setUser({
          email: session.user.email || '',
          displayName: session.user.user_metadata?.name || null,
          id: session.user.id
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser({
          email: session.user.email || '',
          displayName: session.user.user_metadata?.name || null,
          id: session.user.id
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const handleAuthenticated = (userData: { email: string }) => {
    setUser({ ...userData, displayName: null, id: '' });
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
        <div className="container flex min-h-[60px] sm:min-h-[70px] md:min-h-[80px] items-center justify-between px-2 sm:px-4">
          <div className="flex-1 flex justify-center">
            <Logo size="sm" />
          </div>
          {isAuthenticated && (
            <nav className="absolute right-2 sm:right-4">
              <button 
                className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
                onClick={handleLogout}
              >
                <LayoutDashboard size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Déconnexion</span>
                <span className="xs:hidden">Exit</span>
              </button>
            </nav>
          )}
        </div>
      </header>
      
      <main className="container py-6 sm:py-8 md:py-10 flex-1 px-2 sm:px-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-sm sm:text-base">Chargement...</div>
          </div>
        ) : isAuthenticated && user ? (
          <div className="animate-fade-in">
            <Dashboard 
              userName={user.displayName || user.email.split('@')[0]} 
              userId={user.id}
            />
          </div>
        ) : (
          <div className="max-w-sm sm:max-w-md mx-auto py-6 sm:py-12 animate-fade-in">
            <div className="mb-8 sm:mb-12 text-center px-4">
              <div className="mb-4 flex justify-center">
                <Logo size="lg" />
              </div>
              <p className="mt-4 text-white/80 text-sm sm:text-base leading-relaxed">
                Application de suivi de santé et de gestion d'ordonnances
              </p>
            </div>
            <div className="glass-card p-1 shadow-2xl mx-2 sm:mx-0">
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
