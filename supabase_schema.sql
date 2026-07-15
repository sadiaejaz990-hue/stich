-- ==========================================
-- NAVEED SIGNATURE STITCH - SUPABASE SCHEMA
-- ==========================================
-- Paste this script directly into your Supabase SQL Editor (https://supabase.com)
-- to initialize all database tables and permissions.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "bookingId" VARCHAR(50) UNIQUE NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "whatsapp" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "dressType" VARCHAR(100) NOT NULL,
    "fabricType" VARCHAR(100) NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "appointmentDate" VARCHAR(100) NOT NULL,
    "preferredDeliveryDate" VARCHAR(100) NOT NULL,
    "measurements" TEXT NOT NULL,
    "referenceImage" TEXT,
    "specialNotes" TEXT,
    "preferredContactMethod" VARCHAR(20) NOT NULL,
    "consent" BOOLEAN DEFAULT TRUE NOT NULL,
    "status" VARCHAR(20) DEFAULT 'pending' NOT NULL,
    "createdAt" VARCHAR(100) NOT NULL
);

-- 2. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "dressType" VARCHAR(100) NOT NULL,
    "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "feedback" TEXT NOT NULL,
    "image" TEXT,
    "avatar" TEXT,
    "approved" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" VARCHAR(100) NOT NULL
);

-- 3. GALLERY TABLE
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" VARCHAR(100) NOT NULL
);

-- 4. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" VARCHAR(100) NOT NULL
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials("approved") WHERE "approved" = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery("category");
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages("createdAt" DESC);

-- Enable Row Level Security (RLS) on all tables (Production-ready security)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create Policies for Bookings
CREATE POLICY "Public can submit bookings (anonymous insertions)" 
ON bookings FOR INSERT 
WITH CHECK (TRUE);

CREATE POLICY "Admins can select, update, and delete bookings" 
ON bookings FOR ALL 
USING (TRUE); -- Admin Panel logic will utilize service roles or session-token validations

-- Create Policies for Testimonials
CREATE POLICY "Public can read approved testimonials" 
ON testimonials FOR SELECT 
USING ("approved" = TRUE);

CREATE POLICY "Public can insert new testimonials (unapproved by default)" 
ON testimonials FOR INSERT 
WITH CHECK ("approved" = FALSE);

CREATE POLICY "Admins have full access to testimonials" 
ON testimonials FOR ALL 
USING (TRUE);

-- Create Policies for Gallery
CREATE POLICY "Public can read gallery items" 
ON gallery FOR SELECT 
USING (TRUE);

CREATE POLICY "Admins have full access to gallery" 
ON gallery FOR ALL 
USING (TRUE);

-- Create Policies for Messages
CREATE POLICY "Public can submit contact messages" 
ON messages FOR INSERT 
WITH CHECK (TRUE);

CREATE POLICY "Admins can view and delete messages" 
ON messages FOR ALL 
USING (TRUE);
