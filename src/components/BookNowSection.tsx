import React, { useState, useEffect } from 'react';
import { createBooking } from '../lib/db';
import { Booking } from '../types';
import { 
  Sparkles, Calendar, Phone, Mail, FileText, CheckCircle2, 
  User, AlertCircle, Loader2, ArrowLeft, ArrowRight, DollarSign, Ruler, Percent
} from 'lucide-react';

interface BookNowSectionProps {
  preselectedImage: string;
  preselectedCategory: string;
  onClearPreselected: () => void;
}

export const BookNowSection: React.FC<BookNowSectionProps> = ({
  preselectedImage,
  preselectedCategory,
  onClearPreselected
}) => {
  const [step, setStep] = useState(1);

  // Form states - Step 1: Personal Info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'email' | 'call'>('whatsapp');

  // Form states - Step 2: Dress Details
  const [dressType, setDressType] = useState('Bridal Wear');
  const [fabricType, setFabricType] = useState('supplied'); // supplied, silk, organza, chiffon, velvet, jamawar
  const [eventType, setEventType] = useState('wedding'); // wedding, party, formal, casual
  const [appointmentDate, setAppointmentDate] = useState('');
  const [preferredDelivery, setPreferredDelivery] = useState('');
  const [embroideryNeeds, setEmbroideryNeeds] = useState<'none' | 'light' | 'medium' | 'heavy'>('none');

  // Form states - Step 3: Reference & Notes
  const [referenceImage, setReferenceImage] = useState('');
  const [measurements, setMeasurements] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [consent, setConsent] = useState(true);

  // System States
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastBookingId, setLastBookingId] = useState('');
  const [generatedId, setGeneratedId] = useState('');

  // Spam protection honeypot states
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [trapEmail, setTrapEmail] = useState('');

  // Field validation visual triggers
  const [touchedFields, setTouchedFields] = useState<string[]>([]);

  // Auto pre-fill if navigating from gallery
  useEffect(() => {
    if (preselectedImage) {
      setReferenceImage(preselectedImage);
    }
    if (preselectedCategory) {
      setDressType(preselectedCategory);
      // set event type accordingly
      if (preselectedCategory.toLowerCase().includes('bridal')) setEventType('wedding');
      else if (preselectedCategory.toLowerCase().includes('party')) setEventType('party');
      else if (preselectedCategory.toLowerCase().includes('formal')) setEventType('formal');
      else if (preselectedCategory.toLowerCase().includes('casual')) setEventType('casual');
    }
  }, [preselectedImage, preselectedCategory]);

  const handleTouch = (fieldName: string) => {
    if (!touchedFields.includes(fieldName)) {
      setTouchedFields([...touchedFields, fieldName]);
    }
  };

  // Pricing Range Calculator based on user parameters
  const calculateEstimateRange = () => {
    let baseMin = 4000;
    let baseMax = 12000;
    let dollarMin = 15;
    let dollarMax = 45;

    // Dress Categories
    if (dressType === 'Bridal Wear' || eventType === 'wedding') {
      baseMin = 80000;
      baseMax = 250000;
      dollarMin = 280;
      dollarMax = 900;
    } else if (dressType === 'Party Wear' || eventType === 'party') {
      baseMin = 15000;
      baseMax = 45000;
      dollarMin = 50;
      dollarMax = 160;
    } else if (dressType === 'Formal Wear' || eventType === 'formal') {
      baseMin = 10000;
      baseMax = 30000;
      dollarMin = 35;
      dollarMax = 110;
    }

    // Fabric selections
    if (fabricType === 'silk' || fabricType === 'jamawar') {
      baseMin += 10000;
      baseMax += 15000;
      dollarMin += 35;
      dollarMax += 55;
    } else if (fabricType === 'organza' || fabricType === 'chiffon') {
      baseMin += 6000;
      baseMax += 10000;
      dollarMin += 20;
      dollarMax += 35;
    } else if (fabricType === 'velvet') {
      baseMin += 12000;
      baseMax += 20000;
      dollarMin += 42;
      dollarMax += 70;
    }

    // Embroidery Addons
    if (embroideryNeeds === 'light') {
      baseMin += 8000;
      baseMax += 12000;
      dollarMin += 30;
      dollarMax += 45;
    } else if (embroideryNeeds === 'medium') {
      baseMin += 18000;
      baseMax += 28000;
      dollarMin += 65;
      dollarMax += 100;
    } else if (embroideryNeeds === 'heavy') {
      baseMin += 40000;
      baseMax += 80000;
      dollarMin += 140;
      dollarMax += 280;
    }

    return {
      pkr: `${baseMin.toLocaleString()} - ${baseMax.toLocaleString()} PKR`,
      usd: `$${dollarMin} - $${dollarMax} USD`
    };
  };

  const estimate = calculateEstimateRange();

  // Next Step Validations
  const validateStep1 = () => {
    handleTouch('fullName');
    handleTouch('phone');
    handleTouch('email');

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return false;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('A valid Phone Number is required.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid Email Address is required.');
      return false;
    }

    setError('');
    return true;
  };

  const validateStep2 = () => {
    handleTouch('appointmentDate');
    handleTouch('preferredDelivery');

    if (!appointmentDate) {
      setError('Appointment measurement date is required.');
      return false;
    }
    if (!preferredDelivery) {
      setError('Preferred delivery date is required.');
      return false;
    }

    // Simple date logic check
    const appt = new Date(appointmentDate);
    const deliv = new Date(preferredDelivery);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (appt < today) {
      setError('Appointment date must be today or in the future.');
      return false;
    }
    if (deliv <= appt) {
      setError('Delivery date must be at least 1 day after the fitting appointment.');
      return false;
    }

    setError('');
    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const prevStep = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  };

  // Generate a premium unique Booking ID (e.g. NS-2026-F9D2)
  const generateBookingId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `NS-2026-${code}`;
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Please provide your consent to our luxury fitting procedures.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Submit to server-side endpoint for validation, spam protection, and email confirmation
      const serverResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          phone,
          whatsapp: whatsapp || phone,
          email,
          dressType,
          fabricType,
          eventType,
          appointmentDate,
          preferredDeliveryDate: preferredDelivery,
          measurements: measurements || 'No pre-existing measurements. Custom sizing sheet to be drafted during fitting.',
          referenceImage,
          specialNotes,
          preferredContactMethod: preferredContact,
          consent,
          website_honeypot: websiteHoneypot,
          trap_email: trapEmail,
        }),
      });

      const serverData = await serverResponse.json();

      if (!serverResponse.ok || !serverData.success) {
        throw new Error(serverData.error || 'Server-side validation failed.');
      }

      const bId = serverData.bookingId;
      setGeneratedId(bId);

      // 2. Save the validated booking to our database (Supabase / Firestore)
      const newBooking: Omit<Booking, 'id'> = {
        bookingId: bId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        dressType,
        fabricType,
        eventType,
        appointmentDate,
        preferredDeliveryDate: preferredDelivery,
        measurements: measurements.trim() || 'No pre-existing measurements. Custom sizing sheet to be drafted during fitting.',
        referenceImage: referenceImage.trim() || undefined,
        specialNotes: specialNotes.trim() || undefined,
        preferredContactMethod: preferredContact,
        consent,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const docRefId = await createBooking(newBooking);
      setLastBookingId(docRefId);
      
      // Success triggers
      setSuccess(true);
      setShowReceipt(true);
      
      // Clear forms
      setFullName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setDressType('Bridal Wear');
      setFabricType('supplied');
      setEventType('wedding');
      setAppointmentDate('');
      setPreferredDelivery('');
      setEmbroideryNeeds('none');
      setReferenceImage('');
      setMeasurements('');
      setSpecialNotes('');
      setWebsiteHoneypot('');
      setTrapEmail('');
      setStep(1);
      setTouchedFields([]);
      onClearPreselected(); 
    } catch (err: any) {
      console.error('Error saving booking: ', err);
      setError(err.message || 'An error occurred while scheduling your booking. Please verify your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12 md:gap-16" id="book-now-container">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-serif italic text-gold-500 text-sm tracking-widest uppercase block mb-1">
          Bespoke Appointment
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Book Stitching Session
        </h2>
        <div className="w-16 h-1 bg-gold-500 mx-auto mt-3 rounded-full opacity-60" />
        <p className="font-sans text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-4 font-light leading-relaxed">
          Embark on a personalized couture experience. Our dynamic multi-step fitting system allows you to draft contact preferences, calibrate fabric details, configure silhouettes, and preview custom estimates instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left column info & Live Interactive Pricing Estimator */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Dynamic Estimate Widget */}
          <div className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 border border-gold-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/4 right-0 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <span className="font-serif italic text-gold-500 text-[10px] md:text-xs tracking-widest uppercase block mb-1">
              Interactive Estimator
            </span>
            <h3 className="font-serif text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              Bespoke Quote Preview
            </h3>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Design Category:</span>
                <span className="font-serif font-bold text-gold-400">{dressType}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Fabric Specification:</span>
                <span className="font-sans font-semibold text-zinc-300">
                  {fabricType === 'supplied' ? 'Customer Supplied' : fabricType.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Embroidery Level:</span>
                <span className="font-sans font-semibold text-zinc-300">
                  {embroideryNeeds.toUpperCase()} Work
                </span>
              </div>
              <div className="border-t border-zinc-900 my-1" />
              
              <div className="flex flex-col gap-1 text-center py-1">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Estimated Cost Range:</span>
                <span className="font-serif text-lg md:text-xl font-bold text-gold-400 tracking-tight">
                  {estimate.pkr}
                </span>
                <span className="font-sans text-[10px] text-zinc-400 font-semibold italic">
                  ({estimate.usd})
                </span>
              </div>
            </div>

            <p className="font-sans text-[10px] text-zinc-400 leading-relaxed font-light">
              *Estimates are calculated using standard stitch complexity, premium finishing threads, and requested fabric volumes. Exact quote is finalized after anatomical body draping analysis.
            </p>
          </div>

          {/* Quick instructions card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h4 className="font-serif text-xs uppercase tracking-wider font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-gold-500" />
              Anatomical Calibration:
            </h4>
            <ul className="flex flex-col gap-2.5 font-sans text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed list-disc list-inside">
              <li>Our master tailor takes 30+ precise body measurements.</li>
              <li>Please wear fitted, light clothing for perfect precision.</li>
              <li>Bring your formal footwear to analyze custom dress length.</li>
              <li>Virtual consultations are fully backed by video guides.</li>
            </ul>
          </div>
        </div>

        {/* Right column booking form with Stepper Header */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-md">
          {/* Visual Stepper Progress Bar */}
          <div className="flex flex-col gap-3 mb-8" id="booking-stepper">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xs text-gold-500 uppercase tracking-widest font-bold">
                Step {step} of 3
              </span>
              <span className="font-sans text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                {step === 1 && 'Personal Coordinates'}
                {step === 2 && 'Atelier Dress Specifications'}
                {step === 3 && 'Silhouette Notes & Confirmation'}
              </span>
            </div>
            
            {/* Visual Gold Progress Bar */}
            <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Real-time Validation / System Errors banner */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl p-4 flex gap-2.5 mb-6 text-xs items-center animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-sans font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
            {/* Spam Protection Honeypots */}
            <div className="hidden" aria-hidden="true">
              <input 
                type="text" 
                name="website_honeypot" 
                value={websiteHoneypot} 
                onChange={(e) => setWebsiteHoneypot(e.target.value)} 
                tabIndex={-1} 
                autoComplete="off" 
              />
              <input 
                type="email" 
                name="trap_email" 
                value={trapEmail} 
                onChange={(e) => setTrapEmail(e.target.value)} 
                tabIndex={-1} 
                autoComplete="off" 
              />
            </div>
            
            {/* ================= STEP 1: PERSONAL COORDINATES ================= */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onBlur={() => handleTouch('fullName')}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ayesha Naveed"
                    className={`bg-zinc-50 dark:bg-zinc-950 border rounded-xl px-4 py-3 text-xs focus:outline-none dark:text-white w-full transition-all ${
                      touchedFields.includes('fullName') && !fullName.trim() 
                        ? 'border-rose-500 ring-1 ring-rose-500/10' 
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-gold-500'
                    }`}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onBlur={() => handleTouch('phone')}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className={`bg-zinc-50 dark:bg-zinc-950 border rounded-xl px-4 py-3 text-xs focus:outline-none dark:text-white w-full transition-all ${
                      touchedFields.includes('phone') && (!phone.trim() || phone.trim().length < 8)
                        ? 'border-rose-500 ring-1 ring-rose-500/10' 
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-gold-500'
                    }`}
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <span className="text-emerald-500 font-bold text-[10px] uppercase">WA</span>
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 0300-1234567 (If different)"
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onBlur={() => handleTouch('email')}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className={`bg-zinc-50 dark:bg-zinc-950 border rounded-xl px-4 py-3 text-xs focus:outline-none dark:text-white w-full transition-all ${
                      touchedFields.includes('email') && (!email.trim() || !email.includes('@'))
                        ? 'border-rose-500 ring-1 ring-rose-500/10' 
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-gold-500'
                    }`}
                  />
                </div>

                {/* Preferred Contact Method */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Preferred Contact Method *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['whatsapp', 'email', 'call'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPreferredContact(method)}
                        className={`py-3 px-4 rounded-xl border text-xs font-sans uppercase tracking-wider font-semibold cursor-pointer transition-all ${
                          preferredContact === method
                            ? 'bg-zinc-950 dark:bg-gold-500 text-white dark:text-zinc-950 border-transparent shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-gold-500/20'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: DRESS SPECIFICATIONS ================= */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                {/* Dress Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Dress Category *
                  </label>
                  <select
                    value={dressType}
                    onChange={(e) => setDressType(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
                  >
                    <option value="Bridal Wear">Bridal Wear</option>
                    <option value="Party Wear">Party Wear</option>
                    <option value="Formal Wear">Formal Wear</option>
                    <option value="Casual Wear">Casual Wear</option>
                  </select>
                </div>

                {/* Event Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Occasion / Event *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
                  >
                    <option value="wedding">Wedding / Barat</option>
                    <option value="mehndidholki">Mehndi / Dholki</option>
                    <option value="reception">Reception / Walima</option>
                    <option value="party">Party / Festive Gathering</option>
                    <option value="formal">Official / Formal Event</option>
                    <option value="casual">Daily Wear / Casual</option>
                  </select>
                </div>

                {/* Fabric Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Fabric Sourcing *
                  </label>
                  <select
                    value={fabricType}
                    onChange={(e) => setFabricType(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
                  >
                    <option value="supplied">Customer Supplied Fabric</option>
                    <option value="silk">Atelier Raw Silk</option>
                    <option value="organza">Atelier Organza</option>
                    <option value="chiffon">Atelier Chiffon</option>
                    <option value="velvet">Atelier Royal Velvet</option>
                    <option value="jamawar">Atelier Banarsi Jamawar</option>
                  </select>
                </div>

                {/* Embroidery Needs */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Embroidery Specification *
                  </label>
                  <select
                    value={embroideryNeeds}
                    onChange={(e) => setEmbroideryNeeds(e.target.value as any)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
                  >
                    <option value="none">None (Plain / Tailored Only)</option>
                    <option value="light">Light Embellishment / Border</option>
                    <option value="medium">Medium Hand-embroidery</option>
                    <option value="heavy">Heavy Bridal Zardozi Work</option>
                  </select>
                </div>

                {/* Fitting Appointment Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Fitting/Measurement Appointment *
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onBlur={() => handleTouch('appointmentDate')}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className={`bg-zinc-50 dark:bg-zinc-950 border rounded-xl px-4 py-3 text-xs focus:outline-none dark:text-white w-full transition-all ${
                      touchedFields.includes('appointmentDate') && !appointmentDate
                        ? 'border-rose-500 ring-1 ring-rose-500/10' 
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-gold-500'
                    }`}
                  />
                </div>

                {/* Preferred Delivery Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Preferred Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDelivery}
                    onBlur={() => handleTouch('preferredDelivery')}
                    onChange={(e) => setPreferredDelivery(e.target.value)}
                    className={`bg-zinc-50 dark:bg-zinc-950 border rounded-xl px-4 py-3 text-xs focus:outline-none dark:text-white w-full transition-all ${
                      touchedFields.includes('preferredDelivery') && !preferredDelivery
                        ? 'border-rose-500 ring-1 ring-rose-500/10' 
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-gold-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* ================= STEP 3: REFERENCE & NOTES ================= */}
            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                {/* Reference Image URL */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Reference Dress Design Image (URL)</span>
                    {referenceImage && (
                      <button 
                        type="button" 
                        onClick={() => { setReferenceImage(''); onClearPreselected(); }}
                        className="text-[10px] text-rose-500 hover:underline cursor-pointer font-bold"
                      >
                        Clear selection
                      </button>
                    )}
                  </label>
                  <input
                    type="url"
                    value={referenceImage}
                    onChange={(e) => setReferenceImage(e.target.value)}
                    placeholder="Paste design URL (e.g., https://pinterest.com/pin/...)"
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full"
                  />
                  {referenceImage && (
                    <div className="mt-1 flex items-center gap-2 border border-zinc-100 dark:border-zinc-800/80 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 max-w-sm">
                      <img src={referenceImage} alt="Reference Preview" className="w-12 h-12 object-cover rounded-md" />
                      <span className="font-sans text-[10px] text-zinc-400 truncate">Image selection active</span>
                    </div>
                  )}
                </div>

                {/* Measurements (Optional block / JSON structure) */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-zinc-400" />
                    Anatomical Sizing Measurements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={measurements}
                    onChange={(e) => setMeasurements(e.target.value)}
                    placeholder="Chest, Shoulder, Waist, Length, Sleeves, etc. (Leave blank to measure in studio)"
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full resize-none"
                  />
                </div>

                {/* Special Request Notes */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    Special Stitching Requests
                  </label>
                  <textarea
                    rows={3}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Provide necklines, linings, borders, or custom embroidery patterns requested..."
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold-500 dark:text-white w-full resize-none"
                  />
                </div>

                {/* Legal Consent Checkbox */}
                <div className="flex items-start gap-2.5 md:col-span-2 mt-2">
                  <input
                    type="checkbox"
                    id="consent-check"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-gold-500 focus:ring-gold-500 h-3.5 w-3.5 cursor-pointer accent-gold-500"
                  />
                  <label htmlFor="consent-check" className="font-sans text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal select-none cursor-pointer font-light">
                    I acknowledge that Naveed Signature Stich drafts proprietary physical paper molds for custom fits. I authorize scheduled sessions to draft and catalog my measurements.
                  </label>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-zinc-50 dark:border-zinc-950 pt-5 mt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-sans text-xs uppercase tracking-wider font-bold py-2.5 px-4 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : (
                <div className="w-10" />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-sans text-xs uppercase tracking-widest font-bold py-3 px-8 rounded-xl cursor-pointer shadow-sm"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitBooking}
                  disabled={submitting || !consent}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-zinc-950 font-sans text-xs uppercase tracking-widest font-extrabold py-3.5 px-8 rounded-xl cursor-pointer shadow-lg shadow-gold-500/10 disabled:opacity-40 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Couture...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Confirm & Submit
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Receipt Modal Dialogue */}
      {showReceipt && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          id="receipt-modal"
          onClick={() => setShowReceipt(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative p-8 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-5">
              <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-full mb-1">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-zinc-950 dark:text-white leading-tight">
                Couture Booking Confirmed
              </h3>
              <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 font-light">
                Your unique signature design reference has been generated successfully.
              </p>
            </div>

            {/* Receipt Details */}
            <div className="font-sans text-xs text-zinc-600 dark:text-zinc-300 flex flex-col gap-3 py-1">
              <div className="flex justify-between items-center border-b border-dashed border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="text-zinc-400">Booking Reference:</span>
                <span className="font-mono font-bold text-gold-500 text-xs tracking-wider uppercase">{generatedId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Dress Style:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{dressType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Sizing fitting:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{new Date(appointmentDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Guaranteed Delivery:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{new Date(preferredDelivery).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Cost Estimate Range:</span>
                <span className="font-semibold text-gold-500">{estimate.pkr}</span>
              </div>
              
              <div className="flex flex-col gap-1 w-full mt-3 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl text-center">
                <span className="text-zinc-400 text-[9px] uppercase tracking-wider block font-semibold">Flagship Atelier Location:</span>
                <span className="font-serif font-bold text-zinc-900 dark:text-white text-xs block">Butt Chowk, Township, Lahore</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-sans text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

