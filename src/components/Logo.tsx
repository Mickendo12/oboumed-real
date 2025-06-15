
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 sm:w-8 sm:h-8',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const textSizeClasses = {
    sm: 'text-[10px] sm:text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-lg sm:text-xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const sloganSizeClasses = {
    sm: 'text-[8px] sm:text-[10px]',
    md: 'text-[10px] sm:text-xs',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm sm:text-base',
  };

  const spacingClasses = {
    sm: 'mb-0.5 sm:mb-1',
    md: 'mb-1 sm:mb-2',
    lg: 'mb-2 sm:mb-3',
    xl: 'mb-3 sm:mb-4',
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
      <div className="text-center space-y-0.5 sm:space-y-1">
        <h1 className={`font-bold text-white ${textSizeClasses[size]} transition-all duration-300 hover:text-primary leading-tight`}>
          ObouMed
        </h1>
        <p className={`text-white/80 font-medium ${sloganSizeClasses[size]} italic leading-tight max-w-[200px] sm:max-w-xs text-center transition-opacity duration-300 hover:text-white/90`}>
          C'est votre santé, c'est votre décision
        </p>
      </div>
    </div>
  );
};

export default Logo;
