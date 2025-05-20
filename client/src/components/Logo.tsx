import React from "react";
import fullLogo from "../assets/logo-no-bg.png";
import cactusLogo from "../assets/cactus-logo.png";

interface LogoProps {
  className?: string;
  compact?: boolean;
  showText?: boolean;
  useFullLogo?: boolean;
}

export function Logo({ className = "", compact = false, showText = true, useFullLogo = false }: LogoProps) {
  if (useFullLogo) {
    return (
      <div className={`flex items-center ${className}`}>
        <img 
          src={fullLogo} 
          alt="Tecnarit Logo" 
          className={`${compact ? "h-8" : "h-12"} object-contain`} 
        />
      </div>
    );
  }
  
  // Show cactus icon and text
  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`${compact ? "w-8 h-8" : "w-10 h-10"} overflow-hidden mr-2 rounded-md bg-[#73b729] flex items-center justify-center`}
      >
        <img 
          src={cactusLogo} 
          alt="Tecnarit Cactus Icon" 
          className={`${compact ? "h-6 w-6" : "h-8 w-8"} object-contain`} 
        />
      </div>
      {showText && (
        <h1 className={`font-heading font-bold text-white ${compact ? "text-xl" : "text-2xl"}`}>
          TECNARIT
        </h1>
      )}
    </div>
  );
}
