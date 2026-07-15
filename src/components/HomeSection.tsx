import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, Award, Clock, Heart, ShieldCheck, 
  Scissors, CheckCircle2, Star, HelpCircle, ChevronDown, ChevronUp, Instagram, Plus
} from 'lucide-react';
import { Logo } from './Logo';

interface HomeSectionProps {
  onNavigate: (hash: string) => void;
  onFilterGallery: (category: string) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onNavigate, onFilterGallery }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { number: '2,500+', label: 'Elite Clientele', icon: Heart },
    { number: '15+ Years', label: 'Couture Heritage', icon: Award },
    { number: '4,800+', label: 'Bespoke Outfits', icon: Scissors },
    { number: '7-10 Days', label: 'Express Delivery', icon: Clock },
  ];

  // The 8 detailed luxury services requested by the user
  const services = [
    {
      title: 'Bridal Dresses',
      desc: 'Ornate custom lehengas, heavy ghararas, majestic bridal anarkalis, and traditional designer shararas embellished with exquisite zardozi and kora handwork.',
      img: '/images/crimson_lehenga_1784082214336.jpg',
      category: 'bridal',
      alt: 'Bespoke crimson red bridal lehenga with luxurious royal gold zardozi hand embroidery and kora embellishments'
    },
    {
      title: 'Party Wear',
      desc: 'Elegant silk and chiffon sarees, festive gharara suits, hand-worked designer dholki kurtis, and contemporary traditional pieces for festive celebrations.',
      img: '/images/ivory_sharara_1784082237503.jpg',
      category: 'party',
      alt: 'Luxury ivory white sharara suit with fine sitara and gota kiran borders for premium festive party wear'
    },
    {
      title: 'Formal Dresses',
      desc: 'Bespoke raw silk groom sherwanis, elegant high-collar kurtas with tailored luxury waistcoats, and premium formal salwar kameez suits.',
      img: '/images/sage_anarkali_1784082277389.jpg',
      category: 'formal',
      alt: 'Custom sage green heavily pleated silk Anarkali dress with delicate threadwork details and fitted sleeves'
    },
    {
      title: 'Casual Dresses',
      desc: 'Lightweight summer lawn suits, block-printed daily-wear cotton kurtis, and comfortable premium linen tunics tailored to your precise posture.',
      img: '/images/ivory_kurta_1784082353949.jpg',
      category: 'casual',
      alt: 'Elegant off-white luxury lawn cotton short kurta with minimalist geometric self-work neck embroidery'
    },
    {
      title: 'Custom Stitching',
      desc: 'Flawless pattern-drafting calibrated precisely to your anatomical structure. Guaranteed to contour, support, and drape with absolute elegance.',
      img: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800',
      category: 'custom',
      alt: 'Master tailor hand drafting an anatomical custom dress blueprint on premium pattern paper with measuring chalk'
    },
    {
      title: 'Alterations',
      desc: 'Prestige resizing, reshaping, and remodeling services for high-value luxury designer dresses, heavy bridal gowns, and premium shirts.',
      img: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80&w=800',
      category: 'custom',
      alt: 'Artisan tailor performing high-precision adjustments and delicate alterations on a luxury silk dress bodice'
    },
    {
      title: 'Luxury Embroidery',
      desc: 'Royal embellishments featuring traditional hand-crafted tilla, gotapatti, pearl stitchings, and silk threads rendered by heritage craftsmen.',
      img: '/images/black_lehenga_1784082334514.jpg',
      category: 'custom',
      alt: 'Royal midnight black velvet lehenga on display showing gorgeous gold tilla and traditional hand zardozi handwork'
    },
    {
      title: 'Custom Designing',
      desc: 'Inquire and share reference designs from Instagram, Pinterest, or Google. We build custom sewing molds to recreate any silhouette 100%.',
      img: '/images/turquoise_frock_1784082297066.jpg',
      category: 'custom',
      alt: 'Vibrant turquoise teal blue pleated luxury frock styled with contemporary drapes and structural stitching'
    }
  ];

  const trustBadges = [
    { text: 'Premium Tailoring', desc: 'Anatomical paper drafts' },
    { text: 'Custom Fitting', desc: 'Sizing contours calibrated' },
    { text: 'Bridal Specialists', desc: 'Exquisite heavy embellishments' },
    { text: 'Fast Delivery', desc: 'Strict schedule commitment' }
  ];

  const faqs = [
    {
      q: 'What is the standard turnaround time for custom tailoring?',
      a: 'Our turnaround time is carefully structured to uphold our quality standards. Casual dresses require 7–10 days, formal wear and heavy luxury party suits take 2–3 weeks, while magnificent custom bridal couture takes 8–12 weeks of meticulous handcraft.'
    },
    {
      q: 'Can I bring my own fabric, or do you supply materials?',
      a: 'We offer absolute flexibility. You are welcome to supply your own prized fabrics, or collaborate directly with our designers to choose from our premium in-house library of raw silks, banarsi jamawar, pure chiffon, velvets, and luxury lawn cotton.'
    },
    {
      q: 'Do you offer fitting corrections and sizing adjustments?',
      a: 'Yes, we provide a Perfect Silhouette Guarantee. If your tailored dress requires any minor sizing adjustments within 30 days of delivery, our master tailors will perform them complimentary in our flagship Lahore studio.'
    },
    {
      q: 'How does the custom design recreating service work?',
      a: 'Simply upload or paste the URL of any inspiration image (from Pinterest, Instagram, or runway shows) on our Book Now form. Master Naveed will study the silhouette, design custom paper patterns, and sew a premium recreation of the outfit.'
    },
    {
      q: 'Can I request a virtual video consultation if I live abroad?',
      a: 'Absolutely. We cater to global patrons. Our team offers dedicated WhatsApp video calls to guide you step-by-step through taking your own sizing measurements with perfect professional accuracy.'
    }
  ];

  // Curated runway Instagram photos mimicking top designer aesthetics
  const instagramFeed = [
    { img: '/images/crimson_lehenga_1784082214336.jpg', likes: '1.2k', tag: '#Bridal', alt: 'Close-up of a royal crimson bridal lehenga hem featuring heavy traditional zardozi and kora hand embroideries' },
    { img: '/images/ivory_sharara_1784082237503.jpg', likes: '942', tag: '#Atelier', alt: 'Ivory white sharara with a sheer hand-embellished overlay and traditional gota borders showcased in the Lahore atelier' },
    { img: '/images/sage_anarkali_1784082277389.jpg', likes: '1.5k', tag: '#Couture', alt: 'Elegant sage green luxury silk Anarkali outfit draped perfectly on a tailor mannequin' },
    { img: '/images/turquoise_frock_1784082297066.jpg', likes: '811', tag: '#Silk', alt: 'Flowing turquoise katan silk custom frock styled with custom tailored pleats and elegant modern drapes' },
    { img: '/images/ivory_kurta_1784082353949.jpg', likes: '1.1k', tag: '#Minimal', alt: 'Minimalist designer short length off-white summer kurti featuring premium self-embroidered design lines' },
    { img: '/images/black_lehenga_1784082334514.jpg', likes: '2.3k', tag: '#Legacy', alt: 'Royal midnight black velvet lehenga on display showing gorgeous gold tilla and traditional hand zardozi handwork' },
  ];

  const handleServiceClick = (category: string) => {
    onFilterGallery(category);
    onNavigate('#gallery');
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-16 md:gap-24" id="home-section-container">
      {/* Hero Section - Elevated Luxurious Copy & Tone */}
      <section 
         className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-zinc-950 text-white py-20 px-4" 
         id="hero-section"
      >
        {/* Background fashion image overlay with deep vignetting */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1600" 
            alt="Premium luxury raw silk and brocade sewing fabrics displayed elegantly in Naveed Signature Stich Lahore atelier" 
            loading="eager"
            className="w-full h-full object-cover filter brightness-[0.15] saturate-[0.5] scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Elegant Radial Dark Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-zinc-950/70 to-zinc-950 z-0 pointer-events-none" />
        
        {/* Luminous Gold Core in center background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-6">
          {/* Subtle gold monogram identifier */}
          <Logo size="lg" showText={false} className="animate-fade-in opacity-95 scale-90 mb-2" />
          
          <span className="font-serif tracking-[0.45em] text-[10px] md:text-xs uppercase text-gold-500 font-semibold">
            NAVEED SIGNATURE STICH
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight max-w-4xl text-zinc-50 font-normal">
            Luxury Custom Stitching <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 italic font-semibold">
              Designed Around You.
            </span>
          </h1>

          <p className="font-sans text-xs sm:text-sm md:text-base max-w-2xl text-zinc-300/90 leading-relaxed font-light">
            Step into the hallmark of Eastern haute couture. For over fifteen years, we have sculpted immaculate ensembles—transforming magnificent fabrics into tailored statements of power and poise. Our master cutters calibrate each pattern to your unique anatomy.
          </p>

          {/* Luxury dual CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full justify-center">
            <button
              onClick={() => onNavigate('#book-now')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-zinc-950 font-sans text-xs uppercase tracking-widest font-bold py-4 px-10 rounded-full shadow-xl shadow-gold-500/10 hover:scale-[1.03] transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Book Appointment
            </button>
            <button
              onClick={() => onNavigate('#gallery')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent text-white font-sans text-xs uppercase tracking-widest font-bold py-4 px-10 rounded-full border border-gold-500/20 hover:border-gold-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              View Gallery
              <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
            </button>
          </div>

          {/* Luxury visual Trust Badges centered with gold checks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-12 w-full max-w-4xl border-t border-zinc-900 pt-8">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 group">
                <div className="flex items-center gap-1.5 text-gold-500">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span className="font-serif text-xs md:text-sm font-bold text-zinc-100 group-hover:text-gold-500 transition-colors">
                    {badge.text}
                  </span>
                </div>
                <span className="font-sans text-[9px] text-zinc-500 uppercase tracking-widest">
                  {badge.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numerical Indicators / Metrics section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20" id="stats-section">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl shadow-xl py-8 px-6 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center p-4">
                <div className="bg-gold-500/10 dark:bg-gold-500/5 p-3 rounded-2xl mb-3 text-gold-500">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {stat.number}
                </h3>
                <p className="font-sans text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services Grid Section (Displays all 8 services beautifully) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="featured-categories-section">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="font-serif italic text-gold-500 text-sm tracking-widest uppercase block mb-1">
            Exquisite Offerings
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Our Bespoke Services
          </h2>
          <div className="w-16 h-1 bg-gold-500 mx-auto mt-3 rounded-full opacity-60" />
          <p className="font-sans text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed font-light">
            Every stitch is a testament to master craft, custom calibrated patterns, hand-picked premium fabrics, and royal embroidery techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, idx) => (
            <div 
              key={idx}
              className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gold-500/20 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container with luxury dimming filter */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={svc.img} 
                  alt={svc.alt || svc.title} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-40 group-hover:opacity-75 transition-opacity" />
                <div className="absolute bottom-3 left-3">
                  <span className="bg-gold-500/90 text-zinc-950 text-[9px] uppercase tracking-widest font-extrabold py-1 px-2.5 rounded-md shadow-sm">
                    {svc.title}
                  </span>
                </div>
              </div>

              {/* Card textual content */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                    {svc.title}
                  </h3>
                  <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-light mb-4">
                    {svc.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-50 dark:border-zinc-950 pt-3 mt-auto">
                  <button
                    onClick={() => handleServiceClick(svc.category)}
                    className="font-sans text-[9px] uppercase tracking-wider font-bold text-gold-500 hover:text-gold-600 flex items-center gap-1 cursor-pointer"
                  >
                    View Designs
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('#book-now')}
                    className="font-sans text-[9px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Runway Quote / Aesthetic Statement Banner */}
      <section className="bg-zinc-950 text-white py-16 px-6 relative overflow-hidden" id="tagline-banner">
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-zinc-950 z-0 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-4">
          <Scissors className="w-6 h-6 text-gold-500 mb-1 animate-bounce" />
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-light tracking-wide italic leading-relaxed max-w-3xl">
            "We do not merely sew fabric; we draft a physical silhouette of your personal legacy, writing each line with pristine silk and gold thread."
          </h2>
          <p className="font-sans text-xs text-gold-500 uppercase tracking-widest font-semibold">
            — Couturier Naveed Ahmad
          </p>
          <button
            onClick={() => onNavigate('#about')}
            className="mt-2 font-sans text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-all border-b border-zinc-800 hover:border-white pb-0.5 cursor-pointer font-bold"
          >
            Our Atelier Heritage
          </button>
        </div>
      </section>

      {/* Curator Runway Mockup Instagram Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="instagram-feed-section">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="bg-gold-500/10 text-gold-500 p-2.5 rounded-full w-fit mx-auto mb-2.5">
            <Instagram className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
            Curated Atelier Feed
          </h2>
          <p className="font-sans text-xs text-zinc-400 uppercase tracking-widest font-semibold mt-1">
            @NaveedSignatureStitch
          </p>
          <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-light">
            An intimate visual lookbook representing daily bespoke fittings, silk embroideries, and final bridal reveals.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="instagram-grid">
          {instagramFeed.map((feed, idx) => (
            <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-900 cursor-pointer">
              <img 
                src={feed.img} 
                alt={feed.alt || `Naveed Signature Stitch bespoke curation - ${feed.tag}`} 
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-3">
                <span className="text-gold-400 font-serif text-[10px] uppercase tracking-widest font-bold">{feed.tag}</span>
                <span className="text-white font-sans text-xs font-semibold mt-1.5 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-gold-500 stroke-gold-500" />
                  {feed.likes} Likes
                </span>
                <span className="text-[9px] uppercase font-mono text-zinc-400 mt-1">View Post ↗</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accordion FAQ Block */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8" id="faq-section">
        <div className="text-center mb-10">
          <span className="font-serif italic text-gold-500 text-sm tracking-widest uppercase block mb-1">
            Client Inquiries
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="w-12 h-0.5 bg-gold-500 mx-auto mt-2 rounded-full opacity-60" />
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-serif text-sm md:text-base font-bold text-zinc-800 dark:text-white hover:text-gold-500 dark:hover:text-gold-500 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-gold-500 flex-shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gold-500" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-zinc-50 dark:border-zinc-950">
                    <p className="font-sans text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

