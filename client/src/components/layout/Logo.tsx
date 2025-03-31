import React from 'react';

// Props for customizing the logo
interface LogoProps {
  size?: number;
  className?: string;
}

// A custom SVG logo for the LearnFlow AI app
const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Brain with interconnected nodes representing AI-powered learning */}
      <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.9" />
      <path 
        d="M32 12C20.954 12 12 20.954 12 32C12 43.046 20.954 52 32 52C43.046 52 52 43.046 52 32C52 20.954 43.046 12 32 12ZM44 44H20V40H44V44ZM44 36H20V32H44V36ZM44 28H20V24H44V28ZM44 20H20V16H44V20Z" 
        fill="white" 
        opacity="0.9"
      />
      <circle cx="24" cy="21" r="2" fill="white" />
      <circle cx="32" cy="18" r="2" fill="white" />
      <circle cx="40" cy="21" r="2" fill="white" />
      <circle cx="24" cy="33" r="2" fill="white" />
      <circle cx="32" cy="30" r="2" fill="white" />
      <circle cx="40" cy="33" r="2" fill="white" />
      <circle cx="24" cy="45" r="2" fill="white" />
      <circle cx="32" cy="42" r="2" fill="white" />
      <circle cx="40" cy="45" r="2" fill="white" />
      
      {/* Connecting lines representing knowledge flow */}
      <line x1="24" y1="21" x2="32" y2="18" stroke="white" strokeWidth="1" />
      <line x1="32" y1="18" x2="40" y2="21" stroke="white" strokeWidth="1" />
      <line x1="24" y1="21" x2="24" y2="33" stroke="white" strokeWidth="1" />
      <line x1="40" y1="21" x2="40" y2="33" stroke="white" strokeWidth="1" />
      <line x1="24" y1="33" x2="32" y2="30" stroke="white" strokeWidth="1" />
      <line x1="32" y1="30" x2="40" y2="33" stroke="white" strokeWidth="1" />
      <line x1="24" y1="33" x2="24" y2="45" stroke="white" strokeWidth="1" />
      <line x1="40" y1="33" x2="40" y2="45" stroke="white" strokeWidth="1" />
      <line x1="24" y1="45" x2="32" y2="42" stroke="white" strokeWidth="1" />
      <line x1="32" y1="42" x2="40" y2="45" stroke="white" strokeWidth="1" />
    </svg>
  );
};

export default Logo;