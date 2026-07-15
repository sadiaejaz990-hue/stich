import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Verify if the URL is a valid HTTP/HTTPS URL to prevent createClient from throwing an error
const isValidHttpUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

// Initialize Supabase Client if credentials are provided and valid
export const supabase = supabaseUrl && supabaseAnonKey && isValidHttpUrl(supabaseUrl)
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (supabaseUrl && !isValidHttpUrl(supabaseUrl)) {
  console.warn('Supabase URL is provided but is not a valid HTTP or HTTPS URL. Supabase features will be disabled.');
}

/**
 * Checks whether Supabase is fully configured and active.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};
