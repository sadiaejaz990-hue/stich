export interface Booking {
  id?: string;
  bookingId: string; // Generated Booking ID (e.g., NS-84920)
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  dressType: string;
  fabricType: string; // Cotton, Silk, Chiffon, Velvet, Organza, Net, etc.
  eventType: string; // Wedding, Mehndi, Barat, Walima, Party, Eid, etc.
  appointmentDate: string;
  preferredDeliveryDate: string;
  measurements: string; // Structured JSON string or text block
  referenceImage?: string; // Uploaded inspiration image or base64
  specialNotes?: string;
  preferredContactMethod: 'whatsapp' | 'email' | 'call';
  consent: boolean;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  dressType: string;
  rating: number; // 1 to 5
  feedback: string;
  image?: string; // Dress photo
  avatar?: string; // Customer photo / avatar
  approved: boolean; // Needs admin approval to display publicly
  createdAt: string;
}

export interface GalleryItem {
  id?: string;
  title: string;
  category: 'bridal' | 'party' | 'formal' | 'casual' | 'custom';
  image: string;
  description: string;
  createdAt: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

export type CategoryType = 'bridal' | 'party' | 'formal' | 'casual' | 'custom';
