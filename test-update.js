const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aeunhhrvpqkbimpmxddw.supabase.co';
const supabaseKey = 'sb_publishable_ASKN0HThv-CsS93iOrljWA___wQ7u8j';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  const email = `test${Date.now()}@test.com`;
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: 'password123',
  });

  console.log('Signup user:', data.user?.id);

  // Now emulate user going to profile screen and saving
  const { error: updateError } = await supabase.from('profiles').update({
    height: 192,
    age: 25,
  }).eq('id', data.user.id);
  
  console.log('Update error?', updateError);

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id);
  console.log('Profile after update:', profile);
}

testUpdate();
