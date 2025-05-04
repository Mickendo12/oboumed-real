
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Light trails inspired by the image */}
      <div className="light-trail light-trail-1"></div>
      <div className="light-trail light-trail-2"></div>
      
      <div className="glass-card p-8 text-center animate-fade-in">
        <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-white/80 mb-6">Page non trouvée</p>
        <a href="/" className="text-blue-400 hover:text-blue-300 underline">
          Retourner à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
