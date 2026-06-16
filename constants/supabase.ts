import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://aeunhhrvpqkbimpmxddw.supabase.co';
const supabaseAnonKey = 'sb_publishable_ASKN0HThv-CsS93iOrljWA___wQ7u8j';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
