
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-dot-pattern flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 text-center">404</h1>
        <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-center max-w-md leading-relaxed">
          La page que vous recherchez n'existe pas.
        </p>
        <Link 
          to="/" 
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm sm:text-base"
        >
          Retour à l'accueil
        </Link>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
