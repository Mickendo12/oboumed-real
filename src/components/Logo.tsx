
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      <img 
        src="/lovable-uploads/2f23883b-0d4b-4287-b442-49606c056438.png" 
        alt="ObouMed Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
