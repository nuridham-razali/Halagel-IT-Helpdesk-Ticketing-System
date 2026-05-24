import React from 'react';
import { CONFIG } from '../config';
import { IconHeadset } from '@tabler/icons-react';

interface LogoProps {
  size?: number;
  className?: string;
  isHeadsetIconColor?: string;
}

export function Logo({ size = 36, className = '', isHeadsetIconColor = '#fff' }: LogoProps) {
  // If there's a custom logo that isn't empty, use it directly
  if (CONFIG.BRAND_LOGO_BASE64 && CONFIG.BRAND_LOGO_BASE64.length > 50) {
    return (
      <div 
        className={`flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ height: size }}
      >
        <img 
          src={CONFIG.BRAND_LOGO_BASE64} 
          alt="Company Logo" 
          className="h-full w-auto object-contain"
        />
      </div>
    );
  }

  // Fallback to the headset icon if no custom logo is provided
  return (
    <div 
      className={`flex items-center justify-center flex-shrink-0 rounded-xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <IconHeadset size={size * 0.65} color={isHeadsetIconColor} stroke={2} className="relative z-10" />
    </div>
  );
}
