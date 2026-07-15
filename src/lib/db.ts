import { db } from './firebase';
import { supabase, isSupabaseConfigured } from './supabase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { Booking, Testimonial, GalleryItem, ContactMessage } from '../types';

// ==========================================
// 1. BOOKINGS MANAGEMENT
// ==========================================

export async function getBookings(): Promise<Booking[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase!
        .from('bookings')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Booking[];
    } catch (err) {
      console.warn('Supabase getBookings failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const list: Booking[] = [];
  snap.forEach((d) => {
    list.push({ id: d.id, ...d.data() as object } as Booking);
  });
  return list;
}

export async function createBooking(booking: Omit<Booking, 'id'>): Promise<string> {
  // Client-side and server-side safety checks
  if (!booking.fullName || !booking.phone || !booking.email) {
    throw new Error('Validation Failed: Full name, phone, and email are required fields.');
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase!
        .from('bookings')
        .insert([booking])
        .select('id');
      
      if (error) throw error;
      return data && data[0] ? data[0].id : 'supabase-success';
    } catch (err) {
      console.warn('Supabase createBooking failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  const docRef = await addDoc(collection(db, 'bookings'), booking);
  return docRef.id;
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase!
        .from('bookings')
        .update({ status })
        .eq('id', id);
      
      if (!error) return;
      // If eq by UUID failed, try by bookingId as fallback
      const { error: error2 } = await supabase!
        .from('bookings')
        .update({ status })
        .eq('bookingId', id);
      
      if (error2) throw error2;
      return;
    } catch (err) {
      console.warn('Supabase updateBookingStatus failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  const ref = doc(db, 'bookings', id);
  await updateDoc(ref, { status });
}

export async function deleteBooking(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase!
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (!error) return;
      const { error: error2 } = await supabase!
        .from('bookings')
        .delete()
        .eq('bookingId', id);
      
      if (error2) throw error2;
      return;
    } catch (err) {
      console.warn('Supabase deleteBooking failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  await deleteDoc(doc(db, 'bookings', id));
}

// ==========================================
// 2. TESTIMONIALS MANAGEMENT
// ==========================================

export async function getTestimonials(onlyApproved = false): Promise<Testimonial[]> {
  if (isSupabaseConfigured()) {
    try {
      let q = supabase!.from('testimonials').select('*');
      if (onlyApproved) {
        q = q.eq('approved', true);
      }
      const { data, error } = await q.order('createdAt', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Testimonial[];
    } catch (err) {
      console.warn('Supabase getTestimonials failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  let q;
  if (onlyApproved) {
    q = query(
      collection(db, 'testimonials'), 
      where('approved', '==', true),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
  }

  const snap = await getDocs(q);
  const list: Testimonial[] = [];
  snap.forEach((d) => {
    list.push({ id: d.id, ...d.data() as object } as Testimonial);
  });
  return list;
}

export async function createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<string> {
  if (!testimonial.name || !testimonial.feedback) {
    throw new Error('Validation Failed: Name and feedback are required fields.');
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase!
        .from('testimonials')
        .insert([testimonial])
        .select('id');
      
      if (error) throw error;
      return data && data[0] ? data[0].id : 'supabase-success';
    } catch (err) {
      console.warn('Supabase createTestimonial failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  const docRef = await addDoc(collection(db, 'testimonials'), testimonial);
  return docRef.id;
}

export async function approveTestimonial(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase!
        .from('testimonials')
        .update({ approved: true })
        .eq('id', id);
      
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('Supabase approveTestimonial failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  const ref = doc(db, 'testimonials', id);
  await updateDoc(ref, { approved: true });
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase!
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('Supabase deleteTestimonial failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  await deleteDoc(doc(db, 'testimonials', id));
}

// ==========================================
// 3. GALLERY MANAGEMENT
// ==========================================

export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase!
        .from('gallery')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return (data || []) as GalleryItem[];
    } catch (err) {
      console.warn('Supabase getGalleryItems failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const list: GalleryItem[] = [];
  snap.forEach((d) => {
    list.push({ id: d.id, ...d.data() as object } as GalleryItem);
  });
  return list;
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<string> {
  if (!item.title || !item.image) {
    throw new Error('Validation Failed: Title and image URL are required.');
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase!
        .from('gallery')
        .insert([item])
        .select('id');
      
      if (error) throw error;
      return data && data[0] ? data[0].id : 'supabase-success';
    } catch (err) {
      console.warn('Supabase createGalleryItem failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  const docRef = await addDoc(collection(db, 'gallery'), item);
  return docRef.id;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase!
        .from('gallery')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('Supabase deleteGalleryItem failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  await deleteDoc(doc(db, 'gallery', id));
}

// ==========================================
// 4. CONTACT MESSAGES MANAGEMENT
// ==========================================

export async function getMessages(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase!
        .from('messages')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return (data || []) as ContactMessage[];
    } catch (err) {
      console.warn('Supabase getMessages failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const list: ContactMessage[] = [];
  snap.forEach((d) => {
    list.push({ id: d.id, ...d.data() as object } as ContactMessage);
  });
  return list;
}

export async function createMessage(msg: Omit<ContactMessage, 'id'>): Promise<string> {
  if (!msg.name || !msg.email || !msg.message) {
    throw new Error('Validation Failed: Name, email, and message are required.');
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase!
        .from('messages')
        .insert([msg])
        .select('id');
      
      if (error) throw error;
      return data && data[0] ? data[0].id : 'supabase-success';
    } catch (err) {
      console.warn('Supabase createMessage failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  const docRef = await addDoc(collection(db, 'messages'), msg);
  return docRef.id;
}

export async function deleteMessage(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase!
        .from('messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('Supabase deleteMessage failed, falling back to Firestore:', err);
    }
  }

  // Fallback: Firebase Firestore
  await deleteDoc(doc(db, 'messages', id));
}
