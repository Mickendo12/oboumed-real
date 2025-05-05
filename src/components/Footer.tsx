
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Link as LinkIcon } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-6 border-t border-white/10 bg-black/30 backdrop-blur-sm mt-auto">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/80 text-sm">
            © {currentYear} Micaprod Corporate. Tous droits réservés.
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/privacy" className="text-white/80 hover:text-white flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              <span>Confidentialité</span>
            </Link>
            
            <Link to="/data-config" className="text-white/80 hover:text-white flex items-center gap-1.5">
              <LinkIcon className="h-4 w-4" />
              <span>Données</span>
            </Link>
            
            <a 
              href="mailto:contact@micaprod-corporate.com" 
              className="text-white/80 hover:text-white flex items-center gap-1.5"
            >
              <Mail className="h-4 w-4" />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
