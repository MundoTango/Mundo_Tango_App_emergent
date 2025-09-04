import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

// Create Supabase clients only if environment variables are provided
let supabase: any = null;
let supabaseAuth: any = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Supabase service client initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase service client:', error);
  }
} else {
  console.log('ℹ️ Supabase service client disabled - missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'implicit'
      }
    });
    console.log('✅ Supabase auth client initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase auth client:', error);
  }
} else {
  console.log('ℹ️ Supabase auth client disabled - missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

export { supabase, supabaseAuth };
export default supabase;