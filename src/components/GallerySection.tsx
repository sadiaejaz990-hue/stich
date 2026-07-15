import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getGalleryItems } from '../lib/db';
import { isSupabaseConfigured } from '../lib/supabase';
import { GalleryItem, CategoryType } from '../types';
import { Search, ZoomIn, X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface GallerySectionProps {
  onNavigate: (hash: string) => void;
  onSelectReferenceImage: (imageUrl: string, dressType: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ 
  onNavigate, 
  onSelectReferenceImage,
  filterCategory,
  setFilterCategory
}) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Categories config
  const categories: { label: string; value: string }[] = [
    { label: 'All Designs', value: 'all' },
    { label: 'Bridal Wear', value: 'bridal' },
    { label: 'Party Wear', value: 'party' },
    { label: 'Formal Wear', value: 'formal' },
    { label: 'Casual Wear', value: 'casual' },
    { label: 'Custom Designs', value: 'custom' },
  ];

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    async function loadGallery() {
      try {
        const data = await getGalleryItems();
        setItems(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading gallery designs from DB layer:', err);
        setLoading(false);
      }
    }

    if (isSupabaseConfigured()) {
      loadGallery();
    } else {
      // Fallback: Real-time listener for gallery collection in Firestore mode
      const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedItems: GalleryItem[] = [];
        snapshot.forEach((doc) => {
          fetchedItems.push({ id: doc.id, ...doc.data() } as GalleryItem);
        });
        setItems(fetchedItems);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching gallery items: ', error);
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, []);

  // Filter and search logic
  const filteredItems = items.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookThisLook = (item: GalleryItem) => {
    // Pre-fill the booking page state and navigate
    let formattedCategory = 'Custom Dress';
    if (item.category === 'bridal') formattedCategory = 'Bridal Wear';
    else if (item.category === 'party') formattedCategory = 'Party Wear';
    else if (item.category === 'formal') formattedCategory = 'Formal Wear';
    else if (item.category === 'casual') formattedCategory = 'Casual Wear';

    onSelectReferenceImage(item.image, formattedCategory);
    setSelectedItem(null);
    onNavigate('#book-now');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="gallery-section-container">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="font-serif italic text-gold-500 text-sm tracking-widest uppercase block mb-1">
          Inspiration Board
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Our Design Gallery
        </h2>
        <div className="w-16 h-1 bg-gold-500 mx-auto mt-3 rounded-full opacity-60" />
        <p className="font-sans text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-4 font-light leading-relaxed">
          Explore previous works crafted with extreme dedication. Filter by category, search specific designs, and book directly using any image as a reference!
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b border-zinc-100 dark:border-zinc-900 pb-6" id="gallery-toolbar">
        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`font-sans text-[10px] md:text-xs uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer ${
                filterCategory === cat.value
                  ? 'bg-zinc-950 dark:bg-gold-500 text-white dark:text-zinc-950 border-transparent font-semibold shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-gold-500/40 hover:text-gold-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pl-10 pr-4 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          <span className="font-sans text-xs text-zinc-500 dark:text-zinc-400">Loading catalog...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-zinc-800 dark:text-white mb-1">No Designs Found</h3>
          <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 font-light">
            We couldn't find any designs matching your search or filter. Try choosing another category!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="gallery-grid">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="group relative bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gold-500/20 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Frame */}
              <div 
                className="relative h-80 overflow-hidden cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Hover overlay with quick view */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-900 dark:text-white font-sans text-[10px] uppercase tracking-widest font-bold py-2 px-4 rounded-full shadow flex items-center gap-1.5 transition-transform translate-y-2 group-hover:translate-y-0 duration-300">
                    <ZoomIn className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
                    Inspect Details
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-zinc-950/85 backdrop-blur-md text-gold-500 text-[9px] uppercase tracking-widest font-extrabold py-1 px-2.5 rounded-md border border-gold-500/10">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Text & Quick Action Footer */}
              <div className="p-5 flex flex-col justify-between flex-grow bg-white dark:bg-zinc-950">
                <div>
                  <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 font-light line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-zinc-50 dark:border-zinc-900/40 pt-4 mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 hover:text-gold-500 font-bold transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookThisLook(item);
                    }}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-zinc-950 font-sans text-[10px] uppercase tracking-widest font-extrabold py-2 px-3.5 rounded-lg shadow-sm hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                  >
                    Book Similar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Zoom Dialog Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          id="gallery-lightbox"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Box */}
            <div className="md:col-span-7 relative h-[350px] md:h-[500px]">
              <img 
                src={selectedItem.image} 
                alt={selectedItem.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setSelectedItem(null)}
                className="md:hidden absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full cursor-pointer hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Box */}
            <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between h-full bg-white dark:bg-zinc-900">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
                  <span className="bg-gold-500/10 text-gold-500 text-[9px] uppercase tracking-widest font-bold py-1 px-2.5 rounded-md">
                    {selectedItem.category}
                  </span>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="hidden md:flex text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="font-serif text-xl md:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">
                  {selectedItem.title}
                </h3>

                <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light mb-6">
                  {selectedItem.description}
                </p>

                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-4 rounded-2xl mb-6">
                  <h4 className="font-serif text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                    How to order this design:
                  </h4>
                  <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                    Click the button below to book a tailoring appointment. This design will be automatically selected as your reference photo, and master Naveed will tailor it custom to your measurement specifications.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => handleBookThisLook(selectedItem)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-zinc-950 font-sans text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl shadow-lg cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Book This Look
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-2.5 font-sans text-xs uppercase tracking-wider font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 text-center cursor-pointer"
                >
                  Cancel & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
