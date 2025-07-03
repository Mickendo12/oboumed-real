
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Link as LinkIcon } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-2 sm:py-3 lg:py-4 border-t border-white/10 bg-black/30 backdrop-blur-sm mt-auto">
      <div className="container px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          <div className="text-white/80 text-responsive-xs text-center sm:text-left">
            © {currentYear} Micaprod Corporate. Tous droits réservés.
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 text-responsive-xs">
            <Link to="/privacy" className="text-white/80 hover:text-white flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 transition-colors">
              <Shield className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
              <span>Confidentialité</span>
            </Link>
            
            <Link to="/data-config" className="text-white/80 hover:text-white flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 transition-colors">
              <LinkIcon className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
              <span>Données</span>
            </Link>
            
            <a 
              href="mailto:contact@micaprod-corporate.com" 
              className="text-white/80 hover:text-white flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 transition-colors"
            >
              <Mail className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
