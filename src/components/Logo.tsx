
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8',
    md: 'w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12',
    lg: 'w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20',
    xl: 'w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28',
  };

  const textSizeClasses = {
    sm: 'text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs',
    md: 'text-[10px] xs:text-xs sm:text-sm lg:text-base',
    lg: 'text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl',
    xl: 'text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl',
  };

  const sloganSizeClasses = {
    sm: 'text-[6px] xs:text-[7px] sm:text-[8px] lg:text-[9px]',
    md: 'text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs',
    lg: 'text-[10px] xs:text-xs sm:text-sm lg:text-base',
    xl: 'text-xs xs:text-sm sm:text-base lg:text-lg',
  };

  const spacingClasses = {
    sm: 'mb-0.5 sm:mb-1',
    md: 'mb-1 sm:mb-1.5 lg:mb-2',
    lg: 'mb-1.5 sm:mb-2 lg:mb-3',
    xl: 'mb-2 sm:mb-3 lg:mb-4',
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      <div className={`flex items-center justify-center ${sizeClasses[size]} ${spacingClasses[size]} transition-all duration-300 hover:scale-105 floating-element`}>
        <img 
          src="/lovable-uploads/2f23883b-0d4b-4287-b442-49606c056438.png" 
          alt="ObouMed Logo" 
          className="w-full h-full object-contain filter drop-shadow-lg"
        />
      </div>
      <div className="text-center space-y-0.5">
        <h1 className={`font-bold text-white ${textSizeClasses[size]} transition-all duration-300 hover:text-primary leading-tight logo-3d`}>
          ObouMed
        </h1>
        <p className={`text-white/80 font-medium ${sloganSizeClasses[size]} italic leading-tight max-w-[150px] xs:max-w-[180px] sm:max-w-[200px] lg:max-w-xs text-center transition-opacity duration-300 hover:text-white/90`}>
          C'est votre santé, c'est votre décision
        </p>
      </div>
    </div>
  );
};

export default Logo;
