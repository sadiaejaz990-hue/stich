import React from 'react';
import { Scissors, Ruler, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Anatomical Master Draft',
      desc: 'Our master tailors chart 30+ precise measurements, studying your structure and posture to draft a custom architectural blueprint that contours flawlessly.',
      icon: Ruler
    },
    {
      step: '02',
      title: 'Opulent Textile Sourcing',
      desc: 'Select from our highly curated library of pure katan silk, banarsi brocades, hand-woven jamawar, tissue organza, and custom embellished velvets.',
      icon: Sparkles
    },
    {
      step: '03',
      title: 'Heritage Pattern Cutting',
      desc: 'Each pattern is hand-drafted from scratch. Every delicate curve is meticulously calculated and manually cut to maintain perfect textile flow and pattern symmetry.',
      icon: Scissors
    },
    {
      step: '04',
      title: 'Haute Couture Sewing',
      desc: 'Finished with fine french seams, silk linings, and invisible hand-stitched blind hems. Final fitting rituals are conducted to guarantee pristine visual drape.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col gap-16 md:gap-24" id="about-section-container">
      {/* Brand Story */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center" id="about-story-grid">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <span className="font-serif italic text-gold-500 text-sm tracking-widest uppercase block">
            The Atelier Legacy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Perfecting the Art of <br/>Bespoke Couture Since 2011
          </h2>
          <div className="w-16 h-1 bg-gold-500 rounded-full opacity-60" />
          
          <div className="font-sans text-sm text-zinc-600 dark:text-zinc-300 flex flex-col gap-5 font-light leading-relaxed">
            <p>
              At <strong className="font-semibold text-zinc-900 dark:text-white">Naveed Signature Stich</strong>, we honor the belief that garments are the visual canvas of one's personal identity. Established as a private design atelier in Lahore, we have evolved into a premium tailoring house celebrated for precision cutting, couture heritage, and magnificent drapes.
            </p>
            <p>
              Under the artistic direction of master couturier Naveed, our atelier combines timeless drafting lineages with modern design sensibilities. We cater specifically to patrons who demand rigorous detail—the balance of a shoulder, the strength of silk-spun thread, and the luxurious tactile feedback of rare, authentic textiles.
            </p>
            <p>
              From the royal grandeur of hand-embellished bridal lehengas and meticulously tailored sherwanis to the crisp, contemporary elegance of luxury silk ensembles, we construct each creation as a distinct masterpiece.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {[
              'Premium Sourced Heritage Textiles',
              'Intricate Handwork & Embellishments',
              'Rigorous Master-Tailored Linings',
              'Complimentary Couture Adjustments',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <span className="font-sans text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual collage of tailoring handcraft */}
        <div className="lg:col-span-5 relative">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <img 
              src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800" 
              alt="Master tailoring artisan cutting premium dark fabric precisely using bespoke sewing shears in Naveed Signature Stich Lahore atelier" 
              loading="lazy"
              className="w-full h-[450px] object-cover hover:scale-[1.02] transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Decorative design elements */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gold-500/10 rounded-2xl -z-0 pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-48 h-48 bg-gold-500/5 rounded-full blur-2xl -z-0 pointer-events-none" />
          
          <div className="absolute bottom-6 right-6 bg-zinc-950 text-white p-5 rounded-2xl shadow-xl border border-gold-500/20 z-20 flex flex-col items-center text-center">
            <span className="font-serif text-3xl font-bold text-gold-500">100%</span>
            <span className="font-sans text-[9px] uppercase tracking-wider text-zinc-300 mt-1 font-semibold">
              Hand-Finished Artistry
            </span>
          </div>
        </div>
      </section>

      {/* Crafting Process */}
      <section className="flex flex-col gap-12" id="about-process-section">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-serif italic text-gold-500 text-sm tracking-widest uppercase block mb-1">
            The Bespoke Rite
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Our Couture Crafting Ritual
          </h2>
          <p className="font-sans text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-light">
            Behind every signature creation is a disciplined sequence of architectural plotting, textile exploration, and hand-tailored devotion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900/80 p-8 rounded-3xl relative overflow-hidden group hover:border-gold-500/20 hover:shadow-lg transition-all duration-300"
              >
                <span className="font-serif text-5xl font-extrabold text-gold-500/10 group-hover:text-gold-500/20 transition-colors absolute top-4 right-6 pointer-events-none select-none">
                  {item.step}
                </span>
                
                <div className="bg-gold-500/10 dark:bg-gold-500/5 p-3 rounded-2xl text-gold-500 w-fit mb-5">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                
                <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
