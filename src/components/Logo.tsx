import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightColor?: boolean; // if true, forces white/gold instead of dark/gold
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  size = 'md',
  lightColor = false 
}) => {
  const getLogoSize = () => {
    switch (size) {
      case 'sm': return { svg: 'w-10 h-10', title: 'text-xs', tagline: 'text-[8px]', spacing: 'gap-1' };
      case 'md': return { svg: 'w-16 h-16', title: 'text-sm md:text-base', tagline: 'text-[9px]', spacing: 'gap-1.5' };
      case 'lg': return { svg: 'w-24 h-24', title: 'text-xl', tagline: 'text-[11px]', spacing: 'gap-2' };
      case 'xl': return { svg: 'w-36 h-36', title: 'text-3xl', tagline: 'text-xs', spacing: 'gap-3' };
    }
  };

  const dims = getLogoSize();

  return (
    <div className={`flex flex-col items-center justify-center ${dims.spacing} ${className}`} id="ns-brand-logo">
      {/* SVG Monogram NS with Needle and Thread */}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${dims.svg} filter drop-shadow-[0_2px_4px_rgba(201,162,39,0.15)]`}
      >
        {/* Outer elegant ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="46" 
          stroke="#C9A227" 
          strokeWidth="1.5" 
          strokeDasharray="4 2"
          className="opacity-80"
        />
        <circle 
          cx="50" 
          cy="50" 
          r="43" 
          stroke="#C9A227" 
          strokeWidth="0.75" 
          className="opacity-55"
        />

        {/* Minimalist Needle */}
        <path 
          d="M 28,72 L 72,28" 
          stroke="#C9A227" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        {/* Needle Eye (near top-right) */}
        <ellipse 
          cx="69" 
          cy="31" 
          rx="1" 
          ry="3" 
          transform="rotate(45 69 31)" 
          fill={lightColor ? '#FFFFFF' : '#111111'} 
          className="dark:fill-[#111111]"
        />

        {/* Golden Thread Looping around Letters */}
        <path 
          d="M 69,31 C 80,45 65,65 50,60 C 35,55 30,35 45,30 C 55,25 70,35 75,50 C 80,65 60,82 45,78" 
          stroke="#DFB73C" 
          strokeWidth="1.25" 
          strokeLinecap="round" 
          className="opacity-90"
        />

        {/* Custom Hand-Drawn Monogram "N" and "S" */}
        {/* Letter N */}
        <path 
          d="M 33,62 L 33,38 L 47,62 L 47,38" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="mix-blend-difference"
        />
        <path 
          d="M 33,62 L 33,38 L 47,62 L 47,38" 
          stroke="#C9A227" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Letter S (interlocked on the right) */}
        <path 
          d="M 52,41 C 52,37 65,36 65,43 C 65,50 52,48 52,56 C 52,63 66,63 66,58" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="mix-blend-difference"
        />
        <path 
          d="M 52,41 C 52,37 65,36 65,43 C 65,50 52,48 52,56 C 52,63 66,63 66,58" 
          stroke="#C9A227" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col items-center justify-center text-center">
          <h1 
            className={`font-serif tracking-[0.25em] font-semibold leading-tight ${dims.title} ${
              lightColor ? 'text-white' : 'text-zinc-900 dark:text-white'
            }`}
          >
            NAVEED
          </h1>
          <p 
            className={`font-serif tracking-[0.3em] uppercase leading-none font-medium mt-0.5 text-[10px] md:text-xs ${
              lightColor ? 'text-gold-500' : 'text-gold-500'
            }`}
          >
            SIGNATURE STICH
          </p>
          <span 
            className={`font-sans tracking-[0.18em] uppercase font-light mt-1 ${dims.tagline} ${
              lightColor ? 'text-zinc-300' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            Designed to Perfection
          </span>
        </div>
      )}
    </div>
  );
};
