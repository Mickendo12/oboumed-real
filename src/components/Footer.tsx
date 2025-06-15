
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Link as LinkIcon } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-4 sm:py-6 border-t border-white/10 bg-black/30 backdrop-blur-sm mt-auto">
      <div className="container px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-white/80 text-xs sm:text-sm text-center sm:text-left">
            © {currentYear} Micaprod Corporate. Tous droits réservés.
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <Link to="/privacy" className="text-white/80 hover:text-white flex items-center gap-1 sm:gap-1.5 transition-colors">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Confidentialité</span>
            </Link>
            
            <Link to="/data-config" className="text-white/80 hover:text-white flex items-center gap-1 sm:gap-1.5 transition-colors">
              <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Données</span>
            </Link>
            
            <a 
              href="mailto:contact@micaprod-corporate.com" 
              className="text-white/80 hover:text-white flex items-center gap-1 sm:gap-1.5 transition-colors"
            >
              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
