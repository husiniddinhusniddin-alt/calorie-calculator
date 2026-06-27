const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aeunhhrvpqkbimpmxddw.supabase.co';
const supabaseKey = 'sb_publishable_ASKN0HThv-CsS93iOrljWA___wQ7u8j';
const supabase = createClient(supabaseUrl, supabaseKey);

async function registerTest() {
  const email = `test${Date.now()}@test.com`;
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: 'password123',
    options: {
      data: {
        age: 35,
        height: 195,
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
    return;
  }
  
  console.log('Signup successful, user:', data.user?.id);
  console.log('Session?', !!data.session);

  // Try upserting profile
  if (data.session) {
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email,
      age: 35,
      height: 195,
      target_date: new Date().toISOString()
    });
    console.log('Upsert error?', upsertError);
  } else {
    console.log('No session, cannot upsert');
  }

  // After some time, fetch profile using anon key, maybe it is created by trigger?
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id);
  console.log('Profile from unauthenticated fetch:', profile);
}

registerTest();
