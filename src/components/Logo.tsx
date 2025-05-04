
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      <div className="logo-3d">
        <span className="font-extrabold text-white tracking-tight">
          Obou
        </span>
        <span className="relative flex">
          <span className="font-extrabold text-white tracking-tight">
            Med
          </span>
          <span className="logo-cross absolute -right-6 top-1 transform -rotate-3 text-red-500 font-bold">+</span>
        </span>
      </div>
    </div>
  );
};

export default Logo;
