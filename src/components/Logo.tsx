
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const sloganSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  const spacingClasses = {
    sm: 'mb-1',
    md: 'mb-2',
    lg: 'mb-3',
    xl: 'mb-4',
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      <div className={`flex items-center justify-center ${sizeClasses[size]} ${spacingClasses[size]} transition-all duration-300 hover:scale-105`}>
        <img 
          src="/lovable-uploads/2f23883b-0d4b-4287-b442-49606c056438.png" 
          alt="ObouMed Logo" 
          className="w-full h-full object-contain filter drop-shadow-lg"
        />
      </div>
      <div className="text-center space-y-1">
        <h1 className={`font-bold text-white ${textSizeClasses[size]} transition-all duration-300 hover:text-primary leading-tight`}>
          ObouMed
        </h1>
        <p className={`text-white/80 font-medium ${sloganSizeClasses[size]} italic leading-tight max-w-xs text-center transition-opacity duration-300 hover:text-white/90`}>
          C'est votre santé, c'est votre décision
        </p>
      </div>
    </div>
  );
};

export default Logo;
