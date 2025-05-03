
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <span className="logo-obou relative">
        Obou
        <span className="logo-shadow absolute -z-10"></span>
      </span>
      <span className="relative flex">
        <span className="logo-cross absolute -left-2 top-1 transform -rotate-3">+</span>
        <span className="logo-med relative">
          Med
          <span className="logo-shadow absolute -z-10"></span>
        </span>
      </span>
    </div>
  );
};

export default Logo;
