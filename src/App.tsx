import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeSection } from './components/HomeSection';
import { AboutSection } from './components/AboutSection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BookNowSection } from './components/BookNowSection';
import { ContactSection } from './components/ContactSection';
import { AdminPanel } from './components/AdminPanel';
import { SEO } from './components/SEO';
import { Logo } from './components/Logo';
import { ChevronUp, MessageCircle, AlertTriangle, Sparkles, Scissors, Clock, MapPin, Calendar } from 'lucide-react';

function AppContent() {
  const { theme } = useTheme();
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#home');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // Booking pre-fills if navigating from Gallery "Book This Look"
  const [preselectedImage, setPreselectedImage] = useState('');
  const [preselectedCategory, setPreselectedCategory] = useState('');

  // Gallery current filter state (persists if user navigates away and back)
  const [galleryFilter, setGalleryFilter] = useState('all');

  useEffect(() => {
    // Initial luxury loading screen (1.5s fade-out)
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      setCurrentHash(hash);
      
      // Scroll to top of the page on route change (or smooth scroll)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
    setCurrentHash(hash);
  };

  const handleSelectReferenceImage = (imageUrl: string, dressType: string) => {
    setPreselectedImage(imageUrl);
    setPreselectedCategory(dressType);
  };

  const handleClearPreselected = () => {
    setPreselectedImage('');
    setPreselectedCategory('');
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine active view & SEO meta properties
  const renderActiveView = () => {
    switch (currentHash) {
      case '#home':
      case '':
        return (
          <HomeSection 
            onNavigate={handleNavigate} 
            onFilterGallery={setGalleryFilter} 
          />
        );
      case '#about':
        return <AboutSection />;
      case '#gallery':
        return (
          <GallerySection 
            onNavigate={handleNavigate} 
            onSelectReferenceImage={handleSelectReferenceImage}
            filterCategory={galleryFilter}
            setFilterCategory={setGalleryFilter}
          />
        );
      case '#testimonials':
        return <TestimonialsSection />;
      case '#book-now':
        return (
          <BookNowSection 
            preselectedImage={preselectedImage}
            preselectedCategory={preselectedCategory}
            onClearPreselected={handleClearPreselected}
          />
        );
      case '#contact':
        return <ContactSection />;
      case '#admin':
        return <AdminPanel />;
      default:
        // Elegant 404 View
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center" id="404-view">
            <div className="bg-gold-500/10 p-5 rounded-full text-gold-500 border border-gold-500/20 mb-5 animate-pulse">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Design Page Not Found
            </h2>
            <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
              We couldn't draft a pattern for this specific page URL. Let's return you to our primary luxury atelier catalogs.
            </p>
            <button
              onClick={() => handleNavigate('#home')}
              className="bg-zinc-950 dark:bg-gold-500 text-white dark:text-zinc-950 font-sans text-xs uppercase tracking-widest font-bold py-3 px-6 rounded-full cursor-pointer hover:scale-[1.02] transition-transform shadow-md"
            >
              Return Home Studio
            </button>
          </div>
        );
    }
  };

  const getSEOMetadata = () => {
    switch (currentHash) {
      case '#about':
        return {
          title: 'Heritage & Bespoke Craft',
          description: 'Read the legacy of Naveed Signature Stich. Learn about our 30+ precision measurement points and premium hand-sewing procedures.'
        };
      case '#gallery':
        return {
          title: 'Bespoke Gallery Catalog',
          description: 'Explore custom tailored bridal wear, exquisite party wear ghararas and sarees, raw silk ensembles, and bespoke sherwanis stitched to absolute perfection.'
        };
      case '#testimonials':
        return {
          title: 'Client Satisfaction Reviews',
          description: 'Browse genuine client ratings and reviews of our custom fitting and custom stitching. Submit your tailoring experience.'
        };
      case '#book-now':
        return {
          title: 'Schedule Sizing & Fitting',
          description: 'Book an exclusive fitting session online. Fill in your preferred dates and attach reference designs to start your custom tailoring session.'
        };
      case '#contact':
        return {
          title: 'Visit Atelier & Studio Map',
          description: 'Get location directions, hours of operation, phone, email, and social networks for our flagship Manhattan boutique district.'
        };
      case '#admin':
        return {
          title: 'Administrator Console',
          description: 'Private administration dashboard for managing client bookings, moderate reviews, and gallery designs.'
        };
      default:
        return {
          title: 'Custom Dresses Designed to Perfection',
          description: 'Experience premium custom tailoring with Naveed Signature Stich. We stitch custom bridal, formal, casual, and designer wear with absolute precision.'
        };
    }
  };

  const seo = getSEOMetadata();

  // Luxury loading screen
  if (appLoading) {
    return (
      <div className="fixed inset-0 bg-[#111111] z-50 flex flex-col items-center justify-center gap-4 text-white animate-fade-in" id="app-loader">
        <Logo size="lg" showText={false} className="animate-pulse" />
        <div className="flex flex-col items-center justify-center text-center mt-2">
          <span className="font-serif tracking-[0.25em] text-lg font-bold text-gold-500 leading-none">
            NAVEED
          </span>
          <span className="font-serif tracking-[0.3em] uppercase text-xs text-white block mt-1">
            SIGNATURE STICH
          </span>
          <div className="w-24 h-[1px] bg-gold-500/30 mt-4 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gold-500 animate-[loading_1s_infinite_ease-in-out]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F0] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300 font-sans" id="app-root-view">
      <SEO title={seo.title} description={seo.description} />

      {/* Primary Sticky Navbar */}
      <Navbar currentHash={currentHash} onNavigate={handleNavigate} />

      {/* Top Banner Alert for Admin Mode */}
      {currentHash === '#admin' && (
        <div className="bg-amber-500 text-zinc-950 font-sans text-[10px] uppercase tracking-widest font-extrabold text-center py-2 px-4 sticky top-16 z-30 flex items-center justify-center gap-2 border-b border-zinc-900/10">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          Secure Administrator Environment
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-grow pt-24 pb-16" id="main-content-flow">
        {renderActiveView()}
      </main>

      {/* Footer view */}
      <Footer onNavigate={handleNavigate} />

      {/* Back to top button */}
      <button
        onClick={handleScrollToTop}
        className={`fixed bottom-6 left-6 z-40 bg-zinc-900 hover:bg-zinc-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-white dark:text-zinc-950 p-3.5 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border border-gold-500/20 cursor-pointer ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        title="Scroll back to top"
        id="back-to-top-button"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Floating Book Now Button */}
      <button
        onClick={() => handleNavigate('#book-now')}
        className="fixed bottom-24 right-6 z-40 bg-zinc-900 hover:bg-zinc-800 dark:bg-gradient-to-r dark:from-gold-600 dark:to-gold-500 text-white dark:text-zinc-950 p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-gold-500/20 cursor-pointer flex items-center justify-center group"
        title="Schedule Design Session"
        id="book-now-floating-button"
      >
        <Calendar className="w-5 h-5 text-gold-500 dark:text-zinc-950" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out font-sans text-xs uppercase tracking-wider font-bold whitespace-nowrap pl-0 group-hover:pl-2">
          Book Now
        </span>
      </button>

      {/* WhatsApp Floating communication Link */}
      <a
        href="https://wa.me/923064200710?text=Hello%20Naveed%20Signature%20Stich,%20I%20would%20like%20to%20schedule%20a%20measurement%20fitting%20session%20for%20a%20custom%20dress."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-emerald-400/20 cursor-pointer flex items-center justify-center group"
        title="Chat live on WhatsApp"
        id="whatsapp-floating-button"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out font-sans text-xs uppercase tracking-wider font-bold whitespace-nowrap pl-0 group-hover:pl-2">
          Chat Live
        </span>
      </a>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
