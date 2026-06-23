const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aeunhhrvpqkbimpmxddw.supabase.co';
const supabaseKey = 'sb_publishable_ASKN0HThv-CsS93iOrljWA___wQ7u8j';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignupOnly() {
  const email = `test_signup_${Date.now()}@test.com`;
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

  console.log('Signup user:', data.user?.id);

  // Read the profile created by trigger
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id);
  console.log('Profile after signup (no upsert):', profile);
}

testSignupOnly();
