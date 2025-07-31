import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const initializeDatabase = async () => {
  try {
    // Test connection
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