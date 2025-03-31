import React from 'react';
import intellectraLogo from '@/assets/intellectra.jpg';

// Props for customizing the logo
interface LogoProps {
  size?: number;
  className?: string;
}

// Logo component for Intellectra using the provided image
const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <img 
      src={intellectraLogo} 
      alt="Intellectra Logo" 
      width={size} 
      height={size} 
      className={`rounded-full ${className}`}
      style={{ objectFit: 'cover' }}
    />
  );
};

export default Logo;