import React from 'react';

interface UserNameProps {
  displayName: string;
  role?: string;
  color?: string;
  font?: string;
  glow?: boolean;
  effect?: string;
  className?: string;
}

export default function UserName({
  displayName,
  role = "Резидент",
  color = "#ffffff",
  font = "playfair",
  glow = false,
  effect = "none",
  className = ""
}: UserNameProps) {
  const isAdmin = role === 'Опустошатель';

  const getFontFamily = (f: string) => {
    switch (f) {
      case 'inter': return 'var(--font-inter)';
      case 'unbounded': return 'var(--font-unbounded)';
      case 'russo': return 'var(--font-russo)';
      case 'jura': return 'var(--font-jura)';
      case 'philosopher': return 'var(--font-philosopher)';
      case 'caveat': return 'var(--font-caveat)';
      case 'pacifico': return 'var(--font-pacifico)';
      case 'amatic': return 'var(--font-amatic)';
      case 'comfortaa': return 'var(--font-comfortaa)';
      case 'playfair':
      default: return 'var(--font-playfair)';
    }
  };

  const fxClass = effect === 'gradient' ? 'fx-gradient' : effect === 'electric' ? 'fx-electric' : effect === 'pulse' ? 'fx-pulse' : '';
  
  const isDefaultColor = !color || color === "#ffffff";
  const isNoEffect = !effect || effect === 'none';

  // Логика для админов (золотой градиент по умолчанию)
  const baseAdminClass = isAdmin && isDefaultColor && isNoEffect 
    ? 'bg-linear-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
    : (isDefaultColor && isNoEffect ? 'text-white' : '');

  const nameStyle = {
    color: !isDefaultColor && effect !== 'gradient' && effect !== 'electric' ? color : undefined,
    fontFamily: getFontFamily(font),
    textShadow: glow && effect !== 'electric' && effect !== 'pulse' 
      ? `0 0 15px ${!isDefaultColor ? color : (isAdmin ? 'rgba(245,158,11,0.8)' : 'rgba(255,255,255,0.8)')}` 
      : undefined,
    '--fx-color': !isDefaultColor ? color : (isAdmin ? '#f59e0b' : '#ffffff')
  } as React.CSSProperties;

  return (
    <span className={`${baseAdminClass} ${fxClass} ${className}`} style={nameStyle}>
      {displayName}
    </span>
  );
}