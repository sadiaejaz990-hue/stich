import React from 'react';
import { Logo } from './Logo';
import { Scissors, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (hash: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (hash: string) => {
    onNavigate(hash);
  };

  return (
    <footer className="bg-[#111111] text-zinc-300 border-t border-gold-500/10 pt-16 pb-8" id="brand-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-zinc-900 pb-12 mb-8">
        
        {/* Brand visual & Description */}
        <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <button 
            onClick={() => handleLinkClick('#home')}
            className="focus:outline-none flex flex-col items-center md:items-start cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <Logo size="md" showText={true} lightColor={true} />
          </button>
          <p className="font-sans text-xs text-zinc-400 leading-relaxed font-light mt-2 max-w-sm">
            Naveed Signature Stich specializes in creating bespoke masterpiece suits, bridal wear, and custom outfits. We draft individual anatomical pattern sheets for every client to secure a 100% silhouette guarantee.
          </p>
        </div>

        {/* Quick links */}
        <div className="md:col-span-3 flex flex-col items-center md:items-start gap-4">
          <h4 className="font-serif text-gold-500 text-sm tracking-widest uppercase font-bold">
            Atelier Links
          </h4>
          <nav className="flex flex-col gap-2.5 items-center md:items-start text-xs font-sans">
            {[
              { name: 'Home Studio', hash: '#home' },
              { name: 'Craft Heritage', hash: '#about' },
              { name: 'Design Gallery', hash: '#gallery' },
              { name: 'Client Reviews', hash: '#testimonials' },
              { name: 'Schedule Fitting', hash: '#book-now' },
              { name: 'Contact Atelier', hash: '#contact' },
            ].map((link) => (
              <button
                key={link.hash}
                onClick={() => handleLinkClick(link.hash)}
                className="hover:text-gold-500 cursor-pointer transition-colors font-light text-zinc-400"
              >
                {link.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Operating hours & Studio location details */}
        <div className="md:col-span-4 flex flex-col items-center md:items-start gap-4">
          <h4 className="font-serif text-gold-500 text-sm tracking-widest uppercase font-bold">
            Atelier Schedule
          </h4>
          <div className="flex flex-col gap-2 text-xs font-sans text-zinc-400 items-center md:items-start font-light leading-relaxed">
            <p className="flex gap-2 items-start text-center md:text-left">
              <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
              <span>Butt Chowk, Township, Lahore, Pakistan</span>
            </p>
            <p className="mt-2 text-zinc-400">
              <strong className="text-zinc-200">Mon – Sat:</strong> 10:00 AM – 8:00 PM
            </p>
            <p className="text-zinc-400">
              <strong className="text-zinc-200">Sunday:</strong> 12:00 PM – 6:00 PM (Appt. Only)
            </p>
          </div>
        </div>

      </div>

      {/* Copy & Legal lines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-sans text-[10px] text-zinc-500 uppercase tracking-widest text-center md:text-left font-semibold">
          © {currentYear} Naveed Signature Stich. All Rights Reserved. Designed to Perfection.
        </p>

        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-gold-500 opacity-60" />
          <span className="font-serif italic text-[11px] text-zinc-500 tracking-wider">
            Signature Stitch Craftsmanship
          </span>
        </div>
      </div>
    </footer>
  );
};
