import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { createTestimonial, getTestimonials } from '../lib/db';
import { isSupabaseConfigured } from '../lib/supabase';
import { Testimonial } from '../types';
import { 
  Star, MessageSquare, AlertCircle, CheckCircle, Loader2, 
  Upload, Trash2, Image as ImageIcon, User, Sparkles
} from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(5);
  
  // Form states
  const [name, setName] = useState('');
  const [dressType, setDressType] = useState('Bridal Wear');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [image, setImage] = useState(''); // Base64 string for dress image
  const [avatar, setAvatar] = useState(''); // Base64 string for customer avatar
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');

  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    async function loadTestimonials() {
      try {
        const data = await getTestimonials(true);
        setTestimonials(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading testimonials from DB layer:', err);
        setLoading(false);
      }
    }

    if (isSupabaseConfigured()) {
      loadTestimonials();
    } else {
      // Real-time listener fallback for APPROVED testimonials only (local Firestore mode)
      const q = query(
        collection(db, 'testimonials'), 
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched: Testimonial[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Testimonial);
        });
        setTestimonials(fetched);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching testimonials: ', err);
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, []);

  // Compute aggregate metrics
  const totalReviews = testimonials.length;
  const averageRating = totalReviews > 0 
    ? (testimonials.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  // Base64 file reader helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isAvatar = false) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Maximum file size is 2MB for optimized cloud synchronization.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          if (isAvatar) {
            setAvatar(uploadEvent.target.result as string);
          } else {
            setImage(uploadEvent.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag handlings
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Maximum file size is 2MB for optimized cloud synchronization.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (isAvatar = false) => {
    if (isAvatar) {
      setAvatar('');
    } else {
      setImage('');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !feedback.trim()) {
      setError('Name and feedback are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Submit to server-side endpoint for validation and spam protection
      const response = await fetch('/api/testimonials/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          feedback: feedback.trim(),
          rating,
          website_honeypot: websiteHoneypot,
        }),
      });

      const serverData = await response.json();
      if (!response.ok || !serverData.success) {
        throw new Error(serverData.error || 'Testimonial validation failed.');
      }

      // 2. Save testimonial via our database layer
      const newReview: Omit<Testimonial, 'id'> = {
        name: name.trim(),
        dressType,
        rating,
        feedback: feedback.trim(),
        image: image || undefined,
        avatar: avatar || undefined,
        approved: false, // Starts as false - requires admin approval
        createdAt: new Date().toISOString()
      };

      await createTestimonial(newReview);
      
      // Reset form
      setName('');
      setDressType('Bridal Wear');
      setRating(5);
      setFeedback('');
      setImage('');
      setAvatar('');
      setWebsiteHoneypot('');
      setSuccess(true);
      
      // Clear success banner after 8 seconds
      setTimeout(() => setSuccess(false), 8000);
    } catch (err: any) {
      console.error('Error saving review: ', err);
      setError(err.message || 'Failed to submit review. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to generate initials for elegant gold avatar placeholders
  const getInitials = (userName: string) => {
    const parts = userName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase() || 'NS';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12 md:gap-16" id="testimonials-section-container">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-serif italic text-gold-500 text-sm tracking-widest uppercase block mb-1">
          Reviews
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Client Testimonials
        </h2>
        <div className="w-16 h-1 bg-gold-500 mx-auto mt-3 rounded-full opacity-60" />
        <p className="font-sans text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-4 font-light leading-relaxed">
          The art of stitching is measured by the satisfaction of the wearer. Explore genuine reviews from our luxury fashion clients or submit your custom fitting feedback.
        </p>
      </div>

      {/* Aggregate metrics & Submit feedback Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Aggregates & Reviews list */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Top Aggregate Summary Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="font-sans text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold block mb-1">
                Average Rating
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white">
                  {averageRating}
                </span>
                <span className="font-sans text-sm text-zinc-400">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 text-gold-500 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.round(Number(averageRating)) ? 'fill-gold-500 stroke-gold-500' : 'text-zinc-200 dark:text-zinc-800'
                    }`} 
                  />
                ))}
              </div>
              <span className="font-sans text-[11px] text-zinc-500 mt-2 block">
                Based on {totalReviews} approved public reviews
              </span>
            </div>

            <div className="w-px h-16 bg-zinc-100 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex flex-col gap-1 w-full sm:w-auto max-w-xs">
              <span className="font-serif text-sm font-bold text-zinc-800 dark:text-white mb-1.5 text-center sm:text-left">
                100% Satisfaction Rate
              </span>
              <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-light text-center sm:text-left">
                Every customized dress goes through multi-level quality inspections and pre-delivery test fittings to guarantee zero errors.
              </p>
            </div>
          </div>

          {/* Category Filters and Search Bar */}
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(5); // Reset pagination on search
                }}
                placeholder="Search reviews by name, fabric, silhouette, or keywords..."
                className="w-full bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs focus:outline-none focus:border-gold-500/60 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 transition-colors shadow-inner"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </div>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Horizontal Scrollable Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {['All', 'Bridal Wear', 'Party Wear', 'Formal Wear', 'Casual Wear', 'Custom Design'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setVisibleCount(5); // Reset pagination on category switch
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-white shadow-sm shadow-gold-500/10'
                      : 'bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-850'
                  }`}
                >
                  {cat === 'All' ? 'All Reviews' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* List of testimonials */}
          <div className="flex flex-col gap-6" id="testimonials-list">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                <span className="font-sans text-xs text-zinc-500 dark:text-zinc-400">Loading master-stitching reviews...</span>
              </div>
            ) : (() => {
              const filtered = testimonials.filter(item => {
                const matchesCategory = selectedCategory === 'All' || item.dressType === selectedCategory;
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      item.feedback.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center bg-white dark:bg-zinc-900/10">
                    <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400">
                      No matching reviews found for "{searchQuery || selectedCategory}".
                    </p>
                  </div>
                );
              }

              const displayed = filtered.slice(0, visibleCount);

              return (
                <>
                  {displayed.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 items-start transition-all hover:border-gold-500/15"
                    >
                      {/* Customer Avatar & Sizing Info */}
                      <div className="flex-grow flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar container */}
                          {item.avatar ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gold-500/10">
                              <img 
                                src={item.avatar} 
                                alt={`${item.name} - Naveed Signature Stich customer review avatar`} 
                                loading="lazy"
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-850 dark:to-zinc-950 border border-gold-500/35 text-gold-400 flex items-center justify-center font-serif text-xs font-bold shadow-sm flex-shrink-0">
                              {getInitials(item.name)}
                            </div>
                          )}

                          <div>
                            <h4 className="font-serif text-sm font-bold text-zinc-950 dark:text-white">
                              {item.name}
                            </h4>
                            <span className="font-sans text-[10px] text-gold-500 uppercase tracking-widest font-semibold block mt-0.5">
                              {item.dressType}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1 text-gold-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < item.rating ? 'fill-gold-500 stroke-gold-500' : 'text-zinc-200 dark:text-zinc-800'
                              }`} 
                            />
                          ))}
                        </div>

                        <p className="font-sans text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light italic">
                          "{item.feedback}"
                        </p>

                        <span className="font-sans text-[9px] text-zinc-400 mt-1 block">
                          Stitched on {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Dress Photo if attached */}
                      {item.image && (
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 self-center md:self-start border border-zinc-100 dark:border-zinc-800">
                          <img 
                            src={item.image} 
                            alt={`${item.name}'s custom tailored luxury ${item.dressType} fitting reveal`} 
                            loading="lazy"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Load More Button */}
                  {filtered.length > visibleCount && (
                    <button
                      onClick={() => setVisibleCount(prev => prev + 5)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl py-3.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all shadow-sm hover:border-gold-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Load More Client Reviews</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        (Showing {visibleCount} of {filtered.length})
                      </span>
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Submit review form */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-md" id="submit-review-form-container">
          <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold-500" />
            Share Couture Experience
          </h3>
          <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mb-6 font-light leading-relaxed">
            Help our tailoring family flourish. Your high-contrast feedback will be published immediately upon administrator verification.
          </p>

          {/* Success Banner */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl p-4 flex gap-3 mb-6 text-xs leading-relaxed animate-fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <div>
                <strong className="font-semibold block mb-0.5">Review Submitted!</strong>
                Thank you for your valuable feedback. It has been saved successfully and is queued for verification.
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl p-4 flex gap-2.5 mb-6 text-xs items-center animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="flex flex-col gap-5">
            {/* Spam Protection Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input 
                type="text" 
                name="website_honeypot" 
                value={websiteHoneypot} 
                onChange={(e) => setWebsiteHoneypot(e.target.value)} 
                tabIndex={-1} 
                autoComplete="off" 
              />
            </div>
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Farooq"
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white"
              />
            </div>

            {/* Dress Type */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Dress Type Stitched *
              </label>
              <select
                value={dressType}
                onChange={(e) => setDressType(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white"
              >
                <option value="Bridal Wear">Bridal Wear</option>
                <option value="Party Wear">Party Wear</option>
                <option value="Formal Wear">Formal Wear</option>
                <option value="Casual Wear">Casual Wear</option>
                <option value="Custom Design">Custom Designs</option>
              </select>
            </div>

            {/* Rating Stars Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Star Rating *
              </label>
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const starVal = idx + 1;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setRating(starVal)}
                      className="p-1 text-gold-500 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          starVal <= rating ? 'fill-gold-500 stroke-gold-500' : 'text-zinc-200 dark:text-zinc-800'
                        }`} 
                      />
                    </button>
                  );
                })}
                <span className="font-sans text-xs text-zinc-400 font-medium ml-2">
                  ({rating} of 5 Stars)
                </span>
              </div>
            </div>

            {/* Feedback */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Your Feedback *
              </label>
              <textarea
                required
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe the silhouette, thread precision, fitting accuracy, and overall luxury experience..."
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white resize-none"
              />
            </div>

            {/* Premium Client Photo Upload (Avatar) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Your Profile Photo (Optional)
              </label>
              <div className="flex items-center gap-3">
                {avatar ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gold-500/20">
                    <img 
                      src={avatar} 
                      alt="Avatar preview upload" 
                      loading="lazy"
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImage(true)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-12 h-12 rounded-full border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-gold-500/40 hover:text-gold-500 cursor-pointer transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>
                )}
                <div className="flex flex-col text-[11px] text-zinc-400 font-light">
                  <button 
                    type="button" 
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-zinc-700 dark:text-zinc-200 hover:text-gold-500 text-left font-semibold cursor-pointer"
                  >
                    Upload profile avatar
                  </button>
                  <span>JPEG, PNG (Max 2MB)</span>
                </div>
                <input 
                  type="file" 
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="hidden" 
                />
              </div>
            </div>

            {/* Custom Drag & Drop Dress Image Area */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Attach Dress Portrait (Optional)
              </label>
              
              {image ? (
                <div className="relative border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden p-2 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={image} 
                      alt="Dress upload preview file" 
                      loading="lazy"
                      className="w-12 h-12 object-cover rounded-xl border border-gold-500/15" 
                    />
                    <span className="font-sans text-[10px] text-zinc-400">Dress Portrait attached</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeImage(false)}
                    className="p-2 text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-gold-500 bg-gold-500/5' 
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-gold-500/30 bg-zinc-50 dark:bg-zinc-950'
                  }`}
                >
                  <Upload className={`w-5 h-5 ${dragActive ? 'text-gold-500 animate-bounce' : 'text-zinc-400'}`} />
                  <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">Drag & drop</span> your dress photo or <span className="font-semibold text-gold-500">browse</span>
                  </p>
                  <p className="font-sans text-[9px] text-zinc-400">Supports PNG, JPG, WEBP up to 2MB</p>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => handleFileChange(e, false)}
                className="hidden" 
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-zinc-950 font-sans text-xs uppercase tracking-widest font-extrabold py-3.5 rounded-xl cursor-pointer shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Feedback...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
