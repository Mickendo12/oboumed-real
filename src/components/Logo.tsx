
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <span className="logo-obou">Obou</span>
      <span className="relative flex">
        <span className="logo-cross absolute -left-2 top-1">+</span>
        <span className="logo-med">Med</span>
      </span>
    </div>
  );
};

export default Logo;
