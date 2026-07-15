import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  getBookings, 
  updateBookingStatus, 
  deleteBooking,
  getTestimonials, 
  approveTestimonial, 
  deleteTestimonial,
  getGalleryItems, 
  createGalleryItem, 
  deleteGalleryItem,
  getMessages, 
  deleteMessage 
} from '../lib/db';
import { isSupabaseConfigured } from '../lib/supabase';
import { Booking, Testimonial, GalleryItem, ContactMessage } from '../types';
import { 
  Lock, KeyRound, LayoutDashboard, Calendar, Star, 
  Image, Mail, Trash2, Check, X, ShieldAlert, LogOut, 
  Clock, Plus, Sparkles, Loader2, RefreshCw, Layers, User
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active tab state
  const [activeTab, setActiveTab] = useState<'bookings' | 'testimonials' | 'gallery' | 'messages'>('bookings');

  // Real-time lists
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Gallery addition state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'bridal' | 'party' | 'formal' | 'casual' | 'custom'>('bridal');
  const [newImage, setNewImage] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [gallerySubmitting, setGallerySubmitting] = useState(false);
  const [gallerySuccess, setGallerySuccess] = useState(false);

  // Constants
  const ADMIN_PASSCODE = 'signaturegold2026';

  // Session checks on mount
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
    if (token) {
      setLoading(true);
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.valid) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('adminToken');
          localStorage.removeItem('adminToken');
        }
      })
      .catch(err => {
        console.error('Session verification error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const refreshAllLists = async () => {
    setLoading(true);
    try {
      const [bData, tData, gData, mData] = await Promise.all([
        getBookings(),
        getTestimonials(),
        getGalleryItems(),
        getMessages()
      ]);
      setBookings(bData);
      setTestimonials(tData);
      setGallery(gData);
      setMessages(mData);
    } catch (err) {
      console.error('Error loading admin lists:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time or hybrid lists loading
  useEffect(() => {
    if (!isAuthenticated) return;

    if (isSupabaseConfigured()) {
      refreshAllLists();
    } else {
      // Fallback: Real-time listeners for local Firestore mode
      setLoading(true);

      const unsubBookings = onSnapshot(
        query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
        (snap) => {
          const list: Booking[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Booking));
          setBookings(list);
        }
      );

      const unsubTestimonials = onSnapshot(
        query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')),
        (snap) => {
          const list: Testimonial[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Testimonial));
          setTestimonials(list);
        }
      );

      const unsubGallery = onSnapshot(
        query(collection(db, 'gallery'), orderBy('createdAt', 'desc')),
        (snap) => {
          const list: GalleryItem[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as GalleryItem));
          setGallery(list);
        }
      );

      const unsubMessages = onSnapshot(
        query(collection(db, 'messages'), orderBy('createdAt', 'desc')),
        (snap) => {
          const list: ContactMessage[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ContactMessage));
          setMessages(list);
          setLoading(false);
        }
      );

      return () => {
        unsubBookings();
        unsubTestimonials();
        unsubGallery();
        unsubMessages();
      };
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passcode.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError(data.error || 'Invalid Administrator Passcode. Please try again.');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setLoginError('Failed to communicate with authorization server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasscode('');
    sessionStorage.removeItem('adminToken');
    localStorage.removeItem('adminToken');
  };

  const getInitials = (userName: string) => {
    const parts = userName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase() || 'NS';
  };

  // Booking updates
  const handleUpdateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(id, status);
      if (isSupabaseConfigured()) refreshAllLists();
    } catch (err) {
      console.error('Error updating booking: ', err);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this booking request?')) return;
    try {
      await deleteBooking(id);
      if (isSupabaseConfigured()) refreshAllLists();
    } catch (err) {
      console.error('Error deleting booking: ', err);
    }
  };

  // Testimonial approvals
  const handleApproveTestimonial = async (id: string) => {
    try {
      await approveTestimonial(id);
      if (isSupabaseConfigured()) refreshAllLists();
    } catch (err) {
      console.error('Error approving review: ', err);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await deleteTestimonial(id);
      if (isSupabaseConfigured()) refreshAllLists();
    } catch (err) {
      console.error('Error deleting review: ', err);
    }
  };

  // Gallery additions/deletions
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImage.trim() || !newDesc.trim()) {
      alert('Please fill in all gallery fields.');
      return;
    }

    setGallerySubmitting(true);
    try {
      const newItem = {
        title: newTitle.trim(),
        category: newCategory,
        image: newImage.trim(),
        description: newDesc.trim(),
        createdAt: new Date().toISOString()
      };

      await createGalleryItem(newItem);
      
      // Reset
      setNewTitle('');
      setNewImage('');
      setNewDesc('');
      setGallerySuccess(true);
      setTimeout(() => setGallerySuccess(false), 4000);
      if (isSupabaseConfigured()) refreshAllLists();
    } catch (err) {
      console.error('Error adding to gallery: ', err);
    } finally {
      setGallerySubmitting(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image from the public gallery?')) return;
    try {
      await deleteGalleryItem(id);
      if (isSupabaseConfigured()) refreshAllLists();
    } catch (err) {
      console.error('Error deleting gallery design: ', err);
    }
  };

  // Contact deletes
  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await deleteMessage(id);
      if (isSupabaseConfigured()) refreshAllLists();
    } catch (err) {
      console.error('Error deleting message: ', err);
    }
  };

  // Analytics helper counts
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const pendingReviewsCount = testimonials.filter((t) => !t.approved).length;

  // Render Login Card if not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-zinc-950 text-white" id="admin-login-screen">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center">
          
          <div className="bg-gold-500/10 p-4 rounded-full text-gold-500 mb-4 border border-gold-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-2xl font-bold tracking-tight text-center">
            Admin Access Portal
          </h2>
          <span className="font-sans text-[10px] text-gold-500 uppercase tracking-widest font-semibold mt-1">
            Naveed Signature Stich
          </span>

          <p className="font-sans text-xs text-zinc-400 text-center mt-3 mb-6 font-light">
            Enter the private luxury passcode below to view live bookings, approve client testimonials, manage catalogs, and read inquiries.
          </p>

          {/* Secure notice for test sandbox login */}
          <div className="bg-gold-500/10 border border-gold-500/20 p-3.5 rounded-2xl w-full text-center text-xs text-gold-500 mb-5 font-medium leading-relaxed">
            <ShieldAlert className="w-4 h-4 inline mr-1.5 align-middle" />
            Testing Passcode: <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded font-bold">signaturegold2026</code>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl p-3 text-xs w-full mb-4 flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
                Security Passcode
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••••"
                className="bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 text-white w-full tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-zinc-950 font-sans text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform shadow-lg mt-2"
            >
              Verify & Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8" id="admin-dashboard-container">
      {/* Dashboard Top Header bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-5 h-5 text-gold-500" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
              Atelier Dashboard
            </h2>
          </div>
          <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-light">
            You are logged in as administrator. Manage measurements, review approvals, and catalog models.
          </p>
        </div>

        {/* Action button panel */}
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-1.5 rounded-full text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-semibold">
            System Online
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-500 font-sans text-[10px] uppercase tracking-wider font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Analytics Counter Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-analytics">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
          <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Pending Sessions</span>
          <span className="font-serif text-2xl md:text-3xl font-bold mt-1 text-zinc-950 dark:text-white flex items-baseline gap-2">
            {pendingBookingsCount}
            {pendingBookingsCount > 0 && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />}
          </span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
          <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Unapproved Reviews</span>
          <span className="font-serif text-2xl md:text-3xl font-bold mt-1 text-zinc-950 dark:text-white flex items-baseline gap-2">
            {pendingReviewsCount}
            {pendingReviewsCount > 0 && <span className="w-2.5 h-2.5 bg-gold-500 rounded-full animate-pulse" />}
          </span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
          <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Gallery Designs</span>
          <span className="font-serif text-2xl md:text-3xl font-bold mt-1 text-zinc-950 dark:text-white">{gallery.length}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
          <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Inquiry Messages</span>
          <span className="font-serif text-2xl md:text-3xl font-bold mt-1 text-zinc-950 dark:text-white">{messages.length}</span>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800" id="admin-tabs-list">
        {[
          { key: 'bookings', label: 'Bookings', icon: Calendar, badge: pendingBookingsCount },
          { key: 'testimonials', label: 'Testimonials', icon: Star, badge: pendingReviewsCount },
          { key: 'gallery', label: 'Gallery Catalog', icon: Image },
          { key: 'messages', label: 'Inquiries', icon: Mail }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-4 border-b-2 font-sans text-xs uppercase tracking-wider font-semibold cursor-pointer transition-all ${
                isSelected
                  ? 'border-gold-500 text-gold-500'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-gold-500 text-zinc-950 font-bold text-[9px] py-0.5 px-1.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Primary tab workspace view */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            <span className="font-sans text-xs text-zinc-400">Loading workspace...</span>
          </div>
        ) : (
          <>
            {/* BOOKINGS MANAGER */}
            {activeTab === 'bookings' && (
              <div className="flex flex-col gap-6" id="bookings-manager-tab">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">Active Sizing Tickets ({bookings.length})</h3>
                  <div className="text-[10px] text-zinc-400 font-sans tracking-wider uppercase bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-900">
                    Latest appointments on top
                  </div>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center max-w-sm mx-auto">
                    <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-sans text-xs text-zinc-400">No appointments have been requested yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col xl:flex-row justify-between gap-6 relative overflow-hidden transition-all hover:border-gold-500/15"
                      >
                        {/* Elegant side ribbon for status */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          booking.status === 'pending' ? 'bg-amber-500' :
                          booking.status === 'confirmed' ? 'bg-indigo-500' :
                          booking.status === 'completed' ? 'bg-emerald-500' :
                          'bg-zinc-500'
                        }`} />

                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Client coordinates */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-zinc-400" />
                              Client Coordinates
                            </span>
                            <div>
                              <h4 className="font-serif text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                {booking.fullName}
                                <span className="font-mono text-[9px] uppercase tracking-wider text-gold-500 font-semibold bg-gold-500/10 px-1.5 py-0.5 rounded">
                                  {booking.bookingId || 'Legacy'}
                                </span>
                              </h4>
                              <p className="font-sans text-xs text-zinc-500 mt-1.5">{booking.email}</p>
                              <p className="font-sans text-xs text-zinc-500 mt-0.5">Phone: {booking.phone}</p>
                              {booking.whatsapp && (
                                <p className="font-sans text-xs text-emerald-500 mt-0.5 font-semibold flex items-center gap-1">
                                  <span className="text-[10px] bg-emerald-500/10 px-1 rounded">WA</span>
                                  {booking.whatsapp}
                                </p>
                              )}
                            </div>
                            
                            {/* Fast direct triggers */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <a 
                                href={`https://wa.me/${booking.whatsapp?.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-sans text-[10px] uppercase tracking-widest font-bold py-1.5 px-3 rounded-lg border border-transparent hover:border-emerald-500/10 transition-colors cursor-pointer"
                              >
                                Chat WhatsApp
                              </a>
                              <a 
                                href={`mailto:${booking.email}?subject=Naveed%20Signature%20Stich%20Appointment%20Update`}
                                className="bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 font-sans text-[10px] uppercase tracking-widest font-semibold py-1.5 px-3 rounded-lg border border-zinc-100 dark:border-zinc-800 transition-colors cursor-pointer"
                              >
                                Email Client
                              </a>
                            </div>
                          </div>

                          {/* Atelier Dress calibration */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-zinc-400" />
                              Dress Specification
                            </span>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-gold-500/15 text-gold-500 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                                  {booking.dressType}
                                </span>
                                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 px-2 py-0.5 rounded text-zinc-400 font-medium">
                                  {booking.eventType?.toUpperCase()}
                                </span>
                              </div>
                              <p className="font-sans text-xs text-zinc-500 mt-2">
                                <strong className="font-semibold text-zinc-700 dark:text-zinc-300">Fabric:</strong> {booking.fabricType === 'supplied' ? 'Customer Supplied Fabric' : `Atelier ${booking.fabricType?.toUpperCase()}`}
                              </p>
                              
                              <p className="font-sans text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="font-semibold">Fitting Appointment:</span> {new Date(booking.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="font-sans text-xs text-gold-500 font-semibold mt-1 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gold-500" />
                                <span>Guaranteed Delivery:</span> {new Date(booking.preferredDeliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          {/* Sizing measurements ticket */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                              Atelier Pattern Ticket
                            </span>
                            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900/60 p-3 rounded-xl">
                              <p className="font-sans text-xs text-zinc-600 dark:text-zinc-300 font-light whitespace-pre-line leading-relaxed">
                                {booking.measurements || 'No pre-existing sizing. Master tailor to draft physical measurements sheet.'}
                              </p>
                            </div>
                            
                            {booking.specialNotes && (
                              <p className="font-sans text-[11px] text-zinc-400 font-light mt-1">
                                <strong className="font-bold text-zinc-500">Stitching requests:</strong> {booking.specialNotes}
                              </p>
                            )}

                            {booking.referenceImage && (
                              <div className="mt-2 flex items-center gap-2">
                                <img src={booking.referenceImage} alt="Reference blueprint" className="w-8 h-8 object-cover rounded-md border border-zinc-150 dark:border-zinc-800" />
                                <a 
                                  href={booking.referenceImage} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-[10px] text-gold-500 hover:underline font-semibold"
                                >
                                  Open full reference image ↗
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Booking status actions */}
                        <div className="flex flex-row xl:flex-col items-center justify-end gap-3.5 border-t xl:border-t-0 xl:border-l border-zinc-100 dark:border-zinc-800 pt-4 xl:pt-0 xl:pl-6 min-w-[150px]">
                          <div className="text-right xl:text-center">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold block mb-1">Status</span>
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full ${
                              booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                              booking.status === 'confirmed' ? 'bg-indigo-500/10 text-indigo-500' :
                              booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                              'bg-zinc-500/10 text-zinc-500'
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id!, 'confirmed')}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl cursor-pointer shadow-sm transition-transform hover:scale-105"
                                title="Confirm Sizing Session"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id!, 'completed')}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-xl cursor-pointer shadow-sm transition-transform hover:scale-105"
                                title="Complete Custom Fit"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(booking.id!)}
                              className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-500 p-2.5 rounded-xl cursor-pointer transition-colors"
                              title="Delete Sizing Ticket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TESTIMONIALS MODERATOR */}
            {activeTab === 'testimonials' && (
              <div className="flex flex-col gap-6" id="testimonials-moderator-tab">
                <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">Customer Reviews Moderation ({testimonials.length})</h3>
                
                {testimonials.length === 0 ? (
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center max-w-sm mx-auto">
                    <Star className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-sans text-xs text-zinc-400">No client reviews submitted yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {testimonials.map((review) => (
                      <div 
                        key={review.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start"
                      >
                        <div className="flex-grow flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            {/* Profile Image Avatar preview */}
                            {review.avatar ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gold-500/15">
                                <img src={review.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-950 border border-gold-500/35 text-gold-400 flex items-center justify-center font-serif text-xs font-bold flex-shrink-0 uppercase">
                                {getInitials(review.name)}
                              </div>
                            )}

                            <div>
                              <h4 className="font-serif text-sm font-bold text-zinc-950 dark:text-white">{review.name}</h4>
                              <p className="font-sans text-[10px] text-gold-500 uppercase tracking-widest font-bold mt-0.5">{review.dressType}</p>
                            </div>

                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ml-2 ${
                              review.approved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {review.approved ? 'Approved' : 'Pending Approval'}
                            </span>
                          </div>

                          {/* rating */}
                          <div className="flex items-center gap-0.5 text-gold-500 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-gold-500 stroke-gold-500' : 'text-zinc-200 dark:text-zinc-800'}`} 
                              />
                            ))}
                          </div>

                          <p className="font-sans text-xs text-zinc-600 dark:text-zinc-300 italic mt-1 leading-relaxed">"{review.feedback}"</p>
                          <span className="font-sans text-[10px] text-zinc-400 mt-1 block">Submitted: {new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Dress Portrait preview if they uploaded one */}
                        {review.image && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-150 dark:border-zinc-800 flex-shrink-0 self-center md:self-start">
                            <img src={review.image} alt="Dress attached portrait" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Review actions */}
                        <div className="flex items-center gap-2 self-center flex-shrink-0">
                          {!review.approved && (
                            <button
                              onClick={() => handleApproveTestimonial(review.id!)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTestimonial(review.id!)}
                            className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-500 p-2.5 rounded-xl cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GALLERY CATALOG MANAGER */}
            {activeTab === 'gallery' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="gallery-manager-tab">
                {/* Addition Form on Right */}
                <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-gold-500" />
                    Add Design Model
                  </h3>

                  {gallerySuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl p-3 text-xs mb-4">
                      Successfully saved design item to Firebase!
                    </div>
                  )}

                  <form onSubmit={handleAddGallery} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-zinc-500">Design Title</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Royal Gold Sherwani"
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gold-500 dark:text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-zinc-500">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gold-500 dark:text-white"
                      >
                        <option value="bridal">Bridal Wear</option>
                        <option value="party">Party Wear</option>
                        <option value="formal">Formal Wear</option>
                        <option value="casual">Casual Wear</option>
                        <option value="custom">Custom Designs</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-zinc-500">Image URL</label>
                      <input
                        type="url"
                        required
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gold-500 dark:text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-zinc-500">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Write features, fit details, fabric details..."
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gold-500 dark:text-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={gallerySubmitting}
                      className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-zinc-950 font-sans text-xs uppercase tracking-wider font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {gallerySubmitting ? 'Saving...' : 'Add To Gallery'}
                    </button>
                  </form>
                </div>

                {/* Grid List of current catalog */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">Active Gallery Catalog ({gallery.length})</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gallery.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute top-3 left-3">
                            <span className="bg-zinc-950 text-gold-500 text-[8px] uppercase tracking-wider font-extrabold py-0.5 px-2 rounded border border-gold-500/10">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-grow">
                          <div>
                            <h4 className="font-serif text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{item.title}</h4>
                            <p className="font-sans text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{item.description}</p>
                          </div>

                          <div className="border-t border-zinc-50 dark:border-zinc-950 pt-3 mt-4 flex items-center justify-between">
                            <span className="text-[9px] font-mono text-zinc-400">ID: {item.id?.slice(0, 8)}</span>
                            <button
                              onClick={() => handleDeleteGallery(item.id!)}
                              className="text-rose-500 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT MESSAGES INBOX */}
            {activeTab === 'messages' && (
              <div className="flex flex-col gap-6" id="messages-manager-tab">
                <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">Customer Inquiries Inbox ({messages.length})</h3>

                {messages.length === 0 ? (
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center max-w-sm mx-auto">
                    <Mail className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-sans text-xs text-zinc-400">Inbox is empty. No inquiries sent yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-6"
                      >
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3">
                            <div>
                              <span className="text-[9px] font-mono tracking-widest text-gold-500 uppercase font-semibold block">{msg.subject}</span>
                              <h4 className="font-serif text-sm md:text-base font-bold text-zinc-950 dark:text-white mt-1">{msg.name}</h4>
                              <p className="font-sans text-[11px] text-zinc-400 mt-0.5">Email: {msg.email} | Phone: {msg.phone || 'N/A'}</p>
                            </div>

                            <span className="font-sans text-[10px] text-zinc-400 self-start sm:self-center">
                              {new Date(msg.createdAt).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="font-sans text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light whitespace-pre-line">{msg.message}</p>
                        </div>

                        <div className="flex items-center justify-end flex-shrink-0 self-center">
                          <button
                            onClick={() => handleDeleteMessage(msg.id!)}
                            className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-500 p-2.5 rounded-xl cursor-pointer"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
