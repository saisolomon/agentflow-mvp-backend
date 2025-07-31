// Database service that switches between real Supabase and mock data
import { mockSupabase } from './mock-database';

const USE_MOCK = !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY;

let supabase: any;

if (USE_MOCK) {
  console.log('🧪 Using MOCK database (set SUPABASE_URL and SUPABASE_ANON_KEY to use real database)');
  supabase = mockSupabase;
} else {
  console.log('🔗 Using real Supabase database');
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

export { supabase };

export const initializeDatabase = async () => {
  try {
    if (USE_MOCK) {
      console.log('✅ Mock database ready');
      return;
    }
    
    // Test real database connection
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && !error.message.includes('relation "users" does not exist')) {
      throw error;
    }
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};