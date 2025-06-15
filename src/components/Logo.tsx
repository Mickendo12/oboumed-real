
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const sloganSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`flex items-center justify-center ${sizeClasses[size]} mb-2`}>
        <img 
          src="/lovable-uploads/2f23883b-0d4b-4287-b442-49606c056438.png" 
          alt="ObouMed Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-center">
        <h1 className={`font-bold text-white ${textSizeClasses[size]} mb-1`}>
          ObouMed
        </h1>
        <p className={`text-white/80 font-medium ${sloganSizeClasses[size]} italic`}>
          C'est votre santé, c'est votre décision
        </p>
      </div>
    </div>
  );
};

export default Logo;
