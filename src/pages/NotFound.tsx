
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-dot-pattern flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8 text-center">La page que vous recherchez n'existe pas.</p>
        <Link 
          to="/" 
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
