import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { Logo } from './Logo';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentHash, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', hash: '#home' },
    { name: 'About Us', hash: '#about' },
    { name: 'Gallery', hash: '#gallery' },
    { name: 'Reviews', hash: '#testimonials' },
    { name: 'Book Now', hash: '#book-now' },
    { name: 'Contact', hash: '#contact' },
  ];

  const handleLinkClick = (hash: string) => {
    onNavigate(hash);
    setIsOpen(false);
  };

  const isLinkActive = (hash: string) => {
    if (hash === '#home' && (currentHash === '' || currentHash === '#home')) return true;
    return currentHash === hash;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-md py-2 border-b border-gold-500/10' 
          : 'bg-white/70 dark:bg-zinc-950/60 backdrop-blur-sm py-4'
      }`}
      id="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <button 
            onClick={() => handleLinkClick('#home')}
            className="flex items-center gap-3 focus:outline-none cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            id="nav-logo-btn"
          >
            <Logo size="sm" showText={false} />
            <div className="text-left">
              <span className="font-serif font-bold tracking-[0.15em] text-sm text-zinc-900 dark:text-white block">
                NAVEED
              </span>
              <span className="font-serif font-medium tracking-[0.2em] text-[10px] text-gold-500 block leading-none">
                SIGNATURE STICH
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" id="desktop-nav">
            {navLinks.map((link) => (
              <button
                key={link.hash}
                onClick={() => handleLinkClick(link.hash)}
                className={`font-sans text-xs uppercase tracking-wider font-medium cursor-pointer transition-all duration-200 relative py-1 hover:text-gold-500 ${
                  isLinkActive(link.hash)
                    ? 'text-gold-500 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {link.name}
                {isLinkActive(link.hash) && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Action Buttons & Controls */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Dark/Light mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle-desktop"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick CTA */}
            <button
              onClick={() => handleLinkClick('#book-now')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#111111] via-zinc-800 to-[#111111] dark:from-gold-600 dark:to-gold-500 text-white dark:text-zinc-950 font-sans text-xs uppercase tracking-wider font-semibold py-2.5 px-5 rounded-full border border-gold-500/20 shadow-lg hover:shadow-gold-500/10 hover:scale-[1.03] transition-all duration-300 cursor-pointer"
              id="quick-cta-desktop"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Book Fitting
            </button>

            {/* Admin Portal Quick Link */}
            <button
              onClick={() => handleLinkClick('#admin')}
              className="text-[10px] uppercase tracking-wider font-medium text-zinc-400 dark:text-zinc-500 hover:text-gold-500 dark:hover:text-gold-500 cursor-pointer transition-colors"
            >
              Admin Portal
            </button>
          </div>

          {/* Mobile controls & Menu toggle */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              id="theme-toggle-mobile"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-500" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              aria-label="Toggle menu"
              id="mobile-menu-toggle-btn"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div 
        className={`lg:hidden fixed inset-y-0 right-0 z-40 w-72 bg-white dark:bg-zinc-950 shadow-2xl border-l border-gold-500/10 p-6 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="mobile-drawer-menu"
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-5">
              <Logo size="sm" showText={true} />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-5 mt-8" id="mobile-nav-links">
              {navLinks.map((link) => (
                <button
                  key={link.hash}
                  onClick={() => handleLinkClick(link.hash)}
                  className={`text-left font-sans text-xs uppercase tracking-widest font-semibold py-2 block border-b border-zinc-100 dark:border-zinc-900/50 cursor-pointer ${
                    isLinkActive(link.hash)
                      ? 'text-gold-500 pl-2 border-l-2 border-l-gold-500'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-gold-500'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-900">
            <button
              onClick={() => handleLinkClick('#book-now')}
              className="w-full flex items-center justify-center gap-2 bg-[#111111] dark:bg-gold-500 text-white dark:text-zinc-950 font-sans text-xs uppercase tracking-widest font-bold py-3 rounded-xl border border-gold-500/20 shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Book Stitching Now
            </button>
            
            <button
              onClick={() => handleLinkClick('#admin')}
              className="text-center text-[10px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500 hover:text-gold-500 cursor-pointer py-1"
            >
              Admin Access Dashboard
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
