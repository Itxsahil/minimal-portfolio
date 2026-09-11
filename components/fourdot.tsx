import { FourDotLabelProps } from '@/types';
import React from 'react';


export const FourDotLabel: React.FC<React.PropsWithChildren<FourDotLabelProps>> = ({
  children,
  className = "",
  dotColor = "bg-muted",
  bgColor = "bg-panel",
  textColor = "text-ink"
}) => {
  return (
    <span className={`relative inline-flex items-center justify-center px-2 py-0.5 mx-1 rounded-md ${bgColor} ${className} align-baseline`}>
      {/* Top Left Dot */}
      <span className={`absolute -top-0.5 -left-0.5 w-1 h-1 rounded-full ${dotColor}`} />

      {/* Top Right Dot */}
      <span className={`absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full ${dotColor}`} />

      {/* Bottom Left Dot */}
      <span className={`absolute -bottom-0.5 -left-0.5 w-1 h-1 rounded-full ${dotColor}`} />

      {/* Bottom Right Dot */}
      <span className={`absolute -bottom-0.5 -right-0.5 w-1 h-1 rounded-full ${dotColor}`} />

      {/* Content */}
      <span className={`${textColor} font-mono text-sm leading-none`}>
        {children}
      </span>
    </span>
  );
};