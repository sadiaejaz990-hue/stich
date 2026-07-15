import React, { useState } from 'react';
import { createMessage } from '../lib/db';
import { Mail, Phone, MapPin, Clock, MessageCircle, Facebook, Instagram, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const ContactSection: React.FC = () => {
  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all the required fields marked with an asterisk (*).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Submit to server-side endpoint for validation and spam protection
      const response = await fetch('/api/contact/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          website_honeypot: websiteHoneypot,
        }),
      });

      const serverData = await response.json();
      if (!response.ok || !serverData.success) {
        throw new Error(serverData.error || 'Contact validation failed.');
      }

      // 2. Save message via database layer
      const newMessage = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim() || 'General Inquiry',
        message: message.trim(),
        createdAt: new Date().toISOString()
      };

      await createMessage(newMessage);
      
      // Reset form on success
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setWebsiteHoneypot('');
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 6000);
    } catch (err: any) {
      console.error('Error saving message: ', err);
      setError(err.message || 'Failed to transmit message. Please check your network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12 md:gap-16" id="contact-section-container">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-serif italic text-gold-500 text-sm tracking-widest uppercase block mb-1">
          Connect With Us
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Visit Our Atelier
        </h2>
        <div className="w-16 h-1 bg-gold-500 mx-auto mt-3 rounded-full opacity-60" />
        <p className="font-sans text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-4 font-light">
          Have design specifications or specific tailoring questions? Send our design consultants a message or chat with us instantly on WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left column contact details & Map */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
            <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Bespoke Studio Details
            </h3>

            <div className="flex flex-col gap-5">
              <div className="flex gap-4 items-start">
                <div className="bg-gold-500/10 p-3 rounded-2xl text-gold-500 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    Flagship Address
                  </h4>
                  <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Butt Chowk, Township, Lahore, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-gold-500/10 p-3 rounded-2xl text-gold-500 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    Call & Fitting Inquiries
                  </h4>
                  <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    +92 (306) 420-0710
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-gold-500/10 p-3 rounded-2xl text-gold-500 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    Email Correspondence
                  </h4>
                  <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    couture@naveedsignature.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-gold-500/10 p-3 rounded-2xl text-gold-500 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    Atelier Hours
                  </h4>
                  <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Monday – Saturday: 10:00 AM – 8:00 PM <br/>
                    Sunday: 12:00 PM – 6:00 PM (By Appointment Only)
                  </p>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 flex items-center justify-center gap-4">
              <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Socials:
              </span>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-zinc-50 hover:bg-gold-500/15 p-2 rounded-xl text-zinc-400 hover:text-gold-500 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-zinc-50 hover:bg-gold-500/15 p-2 rounded-xl text-zinc-400 hover:text-gold-500 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/923001234567" 
                target="_blank" 
                rel="noreferrer"
                className="bg-zinc-50 hover:bg-emerald-500/15 p-2 rounded-xl text-zinc-400 hover:text-emerald-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Luxury Vector Styled Map */}
          <div className="bg-zinc-950 text-white rounded-3xl p-1 overflow-hidden border border-gold-500/10 h-72 relative shadow-md">
            {/* Custom styled mock vector map representing Township Lahore */}
            <svg viewBox="0 0 400 300" className="w-full h-full bg-zinc-950 opacity-95">
              {/* Grid Roads background */}
              <path d="M 50,0 L 50,300 M 150,0 L 150,300 M 250,0 L 250,300 M 350,0 L 350,300" stroke="#222" strokeWidth="2" />
              <path d="M 0,60 L 400,60 M 0,140 L 400,140 M 0,220 L 400,220" stroke="#222" strokeWidth="2" />
              
              {/* Premium Golden Central Avenue */}
              <path d="M 200,0 L 200,300" stroke="#C9A227" strokeWidth="3" className="opacity-40" />
              <path d="M 0,180 L 400,180" stroke="#C9A227" strokeWidth="3" className="opacity-40" />
              
              {/* Green zone representing local park */}
              <rect x="10" y="10" width="120" height="40" fill="#142111" rx="8" className="opacity-30" />
              <text x="25" y="32" fill="#4B6E45" fontFamily="sans-serif" fontSize="8" letterSpacing="1" fontWeight="bold">TOWNSHIP SECTOR D PARK</text>

              {/* Canal / Water on side */}
              <rect x="0" y="240" width="100" height="60" fill="#0E192B" rx="8" className="opacity-40" />

              {/* Gold Pins */}
              <circle cx="200" cy="180" r="16" fill="#C9A227" className="animate-ping opacity-25" />
              <circle cx="200" cy="180" r="8" fill="#C9A227" />
              <circle cx="200" cy="180" r="4" fill="#111" />

              {/* Compass details */}
              <circle cx="360" cy="50" r="20" stroke="#333" strokeWidth="1" fill="none" />
              <path d="M 360,35 L 360,65 M 345,50 L 375,50" stroke="#333" strokeWidth="1" />
              <text x="358" y="33" fill="#C9A227" fontSize="7" fontWeight="bold">N</text>

              {/* Landmark Callouts */}
              <rect x="215" y="150" width="120" height="40" fill="#111" rx="10" stroke="#C9A227" strokeWidth="0.75" />
              <text x="225" y="165" fill="#FFF" fontFamily="serif" fontSize="8" fontWeight="bold">NAVEED ATELIER</text>
              <text x="225" y="177" fill="#C9A227" fontFamily="sans-serif" fontSize="7">Butt Chowk, Township, Lahore</text>
            </svg>
            <div className="absolute bottom-3 left-3 bg-zinc-900/85 backdrop-blur-md py-1 px-2.5 rounded-lg border border-zinc-800 text-[9px] uppercase tracking-wider font-semibold">
              Butt Chowk, Lahore Atelier Map
            </div>
          </div>
        </div>

        {/* Right column contact form */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-md">
          <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white mb-6">
            Send Inquiry Message
          </h3>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl p-4 flex gap-3 mb-6 text-xs leading-relaxed">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <div>
                <strong className="font-semibold block mb-0.5">Message Dispatched!</strong>
                Your correspondence has been logged. Our tailoring advisors will review your requirements and reach out within 12-24 hours.
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl p-4 flex gap-2.5 mb-6 text-xs items-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohail Siddique"
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rohail@example.com"
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 123-4567"
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
              />
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Inquiry Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Bridal dress sizing query / Custom embroidery material"
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Detailed Message *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your tailored outfit ideas, sizing challenges, or materials inquiry here..."
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="md:col-span-2 w-full mt-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-zinc-950 font-sans text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl cursor-pointer shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transmitting Message...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Inquiry
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
